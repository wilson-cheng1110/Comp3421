# Voting Application

A full-stack voting application built with Node.js, Express, and AWS services.

## Features

- User authentication (register/login)
- Create and manage polls
- Vote on polls
- Real-time analytics tracking
- Grafana dashboards for monitoring

## AWS Services Used

- DynamoDB: For storing polls, votes, and user data
- Elastic Beanstalk: For application deployment
- CloudWatch: For application metrics and monitoring
- IAM: For managing service permissions

## Analytics Features

The application tracks the following metrics in CloudWatch:
- Page Views: Tracks visits to different pages
- User Interactions: Monitors user activities
- Operation Duration: Measures performance metrics

## Prerequisites

- Node.js
- AWS Account
- AWS CLI configured
- Grafana (for analytics dashboard)

## Environment Variables

Create a `.env` file with the following:

```
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
DYNAMODB_TABLE_USERS=Users
DYNAMODB_TABLE_POLLS=Polls
DYNAMODB_TABLE_OPTIONS=Options
DYNAMODB_TABLE_VOTES=Votes
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up the database:
   ```
   node setup-db.js
   ```

## Deployment

1. Create a ZIP file containing all necessary files
2. Deploy to Elastic Beanstalk through AWS Console
3. Configure environment variables in Elastic Beanstalk

## Analytics Setup

1. Configure CloudWatch permissions:
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Effect": "Allow",
               "Action": [
                   "cloudwatch:PutMetricData",
                   "cloudwatch:GetMetricData",
                   "cloudwatch:GetMetricStatistics",
                   "cloudwatch:ListMetrics"
               ],
               "Resource": "*"
           }
       ]
   }
   ```

2. Set up Grafana:
   - Add CloudWatch as a data source
   - Import the dashboard
   - Configure the following panels:
     - Page Views
     - User Interactions
     - Operation Performance

## Testing Analytics

Test the analytics endpoint:
```bash
curl http://your-eb-url/api/test-analytics
```

## Monitoring

Access your Grafana dashboard to view:
- Page view statistics
- User interaction metrics
- Application performance data

## License

MIT

