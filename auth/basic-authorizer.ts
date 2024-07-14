import * as dotenv from 'dotenv';
import * as base64 from 'base-64';

dotenv.config();

export const handler = async (event) => {
    const authHeader = event.headers ? event.headers.Authorization : null;

    if (!authHeader) {
        return {
            statusCode: 401,
            body: 'Unauthorized: Authorization header is missing',
        };
    }

    const [authType, authToken] = authHeader.split(' ');

    if (authType.toLowerCase() !== 'basic') {
        return {
            statusCode: 403,
            body: 'Forbidden: Unsupported authorization type',
        };
    }

    const decodedToken = base64.decode(authToken);
    const [username, password] = decodedToken.split(':');

    const envPassword = process.env[username];

    if (envPassword && envPassword === password) {
        return {
            statusCode: 200,
            body: 'Access granted',
        };
    }

    return {
        statusCode: 403,
        body: 'Forbidden: Invalid credentials',
    };
};
