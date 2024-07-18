import './App.css';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MatomoTracker from './services/matomoTracker';
import Home from './pages/home/Home'
import Dashboard from './pages/dashboard/Dashboard';
import LoginWarningModal from './components/userModals/LoginWarningModal';
import LoginModal from './components/userModals/LoginModal';
import RegisterModal from './components/userModals/RegisterModal';
import ScheduleScripts from './pages/schedule/scheduleScripts';
import Analytics from './pages/analytics/Analytics';
import  Profile  from './pages/profile/Profile';
import Script from './pages/scripts/Script';
import Scripts from './pages/scripts/Scripts';

import { useUser } from './context/UserContext';

function App() {
  const { user } = useUser();
  console.log(user)
  return (

    <div className="App">
      <BrowserRouter>
          <MatomoTracker />
          <Toaster />

         

          <div className="main-content">

            <div className="main">
              <Routes>
                <Route path="/"element={ user? <Dashboard /> :<Home/>}/>
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<LoginModal isOpen={true} />} />
                <Route path="/register" element={<RegisterModal isOpen={true} />} />
                <Route path="/logout" element={<Home />} />

                <Route path="/profile" element={ user? <Profile /> :<LoginWarningModal isOpen={true} redirectPath="profile" />}/>

                <Route path="/script" element={ user? <Script /> :<LoginWarningModal isOpen={true} redirectPath="script" />}/>
                <Route path="/scripts" element={ user? <Scripts /> :<LoginWarningModal isOpen={true} redirectPath="scripts" />}/>

                <Route path="/dashboard" element={ user? <Dashboard /> :<LoginWarningModal isOpen={true} redirectPath="dashboard" />}/>
                <Route path="/analytics" element={user ? <Analytics /> : <LoginWarningModal isOpen={true} redirectPath="/analytics" />} />
                <Route path="/schedule-scripts" element={user ? <ScheduleScripts /> : <LoginWarningModal isOpen={true} redirectPath="/schedule-scripts" />} />
                
                
              </Routes>
            </div>
          </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
