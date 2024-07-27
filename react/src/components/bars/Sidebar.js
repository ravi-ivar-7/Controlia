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
  const [scriptSubMenuOpen, setScripteSubMenuOpen] = useState(false);
  const [notebookSubMenuOpen, setNotebookSubMenuOpen] = useState(false);
  const [projectSubMenuOpen, setProjectSubMenuOpen] = useState(false);
  const [supportSubMenuOpen, setSupportSubMenuOpen] = useState(false);
  const { sidebarState } = useSidebar();

  const handleScriptSubMenuToggle = () => {
    setScripteSubMenuOpen(!scriptSubMenuOpen);
  };

  const handleNotebookSubMenuToggle = () => {
    setNotebookSubMenuOpen(!notebookSubMenuOpen);
  };

  const handleProjectSubMenuToggle = () => {
    setProjectSubMenuOpen(!projectSubMenuOpen);
  };

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

                <div>
                  <div
                    onClick={handleScriptSubMenuToggle}
                    style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
                  >
                    <CDBSidebarMenuItem icon="file-code">
                      <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                        Scripts
                        <i className={`fa fa-chevron-${scriptSubMenuOpen ? "down" : "right"}`} style={{ marginLeft: "7px" }}></i>
                      </div>
                    </CDBSidebarMenuItem>
                  </div>
                  {scriptSubMenuOpen && (
                    <div style={{ paddingLeft: "20px" }}>
                      
                      <NavLink exact to="/scripts" activeClassName="activeClicked">
                        <CDBSidebarMenuItem icon="columns">Dashboard</CDBSidebarMenuItem>
                      </NavLink>

                      <NavLink exact to="/schedule-scripts" activeClassName="activeClicked">
                        <CDBSidebarMenuItem icon="calendar-alt">Schedule</CDBSidebarMenuItem>
                      </NavLink>
                      <NavLink exact to="/share-scripts" activeClassName="activeClicked">
                      <CDBSidebarMenuItem icon="share-alt">Shared</CDBSidebarMenuItem>
                      </NavLink>
                    </div>
                  )}
                </div>

                <NavLink exact to="/notebooks" activeClassName="activeClicked">
                  <CDBSidebarMenuItem icon="book">Notebooks</CDBSidebarMenuItem>
                </NavLink>

                <NavLink exact to="/projects" activeClassName="activeClicked">
                  <CDBSidebarMenuItem icon="project-diagram">Projects</CDBSidebarMenuItem>
                </NavLink>



                <NavLink exact to="/resources" activeClassName="activeClicked">
                  <CDBSidebarMenuItem icon="lightbulb">Resources</CDBSidebarMenuItem>
                </NavLink>

                <NavLink exact to="/analytics" activeClassName="activeClicked">
                  <CDBSidebarMenuItem icon="chart-pie">Analytics</CDBSidebarMenuItem>
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
