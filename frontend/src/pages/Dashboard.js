import React, { } from "react";

import ResponsiveGrid from '../utils/responsiveGrid';

const Dashboard = () => {



  return (
    <div>
      <h2>This is an auto admin portal</h2>
      <p>Control and automate easily.</p>

      <ResponsiveGrid
        pageId="page1"
      >
        <div key="a" className="grid-item">A</div>
        <div key="b" className="grid-item">B</div>
        <div key="c" className="grid-item">C</div>
      </ResponsiveGrid>
    </div>
  );
};

export default Dashboard;