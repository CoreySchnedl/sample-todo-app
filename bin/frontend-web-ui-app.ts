import * as cdk from "aws-cdk-lib";
import * as cdknag from "cdk-nag";
import { FrontendWebUIStack } from "../lib/front-web-ui-stack";

const app = new cdk.App();
cdk.Aspects.of(app).add(new cdknag.AwsSolutionsChecks());

const frontEndWebUIStack = new FrontendWebUIStack(
  app,
  "FrontendWebUIStack",
  {}
);

cdknag.NagSuppressions.addResourceSuppressionsByPath(
  frontEndWebUIStack,
  "/FrontendWebUIStack/AccessLogsBucket/Resource",
  [
    {
      id: "AwsSolutions-S1",
      reason:
        "The access logging bucket does not need access logs configured on itself.",
    },
  ]
);

cdknag.NagSuppressions.addResourceSuppressionsByPath(
  frontEndWebUIStack,
  "/FrontendWebUIStack/CloudFrontDistAccessLogsBucket/Resource",
  [
    {
      id: "AwsSolutions-S1",
      reason:
        "The access logging bucket does not need access logs configured on itself.",
    },
  ]
);

cdknag.NagSuppressions.addResourceSuppressionsByPath(
  frontEndWebUIStack,
  "/FrontendWebUIStack/WebsiteDistribution/CFDistribution",
  [
    {
      id: "AwsSolutions-CFR4",
      reason:
        "Using the default certificate provided by cloudfront for demo purposes only.",
    },
  ]
);

/**
 * NOTE: resolve the below cdknag reported issues before implementing in any production codebase.
 */

cdknag.NagSuppressions.addStackSuppressions(frontEndWebUIStack, [
  {
    id: "AwsSolutions-IAM4",
    reason:
      "This module uses IAM Roles / Policies created via CDK. Some of these policies and roles may be over-permissive for production use-cases. Review these policies and roles before implementing in a production-codebase.",
  },
]);

cdknag.NagSuppressions.addStackSuppressions(frontEndWebUIStack, [
  {
    id: "AwsSolutions-IAM5",
    reason:
      "This module uses IAM Roles / Policies created via CDK. Some of these policies and roles may be over-permissive for production use-cases. Review these policies and roles before implementing in a production-codebase.",
  },
]);
