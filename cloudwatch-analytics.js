const AWS = require('aws-sdk');
require('dotenv').config();

// Add logging for configuration
console.log('Configuring CloudWatch analytics with region:', process.env.AWS_REGION);
console.log('Has AWS credentials:', !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY));

AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    logger: console
});

const cloudWatch = new AWS.CloudWatch({
    apiVersion: '2010-08-01',
    maxRetries: 3,
    retryDelayOptions: { base: 300 }
});

const analytics = {
    async trackMetric(metricName, value, dimensions = []) {
        console.log(`Preparing to send metric: ${metricName}, value: ${value}`);
        const params = {
            MetricData: [{
                MetricName: metricName,
                Value: value,
                Unit: 'Count',
                Dimensions: dimensions,
                Timestamp: new Date()
            }],
            Namespace: 'VotingApp'
        };

        try {
            console.log('Sending metric to CloudWatch:', JSON.stringify(params, null, 2));
            const result = await cloudWatch.putMetricData(params).promise();
            console.log(`Metric ${metricName} tracked successfully:`, result);
            return result;
        } catch (error) {
            console.error('Error sending metric to CloudWatch:', {
                error: error.message,
                stack: error.stack,
                params: params
            });
            throw error;
        }
    },

    async trackPageView(pageName) {
        await this.trackMetric('PageViews', 1, [
            {
                Name: 'Page',
                Value: pageName
            }
        ]);
    },

    async trackUserInteraction(eventName) {
        await this.trackMetric('UserInteractions', 1, [
            {
                Name: 'EventType',
                Value: eventName
            }
        ]);
    },

    async trackPerformance(operationName, duration) {
        await this.trackMetric('OperationDuration', duration, [
            {
                Name: 'Operation',
                Value: operationName
            }
        ]);
    }
};

module.exports = analytics; 