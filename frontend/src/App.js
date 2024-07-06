import './App.css';
import Sidebar from './components/navbars/Sidebar';
import { Toaster } from 'react-hot-toast';
import MatomoTracker from './utils/matomoTracker';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Header from './components/navbars/Header';
import Footer from './components/navbars/Footer';
import { SidebarProvider } from './context/SidebarContext'; // Import SidebarProvider
import { CppServer } from './pages/executes/CppServer'; // Import CppServer component
import { WsTest } from './pages/executes/WsTest';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <SidebarProvider>

          <MatomoTracker />
          <Toaster />
          <SpeedInsights />

          <div className='header'>
            <Header />
          </div>

          <div className='main-content'>
            <div className='sidebar'>
              <Sidebar />
            </div>

            <div className='main'>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/wstest" element={<WsTest />} />
                <Route path="/cppserver" element={<CppServer />} />
              </Routes>
            </div>
          </div>

          <div className='footer'>
            <Footer />
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
