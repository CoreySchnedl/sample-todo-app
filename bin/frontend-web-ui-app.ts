import * as cdk from "aws-cdk-lib";
import * as cdknag from "cdk-nag";
import { FrontendWebUIStack } from "../lib/front-web-ui-stack";

const app = new cdk.App();
cdk.Aspects.of(app).add(new cdknag.AwsSolutionsChecks());

new FrontendWebUIStack(app, "FrontendWebUIStack", {});
