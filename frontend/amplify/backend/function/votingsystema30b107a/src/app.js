/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

const express = require('express')
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const AWS = require('aws-sdk')

// Initialize AWS SDK
const dynamoDb = new AWS.DynamoDB.DocumentClient()

// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});

/**********************
 * Example get method *
 **********************/

app.get('/polls', function(req, res) {
  // Add your code here
  res.json({success: 'get call succeed!', url: req.url});
});

app.get('/polls/*', function(req, res) {
  // Add your code here
  res.json({success: 'get call succeed!', url: req.url});
});

/****************************
* Example post method *
****************************/

app.post('/polls', function(req, res) {
  // Add your code here
  res.json({success: 'post call succeed!', url: req.url, body: req.body})
});

app.post('/polls/*', function(req, res) {
  // Add your code here
  res.json({success: 'post call succeed!', url: req.url, body: req.body})
});

/****************************
* Example put method *
****************************/

app.put('/polls', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

app.put('/polls/*', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

/****************************
* Example delete method *
****************************/

app.delete('/polls', function(req, res) {
  // Add your code here
  res.json({success: 'delete call succeed!', url: req.url});
});

app.delete('/polls/*', function(req, res) {
  // Add your code here
  res.json({success: 'delete call succeed!', url: req.url});
});

// Get a specific poll
app.get('/polls/:pollId', async function(req, res) {
  try {
    const params = {
      TableName: process.env.POLLS_TABLE,
      Key: {
        pollId: req.params.pollId
      }
    }
    
    const result = await dynamoDb.get(params).promise()
    
    if (!result.Item) {
      res.status(404).json({ error: 'Poll not found' })
      return
    }
    
    res.json(result.Item)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Could not fetch poll' })
  }
})

// Submit a vote
app.post('/polls/:pollId/vote', async function(req, res) {
  try {
    const { optionId, userId } = req.body
    
    // Check if user has already voted
    const voteCheckParams = {
      TableName: process.env.VOTES_TABLE,
      Key: {
        pollId: req.params.pollId,
        userId: userId
      }
    }
    
    const existingVote = await dynamoDb.get(voteCheckParams).promise()
    
    if (existingVote.Item) {
      res.status(400).json({ error: 'User has already voted in this poll' })
      return
    }
    
    // Record the vote
    const voteParams = {
      TableName: process.env.VOTES_TABLE,
      Item: {
        pollId: req.params.pollId,
        userId: userId,
        optionId: optionId,
        timestamp: new Date().toISOString()
      }
    }
    
    await dynamoDb.put(voteParams).promise()
    
    // Update poll option count
    const updateParams = {
      TableName: process.env.POLLS_TABLE,
      Key: {
        pollId: req.params.pollId
      },
      UpdateExpression: 'ADD options.#optionId.votes :inc',
      ExpressionAttributeNames: {
        '#optionId': optionId
      },
      ExpressionAttributeValues: {
        ':inc': 1
      }
    }
    
    await dynamoDb.update(updateParams).promise()
    
    res.json({ success: true, message: 'Vote recorded successfully' })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Could not process vote' })
  }
})

// Check if user has voted
app.get('/polls/:pollId/has-voted/:userId', async function(req, res) {
  try {
    const params = {
      TableName: process.env.VOTES_TABLE,
      Key: {
        pollId: req.params.pollId,
        userId: req.params.userId
      }
    }
    
    const result = await dynamoDb.get(params).promise()
    
    res.json({ hasVoted: !!result.Item })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Could not check vote status' })
  }
})

app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
