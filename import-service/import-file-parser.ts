import * as AWS from 'aws-sdk';
import * as csv from 'csv-parser';

const s3 = new AWS.S3();

export const handler = async (event) => {
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

    console.log(`Processing file: ${key} from bucket: ${bucket}`);

    const results = [];

    return new Promise((resolve, reject) => {
        s3.getObject({ Bucket: bucket, Key: key }).createReadStream()
            .pipe(csv())
            .on('data', (data) => {
                console.log('Record:', data);
                results.push(data);
            })
            .on('end', () => {
                console.log('CSV file successfully processed.');
                resolve(`Processed ${results.length} records.`);
            })
            .on('error', (err) => {
                console.error('Error processing CSV file:', err);
                reject(err);
            });
    });
};