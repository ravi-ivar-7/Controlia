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

const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
        .then(() => alert('Token copied to clipboard!'))
        .catch((err) => console.error('Failed to copy token: ', err));
};


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

    const { showErrorToast, showSuccessToast } = useToast();

    const navigate = useNavigate();

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
        setSocketOutput([]);
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

        socket.on('data', (data) => {
            const { output } = data
            setSocketOutput((prevMessages) => [...prevMessages, output]);
        });
        socket.on('connectionInfo', (data) => {
            const { token, url } = data;
            if (token) {
                setJupyterToken(token);
            }
            if (url) {
                setJupyterUrl(url);
            }
        });

        socket.on('error', (data) => {
            const {error} = data
            setSocketOutput((prevMessages) => [...prevMessages, error]);
        });

        socket.on('success', (message) => {
            showSuccessToast(message.message)
            socket.disconnect();
        });

        socket.emit('startJupyterServer', {});

        // Ensure cleanup of socket connection
        return () => {
            showErrorToast('disconnected...')
            socket.disconnect();
        };
    };

    const handleSchedule = async (notebook) => {
        setLoading(true)
        try {
            const response = await axiosInstance.post('/schedule-notebook', { notebook }, {
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
            console.error('Failed to add schedule.', error);
            showErrorToast('Failed to add schedule.');
        } finally {
            setLoading(false);
        }
    };
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

                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
                                        <CDBBtn
                                            type='primary'
                                            flat
                                            className="border-0 px-3"
                                            onClick={() => handleStartJupyterServer()}
                                        >
                                            Start Notebook Server
                                        </CDBBtn>
                                    </div>

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

                                    




                                    {socketOutput.length > 0 ? (
                                        <div style={{ margin: '10px' }}>
                                            <CodeiumEditor
                                                theme="vs-dark"
                                                value={socketOutput.join('\n')}
                                            />
                                        </div>
                                    ) : (
                                        <div></div>
                                    )}


                                    <div className="mt-5">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h4 className="font-weight-bold mb-3" style={{ color: 'white' }}>All Python Notebooks</h4>

                                        </div>

                                        <CDBTable className="dark-table" responsive>
                                            <CDBTableHeader>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Name</th>
                                                    <th>Scheduled</th>
                                                    <th>Shared</th>
                                                </tr>
                                            </CDBTableHeader>
                                            <CDBTableBody>
                                                {notebooks.filter(notebook => notebook.language === 'python').map((notebook, index) => (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>{notebook.notebookName}</td>
                                                        <td>
                                                            {notebook.scheduleName ? notebook.scheduleName : (
                                                                <CDBBtn
                                                                    type="primary"
                                                                    flat
                                                                    className="border-0 ml-auto px-2 my-2"
                                                                    onClick={() => { setScheduleNotebook(notebook); setShowScheduleModal(true); }}
                                                                >
                                                                    <span className="msg-rem">Schedule</span>
                                                                </CDBBtn>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {notebook.shareUrl ? notebook.shareUrl : (
                                                                <CDBBtn
                                                                    type="primary"
                                                                    flat
                                                                    className="border-0 ml-auto px-2 my-2"
                                                                    onClick={() => { setShareNotebook(notebook); setShowShareModal(true); }}
                                                                >
                                                                    <span className="msg-rem">Share</span>
                                                                </CDBBtn>
                                                            )}
                                                        </td>


                                                    </tr>
                                                ))}
                                            </CDBTableBody>
                                        </CDBTable>
                                    </div>
                                </div>
                            )}

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
                    </div >
                </div >
            </div>
        </div>
    );
}

export default Notebooks;
