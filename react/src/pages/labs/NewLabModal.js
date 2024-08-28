import React, { useState, useEffect } from 'react';
import useNotification from '../../hooks/useNotification';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import axiosInstance from '../../services/axiosInstance';

let token = localStorage.getItem('token');

const NewLabModal = ({ isOpen, onClose, existingVolumes, userResources }) => {
    const [cpus, setCpus] = useState('');
    const [memory, setMemory] = useState('');
    const [storage, setStorage] = useState('')
    const [selectedVolume, setSelectedVolume] = useState(null);
    const [labName, setLabName] = useState('');
    const [loading, setLoading] = useState(false);
    const [volumes, setVolumes] = useState([]);
    const [availableResources, setAvailableResources] = useState({ Memory: 0, NanoCpus: 0, Storage: 0 });
    const [totalResources, setTotalResources] = useState({ Memory: 0, NanoCpus: 0, Storage: 0 });
    const [cpusError, setCpusError] = useState('');
    const [memoryError, setMemoryError] = useState('');
    const [storageError, setStorageError] = useState('')
    const [showHelp, setShowHelp] = useState(false);
    const [labUsername, setLabUsername] = useState('')
    const [labPassword, setLabPassword] = useState('')

    const { user } = useUser();

    const notify = useNotification();
    // Ensure userResources is properly initialized
    useEffect(() => {
        if (userResources && userResources.totalResources && userResources.usedResources) {
            // Convert string values to numbers
            const totalMemory = eval(userResources.totalResources.Memory); // Evaluates the mathematical expression
            const totalNanoCpus = parseFloat(userResources.totalResources.NanoCpus); // Converts scientific notation to number
            const totalStorage = parseFloat(userResources.totalResources.Storage);
            const usedMemory = userResources.usedResources.Memory; // Assuming this is a number
            const usedNanoCpus = userResources.usedResources.NanoCpus; // Assuming this is a number
            const usedStorage = userResources.usedResources.Storage;

            // Calculate available resources
            const availableMemory = totalMemory - usedMemory;
            const availableNanoCpus = totalNanoCpus - usedNanoCpus;
            const availableStorage = totalStorage - usedStorage;

            setAvailableResources({ Memory: availableMemory, NanoCpus: availableNanoCpus, Storage: availableStorage });
            setTotalResources({ Memory: totalMemory, NanoCpus: totalNanoCpus, Storage: totalStorage })
        }
    }, [userResources]);

    useEffect(() => {
        // Validate CPU
        if (cpus && (cpus < 0.5 || cpus > availableResources.NanoCpus / 1e9)) {
            setCpusError(`CPU must be between 0.5 and ${availableResources.NanoCpus / 1e9} cores.`);
        } else {
            setCpusError('');
        }

        // Validate Memory
        if (memory && (memory < 256 || memory > availableResources.Memory / (1024 * 1024))) {
            setMemoryError(`Memory must be between 256 MB and ${availableResources.Memory / (1024 * 1024)} MB.`);
        } else {
            setMemoryError('');
        }
        // Validate Memory
        if (storage && (storage < 500 || storage > availableResources.Storage)) {
            setStorageError(`Storage must be between 500 MB and ${availableResources.Storage} MB.`);
        } else {
            setStorageError('');
        }
    }, [cpus, memory, availableResources, storage]);


    useEffect(() => {
        const newVolume = { id: 'new', userId: '', volumeName: 'New Volume', labName: '', containerId: '', storage: null };
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
    const handleStorageChange = (e) => {
        setStorage(e.target.value);
    };

    const handleLabNameChange = (e) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
        setLabName(value);
    };

    const handleSelectVolume = (volume) => {
        setSelectedVolume(volume);
    };

    const handleNewLab = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/new-lab', {
                cpus,
                memory,
                labName,
                selectedVolume,
                storage,
                labSource: 'self',
                labPassword,
                labUsername,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                notify('Info', response.data.info, 'info');
                isOpen = false;
                window.location.reload();
            }
            else {
                notify('Error', response.data.warn || 'Internal Server Error', 'danger');
            }
        } catch (error) {
            notify('Error', 'Failed to create the Lab.', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = async () => {
        navigate(-1);
    };

    if (!isOpen) return null;

    const handleClose = () => {
        isOpen = false;
    }

    return (
        <Modal show={isOpen} onHide={onClose}>
            <Modal.Header closeButton onClick={handleClose}>
                <Modal.Title>Configure New Lab:</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {!loading ? (
                    <div><div style={{ marginTop: '20px' }}><div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', }}>
                        <div style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flex: 1, marginRight: '10px', textAlign: 'center', }}>
                            <h5>Total Resources</h5>
                            <p style={{ margin: '10px 0', fontSize: '16px' ,color:'black' }}>CPUs: {totalResources.NanoCpus / (1e9)} cores</p>
                            <p style={{ margin: '10px 0', fontSize: '16px' ,color:'black' }}>Memory: {totalResources.Memory / (1024 * 1024)} MB</p>
                            <p style={{ margin: '10px 0', fontSize: '16px' ,color:'black' }}>Storage: {totalResources.Storage} MB</p>
                        </div>
                        <div style={{ backgroundColor: '#e9ecef', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flex: 1, marginLeft: '10px', textAlign: 'center', }}>
                            <h5>Available Resources</h5>
                            <p style={{ margin: '10px 0', fontSize: '16px' ,color:'black' }}>CPUs: {availableResources.NanoCpus / (1e9)} cores</p>
                            <p style={{ margin: '10px 0', fontSize: '16px' ,color:'black' }}>Memory: {availableResources.Memory / (1024 * 1024)} MB</p>
                            <p style={{ margin: '10px 0', fontSize: '16px' ,color:'black' }}>Storage: {availableResources.Storage} MB</p>
                        </div>
                    </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Unique Lab Name:</label>
                            <input
                                value={labName}
                                onChange={handleLabNameChange}
                                placeholder="Enter unique name for lab."
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
                            <label style={{ display: 'block', marginBottom: '5px' }}>Username For Lab Server (!Remember):</label>
                            <input
                                value={labUsername}
                                onChange={(e) => setLabUsername(e.target.value)}
                                placeholder="Enter Username for lab server."
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc',
                                    boxSizing: 'border-box'
                                }}
                            />

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Password For Lab Server (!Remember):</label>
                                <input
                                    value={labPassword}
                                    onChange={(e) => setLabPassword(e.target.value)}
                                    placeholder="Enter Password for lab server."
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


                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>CPU (in cores):</label>
                            <input
                                type="number"
                                value={cpus}
                                onChange={handleCpusChange}
                                placeholder="Minimum: 0.5 Cores, Maximum: As per available resources."
                                min={0.5}
                                max={availableResources.NanoCpus / 1e9}
                                step={0.1}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc',
                                    boxSizing: 'border-box'
                                }}
                            />
                            {cpusError && <div style={{ color: 'red', marginTop: '5px' }}>{cpusError}</div>}
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Memory (MB):</label>
                            <input
                                type="number"
                                value={memory}
                                onChange={handleMemoryChange}
                                placeholder="Minimum: 256 MB, Maximum: As per available resources."
                                min={256}
                                max={availableResources.Memory / (1024 * 1024)}
                                step={1}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc',
                                    boxSizing: 'border-box'
                                }}
                            />
                            {memoryError && <div style={{ color: 'red', marginTop: '5px' }}>{memoryError}</div>}
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Storage (MB):</label>
                            <input
                                type="number"
                                value={storage}
                                onChange={handleStorageChange}
                                placeholder="Minimum: 500 MB, Maximum: As per available resources."
                                min={500}
                                max={availableResources.Storage}
                                step={1}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc',
                                    boxSizing: 'border-box'
                                }}
                            />
                            {storageError && <div style={{ color: 'red', marginTop: '5px' }}>{storageError}</div>}
                        </div>


                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>
                                Volume For Lab:
                                <span
                                    style={{
                                        marginLeft: '8px',
                                        cursor: 'pointer',
                                        color: '#007bff',
                                        textDecoration: 'underline',
                                    }}
                                    onClick={() => setShowHelp(!showHelp)}
                                >
                                    <i
                                        className="fas fa-info-circle"
                                        style={{ fontSize: '20px', color: 'black', marginTop: '5px' }}
                                    ></i>
                                </span>
                            </label>
                            {showHelp && (
                                <div
                                    style={{
                                        backgroundColor: '#f8f9fa',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        padding: '10px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,1)',
                                        zIndex: 1000,
                                    }}
                                >
                                    <h5>What is a Volume?</h5>
                                    <p>
                                        A volume is a storage area that is used to persist data in a containerized environment. It allows you to save data that can be shared between different containers or retained even when a container is stopped or removed.
                                    </p>
                                    <h5>Use Case</h5>
                                    <p>
                                        Volumes are commonly used to store configuration files, logs, and other data that need to be preserved across container restarts. They ensure that important data is not lost when containers are updated or redeployed.
                                    </p>
                                    <h5>Consequences of Not Using</h5>
                                    <p>
                                        If you do not use volumes, any data stored inside a container will be lost when the container is removed or stopped. This could lead to loss of important information and affect the stability and consistency of your applications.
                                    </p>
                                </div>
                            )}
                        </div>
                        <ul style={{ listStyleType: 'none', padding: 0 }}>
                            {volumes.map(volume => (
                                <li
                                    key={volume.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginBottom: '10px',
                                        padding: '10px',
                                        border: `1px solid ${selectedVolume?.id === volume.id && volume.labName === '' ? '#007bff' : '#ccc'}`,
                                        borderRadius: '5px',
                                        backgroundColor: selectedVolume?.id === volume.id && volume.labName === '' ? 'rgba(0, 123, 255, 0.1)' : 'white',
                                    }}
                                >
                                    <input
                                        disabled={volume.labName !== ''}
                                        type="radio"
                                        name="volumes"
                                        checked={selectedVolume?.id === volume.id && volume.labName === ''}
                                        onChange={() => handleSelectVolume(volume)}
                                        style={{
                                            marginRight: '10px',
                                            width: '20px',
                                            height: '20px',
                                            WebkitAppearance: 'none',
                                            MozAppearance: 'none',
                                            appearance: 'none',
                                            borderRadius: '5px',
                                            border: `2px solid ${selectedVolume?.id === volume.id && volume.labName === '' ? '#007bff' : '#ccc'}`,
                                            outline: 'none',
                                            cursor: volume.labName === '' ? 'pointer' : 'not-allowed',
                                            backgroundColor: selectedVolume?.id === volume.id && volume.labName === '' ? '#007bff' : 'white',
                                        }}
                                    />
                                    <label
                                        style={{
                                            flex: 1,
                                            cursor: volume.labName === '' ? 'pointer' : 'not-allowed',
                                            userSelect: 'none',
                                            color: volume.labName !== '' ? 'gray' : 'black',
                                        }}
                                    >
                                        {volume.volumeName === 'New Volume'
                                            ? 'Create New Volume :'
                                            : volume.volumeName} -
                                        {volume.volumeName === 'New Volume'
                                            ? `${user.username}_${labName}_lab_volume`
                                            : (volume.labName !== ''
                                                ? `Used by ${volume.labName}`
                                                : 'Freed volume'
                                            )}
                                    </label>
                                </li>
                            ))}
                        </ul>

                    </div>
                    </div>
                ) : (
                    <p>Loading...</p>
                )}
            </Modal.Body>

            <Modal.Footer>

                <Button
                    variant="primary"
                    disabled={
                        loading ||
                        !labName ||
                        !selectedVolume ||
                        !cpus ||
                        !memory ||
                        ! labUsername ||
                        ! labPassword ||
                        cpus < 0.5 ||
                        cpus > availableResources.NanoCpus / 1e9 ||
                        memory < 256 ||
                        memory > availableResources.Memory / (1024 * 1024) ||
                        storage < 500 ||
                        storage > availableResources.Storage
                    }
                    onClick={handleNewLab}
                >
                    {loading ? 'Creating lab...' : 'Create Lab'}
                </Button>

            </Modal.Footer>
        </Modal>
    );
};

export default NewLabModal;
