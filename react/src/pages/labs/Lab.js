import React, { useState, useCallback, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Lab.css';
import axiosInstance from '../../services/axiosInstance';
import useNotification from '../../hooks/useNotification';
import { useLocation, useNavigate } from 'react-router-dom';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import Sidebar from "../../components/bars/Sidebar";
import Navbar from "../../components/bars/Navbar";

let token = localStorage.getItem('token');

// TODO: restart code server with new password

const Lab = () => {
    const [loading, setLoading] = useState(false);
    const [labInfo, setLabInfo] = useState();
    const [containerData, setContainerData] = useState();
    const [volumeData, setVolumeData] = useState();
    const [userResources, setUserResources] = useState();
    const [labServerHelpText, setLabServerHelpText] = useState(false)
    const [labPassword, setLabPassword] = useState('')
    const [labUsername, setLabUsername] = useState('')
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [user, setUser] = useState();

    const [newCpus, setNewCpus] = useState(0);
    const [newMemoryLimit, setNewMemoryLimit] = useState(0)

    const [labLoading, setLabLoading] = useState(false)
    const [changeResourcesLoading, setChangeResourcesLoading] = useState(false);
    const [deleteLabHelpText, setDeleteLabHelpText] = useState(false)
    const [deleteLabWithVolumeHelpText, setDeleteLabWithVolumeHelpText] = useState(false)



    const notify = useNotification();
    const location = useLocation();
    const navigate = useNavigate();
    const isLabActive = containerData && containerData.State.Status === 'running';

    let lab;
    useEffect(() => {
        lab = location.state?.lab;

        if (!lab) {
            notify('Error', 'This action is not allowed', 'danger');
            navigate(-1);
        } else {
            setLabInfo(lab);
        }
    }, [location.state, navigate]);

    const fetchLabInfo = useCallback(async (token) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/lab-info', { container: lab }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if (response.status === 200) {
                if (response.data && response.data.info) {
                    notify('Info', response.data.info || 'Fetched lab information.', 'info');
                }
                setContainerData(response.data.containerData);
                setVolumeData(response.data.volumeData);
                setUserResources(response.data.userResources);
                setLabInfo(response.data.labInfo);
                setUser(response.data.user);

            } else {
                console.error('Internal Server Error:', response.data.warn);
                notify('Error', response.data.warn || 'Internal Server Error', 'danger');
            }
        } catch (error) {
            console.error('Failed to fetch lab.', error);
            notify('Error', 'Failed to fetch lab.', 'danger');
        } finally {
            setLoading(false);
        }
    }, [notify, lab]);

    useEffect(() => {
        if (!token) {
            console.error('No token found in local storage');
            notify('Error', 'Failed to fetch lab.', 'danger');
            return;
        }
        fetchLabInfo(token);
    }, [fetchLabInfo, token, notify]);

    // lab related
    const handleLabDelete = async (deleteType) => {
        const userConfirmed = window.confirm(
            "You are about to delete the lab.\n\n" +
            "If you choose to delete only the lab, the associated storage volume will remain intact and can be reused with any new lab or project.\n\n" +
            "If you choose to delete the lab along with its volume, all files, settings, and data related to this lab will be permanently lost. This action cannot be undone.\n\n" +
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
                const response = await axiosInstance.post('/delete-lab', { container: labInfo, deleteType }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                if (response.status === 200) {
                    if (response.data && response.data.info) {
                        notify('Info', response.data.info || 'lab deleted.', 'info');
                        navigate('/labs')

                    }
                } else {
                    console.error('Internal Server Error:', response.data.warn);
                    notify('Error', response.data.warn || 'Internal Server Error', 'danger');
                }
            } catch (error) {
                console.error('Failed to delete lab.', error);
                notify('Error', 'Failed to delete lab.', 'danger');
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
            const response = await axiosInstance.post('/change-lab-resources', { container: lab, newCpus, newMemoryLimit }, {
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

    const handleLabAction = async (labAction) => {
        if (!isLabActive && labAction === 'restartCodeserver') {
            notify('Error', `Activate lab to apply changes`, 'danger');
            return;
        }
        setLabLoading(true);
        try {
            const response = await axiosInstance.post('/lab-action', { container: labInfo, labAction, labPassword, labUsername }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if (response.status === 200) {
                if (response.data && response.data.info) {
                    notify('Info', response.data.info || `lab is ${labAction}`, 'info');
                    setContainerData(response.data.containerData);
                    setVolumeData(response.data.volumeData);
                    setUserResources(response.data.userResources);
                    setLabInfo(response.data.labInfo);
                    setUser(response.data.user);
                    window.location.reload();

                }
            } else {
                console.error(`Failed to ${labAction} lab:`, response.data.warn);
                notify('Error', response.data.warn || 'Internal Server Error', 'danger');
            }
        } catch (error) {
            console.error(`Failed to ${labAction} lab:`, error);
            notify('Error', `Failed to ${labAction} lab.`, 'danger');
        } finally {
            setLabLoading(false);
        }
    }

    return (


        <div className="lab d-flex">
            <div>
                <Sidebar />
            </div>
            <div style={{ flex: "1 1 auto", display: "flex", flexFlow: "column", height: "100vh", overflowY: "hidden" }}>
                <Navbar pageTitle={`Lab - ${labInfo?.labName || '...'}`} />
                <div style={{ height: "100%" }}>
                    <div style={{ height: "calc(100% - 64px)", overflowY: "scroll" }}>


                        {loading ? (<div>
                            <SkeletonTheme baseColor="#202020" highlightColor="#444">
                                <h1>{<Skeleton />}</h1>
                                <p>
                                    <Skeleton count={5} />
                                </p>
                            </SkeletonTheme>
                        </div>) :
                            (
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
                                            <h3> Lab Status: {containerData?.State?.Status}</h3>
                                        </div>

                                        <div className="d-flex card-section">
                                            <div className="cards-container">


                                                <div className="card-bg w-100 border d-flex flex-column">
                                                    <div className="p-4 d-flex flex-column h-100">

                                                        <h3 className="text-white">Lab: {labInfo?.labName || 'N/A'}
                                                            <span
                                                                style={{
                                                                    marginLeft: '8px',
                                                                    cursor: 'pointer',
                                                                    color: '#007bff',
                                                                    textDecoration: 'underline',
                                                                }}
                                                                onClick={() => setLabServerHelpText(!labServerHelpText)}
                                                            >
                                                                <i
                                                                    className="fas fa-info-circle"
                                                                    style={{ fontSize: '30px', color: 'yellow' }}
                                                                ></i>
                                                            </span>
                                                        </h3>
                                                        {labServerHelpText && (
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
                                                                <h5>What is Lab Server?</h5>
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
                                                        <div
                                                            style={{ backgroundColor: '#708090', padding: '10px', borderRadius: '5px', display: 'inline-block' }}>
                                                            <a
                                                                href={`${labInfo?.subdomains?.labServer}.bycontrolia.com` || "#"}
                                                                target={labInfo?.subdomains?.labServer ? "_blank" : "_self"}
                                                                style={{ color: 'white' }}
                                                            >
                                                                Domain: {labInfo?.subdomains?.labServer}.bycontrolia.com <br />

                                                            </a>Username/Password: Set during Lab creation.
                                                        </div>


                                                        <p className="text-white mt-3">
                                                            <strong>Status:</strong> {containerData?.State?.Status}
                                                        </p>

                                                        <p><strong>Created At:</strong> {labInfo?.createdAt || 'N/A'}</p>
                                                        <p><strong>Memory:</strong> {labInfo?.resourceAllocated?.Memory / (1024 * 1024) || 'N/A'} MB</p>
                                                        <p><strong>CPUs:</strong> {(labInfo?.resourceAllocated?.NanoCpus) / (1e9) || 'N/A'} Cores</p>
                                                        <p><strong>Storage:</strong> {labInfo?.resourceAllocated?.Storage || 'N/A'}</p> MB
                                                        <p><strong>Volume Name:</strong> {volumeData?.volumeName || 'N/A'}</p>


                                                        {containerData?.State?.Status === 'running' ? (
                                                            <button
                                                                className="btn btn-danger mx-2 mt-2"
                                                                onClick={() => { handleLabAction('deactivate'); }}
                                                                disabled={labLoading}
                                                            >
                                                                {labLoading ? 'Deactivating lab...' : ' Deactivate lab'}
                                                            </button>
                                                        ) : (
                                                            <div>

                                                                {/* <div className="form-group mt-3">
                                                                    <label htmlFor="labUsername" className="text-white">Updated Lab Server Username</label>
                                                                    <input
                                                                        placeholder='Enter username.'
                                                                        type="text"
                                                                        id="labUsername"
                                                                        className="form-control"
                                                                        value={labUsername || ''}
                                                                        onChange={(e) => setLabUsername(e.target.value)}
                                                                    />

                                                                    <div className="form-group mt-3">
                                                                        <label htmlFor="labPassword" className="text-white">Updated Lab Server Password</label>
                                                                        <input
                                                                            placeholder='Enter password.'
                                                                            type="text"
                                                                            id="labPassword"
                                                                            className="form-control"
                                                                            value={labPassword || ''}
                                                                            onChange={(e) => setLabPassword(e.target.value)}
                                                                        />
                                                                    </div>
                                                                </div> */}
                                                                <button
                                                                    className="btn btn-success mx-2 mt-2"
                                                                    onClick={() => { handleLabAction('activate'); }}
                                                                    disabled={labLoading}
                                                                >
                                                                    {labLoading ? 'Restarting lab...' : 'Start/Restart lab  and Update Credentials'}
                                                                </button>
                                                            </div>
                                                        )}

                                                    </div>

                                                </div>






                                                <div className="card-bg w-100 border d-flex flex-column">
                                                    <div className="p-4 d-flex flex-column h-100">



                                                        <h4 className="text-white">Update lab Resources</h4>

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

                                                        <h4 className="text-white">Delete lab
                                                            <span
                                                                style={{
                                                                    marginLeft: '8px',
                                                                    cursor: 'pointer',
                                                                    color: '#007bff',
                                                                    textDecoration: 'underline',
                                                                }}
                                                                onClick={() => setDeleteLabHelpText(!deleteLabHelpText)}
                                                            >
                                                                <i
                                                                    className="fas fa-info-circle"
                                                                    style={{ fontSize: '30px', color: 'yellow' }}
                                                                ></i>
                                                            </span>
                                                        </h4>
                                                        {deleteLabHelpText && (
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
                                                                <h5>What is "Delete lab"?</h5>
                                                                <p>
                                                                    The "Delete lab" option will remove the selected lab. This action will stop and permanently remove all files and settings associated with this lab.
                                                                </p>
                                                                <p>
                                                                    <strong>Important Notes:</strong>
                                                                    <ul>
                                                                        <li><strong>Data Loss:</strong> Any files and settings within the lab will be lost. Ensure you have backed up any important data before proceeding.</li>
                                                                        <li><strong>Volume Reuse:</strong> After deleting the lab, the associated storage volume will remain intact. You can reuse this volume with any new lab, notebook, or worker if needed.</li>
                                                                        <li><strong>Irreversible:</strong> Once a lab is deleted, it cannot be recovered. You will need to set up a new lab if needed.</li>
                                                                    </ul>
                                                                </p>
                                                                <p>
                                                                    <strong>When to Use:</strong> Use this option when you no longer need a lab but wish to retain and potentially reuse the associated storage volume for future projects.
                                                                </p>
                                                            </div>
                                                        )}

                                                        <button
                                                            className="btn btn-danger m-2"
                                                            onClick={() => {
                                                                handleLabDelete('deleteOnlyContainer');
                                                            }}
                                                        >
                                                            {deleteLoading ? 'Deleting lab...' : 'Delete Lab only'}
                                                        </button>


                                                        <h4 className="text-white">Delete lab With Volume
                                                            <span
                                                                style={{
                                                                    marginLeft: '8px',
                                                                    cursor: 'pointer',
                                                                    color: '#007bff',
                                                                    textDecoration: 'underline',
                                                                }}
                                                                onClick={() => setDeleteLabWithVolumeHelpText(!deleteLabWithVolumeHelpText)}
                                                            >
                                                                <i
                                                                    className="fas fa-info-circle"
                                                                    style={{ fontSize: '30px', color: 'yellow' }}
                                                                ></i>
                                                            </span>
                                                        </h4>
                                                        {deleteLabWithVolumeHelpText && (
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
                                                                <h5>What is "Delete lab with Volume"?</h5>
                                                                <p>
                                                                    The "Delete lab with Volume" option will remove the selected lab along with any associated storage volume. This action will stop and permanently delete all files, settings, and storage related to this lab.
                                                                </p>
                                                                <p>
                                                                    <strong>Important Notes:</strong>
                                                                    <ul>
                                                                        <li><strong>Complete Data Loss:</strong> All files, settings, and associated storage will be permanently removed. Ensure that you have backed up any important data before proceeding.</li>
                                                                        <li><strong>Irreversible:</strong> Once both the lab and its associated storage are deleted, they cannot be recovered. You will need to create a new lab if needed.</li>
                                                                    </ul>
                                                                </p>
                                                                <p>
                                                                    <strong>When to Use:</strong> Use this option when you wish to completely clean up a lab and all its associated data, including the storage volume. This is typically done when the lab is no longer needed and you want to ensure that all related data is removed.
                                                                </p>
                                                            </div>
                                                        )}


                                                        <button
                                                            className="btn btn-danger m-2"
                                                            onClick={() => {
                                                                handleLabDelete('deleteContainerAndVolume');
                                                            }}
                                                        >
                                                            {deleteLoading ? 'Deleting lab and Volume...' : 'Delete lab with volume data'}
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

export default Lab;
