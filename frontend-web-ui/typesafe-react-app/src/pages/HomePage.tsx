import Grid from "@mui/material/Grid";
import { CreateTodoForm } from "../components/forms/CreateTodoForm";
import { TodosListDisplay } from "../components/TodosListDisplay";

export const HomePage: React.FC<{}> = () => {
  return (
    <Grid container justifyContent="center">
      <Grid item xs={12}></Grid>
      <CreateTodoForm />
      <Grid item xs={12}>
        <TodosListDisplay />
      </Grid>
    </Grid>
  );
};
