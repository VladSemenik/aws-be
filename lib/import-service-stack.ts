import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'import-service', {
      removalPolicy: cdk.RemovalPolicy.DESTROY, // only for testing purposes
      autoDeleteObjects: true, // auto-delete objects when bucket is deleted
      // publicReadAccess: true, // allow public read access
      // blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // block public access settings
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
            s3.HttpMethods.DELETE,
            s3.HttpMethods.HEAD
          ],
          allowedOrigins: ['*'], // allow requests from any origin (adjust as needed)
          allowedHeaders: ['*'] // allow any headers (adjust as needed)
        }
      ]
    })

    bucket.addToResourcePolicy(new iam.PolicyStatement({
      actions: ['s3:PutObject'],
      effect: iam.Effect.ALLOW,
      principals: [new iam.AnyPrincipal()], // allow anyone to perform the action
      resources: [bucket.bucketArn + '/uploaded/*'], // grant access to all objects in the bucket
      conditions: {
        StringEqualsIfExists: {
          's3:x-amz-acl': 'bucket-owner-full-control' // ensure bucket owner has full control
        }
      }
    }));

    const role = new iam.Role(this, 'MyLambdaS3AccessRole', {
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
    });

    role.addToPolicy(new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [new iam.AnyPrincipal()],
        actions: ['s3:PutObject', 's3:GetObject'],
        resources: [`${bucket.bucketArn}/uploaded/*`]
    }));


    const importProductsFile = new lambda.Function(this, 'import-products-files', {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset('import-service'),
      handler: 'import-products-files.importProductsFile',
      role,
    });

    const api = new apigateway.RestApi(this, 'import', {
      restApiName: 'Import Service',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,  // Allow all origins
        allowMethods: apigateway.Cors.ALL_METHODS   // Allow all methods (GET, POST, etc.)
      }
    });

    const importResourse = api.root.addResource('import');

    importResourse.addMethod('GET', new apigateway.LambdaIntegration(importProductsFile));
  }
}
