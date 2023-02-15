import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TodosAPIServiceContracts } from "@shared/types";
import { RootState } from "../../store/Store";

export type Todo = TodosAPIServiceContracts.GetTodoResponse;

interface TodosState {
  todos: Todo[];
}

const initialState: TodosState = {
  todos: [],
};

export const todosSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    setTodos(state, action: PayloadAction<Todo[]>) {
      state.todos = action.payload;
    },
  },
});

const getTodos = (state: RootState) => state.todos.todos;

export const TodosSelector = {
  getTodos,
};

export const TodosAction = {
  ...todosSlice.actions,
};

export default todosSlice.reducer;
