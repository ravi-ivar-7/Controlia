import './App.css';
import React,{useState, useEffect} from 'react';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {ReactNotifications} from 'react-notifications-component';

import { useUser } from './context/UserContext';
import MatomoTracker from './services/matomo/matomoTracker';
import Home from './pages/home/Home'
import Dashboard from './pages/dashboard/Dashboard';

import LoginWarningModal from './components/userModals/LoginWarningModal';
import LoginModal from './components/userModals/LoginModal';
import RegisterModal from './components/userModals/RegisterModal';

import Profile from './pages/profile/Profile';

import Workspaces from './pages/workspaces/Workspaces';
import Workspace from './pages/workspaces/Workspace';

import Labs from './pages/labs/Labs';
import Lab from './pages/labs/Lab';

import GithubRepoModal from './pages/workspaces/GithubWorkspaceModal';


function App() {
  const { user } = useUser();


return (

  <div className="App">
   
    <BrowserRouter>
      <MatomoTracker />

        <ReactNotifications />


      <div className="main-content">

        <div className="main">
      
          <Routes>
            <Route path="/" element={user ? <Dashboard /> : <Home />} />
            <Route path="/home" element={<Home />} />

            <Route path="/login" element={<LoginModal isOpen={true} />} />
            <Route path="/register" element={<RegisterModal isOpen={true} />} />

            <Route path="/github-redirect" element={<GithubRepoModal isOpen={true} redirectPath="/projects"  />} />


            <Route path="/logout" element={<Home />} />

            <Route path="/profile" element={user ? <Profile /> : <LoginWarningModal isOpen={true} redirectPath="profile" />} />

            {/* <Route path="/schedule-scripts" element={user ? <ScheduleScripts /> : <LoginWarningModal isOpen={true} redirectPath="/schedule-scripts" />} />
            <Route path="/share-scripts" element={user ? <ScheduleScripts /> : <LoginWarningModal isOpen={true} redirectPath="/share-scripts" />} /> */}

            <Route path="/labs" element={user ? <Labs /> : <LoginWarningModal isOpen={true} redirectPath="labs" />} />
            <Route path="/lab" element={user ? <Lab /> : <LoginWarningModal isOpen={true} redirectPath="lab" />} />
            {/* <Route path="/schedule-notebooks" element={user ? <ScheduleScripts /> : <LoginWarningModal isOpen={true} redirectPath="/schedule-notebooks" />} />
            <Route path="/share-notebooks" element={user ? <ScheduleScripts /> : <LoginWarningModal isOpen={true} redirectPath="/share-notebooks" />} /> */}

            <Route path="/workspaces" element={user ? <Workspaces /> : <LoginWarningModal isOpen={true} redirectPath="workspaces" />} />
            <Route path="/workspace" element={user ? <Workspace /> : <LoginWarningModal isOpen={true} redirectPath="workspace" />} />

            <Route path="/dashboard" element={user ? <Dashboard /> : <LoginWarningModal isOpen={true} redirectPath="/dashboard" />} />


          </Routes>
        </div>
      </div>
    </BrowserRouter>
  </div>
);
}

export default App;
