import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';
import useToast from '../../hooks/useToast';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'
import Sidebar from "../../components/bars/Sidebar";
import Navbar from "../../components/bars/Navbar";
import ScheduleNotebookModal from './scheduleModal';
import ShareNotebookModal from './shareModal';
import socketIOClient from 'socket.io-client';
import { CodeiumEditor } from "@codeium/react-code-editor";
import { Form } from 'react-bootstrap';
import { CDBTable, CDBTableHeader, CDBTableBody, CDBBtn } from "cdbreact";
import './notebooks.css'
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';



const Notebook = () => {
    const [loading, setLoading] = useState(false);


    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [scheduleNotebook, setScheduleNotebook] = useState('');
    const [shareNotebook, setShareNotebook] = useState('');

    return (
        <div className="d-flex">
            <div>
                <Sidebar />
            </div>
            <div style={{ flex: "1 1 auto", display: "flex", flexFlow: "column", height: "100vh", overflowY: "hidden" }}>
                <Navbar pageTitle={'Notebooks'} />
                <div style={{ height: "100%" }}>
                    <div style={{ padding: "10px", height: "calc(100% - 64px)", overflowY: "scroll" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(1, minmax(200px, 100%))" }}>

                            {loading ? (<div>
                                <SkeletonTheme baseColor="#202020" highlightColor="#444">
                                    <h1>{<Skeleton />}</h1>
                                    <p>
                                        <Skeleton count={5} />
                                    </p>
                                </SkeletonTheme>
                            </div>) : (
                                <div>

                                    <div style={{ margin: '10px', height: '100vh', width: '100%' }}>
                                        <iframe
                                            src={'http://localhost:8881/tree?token=f542c7e668ed26b696282ef0f5bbd048992ae068df732359'}
                                            style={{ border: 'none', height: '100%', width: '100%' }}
                                            title="Jupyter Notebook"
                                        />
                                    </div>


                                </div>
                            )}

                        </div>
                    </div >
                </div >
            </div>
        </div>
    );
}

export default Notebook;
