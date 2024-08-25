import React, { useState, useCallback, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Workspace.css';
import axiosInstance from '../../services/axiosInstance';
import useNotification from '../../hooks/useNotification';
import { useLocation, useNavigate } from 'react-router-dom';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import Sidebar from "../../components/bars/Sidebar";
import Navbar from "../../components/bars/Navbar";

let token = localStorage.getItem('token');


const Workspace = () => {
    const [loading, setLoading] = useState(false);
    const [workspaceInfo, setWorkspaceInfo] = useState();
    const [containerData, setContainerData] = useState();
    const [volumeData, setVolumeData] = useState();
    const [userResources, setUserResources] = useState();
    const [codeServerLoading, setCodeServerLoading] = useState(false);
    const [codeServerHelpText, setCodeServerHelpText] = useState(false)
    const [codeServerNewUser, setCodeServerNewUsername] = useState('')
    const [codeServerNewPassword, setCodeServerNewPassword] = useState('')

    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteType, setDeleteType] = useState('');
    const [user, setUser] = useState();
    const [port3000NewUser, setPort3000NewUser] = useState('')
    const [port3000NewPassword, setPort3000NewPassword] = useState('')
    const [port3000Loading, setPort3000Loading] = useState(false)
    const [port3000HelpText, setPort3000HelpText] = useState(false)
    const [disablePort3000Auth, setDisablePort3000Auth] = useState(false)


    const [port5000NewUser, setPort5000NewUser] = useState('')
    const [port5000NewPassword, setPort5000NewPassword] = useState('')
    const [port5000Loading, setPort5000Loading] = useState(false)
    const [port5000HelpText, setPort5000HelpText] = useState(false)
    const [disablePort5000Auth, setDisablePort5000Auth] = useState(false)


    const [newCpus, setNewCpus] = useState(0);
    const [newMemoryLimit, setNewMemoryLimit] = useState(0)

    const [workspaceLoading, setWorkspaceLoading] = useState(false)
    const [workspaceAction, setWorkspaceAction] = useState('activate')
    const [changeResourcesLoading, setChangeResourcesLoading] = useState(false);
    const [deleteWorkspaceHelpText, setDeleteWorkspaceHelpText] = useState(false)
    const [deleteWorkspaceWithVolumeHelpText, setDeleteWorkspaceWithVolumeHelpText] = useState(false)



    const notify = useNotification();
    const location = useLocation();
    const navigate = useNavigate();

    const workspace = location.state?.workspace;
    const isWorkspaceActive = containerData && containerData.status === 'running';

    if (!workspace) {
        notify('Error', 'This action is not allowed', 'danger')
        navigate(-1)
    }

    const fetchWorkspaceInfo = useCallback(async (token) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/workspace-info', { container: workspace }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if (response.status === 200) {
                if (response.data && response.data.info) {
                    notify('Info', response.data.info || 'Fetched workspace information.', 'info');
                }
                setContainerData(response.data.containerData);
                setVolumeData(response.data.volumeData);
                setUserResources(response.data.userResources);
                setWorkspaceInfo(response.data.workspaceInfo);
                setUser(response.data.user);

            } else {
                console.error('Internal Server Error:', response.data.warn);
                notify('Error', response.data.warn || 'Internal Server Error', 'danger');
            }
        } catch (error) {
            console.error('Failed to fetch workspace.', error);
            notify('Error', 'Failed to fetch workspace.', 'danger');
        } finally {
            setLoading(false);
        }
    }, [notify, workspace]);

    useEffect(() => {
        if (!token) {
            console.error('No token found in local storage');
            notify('Error', 'Failed to fetch workspace.', 'danger');
            return;
        }
        fetchWorkspaceInfo(token);
    }, [fetchWorkspaceInfo, token, notify]);

    // workspace related
    const handleWorkspaceDelete = async (deleteType) => {
        const userConfirmed = window.confirm(
            "You are about to delete the workspace.\n\n" +
            "If you choose to delete only the workspace, the associated storage volume will remain intact and can be reused with any new workspace or project.\n\n" +
            "If you choose to delete the workspace along with its volume, all files, settings, and data related to this workspace will be permanently lost. This action cannot be undone.\n\n" +
            "Please ensure you have backed up any important data before proceeding.\n\n" +
            "Do you wish to continue?"
        );


        if (!deleteType) {
            notify('Error', 'Invalid deletion type specified.', 'danger');
            return;
        }

        if (userConfirmed) {
            setDeleteLoading(true);
            try {
                const response = await axiosInstance.post('/delete-workspace', { container: workspace, deleteType }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                if (response.status === 200) {
                    if (response.data && response.data.info) {
                        notify('Info', response.data.info || 'Workspace deleted.', 'info');
                        navigate('/workspaces')
                        
                    }

                } else {
                    console.error('Internal Server Error:', response.data.warn);
                    notify('Error', response.data.warn || 'Internal Server Error', 'danger');
                }
            } catch (error) {
                console.error('Failed to delete workspace.', error);
                notify('Error', 'Failed to delete workspace.', 'danger');
            } finally {
                setDeleteLoading(false);
            }
        }
        else {
            notify('Info', 'Action aborted!', 'warning')
        }
    }

    const handleChangeResource = async () => {
        setChangeResourcesLoading(true);
        try {
            const response = await axiosInstance.post('/change-workspace-resources', { container: workspace, newCpus, newMemoryLimit }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if (response.status === 200) {
                if (response.data && response.data.info) {
                    notify('Info', response.data.info || 'Resources updated.', 'info');
                }
            } else {
                console.error('Internal Server Error:', response.data.warn);
                notify('Error', response.data.warn || 'Internal Server Error', 'danger');
            }
        } catch (error) {
            console.error('Failed to update resources.', error);
            notify('Error', 'Failed to update resources.', 'danger');
        } finally {
            setChangeResourcesLoading(false);
        }
    }

    const handleWorkspaceAction = async () => {
        setWorkspaceLoading(true);
        try {
            const response = await axiosInstance.post('/workspace-action', { container: workspace, workspaceAction }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if (response.status === 200) {
                if (response.data && response.data.info) {
                    notify('Info', response.data.info || `Workspace is ${workspaceAction}`, 'info');
                    setContainerData(response.data.containerData);
                    setVolumeData(response.data.volumeData);
                    setUserResources(response.data.userResources);
                    setWorkspaceInfo(response.data.workspaceInfo);
                    setUser(response.data.user);
                }
            } else {
                console.error(`Failed to ${workspaceAction} workspace:`, response.data.warn);
                notify('Error', response.data.warn || 'Internal Server Error', 'danger');
            }
        } catch (error) {
            console.error(`Failed to ${workspaceAction} workspace:`, error);
            notify('Error', `Failed to ${workspaceAction} workspace.`, 'danger');
        } finally {
            setWorkspaceLoading(false);
        }
    }

    // code server related
    const handleCodeServerRestart = async () => {
        if (!isWorkspaceActive) {
            notify('Error', 'Workspace is inactive. Activate it.', 'danger');
            return;
        }
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
                }

            } else {
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

    const handleCodeServerStop = async () => {

        if (!isWorkspaceActive) {
            notify('Error', 'Workspace is inactive. Activate it.', 'danger');
            return;
        }
        try {
            setCodeServerLoading(true);
            const response = await axiosInstance.post('/stop-codeserver', { container: workspace }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if (response.status === 200) {
                if (response.data && response.data.info) {
                    notify('Info', response.data.info || 'Code Server stopped.', 'info');
                }

            } else {
                console.error('Internal Server Error:', response.data.warn);
                notify('Error', response.data.warn || 'Internal Server Error', 'danger');
            }
        } catch (error) {
            console.error('Failed to stop code server.', error);
            notify('Error', 'Failed to stop code server.', 'danger');
        } finally {
            setCodeServerLoading(false);
        }
    }

    // port 3000/5000 related

    const handlePort3000Credentials = async () => {

        let userConfirmed;
        if (disablePort3000Auth) {
            userConfirmed = window.confirm(
                "Disabling authentication on development ports/domains can expose your application to unauthorized access and security risks. It's important to have authentication in place to protect sensitive data and prevent unauthorized actions. \n\n" +
                "Are you sure you want to proceed with disabling authentication?"
            );
        }
        if ((disablePort3000Auth && userConfirmed) || !disablePort3000Auth) {
            setPort3000Loading(true);
            try {
                const response = await axiosInstance.post('/port3000-credentials', { container: workspace, port3000NewPassword, port3000NewUser, disablePort3000Auth }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                if (response.status === 200) {
                    if (response.data && response.data.info) {
                        notify('Info', response.data.info || 'Port 3000 credentials updated.', 'info');
                    }
                } else {
                    console.error('Internal Server Error:', response.data.warn);
                    notify('Error', response.data.warn || 'Internal Server Error', 'danger');
                }
            } catch (error) {
                console.error('Failed to update port 3000 credentials.', error);
                notify('Error', 'Failed to update port 3000 credentials.', 'danger');
            } finally {
                setPort3000Loading(false);
            }
        }
        else {
            notify('Info', 'Action aborted!', 'danger')
        }


    }
    const handlePort5000Credentials = async () => {
        let userConfirmed;
        if (disablePort5000Auth) {
            userConfirmed = window.confirm(
                "Disabling authentication on development ports/domains can expose your application to unauthorized access and security risks. It's important to have authentication in place to protect sensitive data and prevent unauthorized actions. \n\n" +
                "Are you sure you want to proceed with disabling authentication?"
            );
        }
        if ((disablePort5000Auth && userConfirmed) || !disablePort5000Auth) {
            setPort5000Loading(true);
            try {
                const response = await axiosInstance.post('/port5000-credentials', { container: workspace, disableAuth: false }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                if (response.status === 200) {
                    if (response.data && response.data.info) {
                        notify('Info', response.data.info || 'Port 5000 credentials updated.', 'info');
                    }
                } else {
                    console.error('Internal Server Error:', response.data.warn);
                    notify('Error', response.data.warn || 'Internal Server Error', 'danger');
                }
            } catch (error) {
                console.error('Failed to update port 5000 credentials.', error);
                notify('Error', 'Failed to update port 5000 credentials.', 'danger');
            } finally {
                setPort5000Loading(false);
            }
        }
        else {
            notify('Info', 'Action aborted!', 'danger')
        }
    }

    console.log(volumeData, userResources)
    return (


        <div className="workspace d-flex">
            <div>
                <Sidebar />
            </div>
            <div style={{ flex: "1 1 auto", display: "flex", flexFlow: "column", height: "100vh", overflowY: "hidden" }}>
                <Navbar pageTitle={`${workspaceInfo?.workspaceName || '...'}-workspace`} />
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


                                <div className="info">
                                    <div
                                        style={{
                                            marginTop: '20px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        {containerData?.State?.Status === 'running' ? (
                                            <button
                                                className="btn btn-danger mx-2 mt-2"
                                                onClick={() => { setWorkspaceAction('deactivate'); handleWorkspaceAction(); }}
                                                disabled={workspaceLoading}
                                            >
                                                {workspaceLoading ? 'Deactivating workspace...' : ' Deactivate Workspace'}
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-success mx-2 mt-2"
                                                onClick={() => { setWorkspaceAction('activate'); handleWorkspaceAction(); }}
                                                disabled={workspaceLoading}
                                            >
                                                {workspaceLoading ? 'Activation Workspace...' : '  Activate Workspace'}
                                            </button>
                                        )}


                                    </div>

                                    <div className="d-flex card-section">
                                        <div className="cards-container">


                                            <div className="card-bg w-100 border d-flex flex-column">
                                                <div className="p-4 d-flex flex-column h-100">

                                                    <h3 className="text-white">Code Server
                                                        <span
                                                            style={{
                                                                marginLeft: '8px',
                                                                cursor: 'pointer',
                                                                color: '#007bff',
                                                                textDecoration: 'underline',
                                                            }}
                                                            onClick={() => setCodeServerHelpText(!codeServerHelpText)}
                                                        >
                                                            <i
                                                                className="fas fa-info-circle"
                                                                style={{ fontSize: '30px', color: 'yellow' }}
                                                            ></i>
                                                        </span>
                                                    </h3>
                                                    {codeServerHelpText && (
                                                        <div
                                                            style={{
                                                                backgroundColor: 'black',
                                                                border: '1px solid #ddd',
                                                                borderRadius: '4px',
                                                                padding: '10px',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,1)',
                                                                zIndex: 1000,
                                                                color: 'white',
                                                            }}
                                                        >
                                                            <h5>What is Code Server?</h5>
                                                            <p>
                                                                Code Server is a tool that allows you to run Visual Studio Code (VS Code) on a remote server and access it through a web browser. It provides a cloud-based development environment, enabling you to code from any device with a browser, without needing to install VS Code locally.
                                                            </p>
                                                            <p>
                                                                <strong>Benefits:</strong>
                                                                <ul>
                                                                    <li><strong>Accessibility:</strong> Access your development environment from anywhere with an internet connection.</li>
                                                                    <li><strong>Consistency:</strong> Work in a consistent environment that is identical to the one used by other team members or on different devices.</li>
                                                                    <li><strong>Resource Management:</strong> Utilize the resources of a powerful server rather than relying on local machine resources.</li>
                                                                    <li><strong>Collaboration:</strong> Share your development environment with team members for easier collaboration.</li>
                                                                </ul>
                                                            </p>
                                                            <p>
                                                                <strong>Use Cases:</strong>
                                                                <ul>
                                                                    <li><strong>Remote Development:</strong> Ideal for working on projects from different locations or devices.</li>
                                                                    <li><strong>Onboarding:</strong> Provides a standardized development setup for new team members.</li>
                                                                    <li><strong>Cloud-Based Projects:</strong> Useful for cloud-native projects where the development environment is closely integrated with cloud services.</li>
                                                                </ul>
                                                            </p>
                                                            <p>
                                                                While Code Server offers flexibility and convenience, it’s important to secure your development environment to protect your code and data. Ensure proper authentication and encryption are in place to prevent unauthorized access.
                                                            </p>
                                                        </div>
                                                    )}


                                                    <p className="text-white mt-3">
                                                        <strong>Code Server Domain:</strong> {workspaceInfo?.subdomains?.codeServer || 'N/A'}<br />

                                                    </p>

                                                    <h4 className="text-white">Update Code Server Credentials</h4>
                                                    <div className="form-group mt-3">
                                                        <label htmlFor="port3000NewUser" className="text-white">New Username</label>
                                                        <input
                                                            type="text"
                                                            id="port3000NewUser"
                                                            className="form-control"
                                                            value={codeServerNewUser || ''}
                                                            onChange={(e) => setCodeServerNewUsername(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="form-group mt-3">
                                                        <label htmlFor="port3000NewPassword" className="text-white">New Password</label>
                                                        <input
                                                            type="text"
                                                            id="port3000NewPassword"
                                                            className="form-control"
                                                            value={codeServerNewPassword || ''}
                                                            onChange={(e) => setCodeServerNewPassword(e.target.value)}
                                                        />
                                                    </div>

                                                    <button
                                                        className="btn btn-info mt-2"
                                                        onClick={handleCodeServerRestart}
                                                        disabled={!codeServerNewPassword || !codeServerNewUser}
                                                    >
                                                        {codeServerLoading ? 'Updating Credentials and Restarting...' : 'Update Credentials and Restart.'}
                                                    </button>

                                                    <button
                                                        className="btn btn-danger mt-2"
                                                        onClick={handleCodeServerStop}
                                                        disabled={codeServerLoading}
                                                    >
                                                        {codeServerLoading ? 'Stopping Code Server...' : 'Stop Code Server'}
                                                    </button>


                                                </div>
                                            </div>

                                            <div className="card-bg w-100 border d-flex flex-column">
                                                <div className="p-4 d-flex flex-column h-100">

                                                    <h3 className="text-white">Port 3000
                                                        <span
                                                            style={{
                                                                marginLeft: '8px',
                                                                cursor: 'pointer',
                                                                color: '#007bff',
                                                                textDecoration: 'underline',
                                                            }}
                                                            onClick={() => setPort3000HelpText(!port3000HelpText)}
                                                        >  <i
                                                            className="fas fa-info-circle"
                                                            style={{ fontSize: '30px', color: 'yellow' }}
                                                        ></i>
                                                        </span></h3>
                                                    {port3000HelpText && (
                                                        <div
                                                            style={{
                                                                backgroundColor: 'black',
                                                                border: '1px solid #ddd',
                                                                borderRadius: '4px',
                                                                padding: '10px',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,1)',
                                                                zIndex: 1000,
                                                            }}
                                                        >
                                                            <p>
                                                                Port 3000 is a common default port used for running web applications in development. When you run your application on this port, it allows you to access and test your application locally or over the internet if configured properly. This is particularly useful for development purposes as it provides a controlled environment where you can test and debug your application.
                                                            </p>
                                                            <p>
                                                                During the development phase, exposing Port 3000 allows other team members or stakeholders to access the application and provide feedback. It also helps in testing how your application behaves in a real-world scenario, ensuring that the application is ready for production deployment.
                                                            </p>
                                                            <p>
                                                                However, be cautious when exposing Port 3000 to the internet as it may expose your application to security risks if not properly protected. Ensure that appropriate authentication and security measures are in place to prevent unauthorized access and protect sensitive information.
                                                            </p>

                                                        </div>
                                                    )}


                                                    <p className="text-white">
                                                        <strong>Domain:</strong> {workspaceInfo?.subdomains?.dev3000Server || 'N/A'}
                                                    </p>
                                                    <h4 className="text-white">Update Port 3000 Credentials</h4>
                                                    <div className="form-group mt-3">
                                                        <label htmlFor="port3000NewUser" className="text-white">New Username</label>
                                                        <input
                                                            type="text"
                                                            id="port3000NewUser"
                                                            className="form-control"
                                                            value={port3000NewUser || ''}
                                                            onChange={(e) => setPort3000NewUser(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="form-group mt-3">
                                                        <label htmlFor="port3000NewPassword" className="text-white">New Password</label>
                                                        <input
                                                            type="text"
                                                            id="port3000NewPassword"
                                                            className="form-control"
                                                            value={port3000NewPassword || ''}
                                                            onChange={(e) => setPort3000NewPassword(e.target.value)}
                                                        />
                                                    </div>
                                                    <button
                                                        className="btn btn-info mt-2"
                                                        onClick={handlePort3000Credentials}
                                                        disabled={!port3000NewPassword || !port3000NewUser}
                                                    >
                                                        {port3000Loading ? 'Updating credentials...' : 'Update Credentials'}
                                                    </button>
                                                    <button
                                                        className="btn btn-danger mt-2"
                                                        onClick={() => {
                                                            setDisablePort3000Auth(true);
                                                            handlePort3000Credentials();
                                                        }}
                                                        disabled={port3000Loading}
                                                    >
                                                        <i
                                                            className="fas fa-exclamation-triangle"
                                                            style={{ fontSize: '25px', color: 'black', margin: '5px' }}
                                                        ></i>
                                                        {port3000Loading ? 'Disabling ...' : 'Disable Port 3000 Auth'}
                                                    </button>




                                                </div>
                                            </div>

                                            <div className="card-bg w-100 border d-flex flex-column">
                                                <div className="p-4 d-flex flex-column h-100">
                                                    <h3 className="text-white">Port 5000
                                                        <span
                                                            style={{
                                                                marginLeft: '8px',
                                                                cursor: 'pointer',
                                                                color: '#007bff',
                                                                textDecoration: 'underline',
                                                            }}
                                                            onClick={() => setPort5000HelpText(!port5000HelpText)}
                                                        >  <i
                                                            className="fas fa-info-circle"
                                                            style={{ fontSize: '30px', color: 'yellow' }}
                                                        ></i>
                                                        </span></h3>
                                                    {port5000HelpText && (
                                                        <div
                                                            style={{
                                                                backgroundColor: 'black',
                                                                border: '1px solid #ddd',
                                                                borderRadius: '4px',
                                                                padding: '10px',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,1)',
                                                                zIndex: 1000,
                                                            }}
                                                        >
                                                            <p>
                                                                Port 5000 is also a common default port used for running web applications in development. When you run your application on this port, it allows you to access and test your application locally or over the internet if configured properly. This is particularly useful for development purposes as it provides a controlled environment where you can test and debug your application.
                                                            </p>
                                                            <p>
                                                                During the development phase, exposing Port 5000 allows other team members or stakeholders to access the application and provide feedback. It also helps in testing how your application behaves in a real-world scenario, ensuring that the application is ready for production deployment.
                                                            </p>
                                                            <p>
                                                                However, be cautious when exposing Port 5000 to the internet as it may expose your application to security risks if not properly protected. Ensure that appropriate authentication and security measures are in place to prevent unauthorized access and protect sensitive information.
                                                            </p>

                                                        </div>
                                                    )}




                                                    <p className="text-white">
                                                        <strong>Domain:</strong> {workspaceInfo?.subdomains?.dev5000Server || 'N/A'}
                                                    </p>
                                                    <h4 className="text-white">Update Port 5000 Credentials</h4>
                                                    <div className="form-group mt-3">
                                                        <label htmlFor="port5000NewUser" className="text-white">New Username</label>
                                                        <input
                                                            type="text"
                                                            id="port5000NewUser"
                                                            className="form-control"
                                                            value={port5000NewUser || ''}
                                                            onChange={(e) => setPort5000NewUser(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="form-group mt-3">
                                                        <label htmlFor="port5000NewPassword" className="text-white">New Password</label>
                                                        <input
                                                            type="text"
                                                            id="port5000NewPassword"
                                                            className="form-control"
                                                            value={port5000NewPassword || ''}
                                                            onChange={(e) => setPort5000NewPassword(e.target.value)}
                                                        />
                                                    </div>
                                                    <button
                                                        className="btn btn-info mx-2 mt-2"
                                                        onClick={handlePort5000Credentials}
                                                        disabled={!port5000NewPassword || !port5000NewUser}
                                                    >
                                                        {port5000Loading ? 'Updating credentials...' : 'Update Credentials'}
                                                    </button>

                                                    <button
                                                        className="btn btn-danger mt-2"
                                                        onClick={() => {
                                                            setDisablePort5000Auth(true);
                                                            handlePort5000Credentials();
                                                        }}
                                                        disabled={port5000Loading}
                                                    >
                                                        <i
                                                            className="fas fa-exclamation-triangle"
                                                            style={{ fontSize: '25px', color: 'black', margin: '5px' }}
                                                        ></i>
                                                        {port5000Loading ? 'Disabling ...' : 'Disable Port 5000 Auth'}
                                                    </button>



                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="info">
                                    <div className="d-flex card-section">
                                        <div className="cards-container">

                                            <div className="card-bg w-100 border d-flex flex-column">
                                                <div className="p-4 d-flex flex-column h-100">

                                                    <h3 className="text-white">Workspace </h3>
                                                    <p className="text-white mt-3">
                                                        <strong>Status:</strong> {containerData?.State?.Status}
                                                    </p>

                                                    <p><strong>Name:</strong> {workspaceInfo?.workspaceName || 'N/A'}</p>
                                                    <p><strong>Created At:</strong> {workspaceInfo?.createdAt || 'N/A'}</p>
                                                    <p><strong>Memory:</strong> {workspaceInfo?.resourceAllocated?.Memory / (1024 * 1024) || 'N/A'} MB</p>
                                                    <p><strong>CPUs:</strong> {(workspaceInfo?.resourceAllocated?.NanoCpus) / (1e9) || 'N/A'} Cores</p>
                                                    <p><strong>Storage:</strong> {workspaceInfo?.resourceAllocated?.Storage || 'N/A'}</p>
                                                    <p><strong>Volume Name:</strong> {volumeData?.volumeName || 'N/A'}</p>

                                                </div>
                                            </div>

                                            <div className="card-bg w-100 border d-flex flex-column">
                                                <div className="p-4 d-flex flex-column h-100">



                                                    <h4 className="text-white">Update Workspace Resources</h4>

                                                    <p><strong>Total Memory:</strong> {parseFloat(userResources?.totalResources?.Memory) / (1024 * 1024) || 'N/A'} MB</p>
                                                    <p><strong>Total CPUs:</strong> {parseFloat(userResources?.totalResources?.NanoCpus) / (1e9) || 'N/A'} Cores</p>
                                                    <p><strong>Total Storage:</strong> {parseFloat(userResources?.totalResources?.Storage) || 'N/A'} MB</p>

                                                    <p><strong>Available Memory:</strong> {(parseFloat(userResources?.totalResources?.Memory) - parseFloat(userResources?.usedResources?.Memory)) / (1024 * 1024) || 'N/A'} MB</p>
                                                    <p><strong>Available CPUs:</strong> {(parseFloat(userResources?.totalResources?.NanoCpus) - parseFloat(userResources?.usedResources?.NanoCpus)) / (1e9) || 'N/A'} Cores</p>
                                                    <p><strong>Available Storage:</strong> {(parseFloat(userResources?.totalResources?.Storage) - parseFloat(userResources?.usedResources?.Storage)) || 'N/A'} MB</p>


                                                    <div className="mt-4">
                                                        <div className="form-group">
                                                            <label htmlFor="newCpus" className="text-white">New CPUs</label>
                                                            <input
                                                                type="number"
                                                                id="newCpus"
                                                                className="form-control"
                                                                value={newCpus || ''}
                                                                onChange={(e) => setNewCpus(e.target.value)}
                                                                min="0"
                                                            />
                                                        </div>
                                                        <div className="form-group mt-3">
                                                            <label htmlFor="newMemoryLimit" className="text-white">New Memory Limit (MB)</label>
                                                            <input
                                                                type="number"
                                                                id="newMemoryLimit"
                                                                className="form-control"
                                                                value={newMemoryLimit || ''}
                                                                onChange={(e) => setNewMemoryLimit(e.target.value)}
                                                                min="0"
                                                            />
                                                        </div>
                                                    </div>

                                                    <button
                                                        className="btn btn-info mt-2"
                                                        onClick={handleChangeResource}
                                                        disabled={!newMemoryLimit || !newCpus || changeResourcesLoading}
                                                    >
                                                        {changeResourcesLoading ? 'Updating resourses...' : 'Update Resource'}
                                                    </button>


                                                </div>
                                            </div>

                                            <div className="card-bg w-100 border d-flex flex-column">
                                                <div className="p-4 d-flex flex-column h-100">

                                                    <h4 className="text-white">Delete Workspace
                                                        <span
                                                            style={{
                                                                marginLeft: '8px',
                                                                cursor: 'pointer',
                                                                color: '#007bff',
                                                                textDecoration: 'underline',
                                                            }}
                                                            onClick={() => setDeleteWorkspaceHelpText(!deleteWorkspaceHelpText)}
                                                        >
                                                            <i
                                                                className="fas fa-info-circle"
                                                                style={{ fontSize: '30px', color: 'yellow' }}
                                                            ></i>
                                                        </span>
                                                    </h4>
                                                    {deleteWorkspaceHelpText && (
                                                        <div
                                                            style={{
                                                                backgroundColor: 'black',
                                                                border: '1px solid #ddd',
                                                                borderRadius: '4px',
                                                                padding: '10px',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,1)',
                                                                zIndex: 1000,
                                                                color: 'white',
                                                            }}
                                                        >
                                                            <h5>What is "Delete Workspace"?</h5>
                                                            <p>
                                                                The "Delete Workspace" option will remove the selected workspace. This action will stop and permanently remove all files and settings associated with this workspace.
                                                            </p>
                                                            <p>
                                                                <strong>Important Notes:</strong>
                                                                <ul>
                                                                    <li><strong>Data Loss:</strong> Any files and settings within the workspace will be lost. Ensure you have backed up any important data before proceeding.</li>
                                                                    <li><strong>Volume Reuse:</strong> After deleting the workspace, the associated storage volume will remain intact. You can reuse this volume with any new workspace, notebook, or worker if needed.</li>
                                                                    <li><strong>Irreversible:</strong> Once a workspace is deleted, it cannot be recovered. You will need to set up a new workspace if needed.</li>
                                                                </ul>
                                                            </p>
                                                            <p>
                                                                <strong>When to Use:</strong> Use this option when you no longer need a workspace but wish to retain and potentially reuse the associated storage volume for future projects.
                                                            </p>
                                                        </div>
                                                    )}

                                                    <button
                                                        className="btn btn-danger m-2"
                                                        onClick={() => {
                                                            handleWorkspaceDelete('deleteOnlyContainer');
                                                        }}
                                                    >
                                                        {deleteLoading ? 'Deleting Workspace...' : 'Delete Workspace only'}
                                                    </button>


                                                    <h4 className="text-white">Delete Workspace With Volume
                                                        <span
                                                            style={{
                                                                marginLeft: '8px',
                                                                cursor: 'pointer',
                                                                color: '#007bff',
                                                                textDecoration: 'underline',
                                                            }}
                                                            onClick={() => setDeleteWorkspaceWithVolumeHelpText(!deleteWorkspaceWithVolumeHelpText)}
                                                        >
                                                            <i
                                                                className="fas fa-info-circle"
                                                                style={{ fontSize: '30px', color: 'yellow' }}
                                                            ></i>
                                                        </span>
                                                    </h4>
                                                    {deleteWorkspaceWithVolumeHelpText && (
                                                        <div
                                                            style={{
                                                                backgroundColor: 'black',
                                                                border: '1px solid #ddd',
                                                                borderRadius: '4px',
                                                                padding: '10px',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,1)',
                                                                zIndex: 1000,
                                                                color: 'white',
                                                            }}
                                                        >
                                                            <h5>What is "Delete Workspace with Volume"?</h5>
                                                            <p>
                                                                The "Delete Workspace with Volume" option will remove the selected workspace along with any associated storage volume. This action will stop and permanently delete all files, settings, and storage related to this workspace.
                                                            </p>
                                                            <p>
                                                                <strong>Important Notes:</strong>
                                                                <ul>
                                                                    <li><strong>Complete Data Loss:</strong> All files, settings, and associated storage will be permanently removed. Ensure that you have backed up any important data before proceeding.</li>
                                                                    <li><strong>Irreversible:</strong> Once both the workspace and its associated storage are deleted, they cannot be recovered. You will need to create a new workspace if needed.</li>
                                                                </ul>
                                                            </p>
                                                            <p>
                                                                <strong>When to Use:</strong> Use this option when you wish to completely clean up a workspace and all its associated data, including the storage volume. This is typically done when the workspace is no longer needed and you want to ensure that all related data is removed.
                                                            </p>
                                                        </div>
                                                    )}


                                                    <button
                                                        className="btn btn-danger m-2"
                                                        onClick={() => {
                                                            handleWorkspaceDelete('deleteContainerAndVolume');
                                                        }}
                                                    >
                                                        {deleteLoading ? 'Deleting Workspace and Volume...' : 'Delete Workspace with volume data'}
                                                    </button>


                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                </div>

                            </div>

                        )}
                    </div>
                </div>
            </div >
        </div >
    );
}

export default Workspace;
