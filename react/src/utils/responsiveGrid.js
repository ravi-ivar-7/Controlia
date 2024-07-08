import React, { useState, useEffect, useCallback } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const getLayout = (pageId, initialLayouts) => {
  const savedLayouts = localStorage.getItem(`layouts-${pageId}`);
  return savedLayouts ? JSON.parse(savedLayouts) : initialLayouts;
};

const ResponsiveGrid = ({ pageId, initialLayouts, breakpoints, cols, rowHeight, children }) => {
  const [layouts, setLayouts] = useState(() => getLayout(pageId, initialLayouts));

  const saveLayout = useCallback((layouts) => {
    localStorage.setItem(`layouts-${pageId}`, JSON.stringify(layouts));
  }, [pageId]);

  useEffect(() => {
    setLayouts(getLayout(pageId, initialLayouts));
  }, [pageId, initialLayouts]);

  const onLayoutChange = (_, allLayouts) => {
    setLayouts(allLayouts);
    saveLayout(allLayouts);
  };

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={breakpoints}
      cols={cols}
      rowHeight={rowHeight}
      onLayoutChange={onLayoutChange}
      draggableHandle=".draggable-handle"
    >
      {children}
    </ResponsiveGridLayout>
  );
};

// ResponsiveGrid.defaultProps = {
//   initialLayouts : {
//     // lg: [
//     //   { i: "a", x: 0, y: 0, w: 10, h: 40 },
     
//     // ],
//     // md: [
//     //   { i: "a", x: 0, y: 0, w: 10, h: 40 },
//     // ],
//     // sm: [
//     //   { i: "a", x: 0, y: 0, w: 10, h: 40},
//     // ],
//     // xs: [
//     //   { i: "a", x: 0, y: 0, w: 10, h: 40 },
//     // ],
//     // xxs: [
//     //   { i: "a", x: 0, y: 0, w: 10, h: 40},
//     // ]
//   },
//   breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
//   cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
//   rowHeight: 30,
// };

export default ResponsiveGrid;
