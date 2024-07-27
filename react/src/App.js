import './App.css';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useUser } from './context/UserContext';
import MatomoTracker from './services/matomo/matomoTracker';
import Home from './pages/home/Home'
import Dashboard from './pages/dashboard/Dashboard';

import LoginWarningModal from './components/userModals/LoginWarningModal';
import LoginModal from './components/userModals/LoginModal';
import RegisterModal from './components/userModals/RegisterModal';

import ScheduleScripts from './pages/scripts/scheduleScripts';
import Analytics from './pages/analytics/Analytics';
import  Profile  from './pages/profile/Profile';

import Script from './pages/scripts/Script';
import Scripts from './pages/scripts/Scripts';
import Notebooks from './pages/notebooks/Notebooks';
import Notebook from './pages/notebooks/Notebook';

import GrapesEditor from './pages/graphjs/editor';
import DragDropContainer from './pages/frontend/DragDropContainer';
import Projects from './pages/projects/Projects';
import GithubRepos from './pages/projects/GithubRepos';
import LogsPage from './pages/projects/logs';


function App() {
  const { user } = useUser();
  return (

    <div className="App">
      <BrowserRouter>
          <MatomoTracker />
          <Toaster />

         

          <div className="main-content">

            <div className="main">
              <Routes>

              <Route path="/editor"element={<GrapesEditor/>}/>
              <Route path="/dndcomp"element={<DragDropContainer/>}/>
              <Route path="/editor"element={<GrapesEditor/>}/>
              <Route path="/editor"element={<GrapesEditor/>}/>




                <Route path="/"element={ user? <Dashboard /> :<Home/>}/>
                <Route path="/home" element={<Home />} />
                <Route path="/logs" element={<LogsPage />} />
                
                <Route path="/login" element={<LoginModal isOpen={true} />} />
                <Route path="/register" element={<RegisterModal isOpen={true} />} />
         
                <Route path="/github-redirect" element={<GithubRepos/>} />
                <Route path="/logout" element={<Home />} />

                <Route path="/profile" element={ user? <Profile /> :<LoginWarningModal isOpen={true} redirectPath="profile" />}/>

                <Route path="/script" element={ user? <Script /> :<LoginWarningModal isOpen={true} redirectPath="script" />}/>
                <Route path="/scripts" element={ user? <Scripts /> :<LoginWarningModal isOpen={true} redirectPath="scripts" />}/>
                <Route path="/schedule-scripts" element={user ? <ScheduleScripts /> : <LoginWarningModal isOpen={true} redirectPath="/schedule-scripts" />} />
                <Route path="/share-scripts" element={user ? <ScheduleScripts /> : <LoginWarningModal isOpen={true} redirectPath="/share-scripts" />} />

                <Route path="/notebooks" element={ user? <Notebooks /> :<LoginWarningModal isOpen={true} redirectPath="notebooks" />}/>
                <Route path="/notebook" element={ user? <Notebook /> :<LoginWarningModal isOpen={true} redirectPath="notebook" />}/>
                <Route path="/schedule-notebooks" element={user ? <ScheduleScripts /> : <LoginWarningModal isOpen={true} redirectPath="/schedule-notebooks" />} />
                <Route path="/share-notebooks" element={user ? <ScheduleScripts /> : <LoginWarningModal isOpen={true} redirectPath="/share-notebooks" />} />

                <Route path="/projects" element={ user? <Projects /> :<LoginWarningModal isOpen={true} redirectPath="projects" />}/>
                <Route path="/deploy-projects" element={ user? <Notebooks /> :<LoginWarningModal isOpen={true} redirectPath="deploy-projects" />}/>

                <Route path="/dashboard" element={ user? <Dashboard /> :<LoginWarningModal isOpen={true} redirectPath="/dashboard" />}/>
                <Route path="/analytics" element={user ? <Analytics /> : <LoginWarningModal isOpen={true} redirectPath="/analytics" />} />
                
                
              </Routes>
            </div>
          </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
