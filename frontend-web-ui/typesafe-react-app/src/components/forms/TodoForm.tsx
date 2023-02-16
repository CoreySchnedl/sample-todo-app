import { Button, FormControl, Grid, MenuItem } from "@mui/material";
import { TodoPriority } from "@shared/enums";
import { Field, Form, Formik } from "formik";
import { Select, TextField } from "formik-mui";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { mixed, object, ObjectSchema, string } from "yup";
import {
  Todo,
  TodosAction,
  TodosSelector,
} from "../../app/features/todos/TodosSlice";
import { useAppDispatch } from "../../app/store/Store";
import { toTitleCase } from "../../utils/text";
import { FormSubmitHandler } from "./types";

export type TodoFormMode = "create" | "update";

type TodoFormValues = Omit<Todo, "id">;

const defaultValues: TodoFormValues = {
  name: "",
  description: "",
  priority: TodoPriority.LOW,
};

const getInitialValues = (
  mode: TodoFormMode,
  todosList: Todo[],
  selectedTodoId: string
): TodoFormValues => {
  if (mode === "update") {
    const matchingTodo = todosList.find((todo) => todo.id === selectedTodoId);
    if (matchingTodo) {
      return {
        name: matchingTodo.name || defaultValues.name,
        description: matchingTodo.description || defaultValues.description,
        priority: matchingTodo.priority || defaultValues.priority,
      };
    }
  }
  return defaultValues;
};

const todoFormValuesSchema: ObjectSchema<TodoFormValues> = object({
  name: string()
    .min(3, "Must be more than 3 characters")
    .max(100, "Must be less than 100 characters")
    .required("Name is required"),
  description: string()
    .min(3, "Must be more than 3 characters")
    .max(100, "Must be less than 100 characters")
    .optional(),
  priority: mixed<TodoPriority>()
    .oneOf(Object.values(TodoPriority))
    .required()
    .defined(),
}).defined();

interface TodoFormBaseProps {
  /**
   * Function to be invoked after submit is complete
   */
  afterSubmitFn?: () => void;
  mode: TodoFormMode;
}

interface CreateTodoFormProps extends TodoFormBaseProps {
  mode: "create";
}

interface UpdateTodoFormProps extends TodoFormBaseProps {
  mode: "update";
  selectedTodoId: string;
}

type TodoFormProps = CreateTodoFormProps | UpdateTodoFormProps;

export const TodoForm: React.FC<TodoFormProps> = (props) => {
  const isCreate = props.mode === "create";
  const isUpdate = props.mode === "update";

  const dispatch = useAppDispatch();
  const todosList = useSelector(TodosSelector.getTodos);

  const handleSubmit: FormSubmitHandler<TodoFormValues> = (
    values,
    { resetForm }
  ) => {
    if (isCreate) {
      return dispatch(
        TodosAction.createTodo({
          ...values,
        })
      ).finally(() => {
        resetForm();
        if (props.afterSubmitFn) {
          props.afterSubmitFn();
        }
      });
    }
    if (isUpdate) {
      return dispatch(
        TodosAction.updateTodo({
          ...values,
          id: props.selectedTodoId,
        })
      ).finally(() => {
        dispatch(TodosAction.setFormMode("create"));
        dispatch(TodosAction.setSelectedTodoId(""));
        resetForm();
        if (props.afterSubmitFn) {
          props.afterSubmitFn();
        }
      });
    }
  };

  const handleUndoClicked = () => {
    dispatch(TodosAction.setFormMode("create"));
    dispatch(TodosAction.setSelectedTodoId(""));
  };

  const initialValues = useMemo(() => {
    return getInitialValues(
      props.mode,
      todosList,
      isUpdate ? props.selectedTodoId : ""
    );
  }, [props, todosList, isUpdate]);

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={todoFormValuesSchema}
      enableReinitialize={true}
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
              {isCreate && (
                <Button
                  onClick={submitForm}
                  disabled={!dirty || isSubmitting || !isValid}
                  fullWidth
                  variant="contained"
                >
                  Create Todo
                </Button>
              )}
              {isUpdate && (
                <>
                  <Button
                    onClick={submitForm}
                    disabled={!dirty || isSubmitting || !isValid}
                    fullWidth
                    variant="contained"
                  >
                    Update Todo
                  </Button>
                  <Button
                    sx={{ marginTop: "10px" }}
                    onClick={handleUndoClicked}
                    fullWidth
                    variant="contained"
                  >
                    Undo Edit
                  </Button>
                </>
              )}
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};
