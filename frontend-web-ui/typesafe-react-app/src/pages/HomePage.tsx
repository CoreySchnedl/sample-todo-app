import { Card, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { CreateTodoForm } from "../components/forms/CreateTodoForm";
import { TodosListDisplay } from "../components/TodosListDisplay";

export const HomePage: React.FC<{}> = () => {
  return (
    <Grid container justifyContent="center">
      <Card style={{ padding: "50px", marginTop: "20px" }}>
        <Grid container width="100%" justifyContent="center">
          <Grid item xs={12} sm={6}>
            <Grid container justifyContent="center">
              <Grid item maxWidth="300px">
                <CreateTodoForm />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Grid container justifyContent="center">
              <Grid item xs={12}>
                <Typography variant="h4" textAlign="center">
                  List of Todos
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TodosListDisplay />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Card>
    </Grid>
  );
};
