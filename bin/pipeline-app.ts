import * as cdk from "aws-cdk-lib";
import * as cdknag from "cdk-nag";
import { PipelineStack } from "../lib/pipeline-stack";

const app = new cdk.App();
cdk.Aspects.of(app).add(new cdknag.AwsSolutionsChecks());

const pipelineStack = new PipelineStack(app, "PipelineStack", {
  codeCommitRepoName: "end-to-end-type-safe-cdk-application",
  branchName: "main",
});

cdknag.NagSuppressions.addResourceSuppressionsByPath(
  pipelineStack,
  "/PipelineStack/AccessLogsBucket/Resource",
  [
    {
      id: "AwsSolutions-S1",
      reason:
        "The bucket used for access logging does not need access logging configured on itself.",
    },
  ]
);

// NOTE: resolve the below cdknag reported issues before implementing in any production codebase.
cdknag.NagSuppressions.addResourceSuppressionsByPath(
  pipelineStack,
  "/PipelineStack/end-to-end-type-safe-cdk-application-pipeline/Role/DefaultPolicy/Resource",
  [
    {
      id: "AwsSolutions-IAM5",
      reason: "Resolve before using in a production codebase.",
    },
  ]
);

cdknag.NagSuppressions.addResourceSuppressionsByPath(
  pipelineStack,
  "/PipelineStack/end-to-end-type-safe-cdk-application-pipeline/Source/Source/CodePipelineActionRole/DefaultPolicy/Resource",
  [
    {
      id: "AwsSolutions-IAM5",
      reason: "Resolve before using in a production codebase.",
    },
  ]
);

cdknag.NagSuppressions.addResourceSuppressionsByPath(
  pipelineStack,
  "/PipelineStack/TestingProject/Role/DefaultPolicy/Resource",
  [
    {
      id: "AwsSolutions-IAM5",
      reason: "Resolve before using in a production codebase.",
    },
  ]
);

cdknag.NagSuppressions.addResourceSuppressionsByPath(
  pipelineStack,
  "/PipelineStack/ScanningProject/Role/DefaultPolicy/Resource",
  [
    {
      id: "AwsSolutions-IAM5",
      reason: "Resolve before using in a production codebase.",
    },
  ]
);

cdknag.NagSuppressions.addResourceSuppressionsByPath(
  pipelineStack,
  "/PipelineStack/DeployDevBackendRestAPIProject/Role/DefaultPolicy/Resource",
  [
    {
      id: "AwsSolutions-IAM5",
      reason: "Resolve before using in a production codebase.",
    },
  ]
);

cdknag.NagSuppressions.addResourceSuppressionsByPath(
  pipelineStack,
  "/PipelineStack/DeployDevFrontendWebUIProject/Role/DefaultPolicy/Resource",
  [
    {
      id: "AwsSolutions-IAM5",
      reason: "Resolve before using in a production codebase.",
    },
  ]
);

cdknag.NagSuppressions.addResourceSuppressionsByPath(
  pipelineStack,
  "/PipelineStack/AllowCDKDeploy/Resource",
  [
    {
      id: "AwsSolutions-IAM5",
      reason: "Resolve before using in a production codebase.",
    },
  ]
);
