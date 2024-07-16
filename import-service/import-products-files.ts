import { S3 } from "aws-sdk"

const s3 = new S3()

export const importProductsFile = async (event) => {

    const fileName = event.queryStringParameters.name;
    
    if (!fileName) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'File name is required' }),
        };
    }

    const params = {
        Bucket: 'importservicestack-importservice88b434cc-wosjisr5udex',
        Key: "uploaded/" + fileName,
        Expires: 3600,
        ContentType: 'text/csv'
    };

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
        'Access-Control-Allow-Credentials': true,
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