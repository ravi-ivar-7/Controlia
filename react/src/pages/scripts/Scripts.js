import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';
import useToast from '../../hooks/useToast';
import Table from 'react-bootstrap/Table';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'
import Footer from '../../components/bars/Footer';
import Sidebar from "../../components/bars/Sidebar";
import Navbar from "../../components/bars/Navbar";
import ScheduleScriptModal from './scheduleModal';

import { CDBTable, CDBTableHeader, CDBTableBody, CDBBtn } from "cdbreact";
import './scripts.css'

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import DeployModal from './deplyModal';

const Scripts = () => {
    const [loading, setLoading] = useState(false);
    const [scripts, setScripts] = useState([]);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showDeployModal, setShowDeployModal] = useState(false);
    const [scheduleScript, setScheduleScript] = useState('');
    const [deployScript, setDeployScript] = useState('');

    const { showErrorToast, showSuccessToast } = useToast();

    const navigate = useNavigate();

    const fetchData = useCallback(async (token) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/scripts', {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if (response.status === 200) {
                if (response.data && response.data.info) {
                    showSuccessToast(response.data.info);
                }
                setScripts(response.data.scripts || []);
            } else {
                console.error('Internal Server Error:', response.data.warn);
                showErrorToast(response.data.warn || 'Internal Server Error');
            }
        } catch (error) {
            console.error('Failed to fetch scripts.', error);
            showErrorToast('Failed to fetch scripts.');
        } finally {
            setLoading(false);
        }
    }, []);

    let token = localStorage.getItem('token');
    useEffect(() => {

        if (!token) {
            console.error('No token found in local storage');
            showErrorToast('No token found. Failed to fetch scripts.');
            return;
        }
        fetchData(token);
    }, []);

    const handleDeleteScript = async (script) => {
        if (!window.confirm(`Delete script ${script.scriptName}`)) {
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axiosInstance.post('/delete-script', {
                script,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status === 200) {
                if (response.data && response.data.info) {
                    showSuccessToast(response.data.info);
                }
                setScripts(prevScripts => prevScripts.filter(s => s.scriptName !== script.scriptName));
            } else {
                console.error('Internal Server Error:', response.data.warn);
                showErrorToast(response.data.warn || 'Internal Server Error');
            }
        } catch (error) {
            console.error('Failed to delete script.', error);
            showErrorToast('Failed to delete script.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditScript = async (script) => {
        setLoading(true)
        try {
            const response = await axiosInstance.post('/script', { script }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if (response.status === 200) {
                if (response.data && response.data.info) {
                    showSuccessToast(response.data.info);
                }
                const { script } = response.data;
                setLoading(false);
                navigate('/script', { state: { script } });

            } else {
                console.error('Internal Server Error:', response.data.warn);
                showErrorToast(response.data.warn || 'Internal Server Error');
            }
        } catch (error) {
            console.error('Failed to fetch scripts.', error);
            showErrorToast('Failed to fetch scripts.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddScript = async (language) => {
        setLoading(true);
        try {
            setLoading(false);
            navigate('/script', { state: { script: { scriptName: '', scriptContent: '', language: language, argumentList: [] } } });
        } catch (error) {
            setLoading(false);
            console.error('Failed to navigate to script page.', error);
            showErrorToast('Failed to navigate to script page.');
        }
    };
    const handleSchedule = async (script) => {
        setLoading(true)
        try {
            const response = await axiosInstance.post('/schedule-script', { script }, {
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
    const handleDeploy = async (script) => {

    }
    return (


        <div className="d-flex">
            <div>
                <Sidebar />
            </div>
            <div style={{ flex: "1 1 auto", display: "flex", flexFlow: "column", height: "100vh", overflowY: "hidden" }}>
                <Navbar pageTitle={'Scripts'} />
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
                                            <h4 className="font-weight-bold mb-3" style={{ color: 'white' }}>Python Scripts</h4>
                                            <CDBBtn
                                                type="primary"
                                                flat
                                                className="border-0 px-3"
                                                style={{ color: 'white' }}
                                                onClick={() => handleAddScript('python')}
                                            >
                                                Add Python Script
                                            </CDBBtn>
                                        </div>

                                        <CDBTable className="dark-table" responsive>
                                            <CDBTableHeader>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Name</th>
                                                    <th>Scheduled</th>
                                                    <th>Deployed</th>
                                                    <th>Action</th>
                                                    <th>Action</th>
                                                </tr>
                                            </CDBTableHeader>
                                            <CDBTableBody>
                                                {scripts.filter(script => script.language === 'python').map((script, index) => (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>{script.scriptName}</td>
                                                        <td>
                                                            {script.scheduleName ? script.scheduleName : (
                                                                <CDBBtn
                                                                    type="primary"
                                                                    flat
                                                                    className="border-0 ml-auto px-2 my-2"
                                                                    onClick={() => { setScheduleScript(script); setShowScheduleModal(true); }}
                                                                >
                                                                    <span className="msg-rem">Schedule</span>
                                                                </CDBBtn>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {script.deployUrl ? script.deployUrl : (
                                                                <CDBBtn
                                                                    type="primary"
                                                                    flat
                                                                    className="border-0 ml-auto px-2 my-2"
                                                                    onClick={() => { setDeployScript(script); setShowDeployModal(true); }}
                                                                >
                                                                    <span className="msg-rem">Deploy</span>
                                                                </CDBBtn>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <CDBBtn
                                                                type="primary"
                                                                flat
                                                                className="border-0 ml-auto px-2 my-2"
                                                                onClick={() => handleEditScript(script)}
                                                            >
                                                                <span className="msg-rem">Edit/Run</span>
                                                            </CDBBtn>
                                                        </td>
                                                        <td>
                                                            <CDBBtn
                                                                type="secondary"
                                                                flat
                                                                className="border-0 ml-auto px-2 my-2"
                                                                onClick={() => handleDeleteScript(script)}
                                                            >
                                                                <span className="msg-rem">Delete</span>
                                                            </CDBBtn>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </CDBTableBody>
                                        </CDBTable>
                                    </div>




                                    <div className="mt-5">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h4 className="font-weight-bold mb-3" style={{ color: 'white' }}>C++ Scripts</h4>
                                            <CDBBtn
                                                type="primary"
                                                flat
                                                className="border-0 px-3"
                                                style={{ color: 'white' }}
                                                onClick={() => handleAddScript('python')}
                                            >
                                                Add C++ Script
                                            </CDBBtn>
                                        </div>

                                        <CDBTable className="dark-table" responsive>
                                            <CDBTableHeader>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Name</th>
                                                    <th>Scheduled</th>
                                                    <th>Deployed</th>
                                                    <th>Action</th>
                                                    <th>Action</th>
                                                </tr>
                                            </CDBTableHeader>
                                            <CDBTableBody>
                                                {scripts.filter(script => script.language === 'cpp').map((script, index) => (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>{script.scriptName}</td>
                                                        <td>
                                                            {script.scheduleName ? script.scheduleName : (
                                                                <CDBBtn
                                                                    type="primary"
                                                                    flat
                                                                    className="border-0 ml-auto px-2 my-2"
                                                                    onClick={() => { setScheduleScript(script); setShowScheduleModal(true); }}
                                                                >
                                                                    <span className="msg-rem">Schedule</span>
                                                                </CDBBtn>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {script.deployUrl ? script.deployUrl : (
                                                                <CDBBtn
                                                                    type="primary"
                                                                    flat
                                                                    className="border-0 ml-auto px-2 my-2"
                                                                    onClick={() => { setDeployScript(script); setShowDeployModal(true); }}
                                                                >
                                                                    <span className="msg-rem">Deploy</span>
                                                                </CDBBtn>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <CDBBtn
                                                                type="primary"
                                                                flat
                                                                className="border-0 ml-auto px-2 my-2"
                                                                onClick={() => handleEditScript(script)}
                                                            >
                                                                <span className="msg-rem">Edit/Run</span>
                                                            </CDBBtn>
                                                        </td>
                                                        <td>
                                                            <CDBBtn
                                                                type="secondary"
                                                                flat
                                                                className="border-0 ml-auto px-2 my-2"
                                                                onClick={() => handleDeleteScript(script)}
                                                            >
                                                                <span className="msg-rem">Delete</span>
                                                            </CDBBtn>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </CDBTableBody>
                                        </CDBTable>
                                    </div>



                                    <div className="mt-5">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h4 className="font-weight-bold mb-3" style={{ color: 'white' }}>JavaScript Scripts</h4>
                                            <CDBBtn
                                                type="primary"
                                                flat
                                                className="border-0 px-3"
                                                style={{ color: 'white' }}
                                                onClick={() => handleAddScript('python')}
                                            >
                                                Add JavaScript Script
                                            </CDBBtn>
                                        </div>

                                        <CDBTable className="dark-table" responsive>
                                            <CDBTableHeader>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Name</th>
                                                    <th>Scheduled</th>
                                                    <th>Deployed</th>
                                                    <th>Action</th>
                                                    <th>Action</th>
                                                </tr>
                                            </CDBTableHeader>
                                            <CDBTableBody>
                                                {scripts.filter(script => script.language === 'javascript').map((script, index) => (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>{script.scriptName}</td>
                                                        <td>
                                                            {script.scheduleName ? script.scheduleName : (
                                                                <CDBBtn
                                                                    type="primary"
                                                                    flat
                                                                    className="border-0 ml-auto px-2 my-2"
                                                                    onClick={() => { setScheduleScript(script); setShowScheduleModal(true); }}
                                                                >
                                                                    <span className="msg-rem">Schedule</span>
                                                                </CDBBtn>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {script.deployUrl ? script.deployUrl : (
                                                                <CDBBtn
                                                                    type="primary"
                                                                    flat
                                                                    className="border-0 ml-auto px-2 my-2"
                                                                    onClick={() => { setDeployScript(script); setShowDeployModal(true); }}
                                                                >
                                                                    <span className="msg-rem">Deploy</span>
                                                                </CDBBtn>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <CDBBtn
                                                                type="primary"
                                                                flat
                                                                className="border-0 ml-auto px-2 my-2"
                                                                onClick={() => handleEditScript(script)}
                                                            >
                                                                <span className="msg-rem">Edit/Run</span>
                                                            </CDBBtn>
                                                        </td>
                                                        <td>
                                                            <CDBBtn
                                                                type="secondary"
                                                                flat
                                                                className="border-0 ml-auto px-2 my-2"
                                                                onClick={() => handleDeleteScript(script)}
                                                            >
                                                                <span className="msg-rem">Delete</span>
                                                            </CDBBtn>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </CDBTableBody>
                                        </CDBTable>
                                    </div>




                                    <div className="mt-5">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h4 className="font-weight-bold mb-3" style={{ color: 'white' }}>Bash/Shell Scripts</h4>
                                            <CDBBtn
                                                type="primary"
                                                flat
                                                className="border-0 px-3"
                                                style={{ color: 'white' }}
                                                onClick={() => handleAddScript('python')}
                                            >
                                                Add Shell Script
                                            </CDBBtn>
                                        </div>

                                        <CDBTable className="dark-table" responsive>
                                            <CDBTableHeader>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Name</th>
                                                    <th>Scheduled</th>
                                                    <th>Deployed</th>
                                                    <th>Action</th>
                                                    <th>Action</th>
                                                </tr>
                                            </CDBTableHeader>
                                            <CDBTableBody>
                                                {scripts.filter(script => script.language === 'shell').map((script, index) => (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>{script.scriptName}</td>
                                                        <td>
                                                            {script.scheduleName ? script.scheduleName : (
                                                                <CDBBtn
                                                                    type="primary"
                                                                    flat
                                                                    className="border-0 ml-auto px-2 my-2"
                                                                    onClick={() => { setScheduleScript(script); setShowScheduleModal(true); }}
                                                                >
                                                                    <span className="msg-rem">Schedule</span>
                                                                </CDBBtn>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {script.deployUrl ? script.deployUrl : (
                                                                <CDBBtn
                                                                    type="primary"
                                                                    flat
                                                                    className="border-0 ml-auto px-2 my-2"
                                                                    onClick={() => { setDeployScript(script); setShowDeployModal(true); }}
                                                                >
                                                                    <span className="msg-rem">Deploy</span>
                                                                </CDBBtn>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <CDBBtn
                                                                type="primary"
                                                                flat
                                                                className="border-0 ml-auto px-2 my-2"
                                                                onClick={() => handleEditScript(script)}
                                                            >
                                                                <span className="msg-rem">Edit/Run</span>
                                                            </CDBBtn>
                                                        </td>
                                                        <td>
                                                            <CDBBtn
                                                                type="secondary"
                                                                flat
                                                                className="border-0 ml-auto px-2 my-2"
                                                                onClick={() => handleDeleteScript(script)}
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




                            <ScheduleScriptModal
                                show={showScheduleModal}
                                handleClose={() => setShowScheduleModal(false)}
                                onSubmit={handleSchedule}
                                scriptData={scheduleScript ? scheduleScript : ''}
                            />

                            <DeployModal
                                show={showDeployModal}
                                handleClose={() => setShowDeployModal(false)}
                                onSubmit={handleDeploy}
                                scriptData={deployScript ? deployScript : ''}
                            />

                        </div>
                    </div >
                </div >
            </div>
        </div>
    );
}

export default Scripts;
