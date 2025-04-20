const express = require('express');
const AWS = require('aws-sdk');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const auth = require('./auth');
const analytics = require('./cloudwatch-analytics');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Configure AWS with more explicit settings
AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    correctClockSkew: true,
    maxRetries: 3
});

// Add error handling for AWS SDK
const dynamoDB = new AWS.DynamoDB.DocumentClient({
    convertEmptyValues: true,
    httpOptions: {
        timeout: 5000,
        connectTimeout: 5000
    }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
});

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, 'frontend'), {
    index: false, // Don't serve index.html automatically
    extensions: ['html'] // Automatically add .html extension
}));

// Authentication Routes with better error handling
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;
        
        if (!username || !password || !email) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                details: 'Username, password, and email are required'
            });
        }

        const result = await auth.register(username, password, email);
        res.json(result);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ 
            error: error.message,
            details: error.code || 'Registration failed'
        });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await auth.login(username, password);
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Poll Routes
app.get('/api/polls', async (req, res) => {
    try {
        // Get all polls
        const pollsParams = {
            TableName: process.env.DYNAMODB_TABLE_POLLS
        };
        const pollsResult = await dynamoDB.scan(pollsParams).promise();
        const polls = pollsResult.Items;

        // Get options for each poll
        const pollsWithOptions = await Promise.all(polls.map(async (poll) => {
            const optionsParams = {
                TableName: process.env.DYNAMODB_TABLE_OPTIONS,
                KeyConditionExpression: 'pollId = :pollId',
                ExpressionAttributeValues: {
                    ':pollId': poll.pollId
                }
            };
            
            const optionsResult = await dynamoDB.query(optionsParams).promise();
            return {
                ...poll,
                options: optionsResult.Items || []
            };
        }));

        res.json(pollsWithOptions);
    } catch (error) {
        console.error('Error fetching polls:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/polls', async (req, res) => {
    try {
        const { question, options, userId } = req.body;
        const pollId = Date.now().toString(); // Generate unique ID

        // Create poll
        const pollParams = {
            TableName: process.env.DYNAMODB_TABLE_POLLS,
            Item: {
                pollId,
                question,
                userId,
                createdAt: new Date().toISOString()
            }
        };

        await dynamoDB.put(pollParams).promise();

        // Create options
        for (const option of options) {
            const optionParams = {
                TableName: process.env.DYNAMODB_TABLE_OPTIONS,
                Item: {
                    pollId,
                    optionId: Date.now().toString(),
                    optionText: option,
                    votes: 0
                }
            };
            await dynamoDB.put(optionParams).promise();
        }

        res.json({ message: 'Poll created successfully', pollId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/vote', async (req, res) => {
    try {
        const { pollId, optionId, userId } = req.body;

        // Check if user has already voted
        const voteParams = {
            TableName: process.env.DYNAMODB_TABLE_VOTES,
            Key: {
                pollId,
                userId
            }
        };

        const existingVote = await dynamoDB.get(voteParams).promise();
        if (existingVote.Item) {
            return res.status(400).json({ error: 'User has already voted on this poll' });
        }

        // Record the vote
        const voteRecordParams = {
            TableName: process.env.DYNAMODB_TABLE_VOTES,
            Item: {
                pollId,
                userId,
                optionId,
                votedAt: new Date().toISOString()
            }
        };

        await dynamoDB.put(voteRecordParams).promise();

        // Update option vote count
        const updateParams = {
            TableName: process.env.DYNAMODB_TABLE_OPTIONS,
            Key: {
                pollId,
                optionId
            },
            UpdateExpression: 'SET votes = votes + :inc',
            ExpressionAttributeValues: {
                ':inc': 1
            }
        };

        await dynamoDB.update(updateParams).promise();

        res.json({ message: 'Vote recorded successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single poll with options
app.get('/api/polls/:pollId', async (req, res) => {
    try {
        const { pollId } = req.params;

        // Get poll
        const pollParams = {
            TableName: process.env.DYNAMODB_TABLE_POLLS,
            Key: {
                pollId
            }
        };
        const pollResult = await dynamoDB.get(pollParams).promise();
        
        if (!pollResult.Item) {
            return res.status(404).json({ error: 'Poll not found' });
        }

        // Get options for the poll
        const optionsParams = {
            TableName: process.env.DYNAMODB_TABLE_OPTIONS,
            KeyConditionExpression: 'pollId = :pollId',
            ExpressionAttributeValues: {
                ':pollId': pollId
            }
        };
        
        const optionsResult = await dynamoDB.query(optionsParams).promise();
        const pollWithOptions = {
            ...pollResult.Item,
            options: optionsResult.Items || []
        };

        res.json(pollWithOptions);
    } catch (error) {
        console.error('Error fetching poll:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update poll
app.put('/api/polls/:pollId', async (req, res) => {
    try {
        const { pollId } = req.params;
        const { question, options, userId } = req.body;

        // Verify poll exists and user owns it
        const pollParams = {
            TableName: process.env.DYNAMODB_TABLE_POLLS,
            Key: {
                pollId
            }
        };
        
        const pollResult = await dynamoDB.get(pollParams).promise();
        if (!pollResult.Item) {
            return res.status(404).json({ error: 'Poll not found' });
        }

        if (pollResult.Item.userId !== userId) {
            return res.status(403).json({ error: 'Not authorized to edit this poll' });
        }

        // Update poll question
        const updatePollParams = {
            TableName: process.env.DYNAMODB_TABLE_POLLS,
            Key: { pollId },
            UpdateExpression: 'SET question = :question',
            ExpressionAttributeValues: {
                ':question': question
            }
        };
        await dynamoDB.update(updatePollParams).promise();

        // Get existing options
        const existingOptionsParams = {
            TableName: process.env.DYNAMODB_TABLE_OPTIONS,
            KeyConditionExpression: 'pollId = :pollId',
            ExpressionAttributeValues: {
                ':pollId': pollId
            }
        };
        const existingOptionsResult = await dynamoDB.query(existingOptionsParams).promise();
        const existingOptions = existingOptionsResult.Items || [];

        // Update or create options
        for (const option of options) {
            if (option.optionId) {
                // Update existing option
                const updateOptionParams = {
                    TableName: process.env.DYNAMODB_TABLE_OPTIONS,
                    Key: {
                        pollId,
                        optionId: option.optionId
                    },
                    UpdateExpression: 'SET optionText = :optionText',
                    ExpressionAttributeValues: {
                        ':optionText': option.optionText
                    }
                };
                await dynamoDB.update(updateOptionParams).promise();
            } else {
                // Create new option
                const newOptionParams = {
                    TableName: process.env.DYNAMODB_TABLE_OPTIONS,
                    Item: {
                        pollId,
                        optionId: Date.now().toString(),
                        optionText: option.optionText,
                        votes: 0
                    }
                };
                await dynamoDB.put(newOptionParams).promise();
            }
        }

        // Delete options that are no longer present
        const updatedOptionIds = options.map(o => o.optionId).filter(id => id);
        for (const existingOption of existingOptions) {
            if (!updatedOptionIds.includes(existingOption.optionId)) {
                const deleteOptionParams = {
                    TableName: process.env.DYNAMODB_TABLE_OPTIONS,
                    Key: {
                        pollId,
                        optionId: existingOption.optionId
                    }
                };
                await dynamoDB.delete(deleteOptionParams).promise();
            }
        }

        res.json({ message: 'Poll updated successfully' });
    } catch (error) {
        console.error('Error updating poll:', error);
        res.status(500).json({ error: error.message });
    }
});

// Analytics endpoints
app.post('/api/analytics/pageview', async (req, res) => {
    try {
        const { page } = req.body;
        await analytics.trackPageView(page);
        res.json({ success: true });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/analytics/interaction', async (req, res) => {
    try {
        const { name } = req.body;
        await analytics.trackUserInteraction(name);
        res.json({ success: true });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/analytics/performance', async (req, res) => {
    try {
        const { metric, value } = req.body;
        await analytics.trackPerformance(metric, value);
        res.json({ success: true });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Test route for analytics
app.get('/api/test-analytics', async (req, res) => {
    try {
        console.log('Starting analytics test...');
        
        // Test page view
        console.log('Sending page view metric...');
        await analytics.trackPageView('test-page');
        console.log('Page view metric sent successfully');
        
        // Test user interaction
        console.log('Sending user interaction metric...');
        await analytics.trackUserInteraction('test-login');
        console.log('User interaction metric sent successfully');
        
        // Test performance
        console.log('Sending performance metric...');
        await analytics.trackPerformance('test-operation', 100);
        console.log('Performance metric sent successfully');
        
        res.json({ 
            message: 'Test metrics sent successfully',
            details: {
                region: process.env.AWS_REGION,
                hasCredentials: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
            }
        });
    } catch (error) {
        console.error('Test analytics error:', error);
        res.status(500).json({ 
            error: error.message,
            stack: error.stack,
            details: {
                region: process.env.AWS_REGION,
                hasCredentials: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
            }
        });
    }
});

// Root route - serve login.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
});

// Catch-all route for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Access the application at: http://localhost:${port}`);
    console.log(`AWS Region: ${process.env.AWS_REGION}`);
}); 