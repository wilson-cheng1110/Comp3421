import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Auth } from 'aws-amplify';

// Initialize Amplify
const awsConfig = {
    Auth: {
        region: 'us-east-1',
        userPoolId: process.env.USER_POOL_ID,
        userPoolWebClientId: process.env.USER_POOL_CLIENT_ID,
    }
};

Amplify.configure(awsConfig);

// Export the withAuthenticator HOC
export { withAuthenticator };

// Helper function to get the current authenticated user
export async function getCurrentUser() {
    try {
        const user = await Auth.currentAuthenticatedUser();
        return user;
    } catch (error) {
        console.error('Error getting current user:', error);
        throw error;
    }
}

// Helper function to sign out
export async function signOut() {
    try {
        await Auth.signOut();
    } catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
}

export async function isAuthenticated() {
    try {
        await Auth.currentSession();
        return true;
    } catch {
        return false;
    }
} 