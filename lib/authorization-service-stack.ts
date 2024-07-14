import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Function, Runtime, Code, LayerVersion } from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const myLayer = new LayerVersion(this, 'MyLayer', {
      code: Code.fromAsset('my-layer/my-layer.zip'),
      compatibleRuntimes: [Runtime.NODEJS_16_X],
    });

    const myFunctionRole = new iam.Role(this, 'MyLambdaExecutionRole1', {
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        managedPolicies: [
            iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
        ],
      });

    const basicAuthorizer = new Function(this, 'basic-authorizer', {
      runtime: Runtime.NODEJS_16_X,
      handler: 'basic-authorizer.handler',
      code: Code.fromAsset(path.join(__dirname, '../auth')),
      layers: [myLayer],
      role: myFunctionRole,
      environment: {
        'vladsemenik': process.env.vladsemenik || 'NO_ENV'
      }
    });


    // Export the Lambda function's ARN
    new cdk.CfnOutput(this, 'basic-authorizer-arn', {
        value: basicAuthorizer.functionArn,
        exportName: 'basic-authorizer-arn'
    });
  }
}
