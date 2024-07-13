import './App.css';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MatomoTracker from './services/matomoTracker';
import Home from './pages/home/Home'
import Dashboard from './pages/dashboard/Dashboard';
import { SidebarProvider } from './context/SidebarContext';
import ExecuteScript from './pages/executeScripts/ExecuteScript';
import LoginWarningModal from './components/userModals/LoginWarningModal';
import LoginModal from './components/userModals/LoginModal';
import RegisterModal from './components/userModals/RegisterModal';
import ScheduleScript from './pages/scheduleScripts/ScheduleScript';
import DeployScript from './pages/deployScripts/DeployScript';
import Analytics from './pages/analytics/Analytics';
import  Profile  from './pages/profile/Profile';
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

         

          <div className="main-content">

            <div className="main">
              <Routes>
                <Route path="/" element={<Home />} />

                <Route path="/login" element={<LoginModal isOpen={true} />} />
                <Route path="/register" element={<RegisterModal isOpen={true} />} />

                <Route path="/profile" element={ user? <Profile /> :<LoginWarningModal isOpen={true} redirectPath="profile" />}/>

                <Route path="/dashboard" element={ user? <Dashboard /> :<LoginWarningModal isOpen={true} redirectPath="dashboard" />}/>
                <Route path="/analytics" element={user ? <Analytics /> : <LoginWarningModal isOpen={true} redirectPath="/analytics" />} />

                <Route path="/execute-scripts" element={user ? <ExecuteScript /> : <LoginWarningModal isOpen={true} redirectPath="/execute-scripts" />} />
                <Route path="/schedule-scripts" element={user ? <ScheduleScript /> : <LoginWarningModal isOpen={true} redirectPath="/schedule-scripts" />} />
                <Route path="/deploy-scripts" element={user ? <DeployScript /> : <LoginWarningModal isOpen={true} redirectPath="/deploy-scripts" />} />
                
                
              </Routes>
            </div>
          </div>

        </SidebarProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
