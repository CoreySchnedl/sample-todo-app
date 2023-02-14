import * as cdk from "aws-cdk-lib";
import * as cdknag from "cdk-nag";
import { PipelineStack } from "../lib/pipeline-stack";

const app = new cdk.App();
cdk.Aspects.of(app).add(new cdknag.AwsSolutionsChecks());

new PipelineStack(app, "PipelineStack", {
  codeCommitRepoName: "end-to-end-type-safe-cdk-app",
  branchName: "main",
});
