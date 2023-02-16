import { Grid } from "@mui/material";
import React from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { useSelector } from "react-redux";
import {
  Todo,
  TodosAction,
  TodosSelector,
} from "../app/features/todos/TodosSlice";
import { useAppDispatch } from "../app/store/Store";
import { reorder } from "../utils/draggable";
import { TodoDisplay } from "./TodoDisplay";

export const TodosListDisplay: React.FC<{}> = () => {
  const dispatch = useAppDispatch();

  const todoList = useSelector(TodosSelector.getTodos);

  const handleDragEnd = ({ destination, source }: DropResult) => {
    // dropped outside the list
    if (!destination) return;

    const newTodoList = reorder<Todo>(
      todoList,
      source.index,
      destination.index
    );

    dispatch(TodosAction.setTodos(newTodoList));
  };

  return (
    <Grid container justifyContent="center">
      <Grid item xs={12}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="droppable-list">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {todoList.map((item, index) => (
                  <TodoDisplay todo={item} index={index} key={item.id} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Grid>
    </Grid>
  );
};
