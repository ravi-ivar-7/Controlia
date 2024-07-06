
import React, { useEffect } from "react";
import useToast from "../hooks/useToast";
import ResponsiveGrid from '../utils/responsiveGrid';

const initialLayouts = {
  lg: [
    { i: 'a', x: 0, y: 0, w: 3, h: 2 },
    { i: 'b', x: 3, y: 0, w: 3, h: 2 },
    { i: 'c', x: 6, y: 0, w: 3, h: 2 }
  ],
  md: [
    { i: 'a', x: 0, y: 0, w: 3, h: 2 },
    { i: 'b', x: 3, y: 0, w: 3, h: 2 },
    { i: 'c', x: 6, y: 0, w: 3, h: 2 }
  ]
};

const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };
const rowHeight = 30;

const Home = () => {


  const { showToast } = useToast();

  useEffect(() => {
    const options = {
      duration: 2000,
      position: "top-center",
      icon: "👋"
    };
    const toastId = showToast("Welcome", options);
    console.log("Toast ID:", toastId);
  }, [showToast]);


  return (
    <div>
      <h2>This is an auto admin portal</h2>
      <p>Control and automate easily.</p>

      <ResponsiveGrid
        pageId="page1"
        initialLayouts={initialLayouts}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={rowHeight}
      >
        <div key="a" className="grid-item">A</div>
        <div key="b" className="grid-item">B</div>
        <div key="c" className="grid-item">C</div>
      </ResponsiveGrid>
    </div>
  );
};

export default Home;