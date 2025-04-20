// Get the current domain and use it as the API base URL
const API_BASE_URL = `${window.location.protocol}//${window.location.host}/api`;

const api = {
    async register(username, password, email) {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, email }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registration failed');
        }
        return response.json();
    },

    async login(username, password) {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
        }

        return response.json();
    },

    async createPoll(question, options, userId) {
        const response = await fetch(`${API_BASE_URL}/polls`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question, options, userId }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create poll');
        }
        return response.json();
    },

    async getPolls() {
        const response = await fetch(`${API_BASE_URL}/polls`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch polls');
        }
        return response.json();
    },

    async getPoll(pollId) {
        const response = await fetch(`${API_BASE_URL}/polls/${pollId}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch poll');
        }
        return response.json();
    },

    async updatePoll(pollId, { question, options, userId }) {
        const response = await fetch(`${API_BASE_URL}/polls/${pollId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question, options, userId }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update poll');
        }
        return response.json();
    },

    async vote(pollId, optionId, userId) {
        const response = await fetch(`${API_BASE_URL}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pollId, optionId, userId }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to vote');
        }
        return response.json();
    }
};

// Store user session
const session = {
    setUser(userData) {
        localStorage.setItem('user', JSON.stringify(userData));
    },
    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    clearUser() {
        localStorage.removeItem('user');
    }
}; 