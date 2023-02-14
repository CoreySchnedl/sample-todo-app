#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { AwsSolutionsChecks } from "cdk-nag";
import "source-map-support/register";
import { EndToEndCdkTypeSafetyStack } from "../lib/end-to-end-cdk-type-safety-stack";

const app = new cdk.App();
new EndToEndCdkTypeSafetyStack(app, "EndToEndCdkTypeSafetyStack", {});
cdk.Aspects.of(app).add(new AwsSolutionsChecks());
