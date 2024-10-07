import AWS from "aws-sdk";

export const awsCredentials = new AWS.Credentials({
    accessKeyId : "AKIAZ24ISY4LZ7NWE4I3",
    secretAccessKey : "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"
});

export const db = new AWS.DynamoDB(awsCredentials);