import React from 'react';
import { Link } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext'; // Import useSidebar hook
import { FaBars, FaTimes } from 'react-icons/fa'; // Import icons for toggle

const Footer = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebar(); // Access sidebar state and toggle function from context

  const navbarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#222831',
    padding: '1rem',
    flexWrap: 'wrap',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    position: 'relative', // Ensure relative position for button overlay
  };

  const brandStyle = {
    color: '#fff',
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 'bold',
  };

  const linksContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
  };

  const linksStyle = {
    listStyle: 'none',
    display: 'flex',
    gap: '1rem',
    margin: 0,
    padding: 0,
    alignItems: 'center',
  };

  const linkItemStyle = {
    margin: 0,
  };

  const linkStyle = {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '1rem',
    transition: 'color 0.3s ease',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
  };

  const linkHoverStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  };

  const toggleButtonStyle = {
    fontSize: '1.5rem',
    color: '#fff',
    cursor: 'pointer',
    transition: 'transform 0.3s ease',
    zIndex: 10,
  };

  const iconContainerStyle = {
    position: 'relative',
    zIndex: 10,
  };

  return (
    <nav style={navbarStyle}>

      <div style={linksContainerStyle}>
        <ul style={linksStyle}>
          <li style={linkItemStyle}>
          © Controlia
          </li>
         
        </ul>
      </div>

      <div style={iconContainerStyle}>
        {isSidebarOpen ? (
          <FaTimes
            className="toggle-icon"
            style={{ ...toggleButtonStyle, transform: 'translateX(-8px)' }}
            onClick={toggleSidebar}
          />
        ) : (
          <FaBars
            className="toggle-icon"
            style={toggleButtonStyle}
            onClick={toggleSidebar}
          />
        )}
      </div>


    </nav>
  );
};

export default Footer;
