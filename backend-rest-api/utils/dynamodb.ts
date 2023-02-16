import { UpdateCommandInput } from "@aws-sdk/lib-dynamodb";

export const generateUpdateExpression = (
  fields: Record<string, any>
): Pick<
  UpdateCommandInput,
  "UpdateExpression" | "ExpressionAttributeNames" | "ExpressionAttributeValues"
> => {
  const expression: Required<
    Pick<
      UpdateCommandInput,
      | "UpdateExpression"
      | "ExpressionAttributeNames"
      | "ExpressionAttributeValues"
    >
  > = {
    UpdateExpression: "SET",
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {},
  };
  Object.entries(fields).forEach(([key, item]) => {
    if (item !== undefined) {
      expression.UpdateExpression += ` #${key} = :${key},`;
      expression.ExpressionAttributeNames[`#${key}`] = key;
      expression.ExpressionAttributeValues[`:${key}`] = item;
    }
  });
  expression.UpdateExpression = expression.UpdateExpression.slice(0, -1);

  return expression;
};
