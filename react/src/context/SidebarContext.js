import React, { createContext, useState, useContext, useEffect } from 'react';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [sidebarState, setSidebarState] = useState('');

  const setSidebarContext = (newState) => {
    setSidebarState(newState);
  };

  useEffect(() => {
    const updateSidebarState = () => {
      if (window.matchMedia("(max-width: 768px)").matches) {
        setSidebarState('nosidebar');
      } else if (window.matchMedia("(max-width: 1024px)").matches) {
        setSidebarState('fullsidebar');
      } else {
        setSidebarState('halfsidebar');
      }
    };

    updateSidebarState();

    window.addEventListener('resize', updateSidebarState);

    return () => window.removeEventListener('resize', updateSidebarState);
  }, []);

  return (
    <SidebarContext.Provider value={{ sidebarState, setSidebarContext }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);


