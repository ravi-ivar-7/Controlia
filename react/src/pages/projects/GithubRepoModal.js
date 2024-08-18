import React, { useEffect, useState } from 'react';
import { Store } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import 'animate.css';

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';

const GithubRepoModal = ({ isOpen, onClose, redirectPath }) => {
    const [repos, setRepos] = useState([]);
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [code, setCode] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [projectName, setProjectName] = useState('');

    const [cpuShares, setCpuShares] = useState('');
    const [memory, setMemory] = useState('');
    const [workspaceName, setWorkspaceName] = useState('');

    const [reposLoading, setReposLoading] = useState(false);
    const [repoDownloadLoading, setRepoDownloadLoading] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    const handleNotification = (title, message, type) => {
        Store.addNotification({
            title: title,
            message: message,
            type: type,
            insert: "top",
            container: "top-right",
            animationIn: ["animate__animated", "animate__fadeIn"],
            animationOut: ["animate__animated", "animate__fadeOut"],
            dismiss: {
                duration: 5000,
                onScreen: true
            }
        });
    };

    const handleSelectRepo = (repo) => {
        setSelectedRepo(repo);
    };

    const handleCpuSharesChange = (e) => {
        setCpuShares(e.target.value);
    };

    const handleMemoryChange = (e) => {
        setMemory(e.target.value);
    };

    const handleWorkspaceNameChange = (e) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
        setWorkspaceName(value);
    };
    

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const code = queryParams.get('code');

        if (code) {
            const authenticateAndRedirect = async () => {
                setReposLoading(true);
                try {
                    const response = await axiosInstance.post('/github-auth', { code });
                    if (response.status === 200) {
                        setRepos(response.data.repos);
                        setCode(response.data.code);
                        setAccessToken(response.data.accessToken);
                    } else {
                        handleNotification('Error', response.data.warn || 'Internal Server Error', 'danger');
                    }
                } catch (error) {
                    handleNotification('Error', 'Failed to authenticate with GitHub.', 'danger');
                } finally {
                    setReposLoading(false);
                }
            };
            authenticateAndRedirect();
        }
    }, [location.search]);

    const handleGetRepo = async () => {
        setRepoDownloadLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axiosInstance.post('/download-github-repo', {
                code,
                selectedRepo,
                accessToken,
                CpuShares : cpuShares,
                Memory:memory,
                containerName :workspaceName
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                handleNotification('Info', response.data.info, 'info');
                setProjectName(response.data.projectName);
                navigate('/projects');
            } else {
                handleNotification('Error', response.data.warn || 'Internal Server Error', 'danger');
            }
        } catch (error) {
            handleNotification('Error', 'Failed to process repositories.', 'danger');
        } finally {
            setRepoDownloadLoading(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (!isOpen) return null;

    return (
        <Modal show={isOpen} onHide={onClose}>
            <Modal.Header closeButton onClick={handleBack}>
                <Modal.Title>Select Repository:</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {!repoDownloadLoading ? (
                    <div>
                        {!reposLoading ? (
                            <>
                                <ul style={{ listStyleType: 'none', padding: 0 }}>
                                    {repos.map(repo => (
                                        <li key={repo.id} style={{
                                            display: 'flex', alignItems: 'center', marginBottom: '10px', padding: '10px',
                                            border: `1px solid ${selectedRepo?.id === repo.id ? '#007bff' : '#ccc'}`,
                                            borderRadius: '5px', backgroundColor: selectedRepo?.id === repo.id ? 'rgba(0, 123, 255, 0.1)' : 'white',
                                        }}>
                                            <input
                                                type="radio"
                                                name="repository"
                                                checked={selectedRepo?.id === repo.id}
                                                onChange={() => handleSelectRepo(repo)}
                                                style={{
                                                    marginRight: '10px', width: '20px', height: '20px',
                                                    WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none',
                                                    borderRadius: '5px', border: `2px solid ${selectedRepo?.id === repo.id ? '#007bff' : '#ccc'}`,
                                                    outline: 'none', cursor: 'pointer',
                                                    backgroundColor: selectedRepo?.id === repo.id ? '#007bff' : 'white',
                                                }}
                                            />
                                            <label style={{ flex: 1, cursor: 'pointer', userSelect: 'none', color: 'black' }}>
                                                {repo.name}
                                            </label>
                                        </li>
                                    ))}
                                </ul>

                                {selectedRepo && (
                                    <div style={{ marginTop: '20px' }}>
                                        <div style={{ marginBottom: '15px' }}>
                                            <label style={{ display: 'block', marginBottom: '5px' }}>Unique Workspace Name:</label>
                                            <input
                                                value={workspaceName}
                                                onChange={handleWorkspaceNameChange}
                                                placeholder="Enter unique name for workspace."
                                                style={{
                                                    width: '100%',
                                                    padding: '8px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #ccc',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <label style={{ display: 'block', marginBottom: '5px' }}>CPU Shares:</label>
                                            <input
                                                type="number"
                                                value={cpuShares}
                                                onChange={handleCpuSharesChange}
                                                placeholder="Enter CPU shares for this project"
                                                style={{
                                                    width: '100%',
                                                    padding: '8px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #ccc',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '5px' }}>Memory (MB):</label>
                                            <input
                                                type="number"
                                                value={memory}
                                                onChange={handleMemoryChange}
                                                placeholder="Enter memory in MB"
                                                style={{
                                                    width: '100%',
                                                    padding: '8px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #ccc',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p>Loading...</p>
                        )}
                    </div>
                ) : (
                    <p>Downloading...</p>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={handleBack}>
                    Cancel
                </Button>
                <Button variant="primary" disabled={reposLoading || repoDownloadLoading} onClick={handleGetRepo}>
                    Download
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default GithubRepoModal;
