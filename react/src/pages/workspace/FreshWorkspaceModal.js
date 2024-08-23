import React, { useState } from 'react';
import useNotification from '../../hooks/useNotification';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';

let token = localStorage.getItem('token');

const FreshWorkspaceModal = ({ isOpen, onClose, existingVolumes }) => {
    const [cpus, setCpus] = useState('');
    const [memory, setMemory] = useState('');
    const [selectedVolume, setSelectedVolume] = useState(null);
    const notify = useNotification();
    const [workspaceName, setWorkspaceName] = useState('');
    const [loading, setLoading] = useState(false);
    const [volumes, setVolumes] = useState([]);

    useEffect(() => {
        const newVolume = { id: 'new', userId: '', volumeName: 'New Volume', workspaceName: '', containerId: '', storage: null };
        setVolumes([newVolume, ...existingVolumes]);
    }, [existingVolumes]);

    const location = useLocation();
    const navigate = useNavigate();


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

    const handleSelectVolume = (volume) => {
        setSelectedVolume(volume);
    };

    const handleNewWorkspace = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/new-workspace', {
                cpus,
                memory,
                workspaceName,
                selectedVolume,
                workspaceSource:'freshWorkspace'
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
            notify('Error', 'Failed to create the workspace.', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (!isOpen) return null;

    return (
        <Modal show={isOpen} onHide={onClose}>
            <Modal.Header closeButton onClick={handleBack}>
                <Modal.Title>Configure New Workspace:</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {!loading ? (
                    <div>
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

                        <ul style={{ listStyleType: 'none', padding: 0 }}>
                            {volumes.map(volume => (
                                <li key={volume.id} style={{
                                    display: 'flex', alignItems: 'center', marginBottom: '10px', padding: '10px',
                                    border: `1px solid ${selectedVolume?.id === volume.id ? '#007bff' : '#ccc'}`,
                                    borderRadius: '5px', backgroundColor: selectedVolume?.id === volume.id ? 'rgba(0, 123, 255, 0.1)' : 'white',
                                }}>
                                    <input
                                        disabled={volume.workspaceName !== ''}
                                        type="radio"
                                        name="volumes"
                                        checked={selectedVolume?.id === volume.id}
                                        onChange={() => handleSelectVolume(volume)}
                                        style={{
                                            marginRight: '10px', width: '20px', height: '20px',
                                            WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none',
                                            borderRadius: '5px', border: `2px solid ${selectedVolume?.id === volume.id ? '#007bff' : '#ccc'}`,
                                            outline: 'none', cursor: volume.workspaceName === '' ? 'pointer' : 'not-allowed',
                                            backgroundColor: selectedVolume?.id === volume.id ? '#007bff' : 'white',
                                        }}
                                    />
                                    <label style={{ flex: 1, cursor: 'pointer', userSelect: 'none', color: volume.workspaceName !== '' ? 'gray' : 'black' }}>
                                        {volume.volumeName} - {volume.workspaceName !== '' ? `Used by ${volume.workspaceName}` : `Unused`}
                                    </label>
                                </li>
                            ))}
                        </ul>

                    </div>
                ) : (
                    <p>Loading...</p>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={handleBack}>
                    Cancel
                </Button>
                <Button variant="primary" disabled={loading} onClick={handleNewWorkspace}>
                    Create Workspace
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default FreshWorkspaceModal;
