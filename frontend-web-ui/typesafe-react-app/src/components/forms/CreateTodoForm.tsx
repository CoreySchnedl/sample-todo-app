import { Button, FormControl, Grid, MenuItem } from "@mui/material";
import { TodoPriority } from "@shared/enums";
import { Field, Form, Formik } from "formik";
import { Select, TextField } from "formik-mui";
import { mixed, object, ObjectSchema, string } from "yup";
import { Todo, TodosAction } from "../../app/features/todos/TodosSlice";
import { useAppDispatch } from "../../app/store/Store";
import { toTitleCase } from "../../utils/text";
import { FormSubmitHandler } from "./types";

type CreateTodoFormValues = Omit<Todo, "id">;

const defaultValues: CreateTodoFormValues = {
  name: "",
  description: "",
  priority: TodoPriority.LOW,
};

const createTodoFormValuesSchema: ObjectSchema<CreateTodoFormValues> = object({
  name: string()
    .min(3, "Must be more than 3 characters")
    .max(100, "Must be less than 100 characters")
    .required("Name is required"),
  description: string()
    .min(3, "Must be more than 3 characters")
    .max(100, "Must be less than 100 characters")
    .required("Description is required"),
  priority: mixed<TodoPriority>()
    .oneOf(Object.values(TodoPriority))
    .required()
    .defined(),
}).defined();

interface CreateTodoFormProps {
  /**
   * Function to be invoked after submit is complete
   */
  afterSubmitFn?: () => void;
}

export const CreateTodoForm: React.FC<CreateTodoFormProps> = ({
  afterSubmitFn = () => {},
}) => {
  const dispatch = useAppDispatch();

  const handleSubmit: FormSubmitHandler<CreateTodoFormValues> = (
    values,
    { resetForm }
  ) => {
    dispatch(
      TodosAction.createTodo({
        ...values,
      })
    ).finally(() => {
      resetForm();
      afterSubmitFn();
    });
  };

  return (
    <Formik
      initialValues={defaultValues}
      onSubmit={handleSubmit}
      validationSchema={createTodoFormValuesSchema}
    >
      {({ submitForm, isSubmitting, isValid, dirty }) => (
        <Form>
          <Grid container justifyContent="center" rowSpacing={2}>
            <Grid item xs={12}>
              <Field fullWidth component={TextField} name="name" label="Name" />
            </Grid>
            <Grid item xs={12}>
              <Field
                fullWidth
                component={TextField}
                name="description"
                label="Description"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <Field
                  component={Select}
                  id="priority"
                  name="priority"
                  label="Priority"
                >
                  {Object.values(TodoPriority).map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {toTitleCase(priority)}
                    </MenuItem>
                  ))}
                </Field>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button
                onClick={submitForm}
                disabled={!dirty || isSubmitting || !isValid}
                fullWidth
                variant="contained"
              >
                Create Todo
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};
