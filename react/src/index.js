import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { UserProvider } from './context/UserContext';
import { SidebarProvider } from './context/SidebarContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
<React.StrictMode>
    <UserProvider>
      <SidebarProvider>
         <App />
      </SidebarProvider>
    </UserProvider>
  </React.StrictMode>,
);

reportWebVitals();
