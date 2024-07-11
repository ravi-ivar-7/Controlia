import './App.css';
import React from 'react';
import { BrowserRouter, Route, Routes ,useLocation, useNavigate } from 'react-router-dom';
// import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/navbars/Sidebar';
import { Toaster } from 'react-hot-toast';
import MatomoTracker from './utils/matomoTracker';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Dashboard from './pages/dashboard/Dashboard';
import Header from './components/navbars/Header';
import Footer from './components/navbars/Footer';
import { SidebarProvider } from './context/SidebarContext';
import ExecuteScript from './pages/executeScripts/ExecuteScript';
import LoginWarningModal from './components/userModals/LoginWarningModal'; // Import the LoginModal component
import LoginModal from './components/userModals/LoginModal';
import RegisterModal from './components/userModals/RegisterModal';
import ScheduleScript from './pages/scheduleScripts/ScheduleScript';

function App() {
  // const { user } = useAuth();
  const user = localStorage.getItem('user')
  console.log(localStorage.getItem('token'))
console.log(user, 'user')
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
                
                <Route path="/execute-scripts" element={user ? <ExecuteScript /> : <LoginWarningModal isOpen={true} />}/>
                <Route path="/schedule-scripts" element={user ? <ScheduleScript /> : <LoginWarningModal isOpen={true} />}/>

                <Route path="/login" element={<LoginModal isOpen={true} />}/>
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
