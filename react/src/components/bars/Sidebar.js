import React, { useState } from "react";
import {
  CDBSidebar,
  CDBSidebarContent,
  CDBSidebarFooter,
  CDBSidebarHeader,
  CDBSidebarMenu,
  CDBSidebarMenuItem
} from "cdbreact";
import { NavLink } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";

const Sidebar = () => {
  const [supportSubMenuOpen, setSupportSubMenuOpen] = useState(false);
  const { sidebarState } = useSidebar();

  const handleSupportSubMenuOpen = () => {
    setSupportSubMenuOpen(!supportSubMenuOpen);
  };

  

  return (
    <div
      className="app"
      style={{ display: "flex", height: "100%", overflow: "scroll initial" }}
    >

      {sidebarState === 'nosidebar' ? (
        <div>

        </div>
      ) : (
        <div>
          <CDBSidebar textColor="#fff" backgroundColor="#333" toggled={ sidebarState === 'fullsidebar'}>
            <CDBSidebarHeader>
              <a href="/" className="text-decoration-none" style={{ color: "inherit" }}>
                Controlia
              </a>
            </CDBSidebarHeader>

            <CDBSidebarContent className="sidebar-content">
              <CDBSidebarMenu>
                <NavLink exact to="/home" activeClassName="activeClicked">
                  <CDBSidebarMenuItem icon="home">Home</CDBSidebarMenuItem>
                </NavLink>
                <NavLink exact to="/dashboard" activeClassName="activeClicked">
                  <CDBSidebarMenuItem icon="columns">Dashboard</CDBSidebarMenuItem>
                </NavLink>

                <NavLink exact to="/workspaces" activeClassName="activeClicked">
                  <CDBSidebarMenuItem icon="project-diagram">Workspaces</CDBSidebarMenuItem>
                </NavLink>
                <NavLink exact to="/notebooks" activeClassName="activeClicked">
                  <CDBSidebarMenuItem icon="book">Notebooks</CDBSidebarMenuItem>
                </NavLink>
                <NavLink exact to="/deployments" activeClassName="activeClicked">
                  <CDBSidebarMenuItem icon="cloud">Deployments</CDBSidebarMenuItem>
                </NavLink>



                <NavLink exact to="/resources" activeClassName="activeClicked">
                  <CDBSidebarMenuItem icon="lightbulb">Resources</CDBSidebarMenuItem>
                </NavLink>

                <NavLink exact to="/settings" activeClassName="activeClicked">
                  <CDBSidebarMenuItem icon="cogs">Settings</CDBSidebarMenuItem>
                </NavLink>



                <div>
                  <div
                    onClick={handleSupportSubMenuOpen}
                    style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
                  >
                    <CDBSidebarMenuItem icon="life-ring">
                      <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                        Support
                        <i className={`fa fa-chevron-${supportSubMenuOpen ? "down" : "right"}`} style={{ marginLeft: "7px" }}></i>
                      </div>
                    </CDBSidebarMenuItem>
                  </div>
                  {supportSubMenuOpen && (
                    <div style={{ paddingLeft: "20px" }}>
                      <NavLink exact to="/FAQs" activeClassName="activeClicked">
                        <CDBSidebarMenuItem icon="question-circle">FAQs</CDBSidebarMenuItem>
                      </NavLink>
                      <NavLink exact to="/feedback" activeClassName="activeClicked">
                        <CDBSidebarMenuItem icon="comment-dots">Feedback</CDBSidebarMenuItem>
                      </NavLink>
                      <NavLink exact to="/complain" activeClassName="activeClicked">
                        <CDBSidebarMenuItem icon="exclamation-triangle">Complain</CDBSidebarMenuItem>
                      </NavLink>
                    </div>
                  )}
                </div>



              </CDBSidebarMenu>
            </CDBSidebarContent>

            <CDBSidebarFooter style={{ textAlign: "center" }}>
              <div className="sidebar-btn-wrapper" style={{ padding: "20px 5px" }}>
                © Controlia
              </div>

              <div>
                <a href="/" target="_blank" rel="noopener noreferrer" style={{ color: "#fff", margin: "0 10px" }}>
                  <i className="fab fa-linkedin"></i>
                </a>
                <a href="/" target="_blank" rel="noopener noreferrer" style={{ color: "#fff", margin: "0 10px" }}>
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="mailto:controlia.services@gmail.com" style={{ color: "#fff", margin: "0 10px" }}>
                  <i className="fa fa-envelope"></i>
                </a>
              </div>
            </CDBSidebarFooter>
          </CDBSidebar>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
