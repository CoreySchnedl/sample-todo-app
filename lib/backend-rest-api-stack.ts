import { GSI_SUB_RECORDTYPE } from "@shared/constants";
import {
  Aws,
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import * as ApiGateway from "aws-cdk-lib/aws-apigateway";
import * as Cognito from "aws-cdk-lib/aws-cognito";
import * as DynamodDB from "aws-cdk-lib/aws-dynamodb";
import { AttributeType } from "aws-cdk-lib/aws-dynamodb";
import * as IAM from "aws-cdk-lib/aws-iam";
import * as Lambda from "aws-cdk-lib/aws-lambda";
import * as LambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import { LogLevel } from "aws-cdk-lib/aws-lambda-nodejs";
import * as Logs from "aws-cdk-lib/aws-logs";
import * as WAFv2 from "aws-cdk-lib/aws-wafv2";
import { Construct } from "constructs";
import * as path from "path";

export interface BackendRestAPIStackProps extends StackProps {}

export class BackendRestAPIStack extends Stack {
  public readonly cognitoUserPool: Cognito.IUserPool;
  public readonly cognitoWebClient: Cognito.IUserPoolClient;

  constructor(scope: Construct, id: string, props: BackendRestAPIStackProps) {
    super(scope, id, props);

    const userPool = new Cognito.UserPool(this, "UserPool", {
      advancedSecurityMode: Cognito.AdvancedSecurityMode.ENFORCED,

      selfSignUpEnabled: false,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
    });

    const webClient = userPool.addClient("WebClient", {
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
    });

    this.cognitoUserPool = userPool;
    this.cognitoWebClient = webClient;

    const mainTable = new DynamodDB.Table(this, "MainTable", {
      partitionKey: {
        name: "id",
        type: DynamodDB.AttributeType.STRING,
      },
      sortKey: {
        name: "recordType",
        type: DynamodDB.AttributeType.STRING,
      },
      encryption: DynamodDB.TableEncryption.AWS_MANAGED,
      billingMode: DynamodDB.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.RETAIN,
      timeToLiveAttribute: "ttl",
      pointInTimeRecovery: true,
    });

    mainTable.addGlobalSecondaryIndex({
      indexName: GSI_SUB_RECORDTYPE.name,
      partitionKey: {
        name: GSI_SUB_RECORDTYPE.primaryKey.name,
        type: AttributeType.STRING,
      },
      sortKey: {
        name: GSI_SUB_RECORDTYPE.sortKey.name,
        type: AttributeType.STRING,
      },
    });

    const logGroup = new Logs.LogGroup(this, "ApiGatewayAccessLogs");

    const webAcl = new WAFv2.CfnWebACL(this, "WebAcl", {
      defaultAction: {
        allow: {},
      },
      scope: "REGIONAL",
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: "webACL",
        sampledRequestsEnabled: true,
      },
      rules: [
        {
          name: "AWS-AWSManagedRulesCommonRuleSet",
          priority: 1,
          overrideAction: { none: {} },
          statement: {
            managedRuleGroupStatement: {
              name: "AWSManagedRulesCommonRuleSet",
              vendorName: "AWS",
              excludedRules: [{ name: "SizeRestrictions_BODY" }],
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: "awsCommonRules",
            sampledRequestsEnabled: true,
          },
        },
        {
          name: "awsAnonymousIP",
          priority: 2,
          overrideAction: { none: {} },
          statement: {
            managedRuleGroupStatement: {
              name: "AWSManagedRulesAnonymousIpList",
              vendorName: "AWS",
              excludedRules: [],
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: "awsAnonymous",
            sampledRequestsEnabled: true,
          },
        },
        {
          name: "awsIPReputation",
          priority: 3,
          overrideAction: { none: {} },
          statement: {
            managedRuleGroupStatement: {
              name: "AWSManagedRulesAmazonIpReputationList",
              vendorName: "AWS",
              excludedRules: [],
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: "awsReputation",
            sampledRequestsEnabled: true,
          },
        },
      ],
    });

    const restAPI = new ApiGateway.RestApi(this, "BackendRestApi", {
      cloudWatchRole: true,
      endpointTypes: [ApiGateway.EndpointType.REGIONAL],
      deployOptions: {
        tracingEnabled: true,
        loggingLevel: ApiGateway.MethodLoggingLevel.INFO,
        stageName: "dev",
        accessLogDestination: new ApiGateway.LogGroupLogDestination(logGroup),
      },
      defaultCorsPreflightOptions: {
        allowOrigins: ApiGateway.Cors.ALL_ORIGINS,
        allowMethods: ApiGateway.Cors.ALL_METHODS,
        allowHeaders: ApiGateway.Cors.DEFAULT_HEADERS,
      },
    });

    new WAFv2.CfnWebACLAssociation(this, "WebACLAssociation", {
      webAclArn: webAcl.attrArn,
      resourceArn: `arn:aws:apigateway:${Aws.REGION}::/restapis/${restAPI.restApiId}/stages/${restAPI.deploymentStage.stageName}`,
    });

    const cognitoAuthorizer = new ApiGateway.CognitoUserPoolsAuthorizer(
      this,
      "UserPoolAuthorizer",
      {
        cognitoUserPools: [userPool],
      }
    );

    /**
     * Start Todos Lambda
     */
    const todosLambdaRole = new IAM.Role(this, "TodosLambdaExecutionRole", {
      assumedBy: new IAM.ServicePrincipal("lambda.amazonaws.com"),
    });

    todosLambdaRole.addToPolicy(
      new IAM.PolicyStatement({
        sid: "AllowCloudWatchLogs",
        effect: IAM.Effect.ALLOW,
        actions: [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ],
        resources: ["*"],
      })
    );

    todosLambdaRole.addToPolicy(
      new IAM.PolicyStatement({
        sid: "AllowXRayAccess",
        effect: IAM.Effect.ALLOW,
        actions: [
          "xray:PutTraceSegments",
          "xray:PutTelemetryRecords",
          "xray:GetSamplingRules",
          "xray:GetSamplingTargets",
          "xray:GetSamplingStatisticSummaries",
        ],
        resources: ["*"],
      })
    );

    mainTable.grantReadWriteData(todosLambdaRole);

    const todosLambdaFunction = new LambdaNodejs.NodejsFunction(
      this,
      "TodosLambdaFunction",
      {
        entry: `${path.resolve(
          __dirname
        )}/../backend-rest-api/lambdas/todo/index.ts`,
        runtime: Lambda.Runtime.NODEJS_18_X,
        architecture: Lambda.Architecture.X86_64,
        role: todosLambdaRole,
        tracing: Lambda.Tracing.ACTIVE,
        timeout: Duration.seconds(4),
        memorySize: 128,
        environment: {
          POWERTOOLS_SERVICE_NAME: id,
          POWERTOOLS_TRACER_CAPTURE_HTTPS_REQUESTS: "true",
          POWERTOOLS_LOGGER_LOG_EVENT: "true",
          LOG_LEVEL: "DEBUG",
          TABLE_NAME_MAIN: mainTable.tableName,
        },
        bundling: {
          minify: true,
          logLevel: LogLevel.INFO,
        },
      }
    );

    const v1Resource = restAPI.root.addResource("v1");

    const v1TodosResource = addLambdaBackedEndpoint({
      parentResource: v1Resource,
      resourceName: "todos",
      methods: ["ANY"],
      handler: todosLambdaFunction,
      cognitoAuthorizer,
    });
    addLambdaBackedEndpoint({
      parentResource: v1TodosResource,
      resourceName: "{id}",
      methods: ["ANY"],
      handler: todosLambdaFunction,
      cognitoAuthorizer,
    });

    new CfnOutput(this, "CognitoUserPoolId", {
      value: userPool.userPoolId,
      description: "Cognito UserPoolId required for frontend settings.",
    });
    new CfnOutput(this, "CognitoUserPoolWebClientId", {
      value: webClient.userPoolClientId,
      description: "Cognito ClientId required for frontend settings.",
    });
    new CfnOutput(this, "CognitoUserPoolRegion", {
      value: this.region,
      description: "Region of the cognito user pool.",
    });
    new CfnOutput(this, "ApiUrl", {
      value: restAPI.deploymentStage.urlForPath(),
      description: "Invoke URL of the backend API Gateway",
    });
  }
}

interface AddApiResourceProps {
  parentResource: ApiGateway.IResource;
  resourceName: string;
  methods: string[];
  handler: Lambda.IFunction;
  cognitoAuthorizer: ApiGateway.IAuthorizer;
}

function addLambdaBackedEndpoint(props: AddApiResourceProps) {
  const newResource = props.parentResource.addResource(props.resourceName);

  for (const method of props.methods) {
    newResource.addMethod(
      method,
      new ApiGateway.LambdaIntegration(props.handler),
      {
        authorizer: props.cognitoAuthorizer,
        authorizationType: ApiGateway.AuthorizationType.COGNITO,
      }
    );
  }
  return newResource;
}
