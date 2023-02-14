import {
  Duration,
  RemovalPolicy,
  Stack,
  StackProps,
  CfnOutput,
} from "aws-cdk-lib";
import * as ApiGateway from "aws-cdk-lib/aws-apigateway";
import * as Cognito from "aws-cdk-lib/aws-cognito";
import * as DynamodDB from "aws-cdk-lib/aws-dynamodb";
import * as IAM from "aws-cdk-lib/aws-iam";
import * as Lambda from "aws-cdk-lib/aws-lambda";
import * as Logs from "aws-cdk-lib/aws-logs";
import * as LambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
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

    const logGroup = new Logs.LogGroup(this, "ApiGatewayAccessLogs");

    const restAPI = new ApiGateway.RestApi(this, "BackendRestApi", {
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
          externalModules: ["@aws-sdk/*"],
        },
      }
    );

    const v1Resource = restAPI.root.addResource("v1");

    addLambdaBackedEndpoint({
      parentResource: v1Resource,
      resourceName: "todos",
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
