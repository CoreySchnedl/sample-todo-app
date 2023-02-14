import { Grid, List, ListItem, ListItemText, Typography } from "@mui/material";
import React from "react";

const generate = (element: React.ReactElement) => {
  return [0, 1, 2].map((value) =>
    React.cloneElement(element, {
      key: value,
    })
  );
};

export const TodosListDisplay: React.FC<{}> = () => {
  return (
    <Grid container justifyContent="center" xs={12} maxWidth="400px">
      <Grid item xs={12}>
        <Typography variant="h4">Todo List</Typography>
      </Grid>
      <Grid item xs={12}>
        <List>
          {generate(
            <ListItem>
              <ListItemText primary="some text here"></ListItemText>
            </ListItem>
          )}
        </List>
      </Grid>
    </Grid>
  );
};
