import React from "react";
import { CDBBtn } from "cdbreact";
import styled from "styled-components";
import { NavLink } from "react-router-dom";

const FooterContainer = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  width: 100%;
  background-color: #333;
  color: #fff;
  bottom:0;
  margin-top:auto;
  text-align:centre;

  @media (max-width: 1320px) {
    width: 90%;
    margin: 0 auto;
  }

  @media (max-width: 920px) {
    flex-direction: column;
    text-align: center;
    padding: 1rem 0; /* Adjusted padding for smaller screens */
  }
`;

const FooterContent = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem; /* Added margin bottom for spacing */

  @media (max-width: 920px) {
    margin-bottom: 0; /* Remove margin bottom on smaller screens */
  }
`;

const FooterText = styled.small`
  margin-left: 1rem;
`;

const SocialContainer = styled.div`
  display: flex;
  align-items: center;

  @media (max-width: 920px) {
    justify-content: center; /* Center align social icons on smaller screens */
  }
`;

const SocialBtn = styled(CDBBtn)`
  background-color: #333;
  color: #fff;
  margin: 0.5rem; /* Adjusted margin for social buttons */

  &:last-child {
    margin-right: 0;
  }

  @media (max-width: 920px) {
    margin: 0.5rem; /* Adjusted margin for social buttons on smaller screens */
  }
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterText className="ml-2 mt-1">&copy; Controlia- All rights reserved.</FooterText>
      </FooterContent>
      <SocialContainer>
        <SocialBtn flat color="dark" className="py-1 px-2 bg-dark border-0">
          <i className="fab fa-facebook-f"></i>
        </SocialBtn>
        <SocialBtn flat color="dark" className="mx-3 py-1 px-2 bg-dark border-0">
          <i className="fab fa-twitter"></i>
        </SocialBtn>
        <SocialBtn flat color="dark" className="py-1 px-2 bg-dark border-0">
          <i className="fab fa-instagram"></i>
        </SocialBtn>
      </SocialContainer>
    </FooterContainer>
  );
};

export default Footer;
