import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// We use a specific ID to avoid conflicts with WordPress themes that might use 'root'
const rootElement = document.getElementById('root-regenerate');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  // Silent fail allows this script to be loaded on pages where the shortcode isn't present
  console.debug("Root & Regenerate: Container not found on this page.");
}