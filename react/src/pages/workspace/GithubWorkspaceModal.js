import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';
import useNotification from '../../hooks/useNotification';

const GithubRepoModal = ({ isOpen, onClose, redirectPath }) => {
    const [repos, setRepos] = useState([]);
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [code, setCode] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [cpus, setCpus] = useState('');
    const [memory, setMemory] = useState('');
    const [workspaceName, setWorkspaceName] = useState('');
    const [selectedVolume, setSelectedVolume] = useState(null);
    const [volumes, setVolumes] = useState([]);
    const [reposLoading, setReposLoading] = useState(false);
    const [repoDownloadLoading, setRepoDownloadLoading] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const notify = useNotification();

    const handleSelectRepo = (repo) => {
        setSelectedRepo(repo);
    };

    const handleSelectVolume = (volume) => {
        setSelectedVolume(volume);
    };

    const handleCpusChange = (e) => {
        setCpus(e.target.value);
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
                    const token = localStorage.getItem('token');
                    const response = await axiosInstance.post('/github-auth', { code }, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    });
                    if (response.status === 200) {
                        setRepos(response.data.repos);
                        setCode(response.data.code);
                        setAccessToken(response.data.accessToken);
                        setVolumes(response.data.volumes);
                    } else {
                        notify('Error', response.data.warn || 'Internal Server Error', 'danger');
                    }
                } catch (error) {
                    notify('Error', 'Failed to authenticate with GitHub.', 'danger');
                } finally {
                    setReposLoading(false);
                }
            };
            authenticateAndRedirect();
        }
    }, [location.search, notify]);

    const handleGetRepo = async () => {
        setRepoDownloadLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axiosInstance.post('/new-workspace', {
                code,
                selectedRepo,
                accessToken,
                cpus,
                memory,
                workspaceName,
                selectedVolume,
                workspaceSource: 'github'
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                notify('Info', response.data.info, 'info');
                navigate('/workspaces');
            } else {
                notify('Error', response.data.warn || 'Internal Server Error', 'danger');
            }
        } catch (error) {
            notify('Error', 'Failed to process repositories.', 'danger');
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
            <Modal.Header closeButton>
                <Modal.Title>Configure Workspace:</Modal.Title>
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
                                            <label style={{ display: 'block', marginBottom: '5px' }}>CPU (in cores):</label>
                                            <input
                                                type="number"
                                                value={cpus}
                                                onChange={handleCpusChange}
                                                placeholder="Enter CPU cores for this project"
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
                                        <div style={{ marginBottom: '15px' }}>
                                            <label style={{ display: 'block', marginBottom: '5px' }}>Volume:</label>
                                            <select
                                                onChange={(e) => handleSelectVolume(e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #ccc',
                                                    boxSizing: 'border-box'
                                                }}
                                            >
                                                <option value="">Select a volume</option>
                                                {volumes.map(volume => (
                                                    <option key={volume.id} value={volume.id}>{volume.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p>Loading repositories...</p>
                        )}
                    </div>
                ) : (
                    <p>Processing...</p>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button
                    variant="primary"
                    onClick={handleGetRepo}
                    disabled={!selectedRepo || repoDownloadLoading}
                >
                    {repoDownloadLoading ? 'Processing...' : 'Get Repo'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default GithubRepoModal;
