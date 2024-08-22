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
import { highlight, languages } from 'prismjs/components/prism-core';

import { Form } from 'react-bootstrap';
import { CDBTable, CDBTableHeader, CDBTableBody, CDBBtn } from "cdbreact";
import './notebooks.css'





const Notebooks = () => {
    const [loading, setLoading] = useState(false);
    const [notebooks, setNotebooks] = useState([]);
    const [jupyterToken, setJupyterToken] = useState('')
    const [jupyterUrl, setJupyterUrl] = useState('');
    const [socketOutput, setSocketOutput] = useState([]);

    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [scheduleNotebook, setScheduleNotebook] = useState('');
    const [shareNotebook, setShareNotebook] = useState('');
    const [jupyterServerStarted, setJupyterServerStarted] = useState(false)

    const { showErrorToast, showSuccessToast } = useToast();

    const navigate = useNavigate();

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => showSuccessToast('Token copied to clipboard.'))
            .catch((err) => showErrorToast(`Failed to copy token: ${err}`));
    };

    const fetchData = useCallback(async (token) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/notebooks', {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if (response.status === 200) {
                if (response.data && response.data.info) {
                    showSuccessToast(response.data.info);
                }
                setNotebooks(response.data.notebooks || []);
            } else {
                console.error('Internal Server Error:', response.data.warn);
                showErrorToast(response.data.warn || 'Internal Server Error');
            }
        } catch (error) {
            console.error('Failed to fetch notebooks.', error);
            showErrorToast('Failed to fetch notebooks.');
        } finally {
            setLoading(false);
        }
    }, []);

    let token = localStorage.getItem('token');
    useEffect(() => {

        if (!token) {
            console.error('No token found in local storage');
            showErrorToast('No token found. Failed to fetch notebooks.');
            return;
        }
        fetchData(token);
    }, []);



    const handleStartJupyterServer = async () => {
        try {
            setSocketOutput([]);
            setJupyterToken('');
            setJupyterUrl('');
            setJupyterServerStarted(true);

            let token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found in local storage');
                showErrorToast('No token found. Failed to start Jupyter server.');
                return;
            }

            const socket = socketIOClient(process.env.REACT_APP_NODEJS_API, {
                transports: ['polling', 'websocket'],
                extraHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });

            socket.on('jupyterOutput', (data) => {
                const { output } = data;
                setSocketOutput((prevMessages) => [...prevMessages, output]);
            });

            socket.on('jupyterConnection', (data) => {
                const { token, url } = data;
                if (token) {
                    setJupyterToken(token);
                }
                if (url) {
                    setJupyterUrl(url);
                }
            });

            socket.on('jupyterWarn', (data) => {
                const { warn } = data;
                showErrorToast(warn)
            });

            socket.on('success', (message) => {
                console.log(message)
                showSuccessToast(message.message);
                socket.disconnect();
            });

            socket.emit('startJupyterServer', {});

            return () => {
                showErrorToast('disconnected...');
                socket.disconnect();
            };
        } finally {
            setJupyterServerStarted(false);
        }
    };

    const handleSchedule = async (notebook) => {
        setLoading(true)
        try {
            const scheduleResponse = await axiosInstance.post('/schedule-notebook', { notebook }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if (scheduleResponse.status === 200) {
                if (scheduleResponse.data && scheduleResponse.data.info) {
                    showSuccessToast(scheduleResponse.data.info);
                }
                await fetchData(token);
            } else {
                console.error('Internal Server Error:', scheduleResponse.data.warn);
                showErrorToast(scheduleResponse.data.warn || 'Internal Server Error');
            }

            const response = await axiosInstance.post('/notebooks', {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if (response.status === 200) {
                if (response.data && response.data.info) {
                    showSuccessToast(response.data.info);
                }
                setNotebooks(response.data.notebooks || []);
            } else {
                console.error('Internal Server Error:', response.data.warn);
                showErrorToast(response.data.warn || 'Internal Server Error');
            }


        } catch (error) {
            console.error('Failed to add schedule.', error);
            showErrorToast('Failed to add schedule.');
        } finally {
            setLoading(false);
        }
    };
    const handleRemoveSchedule = async (notebook) => {

    }

    const handleShare = async (notebook) => {
        setLoading(true)
        try {
            const response = await axiosInstance.post('/share-notebook', { notebook }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if (response.status === 200) {
                if (response.data && response.data.info) {
                    showSuccessToast(response.data.info);
                }
                await fetchData(token);
            } else {
                console.error('Internal Server Error:', response.data.warn);
                showErrorToast(response.data.warn || 'Internal Server Error');
            }
        } catch (error) {
            console.error('Failed to create share link for this notebook.', error);
            showErrorToast('Failed to create a share link for this notebook.');
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="notebook d-flex" >
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
                                {(jupyterToken || jupyterUrl) ? (
                                    <div style={{ marginTop: '10px', textAlign: 'center' }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: '10px',
                                            position: 'relative'
                                        }}>
                                            {jupyterUrl && (
                                                <div style={{ position: 'relative' }}>
                                                    <CDBBtn
                                                        type='primary'
                                                        flat
                                                        className="border-0 px-3"
                                                        onClick={() => window.open(jupyterUrl, '_blank')}
                                                    >
                                                        Open Notebook Server
                                                    </CDBBtn>

                                                </div>
                                            )}

                                            {jupyterToken && (
                                                <div style={{ position: 'relative' }}>
                                                    <CDBBtn
                                                        type='primary'
                                                        flat
                                                        className="border-0 px-3"
                                                        onClick={() => copyToClipboard(jupyterToken)}
                                                    >
                                                        Copy Token
                                                    </CDBBtn>

                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
                                        <CDBBtn
                                            disabled={jupyterServerStarted}
                                            type='primary'
                                            flat
                                            className="border-0 px-3"
                                            onClick={() => handleStartJupyterServer()}
                                        >
                                            Start Notebook Server
                                        </CDBBtn>
                                    </div>
                                )}

                                <div className="d-flex card-section" style={{ marginTop: '10px', marginBottom: '30px' }}>
                                    <div className="card-bg w-100 d-flex flex-column wide border d-flex flex-column" style={{ height: '400px', overflow: 'auto' }}>
                                        <div className="d-flex flex-column p-0 h-100">
                                            <div className="mt-3" style={{ flex: 1 }}>
                                                <Editor
                                                    value={socketOutput.join('\n')}

                                                    readOnly
                                                    highlight={code => highlight(code, languages.text)}
                                                    padding={10}
                                                    style={{
                                                        fontFamily: '"Fira code", "Fira Mono", monospace',
                                                        color: 'white',
                                                        height: '100%',
                                                        overflow: 'auto'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                <div>
                                    <div className="d-flex card-section">
                                        <div className="cards-container">
                                            {notebooks.map((notebook, index) => (
                                                <div key={index} className="card-item">
                                                    <div className="card-bg w-100 d-flex flex-column border" style={{ gridRow: "span 2", backgroundColor: "black", color: "white" }}>
                                                        <div className="p-4 d-flex flex-column h-100">
                                                            <div className="d-flex align-items-center justify-content-between mb-3">
                                                                <h4 className="m-0 h5 font-weight-bold text-white">{notebook}</h4>
                                                            </div>
                                                            <div className="d-flex flex-column align-items-start">
                                                                {notebook.scheduleName ? (
                                                                    <div className="d-flex align-items-center w-100">
                                                                        <span className="mr-2">{notebook.scheduleName}</span>
                                                                        <CDBBtn
                                                                            type="primary"
                                                                            flat
                                                                            className="border-0 px-2 my-2"
                                                                            onClick={() => handleRemoveSchedule(notebook)}
                                                                        >
                                                                            <span className="msg-rem">Remove Schedule</span>
                                                                        </CDBBtn>
                                                                    </div>
                                                                ) : (
                                                                    <CDBBtn
                                                                        type="primary"
                                                                        flat
                                                                        className="border-0 px-2 my-2 align-self-start"
                                                                        onClick={() => { setScheduleNotebook({ notebookName: notebook }); setShowScheduleModal(true); }}
                                                                    >
                                                                        <span className="msg-rem">Schedule</span>
                                                                    </CDBBtn>
                                                                )}
                                                                {notebook.shareUrl ? (
                                                                    <div className="d-flex align-items-center w-100">
                                                                        <span className="mr-2">{notebook.shareUrl}</span>
                                                                        {/* You can add a button here if needed */}
                                                                    </div>
                                                                ) : (
                                                                    <CDBBtn
                                                                        type="primary"
                                                                        flat
                                                                        className="border-0 px-2 my-2 align-self-start"
                                                                        onClick={() => { setShareNotebook(notebook); setShowShareModal(true); }}
                                                                    >
                                                                        <span className="msg-rem">Share</span>
                                                                    </CDBBtn>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>




                                <ScheduleNotebookModal
                                    show={showScheduleModal}
                                    handleClose={() => setShowScheduleModal(false)}
                                    onSubmit={handleSchedule}
                                    notebookData={scheduleNotebook ? scheduleNotebook : ''}
                                />

                                <ShareNotebookModal
                                    show={showShareModal}
                                    handleClose={() => setShowShareModal(false)}
                                    onSubmit={handleShare}
                                    notebookData={shareNotebook ? shareNotebook : ''}
                                />

                            </div>
                        )}

                    </div>
                </div >

            </div>
        </div>
    )
}

export default Notebooks;
