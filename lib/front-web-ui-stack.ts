import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import * as Cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as S3 from "aws-cdk-lib/aws-s3";
import * as S3Deployment from "aws-cdk-lib/aws-s3-deployment";
import * as WAFv2 from "aws-cdk-lib/aws-wafv2";
import { Construct } from "constructs";
import * as path from "path";

export interface FrontendWebUIStackProps extends StackProps {}

export class FrontendWebUIStack extends Stack {
  constructor(scope: Construct, id: string, props: FrontendWebUIStackProps) {
    super(scope, id, props);

    const accessLogsBucket = new S3.Bucket(this, "AccessLogsBucket", {
      blockPublicAccess: S3.BlockPublicAccess.BLOCK_ALL,
      encryption: S3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
    });

    const hostingBucket = new S3.Bucket(this, "HostingBucket", {
      versioned: true,
      blockPublicAccess: S3.BlockPublicAccess.BLOCK_ALL,
      encryption: S3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      serverAccessLogsBucket: accessLogsBucket,
    });

    const webACL = new WAFv2.CfnWebACL(this, "WebACL", {
      defaultAction: {
        allow: {},
      },
      scope: "CLOUDFRONT",
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: "CloudfrontWebACL",
        sampledRequestsEnabled: false,
      },
      rules: [
        {
          name: "AWS-AWSManagedRulesCommonRuleSet",
          priority: 1,
          overrideAction: {
            none: {},
          },
          statement: {
            managedRuleGroupStatement: {
              name: "AWSManagedRulesCommonRuleSet",
              vendorName: "AWS",
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: "CloudfrontWebAclCrs",
            sampledRequestsEnabled: false,
          },
        },
        {
          name: "AWS-AWSManagedRulesKnownBadInputsRuleSet",
          priority: 2,
          overrideAction: {
            none: {},
          },
          statement: {
            managedRuleGroupStatement: {
              name: "AWSManagedRulesKnownBadInputsRuleSet",
              vendorName: "AWS",
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: "CloudfrontWebAclKbirs",
            sampledRequestsEnabled: false,
          },
        },
      ],
    });

    const originAccessIdentity = new Cloudfront.OriginAccessIdentity(
      this,
      "OriginAccessIdentity"
    );
    hostingBucket.grantRead(originAccessIdentity);

    const cloudFrontWebDistaccessLogsBucket = new S3.Bucket(
      this,
      "CloudFrontDistAccessLogsBucket",
      {
        blockPublicAccess: S3.BlockPublicAccess.BLOCK_ALL,
        encryption: S3.BucketEncryption.S3_MANAGED,
        enforceSSL: true,
      }
    );

    const distribution = new Cloudfront.CloudFrontWebDistribution(
      this,
      "WebsiteDistribution",
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: hostingBucket,
              originAccessIdentity: originAccessIdentity,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
                viewerProtocolPolicy:
                  Cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
              },
            ],
          },
        ],
        viewerProtocolPolicy: Cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        webACLId: webACL.attrArn,
        loggingConfig: { bucket: cloudFrontWebDistaccessLogsBucket },
        errorConfigurations: [
          {
            errorCode: 404,
            errorCachingMinTtl: 0,
            responseCode: 200,
            responsePagePath: "/index.html",
          },
          {
            errorCode: 403,
            errorCachingMinTtl: 0,
            responseCode: 200,
            responsePagePath: "/index.html",
          },
        ],
      }
    );

    new S3Deployment.BucketDeployment(this, "WebsiteDeployment", {
      sources: [
        S3Deployment.Source.asset(
          `${path.resolve(
            __dirname
          )}/../frontend-web-ui/typesafe-react-app/build`
        ),
      ],
      destinationBucket: hostingBucket,
      distribution: distribution,
      memoryLimit: 1024,
    });

    new CfnOutput(this, "WebsiteDomain", {
      value: distribution.distributionDomainName,
      description: "Domain for the CloudFront distribution",
    });
  }
}
