import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';

export class NodejsAwsShopBeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productsTable = new Table(this, 'products', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING
      },
      tableName: 'products',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const stocksTable = new Table(this, 'stocks', {
      partitionKey: {
        name: 'product_id',
        type: AttributeType.STRING
      },
      tableName: 'stocks',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const getAllProducts = new lambda.Function(this, 'get-all-products', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('product'),
      handler: 'get-all-products.getProductsList',
      environment: {
        PRIMARY_KEY: 'id',
        TABLE_NAME: productsTable.tableName,
        STOCK_PRIMARY_KEY: 'product_id',
        STOCK_TABLE_NAME: stocksTable.tableName,
      }
    });

    const getProduct = new lambda.Function(this, 'get-product', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('product'),
      handler: 'get-product.getProductsById',
      environment: {
        PRIMARY_KEY: 'id',
        TABLE_NAME: productsTable.tableName,
        STOCK_PRIMARY_KEY: 'product_id',
        STOCK_TABLE_NAME: stocksTable.tableName,
      }
    });

    const createProduct = new lambda.Function(this, 'create-product', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('product'),
      handler: 'create-product.createProduct',
      environment: {
        PRIMARY_KEY: 'id',
        TABLE_NAME: productsTable.tableName,
        STOCK_PRIMARY_KEY: 'product_id',
        STOCK_TABLE_NAME: stocksTable.tableName,
      }
    });

    const api = new apigateway.RestApi(this, 'product', {
      restApiName: 'Product Service'
    });

    const products = api.root.addResource('products');
    products.addMethod('GET', new apigateway.LambdaIntegration(getAllProducts));
    products.addMethod('POST', new apigateway.LambdaIntegration(createProduct));

    const singleProduct = products.addResource('{productId}')
    singleProduct.addMethod('GET', new apigateway.LambdaIntegration(getProduct));

    addCorsOptions(products);
    addCorsOptions(singleProduct);


    //test
    new cdk.CfnOutput(this, 'test', {
      value: createProduct.functionName,
      description: 'JavaScript Lambda function'
    });
  }
}

export function addCorsOptions(apiResource: apigateway.IResource) {
  apiResource.addMethod('OPTIONS', new apigateway.MockIntegration({
    // In case you want to use binary media types, uncomment the following line
    // contentHandling: ContentHandling.CONVERT_TO_TEXT,
    integrationResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
        'method.response.header.Access-Control-Allow-Origin': "'*'",
        'method.response.header.Access-Control-Allow-Credentials': "'false'",
        'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE'",
      },
    }],
    // In case you want to use binary media types, comment out the following line
    passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
    requestTemplates: {
      "application/json": "{\"statusCode\": 200}"
    },
  }), {
    methodResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': true,
        'method.response.header.Access-Control-Allow-Methods': true,
        'method.response.header.Access-Control-Allow-Credentials': true,
        'method.response.header.Access-Control-Allow-Origin': true,
      },
    }]
  })
}
