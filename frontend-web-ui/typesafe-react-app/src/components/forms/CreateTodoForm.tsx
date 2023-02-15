import { Grid, MenuItem } from "@mui/material";
import { Field, Form, Formik } from "formik";
import { Select, TextField } from "formik-mui";
import { mixed, object, ObjectSchema, string } from "yup";
import { Todo } from "../../app/features/todos/TodosSlice";
import { toTitleCase } from "../../utils/text";
import { TodoPriority } from "@shared/enums";

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
    .required("Required")
    .defined(),
  description: string()
    .min(3, "Must be more than 3 characters")
    .max(100, "Must be less than 100 characters")
    .required("Required")
    .defined(),
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
  /**
   * Function to be invoked after cancel
   */
  afterCancelFn?: () => void;
}

export const CreateTodoForm: React.FC<CreateTodoFormProps> = ({
  afterCancelFn = () => {},
  afterSubmitFn = () => {},
}) => {
  const handleSubmit = () => {};

  return (
    <Formik
      initialValues={defaultValues}
      onSubmit={handleSubmit}
      validationSchema={createTodoFormValuesSchema}
    >
      {({ submitForm, isSubmitting, isValid, dirty }) => (
        <Form>
          <Grid container justifyContent="center">
            <Grid item xs={12}>
              <Field component={TextField} name="name" label="Name" />
            </Grid>
            <Grid item xs={12}>
              <Field
                component={TextField}
                name="description"
                label="Description"
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                component={Select}
                id="priority"
                name="priority"
                label="Priority"
              >
                {Object.values([]).map((priority) => (
                  <MenuItem value={priority}>{toTitleCase(priority)}</MenuItem>
                ))}
              </Field>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};
