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

import Notebooks from './pages/notebooks/Notebooks';
import Notebook from './pages/notebooks/Notebook';

import Projects from './pages/projects/ProjectDashboard';
import GithubRepoModal from './pages/projects/GithubRepoModal';


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

            <Route path="/schedule-scripts" element={user ? <ScheduleScripts /> : <LoginWarningModal isOpen={true} redirectPath="/schedule-scripts" />} />
            <Route path="/share-scripts" element={user ? <ScheduleScripts /> : <LoginWarningModal isOpen={true} redirectPath="/share-scripts" />} />

            <Route path="/notebooks" element={user ? <Notebooks /> : <LoginWarningModal isOpen={true} redirectPath="notebooks" />} />
            <Route path="/notebook" element={user ? <Notebook /> : <LoginWarningModal isOpen={true} redirectPath="notebook" />} />
            <Route path="/schedule-notebooks" element={user ? <ScheduleScripts /> : <LoginWarningModal isOpen={true} redirectPath="/schedule-notebooks" />} />
            <Route path="/share-notebooks" element={user ? <ScheduleScripts /> : <LoginWarningModal isOpen={true} redirectPath="/share-notebooks" />} />

            <Route path="/projects" element={user ? <Projects /> : <LoginWarningModal isOpen={true} redirectPath="projects" />} />
            <Route path="/deploy-projects" element={user ? <Notebooks /> : <LoginWarningModal isOpen={true} redirectPath="deploy-projects" />} />

            <Route path="/dashboard" element={user ? <Dashboard /> : <LoginWarningModal isOpen={true} redirectPath="/dashboard" />} />


          </Routes>
        </div>
      </div>
    </BrowserRouter>
  </div>
);
}

export default App;
