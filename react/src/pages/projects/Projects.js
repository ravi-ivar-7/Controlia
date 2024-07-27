import React, { useState, useCallback, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Projects.css';
import axiosInstance from '../../services/axiosInstance';
import useToast from '../../hooks/useToast';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useUser } from '../../context/UserContext';

import Sidebar from "../../components/bars/Sidebar";
import Navbar from "../../components/bars/Navbar";

const Projects = () => {
    const { user } = useUser();
    const [loading, setLoading] = useState(false)
    const [projectDropDown, setProjectDropDown] = useState(false);
    const [projects, setProjects] = useState([])
    const [logFetchLoading, setLogFetchLoading] = useState(false);
    const [deleteLoading, setDeleteLoading]= useState(false)


    const { showErrorToast, showSuccessToast } = useToast();


    const fetchProjects = useCallback(async (token) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/projects', {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if (response.status === 200) {
                if (response.data && response.data.info) {
                    showSuccessToast(response.data.info);
                }
                setProjects(response.data.projects || []);
            } else {
                console.error('Internal Server Error:', response.data.warn);
                showErrorToast(response.data.warn || 'Internal Server Error');
            }
        } catch (error) {
            console.error('Failed to fetch projects.', error);
            showErrorToast('Failed to fetch projects.');
        } finally {
            setLoading(false);
        }
    }, []);

    let token = localStorage.getItem('token');
    useEffect(() => {

        if (!token) {
            console.error('No token found in local storage');
            showErrorToast('No token found. Failed to fetch projects.');
            return;
        }
        fetchProjects(token);
    }, []);

    const handleConsoleLogs = async(project)=>{
        setLogFetchLoading(true)
        try {
            const response = await axiosInstance.post('/logs', {project, logType:'console'}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if (response.status === 200) {
                if (response.data && response.data.info) {
                    showSuccessToast(response.data.info);
                }
                const logs = encodeURIComponent(response.data.logs);
                window.open(`/logs?data=${logs}`, '_blank');
                
            } else {
                console.error('Internal Server Error:', response.data.warn);
                showErrorToast(response.data.warn || 'Internal Server Error');
            }
        } catch (error) {
            console.error('Failed to fetch logs.', error);
            showErrorToast('Failed to fetch logs.');
        }
        finally{
            setLogFetchLoading(false)
        }
    }

    const handleProjectDelete = async (project) => {
        setDeleteLoading(true)
        try {
            const response = await axiosInstance.post('/delete-project', { project }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
    
            if (response.status === 200) {
                if (response.data && response.data.info) {
                    showSuccessToast(response.data.info);
                }
                setProjects(prevs => prevs.filter(prev => prev.projectid !== project.projectid));
            } else {
                console.error('Internal Server Error:', response.data.warn);
                showErrorToast(response.data.warn || 'Internal Server Error');
            }
        } catch (error) {
            console.error('Failed to delete.', error);
            showErrorToast('Failed to delete.');
        }
        finally{
            setDeleteLoading(false)
        }
    }
    
    const handleProjectUpdate = async(project)=>{

    }


    return (

        <div className="project d-flex">
            <div>
                <Sidebar />
            </div>
            <div style={{ flex: "1 1 auto", display: "flex", flexFlow: "column", height: "100vh", overflowY: "hidden" }}>
                <Navbar pageTitle={'Projects'} />
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
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <div className="icon-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <div className="popup" onClick={() => setProjectDropDown(!projectDropDown)} style={{ cursor: 'pointer', marginLeft: '15px', marginTop: '15px' }}>


                                            <div style={{ textDecoration: 'none', marginBottom: '10px', display: 'flex', alignItems: 'center', padding: '5px 14px', color: '#fff', borderRadius: '4px', border: '2px solid #007bff' }}>
                                                <i className="fas fa-plus" style={{ fontSize: '25px', color: 'white' }}>
                                                    &nbsp;Add Project
                                                </i>
                                            </div>

                                            {projectDropDown && (
                                                <div className="popup-menu" style={{
                                                    position: 'absolute',
                                                    top: '50px',
                                                    right: '0',
                                                    background: 'black',
                                                    border: '1px solid #ccc',
                                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                                    zIndex: '1000',
                                                    padding: '10px',
                                                    borderRadius: '4px',
                                                    minWidth: '150px'
                                                }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', padding: '10px' }}>

                                                        <a href={`https://github.com/login/oauth/authorize?client_id=Ov23liJhpyR8Kjsrq7x5&redirect_uri=http://localhost:3000/github-redirect&scope=repo`} style={{ textDecoration: 'none', marginBottom: '10px', display: 'flex', alignItems: 'center', padding: '8px 16px', color: '#fff', borderRadius: '5px', border: '2px solid #007bff' }}>
                                                            <i className="fab fa-github" style={{ marginRight: '8px' }}></i> From Github
                                                        </a>

                                                        <a href={`/upload`} style={{ textDecoration: 'none', marginBottom: '10px', display: 'flex', alignItems: 'center', padding: '8px 16px', color: '#fff', borderRadius: '5px', border: '2px solid #007bff' }}>
                                                            <i className="fas fa-upload" style={{ marginRight: '8px' }}></i> Upload
                                                        </a>

                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="info">
                                    <div className="d-flex card-section">
                                        <div className="cards-container">

                                            {projects.map((project, index) => (
                                                <div key={index} className="card-bg w-100 border d-flex flex-column">
                                                    <div className="p-4 d-flex flex-column h-100">
                                                        
                                                        <h4 className="my-4 text-right text-white h2 font-weight-bold">{project.projectName}</h4>
                                                        <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" style={{marginBottom:'5px'}}>   {project.projectUrl} </a>

                                                  
                                                        <div className="d-flex justify-content-between mt-auto">
                                                            <button className="btn btn-primary" disabled={logFetchLoading} onClick={()=> handleConsoleLogs(project)}>Check Logs</button>
                                                            <button className="btn btn-secondary" onClick={()=>handleProjectUpdate(project)}>Update</button>
                                                            <button className="btn btn-danger" disabled={deleteLoading} onClick={()=>handleProjectDelete(project) }>Delete</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                        </div>
                                    </div>
                                </div>
                            </div>)}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Projects;
