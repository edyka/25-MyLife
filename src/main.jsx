import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Register service worker once (avoid duplicate registration)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        await navigator.serviceWorker.register('/sw.js');
      }
    } catch (err) {
      console.warn('SW registration skipped:', err);
    }
  });
}