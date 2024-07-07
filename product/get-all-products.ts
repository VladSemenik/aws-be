import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDB } from '@aws-sdk/client-dynamodb';

const TABLE_NAME = process.env.TABLE_NAME || '';
const STOCK_TABLE_NAME = process.env.STOCK_TABLE_NAME || '';

const PRIMARY_KEY = process.env.PRIMARY_KEY || '';
const STOCK_PRIMARY_KEY = process.env.STOCK_PRIMARY_KEY || '';

const db = DynamoDBDocument.from(new DynamoDB());

// async is nessasary
export const  getProductsList = async (event) => {

  const params = {
    TableName: TABLE_NAME,
    // Key: {}
  };

  const stockParams = {
    TableName: STOCK_TABLE_NAME,
    // Key: {}
  };


  try {
    const stocks = await db.scan(stockParams);
    const products = await db.scan(params);

    const map = {}
    stocks.Items?.forEach(({ product_id, stock }) => {
      map[product_id] = stock
    })

    const result = products.Items?.map((product) => {
      return {
        ...product,
        stock: map[product.id],
      }
    })

    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify(error) };
  }
};
