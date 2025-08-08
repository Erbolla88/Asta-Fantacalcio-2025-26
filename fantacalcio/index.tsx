import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'https://esm.sh/uuid@9.0.1'; // Import for side effects if needed, or direct import in files

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
