import React, { useState, useCallback, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Workspace.css';
import axiosInstance from '../../services/axiosInstance';
import useNotification from '../../hooks/useNotification';
import { useNavigate } from 'react-router-dom';
import FreshWorkspaceModal from './NewWorkspaceModal';

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import Sidebar from "../../components/bars/Sidebar";
import Navbar from "../../components/bars/Navbar";


let GITHUB_AUTHORIZED_URL = `https://github.com/login/oauth/authorize?client_id=Ov23liJhpyR8Kjsrq7x5&redirect_uri=http://localhost:3000/github-redirect&scope=repo`

const Workspaces = () => {
    const [loading, setLoading] = useState(false)
    const [workspaceDropDown, setWorkspaceDropDown] = useState(false);
    const [workspaces, setWorkspaces] = useState([])
    const [volumes, setVolumes] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [userResources, setUserResources] = useState(null);
    const [codeServerLoading, setCodeServerLoading] = useState(false)
    const [codeServerUrl, setCodeServerUrl] = useState('')


    const navigate = useNavigate();
    const notify = useNotification();
    let token = localStorage.getItem('token');

    const fetchWorkspaces = useCallback(async (token) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/workspaces', {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if (response.status === 200) {
                if (response.data && response.data.info) {
                    notify('Info', response.data.info || 'Fetched workspaces information.', 'info');
                }
                setWorkspaces(response.data.workspaces || []);
                setVolumes(response.data.volumes || []);
                setUserResources(response.data.userResources);
            } else {
                console.error('Internal Server Error:', response.data.warn);
                notify('Error', response.data.warn || 'Internal Server Error', 'danger');
            }
        } catch (error) {
            console.error('Failed to fetch workspaces.', error);
            notify('Error', 'Failed to fetch workspaces.', 'danger');
        } finally {
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        if (!token) {
            console.error('No token found in local storage');
            notify('Error', 'Failed to fetch workspaces.', 'danger');
            return;
        }
        fetchWorkspaces(token);
    }, []);

    const handleFreshWorkspace = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleWorkspaceConfiguration = async (workspace) => {
        navigate('/workspace', { state: { workspace } });
    }

    const handleCodeServer = async (workspace) => {
        setCodeServerLoading(true);

        try {
            const response = await axiosInstance.post('/restart-codeserver', { container: workspace }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if (response.status === 200) {
                if (response.data && response.data.info) {
                    notify('Info', response.data.info || 'Code Server restarted.', 'info');
                    setCodeServerUrl(response.data.codeServerUrl)
                    if (codeServerUrl) {
                    }
                }
            }
            else {
                console.error('Internal Server Error:', response.data.warn);
                notify('Error', response.data.warn || 'Internal Server Error', 'danger');
            }
        } catch (error) {
            console.error('Failed to restart code server.', error);
            notify('Error', 'Failed to restart code server.', 'danger');
        } finally {
            setCodeServerLoading(false);
        }



    }


    return (

        <div className="profile d-flex">
			<div>
				<Sidebar />
			</div>
			<div style={{ flex: "1 1 auto", display: "flex", flexFlow: "column", height: "100vh", overflowY: "hidden" }}>
				<Navbar pageTitle={'Profile'} />
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
                                        <div className="popup" onClick={() => setWorkspaceDropDown(!workspaceDropDown)} style={{ cursor: 'pointer', marginLeft: '15px', marginTop: '15px' }}>


                                            <div style={{ textDecoration: 'none', marginBottom: '10px', display: 'flex', alignItems: 'center', padding: '5px 14px', color: '#fff', borderRadius: '4px', border: '2px solid #007bff' }}>
                                                <i className="fas fa-plus" style={{ fontSize: '25px', color: 'white' }}>
                                                    &nbsp;Add Workspace
                                                </i>
                                            </div>

                                            {workspaceDropDown && (
                                                <div className="popup-menu" style={{ top: '50px', right: '0', background: 'black', position: 'absolute', border: '1px solid #ccc', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', zIndex: '1000', padding: '10px', borderRadius: '4px', minWidth: '150px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', padding: '10px' }}>

                                                        <button onClick={handleFreshWorkspace} style={{ textDecoration: 'none', marginBottom: '10px', display: 'flex', alignItems: 'center', padding: '8px 16px', color: '#fff', borderRadius: '5px', border: '2px solid #007bff', backgroundColor: 'black' }}>
                                                            <i className="fas fa-folder-plus" style={{ marginRight: '8px' }}></i> New Workspace
                                                        </button>


                                                        <a href={GITHUB_AUTHORIZED_URL} style={{ pointerEvents: 'none', textDecoration: 'none', marginBottom: '10px', display: 'flex', alignItems: 'center', padding: '8px 16px', color: '#fff', borderRadius: '5px', border: '2px solid #007bff' }}>
                                                            <i className="fab fa-github" style={{ marginRight: '8px' }}></i> New Workspace With GitHub Repository
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

											{workspaces.map((workpace, index) => (
                                                <div key={index} className="card-bg w-100 border d-flex flex-column">
                                                    <div className="p-4 d-flex flex-column h-100">
                                                        <h4 className="my-4 text-right text-white h2 font-weight-bold">
                                                            Workspace: {workpace.workspaceName}
                                                        </h4>

                                                        <div>
                                                            <h5 className="text-white mt-3">Resource Allocated</h5>
                                                            <p className="text-white">Memory: {workpace.resourceAllocated.Memory / (1024 * 1024)} MB</p>
                                                            <p className="text-white">CPUs: {workpace.resourceAllocated.NanoCpus / 1e9} cores</p>
                                                            <p className="text-white">Storage: {workpace.resourceAllocated.Storage} MB</p>
                                                            <p style={{ color: 'red', fontWeight: 'bold' }}>
                                                                ⚠️ Use your account username and password if Sign-in required. For security reasons, update your workspace credentials from the configuration below.
                                                                <br />
                                                                Do verify that  <span style={{ color: 'blue', fontWeight: 'bold' }}> ALL URL</span> ends with
                                                                <span style={{ color: 'blue', fontWeight: 'bold' }}> .bycontrolia.com</span>
                                                            </p>

                                                            <a href={`${codeServerUrl}`}> Code-Server URL: {codeServerUrl}</a>

                                                        </div>

                                                        <div className="d-flex justify-content-between mt-auto">
                                                            <button className="btn btn-primary" onClick={() => handleWorkspaceConfiguration(workpace)}>
                                                                Configuration
                                                            </button>

                                                            <button disabled={codeServerLoading} className="btn btn-success" onClick={() => handleCodeServer(workpace)}>
                                                                {codeServerLoading ? 'Starting Code Server' : 'Enter Into Code Server'}
                                                            </button>


                                                        </div>
                                                    </div>
                                      
                                            </div>



                                        ))}

											
										</div>
									</div>
								</div>

								{/* <div className="info">
									<div className="d-flex card-section">

										<div className="cards-container">
											<div className="card-bg w-100 border d-flex flex-column">
												<div className="p-4 d-flex flex-column h-100">
													<div className="d-flex align-items-center justify-content-between">
														<h4 className="m-0 h5 font-weight-bold text-white">General Information</h4>
														<div className="py-1 px-2 bg-grey rounded-circle"><i className="fas fa-user"></i></div>
													</div>
													<h4 className="my-4 text-right text-white h2 font-weight-bold">sdfdsfdsfs</h4>

													<p>account setput info here</p>

												</div>
											</div>



										</div>
									</div>
								</div> */}
							</div>


						)}
					</div>
				</div>
			</div>
            <FreshWorkspaceModal isOpen={isModalOpen} onClose={handleCloseModal} existingVolumes={volumes} userResources={userResources} />
		</div>
    );
}

export default Workspaces;
