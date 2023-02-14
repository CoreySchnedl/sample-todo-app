import { Aws, Stack, StackProps } from "aws-cdk-lib";
import * as CodeBuild from "aws-cdk-lib/aws-codebuild";
import * as CodeCommit from "aws-cdk-lib/aws-codecommit";
import * as CodePipeline from "aws-cdk-lib/aws-codepipeline";
import * as CodePipelineActions from "aws-cdk-lib/aws-codepipeline-actions";
import * as IAM from "aws-cdk-lib/aws-iam";
import * as KMS from "aws-cdk-lib/aws-kms";
import * as S3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export interface PipelineStackProps extends StackProps {
  codeCommitRepoName: string;
  branchName: string;
}

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    const accessLogsBucket = new S3.Bucket(this, "AccessLogsBucket", {
      blockPublicAccess: S3.BlockPublicAccess.BLOCK_ALL,
      encryption: S3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
    });

    const encryptionKey = new KMS.Key(this, "EncryptionKey", {
      enableKeyRotation: true,
    });

    const artifactBucket = new S3.Bucket(this, "ArtifactsBucket", {
      blockPublicAccess: S3.BlockPublicAccess.BLOCK_ALL,
      encryption: S3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      serverAccessLogsBucket: accessLogsBucket,
    });

    const pipeline = new CodePipeline.Pipeline(
      this,
      "end-to-end-type-safe-cdk-application-pipeline",
      {
        artifactBucket,
      }
    );
    const sourceStage = pipeline.addStage({ stageName: "Source" });

    const repo = CodeCommit.Repository.fromRepositoryName(
      this,
      "end-to-end-type-safe-cdk-application",
      props.codeCommitRepoName
    );

    const sourceArtifact = new CodePipeline.Artifact("SourceArtifact");

    sourceStage.addAction(
      new CodePipelineActions.CodeCommitSourceAction({
        actionName: "Source",
        output: sourceArtifact,
        repository: repo,
        branch: props.branchName,
      })
    );

    /**
     * Start Test Stage
     */
    const testingStage = pipeline.addStage({ stageName: "Test" });
    const testingProject = new CodeBuild.PipelineProject(
      this,
      `TestingProject`,
      {
        encryptionKey,
        environment: {
          buildImage: CodeBuild.LinuxBuildImage.STANDARD_6_0,
          environmentVariables: {
            AWS_XRAY_CONTEXT_MISSING: {
              value: "IGNORE_ERROR",
            },
          },
        },
        buildSpec: CodeBuild.BuildSpec.fromObject({
          version: "0.2",
          phases: {
            install: {
              "runtime-versions": {
                nodejs: "16",
              },
              commands: ["ls", "npm install"],
            },
            build: {
              commands: ["npm run test"],
            },
          },
        }),
      }
    );

    testingStage.addAction(
      new CodePipelineActions.CodeBuildAction({
        actionName: "TestingAction",
        input: sourceArtifact,
        project: testingProject,
      })
    );

    /**
     * Start Security Scan Stage
     */
    const scanReportsBucket = new S3.Bucket(this, "ASHScanResultsBucket", {
      blockPublicAccess: S3.BlockPublicAccess.BLOCK_ALL,
      encryption: S3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      serverAccessLogsBucket: accessLogsBucket,
    });
    const scanningStage = pipeline.addStage({ stageName: "Scanning" });
    const scanningProject = new CodeBuild.PipelineProject(
      this,
      "ScanningProject",
      {
        encryptionKey,
        environment: {
          privileged: true,
          buildImage: CodeBuild.LinuxBuildImage.AMAZON_LINUX_2_3,
        },
        buildSpec: CodeBuild.BuildSpec.fromObject({
          version: 0.2,
          phases: {
            install: {
              commands: [
                "echo Cloning ASH",
                "git clone https://github.com/aws-samples/automated-security-helper.git /tmp/ash",
              ],
            },
            pre_build: {
              commands: [
                "export codebuild_build_arn=${CODEBUILD_BUILD_ARN}",
                "export codecommit_commit_id=${CODEBUILD_RESOLVED_SOURCE_VERSION}",
                `export s3_bucket=${scanReportsBucket.bucketName}`,
                "export codecommit_repo=${PWD##*/}",
                "export report_name=ash_report-$(date +%Y-%m-%d).txt",
                'export report_location=s3://"${s3_bucket}"/"${codecommit_repo}"/"${codecommit_commit_id}"/"${report_name}"',
                'date_iso="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"',
                'accountid=$(aws sts get-caller-identity --query "Account" --output text)',
                "printenv",
              ],
            },
            build: {
              commands: [
                "echo Running ASH...",
                "if /tmp/ash/ash --source-dir .; then echo scan completed && scan_fail=0; else echo found vulnerabilies && echo Sending alert to SecHub && scan_fail=1 ;fi",
              ],
            },
            post_build: {
              commands: [
                "echo Uploading report to ${report_location}",
                "aws s3 cp aggregated_results.txt $report_location",
                'sechub_finding=\'[\n    {\n        "AwsAccountId": "\'${accountid}\'",\n        "CreatedAt": "\'${date_iso}\'",\n        "UpdatedAt": "\'${date_iso}\'",\n        "Description": "The Automated Security Helper scan failed for repository \'${codecommit_repo}\' , review the report",\n        "ProductArn": "arn:aws:securityhub:\'${AWS_REGION}\':\'${accountid}\':product/\'${accountid}\'/default",\n        "Remediation": {\n            "Recommendation": {\n                "Text": "Review the report at \'${report_location}\'"\n            }\n        },\n        "Resources": [\n            {\n                "Type": "CodeBuild",\n                "Id": "\'${codebuild_build_arn}\'",\n                "Partition": "aws",\n                "Region": "\'${AWS_REGION}\'"\n            }\n        ],\n        "FindingProviderFields": {\n            "Severity": {\n                "Label": "HIGH"\n            },\n            "Types": [\n                "IaC and software scan - ASH"\n            ]\n        },\n        "GeneratorId": "\'${codebuild_build_arn}\'",\n        "Id": "\'${codecommit_commit_id}\'",\n        "SchemaVersion": "2018-10-08",\n        "Title": "Automated Security Helper - Scan Failed for \'${codecommit_repo}\'"\n    }\n]\'\n',
                'echo "$sechub_finding"',
                `if [ "$scan_fail" -eq "1" ];then aws securityhub batch-import-findings --findings "$sechub_finding"; fi`,
              ],
            },
          },
        }),
      }
    );

    scanReportsBucket.grantPut(scanningProject);
    scanningProject.addToRolePolicy(
      new IAM.PolicyStatement({
        actions: ["securityhub:BatchImportFindings"],
        resources: [
          `arn:aws:securityhub:${Aws.REGION}:${Aws.ACCOUNT_ID}:product/*/*`,
        ],
      })
    );

    scanningStage.addAction(
      new CodePipelineActions.CodeBuildAction({
        actionName: "ScanningAction",
        input: sourceArtifact,
        project: scanningProject,
      })
    );

    /**
     * Start Deploy Dev Stage
     */

    const deployStage = pipeline.addStage({
      stageName: "DeployDev",
    });

    const backendProject = new CodeBuild.PipelineProject(
      this,
      "DeployDevBackendRestAPIProject",
      {
        encryptionKey,
        environment: {
          buildImage: CodeBuild.LinuxBuildImage.STANDARD_6_0,
        },
        buildSpec: CodeBuild.BuildSpec.fromObject({
          version: "0.2",
          phases: {
            install: {
              "runtime-versions": {
                nodejs: "16",
              },
              commands: ["ls", "npm install"],
            },
            build: {
              commands: ["npm run deploy-backend-rest-api"],
            },
          },
          artifacts: {
            files: "backendRestAPIExports.json",
          },
        }),
      }
    );

    const allowCDKDeployPolicy = new IAM.Policy(this, "AllowCDKDeploy", {
      statements: [
        new IAM.PolicyStatement({
          actions: ["sts:AssumeRole"],
          effect: IAM.Effect.ALLOW,
          resources: [
            `arn:aws:iam::${Aws.ACCOUNT_ID}:role/cdk-*-${Aws.ACCOUNT_ID}-${Aws.REGION}`,
          ],
        }),
      ],
    });

    backendProject.role?.attachInlinePolicy(allowCDKDeployPolicy);

    const backendRestAPIExports = new CodePipeline.Artifact(
      "DevBackendRestAPIExports"
    );
    deployStage.addAction(
      new CodePipelineActions.CodeBuildAction({
        runOrder: 1,
        actionName: "DeployDevBackendRestAPIStack",
        input: sourceArtifact,
        project: backendProject,
        outputs: [backendRestAPIExports],
        environmentVariables: {
          PIPELINE_DEPLOY_ACCOUNT: { value: Aws.ACCOUNT_ID },
          PIPELINE_DEPLOY_REGION: { value: Aws.REGION },
          ENV_NAME: { value: "DEV" },
        },
      })
    );

    const frontendWebUIProject = new CodeBuild.PipelineProject(
      this,
      "DeployDevFrontendWebUIProject",
      {
        encryptionKey,
        environment: {
          buildImage: CodeBuild.LinuxBuildImage.STANDARD_6_0,
        },
        buildSpec: CodeBuild.BuildSpec.fromObject({
          version: "0.2",
          phases: {
            install: {
              "runtime-versions": {
                nodejs: "16",
              },
              commands: [
                "npm install",
                "cd frontend-web-ui/typesafe-react-app",
                "npm install",
                "cd ../..",
              ],
            },
            build: {
              commands: [
                'export ASSET=$"CODEBUILD_SRC_DIR_DevBackendRestAPIExports',
                "export RESOLVED_ASSET_DIR=$(eval echo $ASSET)",
                "cp $RESOLVED_ASSET_DIR/backendRestAPIExports.json frontend-web-ui/typesafe-react-app/src",
                "cd frontend-web-ui/typesafe-react-app",
                "npm run build",
                "cd ../..",
                "npm run deploy-frontend-web-ui",
              ],
            },
          },
        }),
      }
    );

    frontendWebUIProject.role?.attachInlinePolicy(allowCDKDeployPolicy);

    deployStage.addAction(
      new CodePipelineActions.CodeBuildAction({
        runOrder: 2,
        actionName: `DeployDevFrontendWebUIStack`,
        input: sourceArtifact,
        extraInputs: [backendRestAPIExports],
        project: frontendWebUIProject,
        environmentVariables: {
          PIPELINE_DEPLOY_ACCOUNT: { value: Aws.ACCOUNT_ID },
          PIPELINE_DEPLOY_REGION: { value: Aws.REGION },
          ENV_NAME: { value: "DEV" },
        },
      })
    );
  }
}
