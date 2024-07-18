import React ,{useState} from "react";
import { CDBNavbar, CDBInput } from "cdbreact";
import styled from "styled-components";
import { Link } from "react-router-dom"; 
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';

const Header = styled.header`
  background: #333;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;

  .input-nav {
    margin-left: 5rem !important;
    width: 25rem;
    color: #000;
    &::placeholder {
      color: #aaa;
    }
  }

  .icon-container {
    display: flex;
    align-items: center;
    gap: 1rem; /* Adds spacing between icons */
  }

  img {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
  }

  @media (max-width: 920px) {
    .input-nav {
      display: none;
    }
  }
`;

const PageTitle = styled.h1`
  margin: 0; /* Remove default margin */
  font-size: 1.5rem; /* Adjust font size */
`;

const Navbar = ({ pageTitle }) => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [popupVisible, setPopupVisible] = useState(false);

  const togglePopup = () => {
    setPopupVisible(!popupVisible);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setPopupVisible(false);
    navigate('/')
  };

  return (
    <Header>
      <CDBNavbar dark expand="md" scrolling className="justify-content-start">
        <CDBInput
          type="search"
          size="md"
          hint="Search"
          className="mb-n4 mt-n3 input-nav"
        />
      </CDBNavbar>
      <PageTitle>{pageTitle}</PageTitle>

      <div className="icon-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <Link to="/">
        <i className="fas fa-comment-alt mx-4" style={{ fontSize: '24px' }}></i>
      </Link>
      <div className="popup" onClick={togglePopup} style={{ cursor: 'pointer', marginLeft: '15px', }}>
        <i
          className="fas fa-user-circle"
          style={{ fontSize: '32px' }}
        ></i>
        {popupVisible && (
          <div className="popup-menu" style={{ position: 'absolute', top: '50px', right: '0', background: 'grey', border: '1px solid #ccc', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', zIndex: '1000', padding: '10px', borderRadius: '4px', minWidth: '150px' }}>
            {user ? (
              <>
                <Link className="popup-item" to="/profile" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center' }}>
                  <i className="fas fa-user" style={{ marginRight: '8px' }}></i> Profile
                </Link>
                <div className="popup-item" onClick={handleLogout} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <i className="fas fa-sign-out-alt" style={{ marginRight: '8px' }}></i> Logout
                </div>
              </>
            ) : (
              <>
                <Link className="popup-item" to="/login" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center' }}>
                  <i className="fas fa-sign-in-alt" style={{ marginRight: '8px' }}></i> Login
                </Link>
                <Link className="popup-item" to="/register" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center' }}>
                  <i className="fas fa-user-plus" style={{ marginRight: '8px' }}></i> Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
      

      
    </Header>
  );
};

export default Navbar;
