import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (error) {
  console.error('Main Error:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h1>Application Error</h1>
      <p>${error.message}</p>
      <pre>${error.stack}</pre>
    </div>
  `;
}
