import * as cdk from "aws-cdk-lib";
import * as cdknag from "cdk-nag";
import { BackendRestAPIStack } from "../lib/backend-rest-api-stack";

const app = new cdk.App();
cdk.Aspects.of(app).add(new cdknag.AwsSolutionsChecks());

const backendRestAPIStack = new BackendRestAPIStack(
  app,
  "BackendRestAPIStack",
  {}
);

cdknag.NagSuppressions.addResourceSuppressionsByPath(
  backendRestAPIStack,
  "/BackendRestAPIStack/BackendRestApi/Resource",
  [
    {
      id: "AwsSolutions-APIG2",
      reason: "Request Validation is handled via Lambda.",
    },
  ]
);

cdknag.NagSuppressions.addResourceSuppressionsByPath(
  backendRestAPIStack,
  "/BackendRestAPIStack/BackendRestApi/Default/OPTIONS/Resource",
  [
    {
      id: "AwsSolutions-APIG4",
      reason: "OPTIONS resources should not required authorization.",
    },
    {
      id: "AwsSolutions-COG4",
      reason: "OPTIONS resources should not required authorization.",
    },
  ]
);

cdknag.NagSuppressions.addResourceSuppressionsByPath(
  backendRestAPIStack,
  "/BackendRestAPIStack/BackendRestApi/Default/v1/OPTIONS/Resource",
  [
    {
      id: "AwsSolutions-APIG4",
      reason: "OPTIONS resources should not required authorization.",
    },
    {
      id: "AwsSolutions-COG4",
      reason: "OPTIONS resources should not required authorization.",
    },
  ]
);

cdknag.NagSuppressions.addResourceSuppressionsByPath(
  backendRestAPIStack,
  "/BackendRestAPIStack/BackendRestApi/Default/v1/todos/OPTIONS/Resource",
  [
    {
      id: "AwsSolutions-APIG4",
      reason: "OPTIONS resources should not required authorization.",
    },
    {
      id: "AwsSolutions-COG4",
      reason: "OPTIONS resources should not required authorization.",
    },
  ]
);

cdknag.NagSuppressions.addResourceSuppressionsByPath(
  backendRestAPIStack,
  "/BackendRestAPIStack/TodosLambdaExecutionRole/DefaultPolicy/Resource",
  [
    {
      id: "AwsSolutions-IAM5",
      reason: "Lambda Permissions are least priveledge and required to log.",
    },
  ]
);
