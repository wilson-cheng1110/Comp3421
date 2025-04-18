import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsconfig from '../aws-exports';
import { getCurrentUser, signOut, isAuthenticated } from './auth';

// Initialize Amplify with exported configuration
Amplify.configure(awsconfig);

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
          console.log('User is not authenticated');
          return;
        }

        const currentUser = await getCurrentUser();
        setUser(currentUser);
        console.log('Current user:', currentUser.username);
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    }

    init();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.username}!</h1>
      <button onClick={handleSignOut}>Sign Out</button>
      {/* TODO: Add poll components here */}
    </div>
  );
}

const AuthenticatedApp = withAuthenticator(App);

// Create root element
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthenticatedApp />
  </React.StrictMode>
);