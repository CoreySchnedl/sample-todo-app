import ClearIcon from "@mui/icons-material/Clear";
import EditIcon from "@mui/icons-material/Edit";
import {
  Avatar,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tooltip,
} from "@mui/material";
import { TodoPriority } from "@shared/enums";
import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { Todo, TodosAction } from "../app/features/todos/TodosSlice";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import LowPriorityIcon from "@mui/icons-material/LowPriority";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import CircleIcon from "@mui/icons-material/Circle";
import { useAppDispatch } from "../app/store/Store";

interface TodoPriorityDisplayProps {
  priority: TodoPriority;
}

const TodoPriorityDisplay: React.FC<TodoPriorityDisplayProps> = ({
  priority,
}) => {
  switch (priority) {
    case TodoPriority.LOW:
      return (
        <Tooltip title="Low Priority">
          <LowPriorityIcon color="info"></LowPriorityIcon>
        </Tooltip>
      );
    case TodoPriority.MEDIUM:
      return (
        <Tooltip title="Medium Priority">
          <CircleIcon color="secondary"></CircleIcon>
        </Tooltip>
      );
    case TodoPriority.HIGH:
      return (
        <Tooltip title="High Priority">
          <PriorityHighIcon color="warning"></PriorityHighIcon>
        </Tooltip>
      );
    case TodoPriority.CRITICAL:
      return (
        <Tooltip title="Critical Priority">
          <NewReleasesIcon color="error"></NewReleasesIcon>
        </Tooltip>
      );
    default:
      return (
        <Tooltip title="Low Priority">
          <LowPriorityIcon color="info"></LowPriorityIcon>
        </Tooltip>
      );
  }
};

export interface TodoDisplayProps {
  todo: Todo;
  index: number;
}

export const TodoDisplay: React.FC<TodoDisplayProps> = ({ todo, index }) => {
  const dispatch = useAppDispatch();

  const handleDeleteButtonClicked = () => {
    dispatch(TodosAction.deleteTodo({ id: todo.id }));
  };

  const handleEditButtonClicked = () => {
    dispatch(TodosAction.setFormMode("update"));
    dispatch(TodosAction.setSelectedTodoId(todo.id));
  };

  return (
    <Draggable draggableId={todo.id} index={index}>
      {(provided) => (
        <ListItem
          sx={{ minWidth: "500px" }}
          disablePadding
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <ListItemAvatar>
            <Avatar>
              <TodoPriorityDisplay priority={todo.priority} />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={todo.name} secondary={todo.description} />
          <ListItemAvatar>
            <IconButton onClick={handleEditButtonClicked}>
              <EditIcon />
            </IconButton>
            <IconButton
              sx={{ marginTop: "10px" }}
              onClick={handleDeleteButtonClicked}
            >
              <ClearIcon />
            </IconButton>
          </ListItemAvatar>
        </ListItem>
      )}
    </Draggable>
  );
};
