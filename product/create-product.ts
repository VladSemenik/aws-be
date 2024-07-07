import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDB } from '@aws-sdk/client-dynamodb';

const TABLE_NAME = process.env.TABLE_NAME || '';
const STOCK_TABLE_NAME = process.env.STOCK_TABLE_NAME || '';

const PRIMARY_KEY = process.env.PRIMARY_KEY || '';
const STOCK_PRIMARY_KEY = process.env.STOCK_PRIMARY_KEY || '';

const db = DynamoDBDocument.from(new DynamoDB());

export const createProduct = async (event: any = {}) => {
  if (!event.body) {
    return { statusCode: 400, body: 'invalid request, you are missing the parameter body' };
  }
  const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body);

  const id = String(Date.now() + ~~(Math.random() * 1000))

  const { stock, ...restFields } = item;

  const params = {
    TableName: TABLE_NAME,
    Item: {
        [PRIMARY_KEY]: id,
        ...restFields
    }
  };

  const stockParams = {
    TableName: STOCK_TABLE_NAME,
    Item: {
        [STOCK_PRIMARY_KEY]: id,
        stock
    }
  };

  try {
    await db.put(stockParams);
    await db.put(params);
    return { statusCode: 201, body: '' };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify(error) };
  }
};