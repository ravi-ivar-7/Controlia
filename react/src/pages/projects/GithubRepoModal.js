import React, { useEffect, useState } from 'react';
import useNotification from '../../hooks/pushNotification';
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

    const [reposLoading, setReposLoading] = useState(false);
    const [repoDownloadLoading, setRepoDownloadLoading] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const handleNotification = (title, message) => {
        showNotification({
            title: title,
            message: message,
            position: 'top-right',
        });
    };

    const handleSelectRepo = (repo) => {
        setSelectedRepo(repo);
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
                        handleNotification('Error', response.data.warn || 'Internal Server Error');
                    }
                } catch (error) {
                    handleNotification('Error', 'Failed to authenticate with GitHub.');
                } finally {
                    setReposLoading(false);
                }
            };
            authenticateAndRedirect();
        }
    }, []);

    const handleGetRepo = async () => {
        setRepoDownloadLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axiosInstance.post('/download-github-repo', { code, selectedRepo, accessToken }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                handleNotification('Info', response.data.info);
                setProjectName(response.data.projectName);
                navigate('/projects')
            } else {
                handleNotification('Error', response.data.warn || 'Internal Server Error');
            }
        } catch (error) {
            handleNotification('Error', 'Failed to process repositories.');
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
                                            <ul style={{ listStyleType: 'none', padding: 0 }}>
                                                {repos.map(repo => (
                                                    <li key={repo.id} style={{
                                                        display: 'flex', alignItems: 'center', marginBottom: '10px', padding: '10px', border: `1px solid ${selectedRepo?.id === repo.id ? '#007bff' : '#ccc'}`, borderRadius: '5px', backgroundColor: selectedRepo?.id === repo.id ? 'rgba(0, 123, 255, 0.1)' : 'white',
                                                    }}>
                                                        <input
                                                            type="radio"
                                                            name="repository"
                                                            checked={selectedRepo?.id === repo.id}
                                                            onChange={() => handleSelectRepo(repo)}
                                                            style={{
                                                                marginRight: '10px', width: '20px', height: '20px', WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none', borderRadius: '5px', border: `2px solid ${selectedRepo?.id === repo.id ? '#007bff' : '#ccc'}`, outline: 'none', cursor: 'pointer', backgroundColor: selectedRepo?.id === repo.id ? '#007bff' : 'white',
                                                            }}
                                                        />
                                                        <label style={{ flex: 1, cursor: 'pointer', userSelect: 'none', color:'black' }}>
                                                            {repo.name}
                                                        </label>
                                                    </li>
                                                ))}
                                            </ul>

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
                <Button variant="primary" disabled ={reposLoading || repoDownloadLoading} onClick={handleGetRepo} >
                    Download
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default GithubRepoModal;
