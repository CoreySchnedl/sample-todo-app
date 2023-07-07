import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import todosReducer from "../features/todos/TodosSlice";
import countersReducer from "../features/counters/CountersSlice";

export const store = configureStore({
  reducer: {
    todos: todosReducer,
    counters: countersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<typeof store.dispatch>();
