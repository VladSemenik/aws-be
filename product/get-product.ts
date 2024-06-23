import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDB } from '@aws-sdk/client-dynamodb';

const TABLE_NAME = process.env.TABLE_NAME || '';
const STOCK_TABLE_NAME = process.env.STOCK_TABLE_NAME || '';

const PRIMARY_KEY = process.env.PRIMARY_KEY || '';
const STOCK_PRIMARY_KEY = process.env.STOCK_PRIMARY_KEY || '';

const db = DynamoDBDocument.from(new DynamoDB());

// async is nessasary
export const getProductsById = async (event) => {
    try {
        const id = event.pathParameters.productId

        const params = {
            TableName: TABLE_NAME,
            Key: {
                [PRIMARY_KEY]: id
            }
        };
        
        const stockParams = {
            TableName: STOCK_TABLE_NAME,
            Key: {
                [STOCK_PRIMARY_KEY]: id
            }
        };

    
        const stock = await db.get(stockParams);
        const product = await db.get(params);

        const result = { ...product.Item, stock: stock.Item?.stock }

        return { statusCode: 200, body: JSON.stringify(result) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify(error) };
    }
}