import { S3 } from "aws-sdk"
import fetch from "node-fetch"

const s3 = new S3()

export const importProductsFile = async (event) => {

    const fileName = event.queryStringParameters.name;
    
    if (!fileName) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'File name is required' }),
        };
    }

    const expiresIn = 3600; // URL expiration time in seconds

    const params = {
        Bucket: 'arn:aws:s3:global:258886028601:accesspoint/uploaded',
        Key: "uploaded/" + fileName,
        Expires: expiresIn,
    };

    const headers = {
        'Access-Control-Allow-Origin': '*',  // Replace with your allowed origin(s)
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
        'Access-Control-Allow-Credentials': true,  // Set to true if you are allowing credentials
    };

    try {
        console.log(fileName)
        const url = s3.getSignedUrl('putObject', params);

        return {
            statusCode: 200,
            headers,
            body: url,
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Could not generate URL' }),
        };
    }
}