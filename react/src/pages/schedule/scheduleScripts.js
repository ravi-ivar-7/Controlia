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

import { CDBBtn } from "cdbreact";


const ScheduleScripts = () => {
    const [loading, setLoading] = useState(false);
    const [scheduleScripts, setScheduleScripts] = useState([]);
    const { showErrorToast, showSuccessToast } = useToast();

    const navigate = useNavigate();

    const fetchData = useCallback(async (token) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/get-schedule-scripts', {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if (response.status === 200) {
                if (response.data && response.data.info) {
                    showSuccessToast(response.data.info);
                }
                setScheduleScripts(response.data.scheduleScripts || []);
            } else {
                console.error('Internal Server Error:', response.data.warn);
                showErrorToast(response.data.warn || 'Internal Server Error');
            }
        } catch (error) {
            console.error('Failed to fetch schedule scripts.', error);
            showErrorToast('Failed to fetch schedule scripts.');
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

    const handleDeleteScriptSchedule = async (script) => {
        if (!window.confirm(`Delete schedule ${script.scheduleName}`)) {
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axiosInstance.post('/reset-scripts-schedule', {
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
                setScheduleScripts(response.data.scheduleScripts || []);
            } else {
                console.error('Internal Server Error:', response.data.warn);
                showErrorToast(response.data.warn || 'Internal Server Error');
            }
        } catch (error) {
            console.error('Failed to delete schedule script.', error);
            showErrorToast('Failed to delete schedule script.');
        } finally {
            setLoading(false);
        }
    };
    const handleAddScriptSchedule = async () => {
        navigate('/scripts');
    }

    return (
        <div className="scripts d-flex">
            <div>
                <Sidebar />
            </div>
            <div style={{ flex: "1 1 auto", display: "flex", flexFlow: "column", height: "100vh", overflowY: "hidden" }}>
                <Navbar pageTitle={'Schedule'} />
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
                                <div style={{ margin: '20px' }} className="table-responsive">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h4 className="font-weight-bold text-white">Python Schedule Scripts</h4>
                                        <CDBBtn
                                            type='primary'
                                            flat
                                            className="border-0 px-3"
                                            onClick={() => handleAddScriptSchedule()}
                                        >
                                            Schedule Scripts
                                        </CDBBtn>
                                    </div>
                                    <Table striped bordered hover variant="dark">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Script Name</th>
                                                <th>Schedule Name</th>
                                                <th>Schedule Rule</th>
                                                <th>Schedule Type</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {scheduleScripts.filter(script => script.language === 'python').map((script, index) => (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{script.scriptName}</td>
                                                    <td>{script.scheduleName}</td>
                                                    <td>{script.scheduleRule}</td>
                                                    <td>{script.scheduleType}</td>
                                                    <td>
                                                        <CDBBtn
                                                            type='secondary'
                                                            flat
                                                            className="border-0 ml-auto px-2 my-2"
                                                            onClick={() => handleDeleteScriptSchedule(script)}
                                                        >
                                                            <span className="msg-rem">Delete</span>
                                                        </CDBBtn>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>

                                <div style={{ margin: '20px' }} className="table-responsive">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h4 className="font-weight-bold text-white">JavaScript/Nodejs Schedule Scripts</h4>
                                        <CDBBtn
                                            type='primary'
                                            flat
                                            className="border-0 px-3"
                                            onClick={() => handleAddScriptSchedule()}
                                        >
                                            Schedule Scripts
                                        </CDBBtn>
                                    </div>
                                    <Table striped bordered hover variant="dark">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Script Name</th>
                                                <th>Schedule Name</th>
                                                <th>Schedule Rule</th>
                                                <th>Schedule Type</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {scheduleScripts.filter(script => script.language === 'javascript').map((script, index) => (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{script.scriptName}</td>
                                                    <td>{script.scheduleName}</td>
                                                    <td>{script.scheduleRule}</td>
                                                    <td>{script.scheduleType}</td>
                                                    <td>
                                                        <CDBBtn
                                                            type='secondary'
                                                            flat
                                                            className="border-0 ml-auto px-2 my-2"
                                                            onClick={() => handleDeleteScriptSchedule(script)}
                                                        >
                                                            <span className="msg-rem">Delete</span>
                                                        </CDBBtn>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>


                                <div style={{ margin: '20px' }} className="table-responsive">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h4 className="font-weight-bold text-white"> C++ Schedule Scripts</h4>
                                        <CDBBtn
                                            type='primary'
                                            flat
                                            className="border-0 px-3"
                                            onClick={() => handleAddScriptSchedule()}
                                        >
                                            Schedule Scripts
                                        </CDBBtn>
                                    </div>
                                    <Table striped bordered hover variant="dark">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Script Name</th>
                                                <th>Schedule Name</th>
                                                <th>Schedule Rule</th>
                                                <th>Schedule Type</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {scheduleScripts.filter(script => script.language === 'cpp').map((script, index) => (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{script.scriptName}</td>
                                                    <td>{script.scheduleName}</td>
                                                    <td>{script.scheduleRule}</td>
                                                    <td>{script.scheduleType}</td>
                                                    <td>
                                                        <CDBBtn
                                                            type='secondary'
                                                            flat
                                                            className="border-0 ml-auto px-2 my-2"
                                                            onClick={() => handleDeleteScriptSchedule(script)}
                                                        >
                                                            <span className="msg-rem">Delete</span>
                                                        </CDBBtn>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>


                                <div style={{ margin: '20px' }} className="table-responsive">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h4 className="font-weight-bold text-white">Bash/Shell Schedule Scripts</h4>
                                        <CDBBtn
                                            type='primary'
                                            flat
                                            className="border-0 px-3"
                                            onClick={() => handleAddScriptSchedule()}
                                        >
                                            Schedule Scripts
                                        </CDBBtn>
                                    </div>
                                    <Table striped bordered hover variant="dark">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Script Name</th>
                                                <th>Schedule Name</th>
                                                <th>Schedule Rule</th>
                                                <th>Schedule Type</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {scheduleScripts.filter(script => script.language === 'shell').map((script, index) => (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{script.scriptName}</td>
                                                    <td>{script.scheduleName}</td>
                                                    <td>{script.scheduleRule}</td>
                                                    <td>{script.scheduleType}</td>
                                                    <td>
                                                        <CDBBtn
                                                            type='secondary'
                                                            flat
                                                            className="border-0 ml-auto px-2 my-2"
                                                            onClick={() => handleDeleteScriptSchedule(script)}
                                                        >
                                                            <span className="msg-rem">Delete</span>
                                                        </CDBBtn>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </div>


                        )}
                    </div>
                    <Footer />
                </div>
            </div>
        </div>
    );
}

export default ScheduleScripts;
