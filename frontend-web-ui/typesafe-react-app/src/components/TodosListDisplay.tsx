import { Grid, List, ListItem, ListItemText } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { TodosSelector } from "../app/features/todos/TodosSlice";

export const TodosListDisplay: React.FC<{}> = () => {
  const todoList = useSelector(TodosSelector.getTodos);

  return (
    <Grid container justifyContent="center">
      <Grid item xs={12}>
        <List>
          {todoList.map((todo) => (
            <ListItem key={todo.id}>
              <ListItemText>{todo.name}</ListItemText>
            </ListItem>
          ))}
        </List>
      </Grid>
    </Grid>
  );
};
