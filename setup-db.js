const AWS = require('aws-sdk');
require('dotenv').config();

// Configure AWS
AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamodb = new AWS.DynamoDB();

const tables = [
    {
        TableName: process.env.DYNAMODB_TABLE_USERS,
        KeySchema: [{ AttributeName: 'username', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'username', AttributeType: 'S' }],
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
    },
    {
        TableName: process.env.DYNAMODB_TABLE_POLLS,
        KeySchema: [{ AttributeName: 'pollId', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'pollId', AttributeType: 'S' }],
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
    },
    {
        TableName: process.env.DYNAMODB_TABLE_OPTIONS,
        KeySchema: [
            { AttributeName: 'pollId', KeyType: 'HASH' },
            { AttributeName: 'optionId', KeyType: 'RANGE' }
        ],
        AttributeDefinitions: [
            { AttributeName: 'pollId', AttributeType: 'S' },
            { AttributeName: 'optionId', AttributeType: 'S' }
        ],
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
    },
    {
        TableName: process.env.DYNAMODB_TABLE_VOTES,
        KeySchema: [
            { AttributeName: 'pollId', KeyType: 'HASH' },
            { AttributeName: 'userId', KeyType: 'RANGE' }
        ],
        AttributeDefinitions: [
            { AttributeName: 'pollId', AttributeType: 'S' },
            { AttributeName: 'userId', AttributeType: 'S' }
        ],
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
    }
];

async function createTables() {
    for (const tableParams of tables) {
        try {
            console.log(`Creating table: ${tableParams.TableName}`);
            await dynamodb.createTable(tableParams).promise();
            console.log(`Table ${tableParams.TableName} created successfully`);
        } catch (error) {
            if (error.code === 'ResourceInUseException') {
                console.log(`Table ${tableParams.TableName} already exists`);
            } else {
                console.error(`Error creating table ${tableParams.TableName}:`, error);
            }
        }
    }
}

createTables()
    .then(() => console.log('Setup complete'))
    .catch(error => console.error('Setup failed:', error)); 