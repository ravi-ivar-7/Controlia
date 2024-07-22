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

import './scheduleScirpts.css'

import { CDBTable, CDBTableHeader, CDBTableBody, CDBBtn } from "cdbreact";


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

                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
                                        <CDBBtn
                                            type='primary'
                                            flat
                                            className="border-0 px-3"
                                            onClick={() => handleAddScriptSchedule()}
                                        >
                                            Schedule Scripts
                                        </CDBBtn>
                                    </div>


                                    <div className="mt-5">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h4 className="font-weight-bold mb-3" style={{ color: 'white' }}>
                                                Python Schedule Scripts
                                            </h4>
                                        </div>

                                        <CDBTable className="dark-table" responsive>
                                            <CDBTableHeader>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Script Name</th>
                                                    <th>Schedule Name</th>
                                                    <th>Schedule Rule</th>
                                                    <th>Schedule Type</th>
                                                    <th>Action</th>
                                                </tr>
                                            </CDBTableHeader>
                                            <CDBTableBody>
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
                                            </CDBTableBody>
                                        </CDBTable>
                                    </div>

                                    <div className="mt-5">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h4 className="font-weight-bold mb-3" style={{ color: 'white' }}>
                                                C++ Schedule Scripts
                                            </h4>
                                        </div>

                                        <CDBTable className="dark-table" responsive>
                                            <CDBTableHeader>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Script Name</th>
                                                    <th>Schedule Name</th>
                                                    <th>Schedule Rule</th>
                                                    <th>Schedule Type</th>
                                                    <th>Action</th>
                                                </tr>
                                            </CDBTableHeader>
                                            <CDBTableBody>
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
                                            </CDBTableBody>
                                        </CDBTable>
                                    </div>

                                    <div className="mt-5">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h4 className="font-weight-bold mb-3" style={{ color: 'white' }}>
                                                JavaScript Schedule Scripts
                                            </h4>
                                        </div>

                                        <CDBTable className="dark-table" responsive>
                                            <CDBTableHeader>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Script Name</th>
                                                    <th>Schedule Name</th>
                                                    <th>Schedule Rule</th>
                                                    <th>Schedule Type</th>
                                                    <th>Action</th>
                                                </tr>
                                            </CDBTableHeader>
                                            <CDBTableBody>
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
                                            </CDBTableBody>
                                        </CDBTable>
                                    </div>

                                    <div className="mt-5">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h4 className="font-weight-bold mb-3" style={{ color: 'white' }}>
                                                Bash/Shell Schedule Scripts
                                            </h4>
                                        </div>

                                        <CDBTable className="dark-table" responsive>
                                            <CDBTableHeader>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Script Name</th>
                                                    <th>Schedule Name</th>
                                                    <th>Schedule Rule</th>
                                                    <th>Schedule Type</th>
                                                    <th>Action</th>
                                                </tr>
                                            </CDBTableHeader>
                                            <CDBTableBody>
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
                                            </CDBTableBody>
                                        </CDBTable>
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

export default ScheduleScripts;
