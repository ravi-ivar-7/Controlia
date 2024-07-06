import React, { createContext, useState, useContext } from 'react';

// Create a context object
const SidebarContext = createContext();

// Custom hook to access the context
export const useSidebar = () => useContext(SidebarContext);

// Context provider component
export const SidebarProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Initial state: sidebar is open

  // Function to toggle sidebar state
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};
