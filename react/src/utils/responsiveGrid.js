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
      // rowHeight={rowHeight}
      onLayoutChange={onLayoutChange}
      draggableHandle=".draggable-handle"
    >
      {children}
    </ResponsiveGridLayout>
  );
};

export default ResponsiveGrid;
