const analytics = {
    // Track page views
    async trackPageView(pageName) {
        await this.sendToBackend('/api/analytics/pageview', {
            page: pageName,
            timestamp: new Date().toISOString()
        });
    },

    // Track user interactions
    async trackInteraction(eventName, details = {}) {
        await this.sendToBackend('/api/analytics/interaction', {
            name: eventName,
            details,
            timestamp: new Date().toISOString()
        });
    },

    // Track performance metrics
    async trackPerformance(metricName, value) {
        await this.sendToBackend('/api/analytics/performance', {
            metric: metricName,
            value,
            timestamp: new Date().toISOString()
        });
    },

    // Send data to backend
    async sendToBackend(endpoint, data) {
        try {
            await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        } catch (error) {
            console.error('Analytics tracking failed:', error);
        }
    }
};

// Export for use in other files
window.analytics = analytics; 