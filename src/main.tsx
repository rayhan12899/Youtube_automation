import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress Vite WebSocket connection errors
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message === 'WebSocket closed without opened.') {
    event.preventDefault();
  }
});

const originalConsoleError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('[vite] failed to connect to websocket')) {
    return;
  }
  originalConsoleError.apply(console, args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
