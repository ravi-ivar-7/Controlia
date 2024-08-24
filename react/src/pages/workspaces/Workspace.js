import React, { useState, useCallback, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Workspace.css';
import axiosInstance from '../../services/axiosInstance';
import useNotification from '../../hooks/useNotification';
import { useLocation } from 'react-router-dom';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import Sidebar from "../../components/bars/Sidebar";
import Navbar from "../../components/bars/Navbar";

let token = localStorage.getItem('token');

const Workspace = () => {
    const [loading, setLoading] = useState(false);
    const [workpaceInfo, setWorkpaceInfo] = useState();
    const [containerData, setContainerData] = useState();
    const [volumeData, setVolumeData] = useState();
    const [userResources, setUserResources] = useState();
    const [codeServerLoading, setCodeServerLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteType, setDeleteType] = useState('deleteOnlyContainer');
    const [user, setUser] = useState();

    const [newCpus, setNewCpus] = useState(0);
    const [newMemoryLimit, setNewMemoryLimit] = useState(0)

    const [changeResourcesLoading, setChangeResourcesLoading] = useState(false);

    const notify = useNotification();
    const location = useLocation();
    const workspace = location.state?.workspace;
    console.log(workspace)

    if (!workspace) {
        notify('Error', 'This action is not allowed', 'danger')
        navigator(-1)
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
                setWorkpaceInfo(response.data.workpaceInfo);
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

    const handleCodeServerStart = async () => {
        setCodeServerLoading(true);
        try {
            const response = await axiosInstance.post('/start-code-server', { container: workspace }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if (response.status === 200) {
                if (response.data && response.data.info) {
                    notify('Info', response.data.info || 'Code Server started.', 'info');
                }

            } else {
                console.error('Internal Server Error:', response.data.warn);
                notify('Error', response.data.warn || 'Internal Server Error', 'danger');
            }
        } catch (error) {
            console.error('Failed to start code server.', error);
            notify('Error', 'Failed to start code server.', 'danger');
        } finally {
            setCodeServerLoading(false);
        }
    }

    const handleCodeServerStop = async () => {
        setCodeServerLoading(true);
        try {
            const response = await axiosInstance.post('/stop-code-server', { container: workspace }, {
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

    const handleWorkspaceDelete = async () => {
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

    return (
        <div className="workspace d-flex">
            <div>
                <Sidebar />
            </div>
            <div style={{ flex: "1 1 auto", display: "flex", flexFlow: "column", height: "100vh", overflowY: "hidden" }}>
                <Navbar pageTitle={'Workspace'} />
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
                                    <div className="d-flex card-section">
                                        <div className="cards-container">

                                            <div className="card-bg w-100 border d-flex flex-column">
                                                <div className="p-4 d-flex flex-column h-100">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <h4 className="m-0 h5 font-weight-bold text-white">System Status</h4>
                                                        <div className="py-1 px-2 bg-grey rounded-circle"><i className="fas fa-user"></i></div>
                                                    </div>
                                                    <h4 className="my-4 text-right text-white h2 font-weight-bold">sdfdsfdsfs</h4>

                                                    <p >
                                                        User-Id:
                                                    </p>
                                                    <p >
                                                        Email: sdfdsfdsfs
                                                    </p>

                                                </div>
                                            </div>

                                            <div className="card-bg w-100 border d-flex flex-column">
                                                <div className="p-4 d-flex flex-column h-100">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <h4 className="m-0 h5 font-weight-bold text-white">Workspace Information</h4>
                                                        <div className="py-1 px-2 bg-grey rounded-circle"><i className="fas fa-user"></i></div>
                                                    </div>
                                                    <h4 className="my-4 text-right text-white h2 font-weight-bold">{workpaceInfo?.workspaceName}</h4>

                                                    <p >

                                                    </p>


                                                </div>
                                            </div>


                                            <div className="card-bg w-100 border d-flex flex-column">
                                                <div className="p-4 d-flex flex-column h-100">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <h4 className="m-0 h5 font-weight-bold text-white">Volume Information</h4>
                                                        <div className="py-1 px-2 bg-grey rounded-circle"><i className="fas fa-cogs"></i></div>
                                                    </div>
                                                    <h4 className="my-4 text-right text-white h2 font-weight-bold">{volumeData?.Name || 'N/A'}</h4>
                                                    <p><strong>ID:</strong> {volumeData?.Id || 'N/A'}</p>
                                                    <p><strong>Driver:</strong> {volumeData?.Driver || 'N/A'}</p>
                                                    <p><strong>Mountpoint:</strong> {volumeData?.Mountpoint || 'N/A'}</p>
                                                    <p><strong>Labels:</strong> {JSON.stringify(volumeData?.Labels) || 'N/A'}</p>
                                                    <p><strong>Options:</strong> {JSON.stringify(volumeData?.Options) || 'N/A'}</p>
                                                    {/* Additional volume info can be added here */}

                                                </div>
                                            </div>



                                            <div className="card-bg w-100 border d-flex flex-column">
                                                <div className="p-4 d-flex flex-column h-100">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <h4 className="m-0 h5 font-weight-bold text-white">Container Information</h4>
                                                        <div className="py-1 px-2 bg-grey rounded-circle"><i className="fas fa-cogs"></i></div>
                                                    </div>
                                                    <h4 className="my-4 text-right text-white h2 font-weight-bold">{containerData?.Name || 'N/A'}</h4>
                                                    <p><strong>ID:</strong> {containerData?.Id || 'N/A'}</p>
                                                    <p><strong>Image:</strong> {containerData?.Image || 'N/A'}</p>
                                                    <p><strong>Command:</strong> {containerData?.Command || 'N/A'}</p>
                                                    <p><strong>Status:</strong> {containerData?.State?.Status || 'N/A'}</p>
                                                    <p><strong>Ports:</strong> {containerData?.Ports?.map(port => `${port.PrivatePort}:${port.PublicPort}`).join(', ') || 'N/A'}</p>
                                                    <p><strong>Created At:</strong> {containerData?.Created || 'N/A'}</p>
                                                    <p><strong>Labels:</strong> {JSON.stringify(containerData?.Config?.Labels) || 'N/A'}</p>
                                                    <p><strong>Mounts:</strong> {containerData?.Mounts?.map(mount => `${mount.Type}: ${mount.Source} -> ${mount.Destination}`).join(', ') || 'N/A'}</p>
                                                    <p><strong>Networks:</strong> {JSON.stringify(containerData?.NetworkSettings?.Networks) || 'N/A'}</p>
                                                    {/* Additional container info can be added here */}

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
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <h4 className="m-0 h5 font-weight-bold text-white">Update Resources</h4>
                                                        <div className="py-1 px-2 bg-grey rounded-circle"><i className="fas fa-cogs"></i></div>
                                                    </div>
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

                                                    <button className="btn btn-warning mx-2" onClick={handleChangeResource} disabled={changeResourcesLoading}>
                                                        {changeResourcesLoading ? 'Updating Resources...' : 'Change Resources'}
                                                    </button>



                                                </div>
                                            </div>


                                            <div className="card-bg w-100 border d-flex flex-column">
                                                <div className="p-4 d-flex flex-column h-100">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <h4 className="m-0 h5 font-weight-bold text-white">Workspace Information</h4>
                                                        <div className="py-1 px-2 bg-grey rounded-circle"><i className="fas fa-user"></i></div>
                                                    </div>
                                                    <h4 className="my-4 text-right text-white h2 font-weight-bold">{workpaceInfo?.workspaceName}</h4>

                                                    <div className="d-flex">
                                                        <button className="btn btn-primary mx-2" onClick={handleCodeServerStart} disabled={codeServerLoading}>
                                                            {codeServerLoading ? 'Starting Code Server...' : 'Start Code Server'}
                                                        </button>
                                                        <button className="btn btn-secondary mx-2" onClick={handleCodeServerStop} disabled={codeServerLoading}>
                                                            {codeServerLoading ? 'Stopping Code Server...' : 'Stop Code Server'}
                                                        </button>
                                                        <button
                                                            className="btn btn-danger mx-2"
                                                            onClick={() => {
                                                                setDeleteType('deleteOnlyContainer');
                                                                handleWorkspaceDelete();
                                                            }}
                                                        >
                                                            {deleteLoading ? 'Deleting Workspace...' : 'Delete Workspace only'}
                                                        </button>
                                                        <button
                                                            className="btn btn-danger mx-2"
                                                            onClick={() => {
                                                                setDeleteType('deleteWithVolume');
                                                                handleWorkspaceDelete();
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




                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Workspace;
