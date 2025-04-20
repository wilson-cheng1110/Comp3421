const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const auth = {
    async register(username, password, email) {
        try {
            // Check if user already exists
            const params = {
                TableName: process.env.DYNAMODB_TABLE_USERS,
                Key: {
                    username
                }
            };

            const existingUser = await dynamoDB.get(params).promise();
            if (existingUser.Item) {
                throw new Error('Username already exists');
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create new user
            const userParams = {
                TableName: process.env.DYNAMODB_TABLE_USERS,
                Item: {
                    username,
                    password: hashedPassword,
                    email,
                    createdAt: new Date().toISOString()
                }
            };

            await dynamoDB.put(userParams).promise();
            return { message: 'User registered successfully' };
        } catch (error) {
            throw error;
        }
    },

    async login(username, password) {
        try {
            const params = {
                TableName: process.env.DYNAMODB_TABLE_USERS,
                Key: {
                    username
                }
            };

            const result = await dynamoDB.get(params).promise();
            if (!result.Item) {
                throw new Error('User not found');
            }

            const isValidPassword = await bcrypt.compare(password, result.Item.password);
            if (!isValidPassword) {
                throw new Error('Invalid password');
            }

            // Return user data (excluding password)
            const { password: _, ...userWithoutPassword } = result.Item;
            return userWithoutPassword;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = auth; 