import { Card, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { TodosAction, TodosSelector } from "../app/features/todos/TodosSlice";
import { useAppDispatch } from "../app/store/Store";
import { TodoForm } from "../components/forms/TodoForm";
import { TodosListDisplay } from "../components/TodosListDisplay";

export const HomePage: React.FC<{}> = () => {
  const dispatch = useAppDispatch();

  const formMode = useSelector(TodosSelector.getFormMode);
  const selectedTodoId = useSelector(TodosSelector.getSelectedTodoId);

  useEffect(() => {
    dispatch(TodosAction.getTodosList());
  }, [dispatch]);

  return (
    <Grid container justifyContent="center">
      <Card style={{ padding: "50px", marginTop: "20px" }}>
        <Grid container rowSpacing={4} width="100%" justifyContent="center">
          <Grid item xs={12} md={6}>
            <Grid container justifyContent="center">
              <Grid item maxWidth="300px">
                {formMode === "create" && <TodoForm mode={formMode} />}
                {formMode === "update" && (
                  <TodoForm mode={formMode} selectedTodoId={selectedTodoId} />
                )}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid container justifyContent="center">
              <Grid item xs={12}>
                <Typography variant="h4" textAlign="center">
                  List of Todos
                </Typography>
              </Grid>
              <Grid item sx={{ minWidth: "500px" }} xs={12}>
                <TodosListDisplay />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Card>
    </Grid>
  );
};
