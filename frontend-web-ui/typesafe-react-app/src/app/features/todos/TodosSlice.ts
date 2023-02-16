import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TodoPriority } from "@shared/enums";
import { TodosAPIServiceContracts } from "@shared/types";
import { API } from "aws-amplify";
import { API_NAME_BACKEND_REST_API } from "../../../App";
import { TodoFormMode } from "../../../components/forms/TodoForm";
import { apiPaths } from "../../../utils/api";
import { RootState } from "../../store/Store";

export type Todo = TodosAPIServiceContracts.GetTodoResponse;

interface TodosState {
  selectedTodoId: string;
  formMode: TodoFormMode;
  todos: Todo[];
}

const initialState: TodosState = {
  selectedTodoId: "",
  formMode: "create",
  todos: [],
};

export const todosSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    setTodos(state, action: PayloadAction<Todo[]>) {
      state.todos = action.payload;
    },
    setFormMode(state, action: PayloadAction<TodoFormMode>) {
      state.formMode = action.payload;
    },
    setSelectedTodoId(state, action: PayloadAction<string>) {
      state.selectedTodoId = action.payload;
    },
  },
});

const getTodosList = createAsyncThunk<void, void, { state: RootState }>(
  "@todos/getTodosList",
  async (props: void, { dispatch }) => {
    console.log("GETTING TODOS LIST");
    try {
      const response: Todo[] = await API.get(
        API_NAME_BACKEND_REST_API,
        `/${apiPaths.v1Todos}`,
        {}
      );

      const priorityOrder = Object.values(TodoPriority);

      const sortedTodos = response.sort((a, b) => {
        return (
          priorityOrder.indexOf(b.priority) - priorityOrder.indexOf(a.priority)
        );
      });

      dispatch(TodosAction.setTodos(sortedTodos));
    } catch (e) {
      console.log(e);
    }
  }
);

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

const updateTodo = createAsyncThunk<void, Todo, { state: RootState }>(
  "@todos/updateTodo",
  async (props: Todo, { dispatch, getState }) => {
    try {
      const { id, ...attributesToUpdate } = props;

      const response: Todo = await API.put(
        API_NAME_BACKEND_REST_API,
        `${apiPaths.v1Todos}/${id}`,
        {
          body: {
            ...attributesToUpdate,
          },
        }
      );

      const currentTodoList = getTodos(getState());

      const updatedTodoList = currentTodoList.map((todo) => {
        return todo.id === id ? response : todo;
      });

      dispatch(TodosAction.setTodos(updatedTodoList));
    } catch (e) {
      console.log(e);
    }
  }
);

const deleteTodo = createAsyncThunk<void, { id: string }, { state: RootState }>(
  "@todos/updateTodo",
  async (props: { id: string }, { dispatch, getState }) => {
    try {
      await API.del(
        API_NAME_BACKEND_REST_API,
        `${apiPaths.v1Todos}/${props.id}`,
        {}
      );

      const currentTodoList = getTodos(getState());

      const updatedTodoList = currentTodoList.filter((todo) => {
        return todo.id !== props.id;
      });

      dispatch(TodosAction.setTodos(updatedTodoList));
    } catch (e) {
      console.log(e);
    }
  }
);

const getTodos = (state: RootState) => state.todos.todos;
const getFormMode = (state: RootState) => state.todos.formMode;
const getSelectedTodoId = (state: RootState) => state.todos.selectedTodoId;

export const TodosSelector = {
  getFormMode,
  getTodos,
  getSelectedTodoId,
};

export const TodosAction = {
  ...todosSlice.actions,
  getTodosList,
  createTodo,
  updateTodo,
  deleteTodo,
};

export default todosSlice.reducer;
