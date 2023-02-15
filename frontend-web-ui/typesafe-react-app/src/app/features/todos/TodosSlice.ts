import {
  createAsyncThunk,
  createSlice,
  current,
  PayloadAction,
} from "@reduxjs/toolkit";
import { TodosAPIServiceContracts } from "@shared/types";
import { API } from "aws-amplify";
import { API_NAME_BACKEND_REST_API } from "../../../App";
import { apiPaths } from "../../../utils/api";
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

const createTodo = createAsyncThunk<
  void,
  Omit<Todo, "id">,
  { state: RootState }
>(
  "@todos/createTodo",
  async (props: Omit<Todo, "id">, { dispatch, getState }) => {
    try {
      const response: Todo = await API.post(
        API_NAME_BACKEND_REST_API,
        apiPaths.v1Todos,
        {
          body: {
            ...props,
          },
        }
      );

      const currentTodoList = getTodos(getState());

      dispatch(TodosAction.setTodos([...currentTodoList, response]));
    } catch (e) {
      console.log(e);
    }
  }
);

const getTodos = (state: RootState) => state.todos.todos;

export const TodosSelector = {
  getTodos,
};

export const TodosAction = {
  ...todosSlice.actions,
  createTodo,
};

export default todosSlice.reducer;
