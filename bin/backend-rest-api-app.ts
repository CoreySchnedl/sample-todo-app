import * as cdk from "aws-cdk-lib";
import * as cdknag from "cdk-nag";
import { BackendRestAPIStack } from "../lib/backend-rest-api-stack";

const app = new cdk.App();
cdk.Aspects.of(app).add(new cdknag.AwsSolutionsChecks());

new BackendRestAPIStack(app, "BackendRestAPIStack", {});
