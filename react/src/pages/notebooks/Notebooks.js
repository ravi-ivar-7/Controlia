import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';
import useToast from '../../hooks/useToast';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'
import Footer from '../../components/bars/Footer';
import Sidebar from "../../components/bars/Sidebar";
import Navbar from "../../components/bars/Navbar";
import ScheduleNotebookModal from './scheduleModal';
import ShareNotebookModal from './shareModal';

import { CDBTable, CDBTableHeader, CDBTableBody, CDBBtn } from "cdbreact";
import './notebooks.css'
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';


const Notebooks = () => {
    const [loading, setLoading] = useState(false);
    const [notebooks, setNotebooks] = useState([]);
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

    const handleDeleteNotebook = async (notebook) => {
        if (!window.confirm(`Delete notebook ${notebook.notebookName}`)) {
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axiosInstance.post('/delete-notebook', {
                notebook,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status === 200) {
                if (response.data && response.data.info) {
                    showSuccessToast(response.data.info);
                }
                setNotebooks(prevNotebooks => prevNotebooks.filter(s => s.notebookName !== notebook.notebookName));
            } else {
                console.error('Internal Server Error:', response.data.warn);
                showErrorToast(response.data.warn || 'Internal Server Error');
            }
        } catch (error) {
            console.error('Failed to delete notebook.', error);
            showErrorToast('Failed to delete notebook.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditNotebook = async (notebook) => {
        setLoading(true)
        try {
            const response = await axiosInstance.post('/notebook', { notebook }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if (response.status === 200) {
                if (response.data && response.data.info) {
                    showSuccessToast(response.data.info);
                }
                const { notebook } = response.data;
                setLoading(false);
                navigate('/notebook', { state: { notebook } });

            } else {
                console.error('Internal Server Error:', response.data.warn);
                showErrorToast(response.data.warn || 'Internal Server Error');
            }
        } catch (error) {
            console.error('Failed to fetch notebook.', error);
            showErrorToast('Failed to fetch notebook.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddNotebook = async (language) => {
        setLoading(true);
        try {
            setLoading(false);
            navigate('/notebook', { state: { notebook: { notebookName: '', notebookContent: '', language: language, argumentList: [] } } });
        } catch (error) {
            setLoading(false);
            console.error('Failed to navigate to notebook page.', error);
            showErrorToast('Failed to navigate to notebook page.');
        }
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


                                    <div className="mt-5">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h4 className="font-weight-bold mb-3" style={{ color: 'white' }}>All Python Notebooks</h4>
                                            <CDBBtn
                                                type="primary"
                                                flat
                                                className="border-0 px-3"
                                                style={{ color: 'white' }}
                                                onClick={() => handleAddNotebook('python')}
                                            >
                                                Add Python Notebook
                                            </CDBBtn>
                                        </div>

                                        <CDBTable className="dark-table" responsive>
                                            <CDBTableHeader>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Name</th>
                                                    <th>Scheduled</th>
                                                    <th>Shared</th>
                                                    <th>Action</th>
                                                    <th>Action</th>
                                                </tr>
                                            </CDBTableHeader>
                                            <CDBTableBody>
                                                {notebooks.filter(notebook => notebook.language === 'python').map((notebook, index) => (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>{notebook.scriptName}</td>
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
                                                        <td>
                                                            <CDBBtn
                                                                type="primary"
                                                                flat
                                                                className="border-0 ml-auto px-2 my-2"
                                                                onClick={() => handleEditNotebook(notebook)}
                                                            >
                                                                <span className="msg-rem">Edit/Run</span>
                                                            </CDBBtn>
                                                        </td>
                                                        <td>
                                                            <CDBBtn
                                                                type="secondary"
                                                                flat
                                                                className="border-0 ml-auto px-2 my-2"
                                                                onClick={() => handleDeleteNotebook(notebook)}
                                                            >
                                                                <span className="msg-rem">Delete</span>
                                                            </CDBBtn>
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
                                notebookData={shareNotebook ? shareNotebook : ''}
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
