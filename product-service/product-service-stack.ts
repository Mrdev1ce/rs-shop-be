import * as cdk from '@aws-cdk/core';
import {RemovalPolicy} from '@aws-cdk/core';
import {AttributeType, Table} from "@aws-cdk/aws-dynamodb";
import {NodejsFunction, NodejsFunctionProps} from "@aws-cdk/aws-lambda-nodejs";
import path from 'path';
import {Runtime, Tracing} from "@aws-cdk/aws-lambda";
import {LambdaIntegration, RestApi} from "@aws-cdk/aws-apigateway";
import {Queue} from "@aws-cdk/aws-sqs";
import {SqsEventSource} from "@aws-cdk/aws-lambda-event-sources";
import {Subscription, SubscriptionProtocol, Topic} from "@aws-cdk/aws-sns";


export class ProductServiceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dynamoTable = this.createDynamoTable();

    const {createProductLambda, getProductsListLambda, getProductByIdLambda, catalogBatchProcessLambda} = this.createLambdas(dynamoTable.tableName);

    this.grantDynamoReadWritePermissionsToLambdas(dynamoTable, [
      createProductLambda,
      getProductsListLambda,
      getProductByIdLambda,
      catalogBatchProcessLambda
    ]);

    this.setUpApi({createProductLambda, getProductByIdLambda, getProductsListLambda});

    this.setUpSqsForBatchingProducts(catalogBatchProcessLambda);

    this.setUpSns();
  }

  private createDynamoTable() {
    return new Table(this, 'productService', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING
      },
      tableName: 'product-service',
      removalPolicy: RemovalPolicy.RETAIN
    });
  }

  private grantDynamoReadWritePermissionsToLambdas(table: Table, lamdas: NodejsFunction[]) {
    lamdas.forEach((lambda) => {
      table.grantReadWriteData(lambda);
    });
  }

  private createLambdas(tableName: string) {
    const lambdasPath = path.join(__dirname, 'handlers');
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        nodeModules: ['joi', 'uuid', 'source-map-support', 'aws-xray-sdk']
      },
      depsLockFilePath: path.join(__dirname, 'package-lock.json'),
      runtime: Runtime.NODEJS_12_X,
      environment: {
        PRODUCT_TABLE_NAME: tableName
      },
      tracing: Tracing.ACTIVE
    };
    const createProductLambda = new NodejsFunction(this, 'createProduct', {
      entry: path.join(lambdasPath, 'create-product', 'create-product.handler.ts'),
      handler: 'createProduct',
      ...nodeJsFunctionProps
    });
    const getProductsListLambda = new NodejsFunction(this, 'getProductList', {
      entry: path.join(lambdasPath, 'get-products-list', 'get-products-list.handler.ts'),
      handler: 'getProductsList',
      ...nodeJsFunctionProps
    });
    const getProductByIdLambda = new NodejsFunction(this, 'getProductById', {
      entry: path.join(lambdasPath, 'get-product-by-id', 'get-product-by-id.handler.ts'),
      handler: 'getProductById',
      ...nodeJsFunctionProps
    });
    const catalogBatchProcessLambda = new NodejsFunction(this, 'catalogBatchProcessLambda', {
      entry: path.join(lambdasPath, 'catalog-batch-process', 'catalog-batch-process.handler.ts'),
      handler: 'catalogBatchProcess',
      ...nodeJsFunctionProps
    });

    return {
      createProductLambda,
      getProductsListLambda,
      getProductByIdLambda,
      catalogBatchProcessLambda
    };
  }

  private setUpApi(
    {createProductLambda, getProductsListLambda, getProductByIdLambda}:
      {createProductLambda: NodejsFunction, getProductsListLambda: NodejsFunction, getProductByIdLambda: NodejsFunction}
  ) {
    const createProductLambdaIntegration = new LambdaIntegration(createProductLambda);
    const getProductsListLambdaIntegration = new LambdaIntegration(getProductsListLambda);
    const getProductByIdLambdaIntegration = new LambdaIntegration(getProductByIdLambda);

    const api = new RestApi(this, 'productsApi', {
      restApiName: 'products',
      defaultCorsPreflightOptions: {
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
        allowOrigins: ["*"],
        allowHeaders: ["*"],
      },
      deployOptions: { tracingEnabled: true }
    });

    const productsResource = api.root.addResource('products');
    productsResource.addMethod('GET', getProductsListLambdaIntegration);
    productsResource.addMethod('POST', createProductLambdaIntegration);

    const singleProductResource = productsResource.addResource('{productId}');
    singleProductResource.addMethod('GET', getProductByIdLambdaIntegration);
  }

  private setUpSqsForBatchingProducts(lambda: NodejsFunction) {
    const sqsQueue = new Queue(this, 'catalogBatchProcess');
    const sqsEventSource = new SqsEventSource(sqsQueue, {batchSize: 5});
    lambda.addEventSource(sqsEventSource);

    new cdk.CfnOutput(this, 'CatalogItemsQueueUrl', {
      value: sqsQueue.queueUrl,
      description: 'The url of catalogBatchProcess queue'
    });
    new cdk.CfnOutput(this, 'CatalogItemsQueueArn', {
      value: sqsQueue.queueArn,
      description: 'The arn of catalogBatchProcess queue'
    });
  }

  private setUpSns() {
    const snsTopic = new Topic(this, 'CreateProductTopic', {
      topicName: 'create-product-topic-cdk'
    });
    new Subscription(this, 'CreateProductSubscription', {
      protocol: SubscriptionProtocol.EMAIL,
      endpoint: 'dessqa.dev@gmail.com',
      topic: snsTopic
    });
    new Subscription(this, 'OutOfStockProductSubscription', {
      protocol: SubscriptionProtocol.EMAIL,
      endpoint: 'max.jsspec@gmail.com',
      topic: snsTopic,
      filterPolicy: {
        outOfStock: {
          conditions: ["true"]
        }
      }
    });
  }
}
