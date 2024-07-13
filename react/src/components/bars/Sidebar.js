import React from "react";
import {
  CDBSidebar,
  CDBSidebarContent,
  CDBSidebarFooter,
  CDBSidebarHeader,
  CDBSidebarMenu,
  CDBSidebarMenuItem
} from "cdbreact";
import { NavLink } from "react-router-dom";

const Sidebar = () => {

  return (
    <div
      className={`app`}
      style={{ display: "flex", height: "100%", overflow: "scroll initial" }}
    >
      <CDBSidebar
        textColor="#fff"
        backgroundColor="#333"
      >
        <CDBSidebarHeader
          prefix={
            <i className="fa fa-bars fa-large"></i>
          }
        >
          <a href="/" className="text-decoration-none" style={{ color: "inherit" }}>
            Controlia
          </a>
        </CDBSidebarHeader>

        <CDBSidebarContent className="sidebar-content">

          <CDBSidebarMenu>
            <NavLink exact to="/" activeClassName="activeClicked">
              <CDBSidebarMenuItem icon="home">Home</CDBSidebarMenuItem>
            </NavLink>
            <NavLink exact to="/dashboard" activeClassName="activeClicked">
              <CDBSidebarMenuItem icon="columns">Dashboard</CDBSidebarMenuItem>
            </NavLink>
            <NavLink exact to="/execute-scripts" activeClassName="activeClicked">
              <CDBSidebarMenuItem icon="play-circle">Execute</CDBSidebarMenuItem>
            </NavLink>
            <NavLink exact to="/schedule-scripts" activeClassName="activeClicked">
              <CDBSidebarMenuItem icon="calendar-alt">Schedule</CDBSidebarMenuItem>
            </NavLink>
            <NavLink exact to="/deploy-scripts" activeClassName="activeClicked">
              <CDBSidebarMenuItem icon="server">Deploy</CDBSidebarMenuItem>
            </NavLink>
            <NavLink exact to="/analytics" activeClassName="activeClicked">
              <CDBSidebarMenuItem icon="chart-pie">Analytics</CDBSidebarMenuItem>
            </NavLink>

          </CDBSidebarMenu>


        </CDBSidebarContent>

        <CDBSidebarFooter style={{ textAlign: "center" }}>
          <div
            className="sidebar-btn-wrapper"
            style={{
              padding: "20px 5px"
            }}
          >
            © Controlia
          </div>
        </CDBSidebarFooter>
      </CDBSidebar>
    </div>
  );
}

export default Sidebar;
