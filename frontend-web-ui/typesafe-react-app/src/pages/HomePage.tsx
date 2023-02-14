import Grid from "@mui/material/Grid";
import { TodosListDisplay } from "../components/TodosListDisplay";

export const HomePage: React.FC<{}> = () => {
  return (
    <Grid container justifyContent="center">
      <Grid item xs={12}>
        <TodosListDisplay />
      </Grid>
      <Grid item xs={12}></Grid>
    </Grid>
  );
};
