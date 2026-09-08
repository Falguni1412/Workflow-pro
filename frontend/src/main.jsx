import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { DarkModeProvider } from './context/DarkModeContext';
import App from './App';
import './index.css';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <DarkModeProvider>
          <App />
          <Toaster 
            position="top-right" 
            toastOptions={{
              className: 'dark:bg-slate-800 dark:text-white',
              style: {
                borderRadius: '12px',
                background: 'var(--toast-bg, #fff)',
                color: 'var(--toast-text, #333)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
              }
            }} 
          />
        </DarkModeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
