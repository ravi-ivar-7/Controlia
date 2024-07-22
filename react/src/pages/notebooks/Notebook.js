import React, { useState, useEffect, useCallback } from 'react';
import { CodeiumEditor } from "@codeium/react-code-editor";
import { Form, Button } from 'react-bootstrap';
import axiosInstance from '../../services/axiosInstance';
import useToast from '../../hooks/useToast';
import Footer from '../../components/bars/Footer';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'

import Sidebar from "../../components/bars/Sidebar";
import Navbar from "../../components/bars/Navbar";



const Notebook = () => {
  const [loading, setLoading] = useState(false);
  

  return (
    <div className="script d-flex" >
      <div>
        <Sidebar />
      </div>
      <div style={{ flex: "1 1 auto", display: "flex", flexFlow: "column", height: "100vh", overflowY: "hidden" }}>
        <Navbar pageTitle={'Notebook'} />
        <div style={{ height: "100%" }}>
          <div style={{ height: "calc(100% - 64px)", overflowY: "scroll" }}>

            {loading ? (<div>
              <SkeletonTheme baseColor="#202020" highlightColor="#444">
                <h1>{<Skeleton />}</h1>
                <p>
                  <Skeleton count={5} />
                </p>
              </SkeletonTheme>
            </div>) : (
              <div>













              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Notebook;
