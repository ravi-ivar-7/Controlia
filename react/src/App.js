import './App.css';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Sidebar from './components/navbars/Sidebar';
import { Toaster } from 'react-hot-toast';
import MatomoTracker from './services/matomoTracker';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Dashboard from './pages/dashboard/Dashboard';
import Header from './components/navbars/Header';
import Footer from './components/navbars/Footer';
import { SidebarProvider } from './context/SidebarContext';
import ExecuteScript from './pages/executeScripts/ExecuteScript';
import LoginWarningModal from './components/userModals/LoginWarningModal';
import LoginModal from './components/userModals/LoginModal';
import RegisterModal from './components/userModals/RegisterModal';
import ScheduleScript from './pages/scheduleScripts/ScheduleScript';
import { useUser } from './context/UserContext';

function App() {
  const { user } = useUser();
  console.log(user)
  return (

    <div className="App">
      <BrowserRouter>
        <SidebarProvider>
          <MatomoTracker />
          <Toaster />
          <SpeedInsights />

          <Header />

          <div className="main-content">
            <Sidebar />

            <div className="main">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/execute-scripts" element={user ? <ExecuteScript /> : <LoginWarningModal isOpen={true} redirectPath="/execute-scripts" />} />
                <Route path="/schedule-scripts" element={user ? <ScheduleScript /> : <LoginWarningModal isOpen={true} redirectPath="/schedule-scripts" />} />
                <Route path="/login" element={<LoginModal isOpen={true} />} />
                <Route path="/register" element={<RegisterModal isOpen={true} />} />
              </Routes>
            </div>
          </div>

          <Footer />
        </SidebarProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
