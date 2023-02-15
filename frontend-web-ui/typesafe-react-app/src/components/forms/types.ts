import { FormikHelpers } from "formik";

export type FormSubmitHandler<T extends Record<string, any>> = (
  values: T,
  formikHelpers: FormikHelpers<T>
) => void | Promise<any>;
