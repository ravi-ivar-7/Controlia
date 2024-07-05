import './App.css';
import Sidebar from './components/sidebar/Sidebar';
import { Toaster } from 'react-hot-toast';
import MatomoTracker from './utils/matonoTracker';

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';


function App() {
  return (
    <div className="App">
  <BrowserRouter>
    <MatomoTracker />
    <Toaster />
    <div className="sidebar">
      <Sidebar />
    </div>
    <div className="main">
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </div>
  </BrowserRouter>
</div>
  );
}

export default App;