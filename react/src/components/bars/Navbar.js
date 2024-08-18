import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import { Header, ThreeStateButton } from './Navbar.style.js'
import { Modal, Button } from 'react-bootstrap';

import { CDBBtn } from "cdbreact";
const Navbar = ({ pageTitle }) => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [popupVisible, setPopupVisible] = useState(false);
  const [betaModal, setBetaModal] = useState(false);
  const { sidebarState, setSidebarContext } = useSidebar();

  const togglePopup = () => {
    setPopupVisible(!popupVisible);
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setPopupVisible(false);
    navigate('/')
  };

  const handleClick = (buttonState) => {
    setSidebarContext(buttonState);
  };

  const betaInfo = `
    <h2 style="color: #fff;">Controlia is in public beta.</h2>
    <p style="color: #ccc;">We love to hear from you! Please submit any questions, feedback, feature requests, and bugs via the support option in the sidebar nav.</p>
    <p style="color: #ccc;">Thank you for your contribution!</p>
    <i class="fas fa-heart" style="color: #ff4081;"></i>
  `;

  return (
    <Header>
      <ThreeStateButton>
        <div className="tri-state-toggle">
          <button
            className={`tri-state-toggle-button ${sidebarState === 'nosidebar' ? 'active' : ''}`}
            onClick={() => handleClick('nosidebar')}
          >
            <i className="fa fa-times"></i>
          </button>

          <button
            className={`tri-state-toggle-button ${sidebarState === 'fullsidebar' ? 'active' : ''}`}
            onClick={() => handleClick('fullsidebar')}
          >
            <i className="fa fa-align-left"></i>
          </button>

          <button
            className={`tri-state-toggle-button ${sidebarState === 'halfsidebar' ? 'active' : ''}`}
            onClick={() => handleClick('halfsidebar')}
          >
            <i className="fa fa-bars"></i>
          </button>
        </div>
      </ThreeStateButton>

      <h1 style={{ fontSize: '1rem', marginTop: '10px' }}>{pageTitle}</h1>

      <CDBBtn color="warning" onClick={() => setBetaModal(true)} >
        <i className="fas fa-info"></i>
      </CDBBtn>

      <div className="icon-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <div className="popup" onClick={togglePopup} style={{ cursor: 'pointer', marginLeft: '15px', }}>
          <i
            className="fas fa-user-circle"
            style={{ fontSize: '32px' }}
          ></i>
          {popupVisible && (
            <div className="popup-menu" style={{ position: 'absolute', top: '50px', right: '0', background: 'grey', border: '1px solid #ccc', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', zIndex: '1000', padding: '10px', borderRadius: '4px', minWidth: '150px' }}>
              {user ? (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <CDBBtn size="small" color="primary" style={{ margin: '10px 0', padding: '8px 16px' }}>
                      <Link className="popup-item" to="/profile" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                        <i className="fas fa-user" style={{ marginRight: '8px' }}></i> Profile
                      </Link>
                    </CDBBtn>

                    <CDBBtn size="small" color="primary" style={{ margin: '10px 0', padding: '8px 16px' }}>
                      <Link className="popup-item" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                        <i className="fas fa-comment-alt" style={{ marginRight: '8px' }}></i> Notificaton
                      </Link>
                    </CDBBtn>


                    <CDBBtn size="small" color="danger" style={{ margin: '10px 0', padding: '8px 16px' }}>
                      <div
                        className="popup-item"
                        onClick={handleLogout}
                        style={{ color: '#fff', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <i className="fas fa-sign-out-alt" style={{ marginRight: '8px' }}></i> Logout
                      </div>
                    </CDBBtn>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <CDBBtn size="small" color="primary" style={{ margin: '10px 0', padding: '8px 16px' }}>
                      <Link className="popup-item" to="/login" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                        <i className="fas fa-sign-in-alt" style={{ marginRight: '8px' }}></i> Login
                      </Link>
                    </CDBBtn>

                    <CDBBtn size="small" color="secondary" style={{ margin: '10px 0', padding: '8px 16px' }}>
                      <Link className="popup-item" to="/register" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                        <i className="fas fa-user-plus" style={{ marginRight: '8px' }}></i> Register
                      </Link>
                    </CDBBtn>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal show={betaModal} onHide={() => setBetaModal(false)} size="lg" aria-labelledby="beta-info-modal" centered dialogClassName="dark-modal">
        <Modal.Header closeButton className="dark-modal-header" style={{ backgroundColor: '#333', color: '#fff', }}>
          <Modal.Title id="beta-info-modal">Beta Information</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ textAlign: 'center', padding: '20px', backgroundColor: '#222', color: '#fff', }}
          dangerouslySetInnerHTML={{ __html: betaInfo }}
        />
        <Modal.Footer className="dark-modal-footer" style={{ backgroundColor: '#333', color: '#fff', }}>
          <Button variant="primary" onClick={() => setBetaModal(false)} size="sm">
            Got it!
          </Button>
        </Modal.Footer>
      </Modal>

    </Header>

  );
};

export default Navbar;
