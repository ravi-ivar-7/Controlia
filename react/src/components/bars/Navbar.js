import React from "react";
import { CDBNavbar, CDBInput } from "cdbreact";
import styled from "styled-components";
import { Link } from "react-router-dom"; // Import Link from react-router-dom

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
      <div className="icon-container">
        <Link to="/">
          <i className="fas fa-comment-alt mx-4"></i>
        </Link>
        <Link to="/">
          <img
            alt="panelImage"
            src="img/pane/pane4.png"
          />
        </Link>
      </div>
    </Header>
  );
};

export default Navbar;
