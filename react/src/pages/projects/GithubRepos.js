import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Projects.css';
import Sidebar from "../../components/bars/Sidebar";
import Navbar from "../../components/bars/Navbar";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import socketIOClient from 'socket.io-client';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';
import useToast from '../../hooks/useToast';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';

const GithubRepos = () => {

    const { showErrorToast, showSuccessToast } = useToast();
    const [repos, setRepos] = useState([]);
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [code, setCode] = useState('')
    const [accessToken, setAccessToken] = useState('')
    const [selectedFramework, setSelectedFramework] = useState(null);
    const [projectName, setProjectName] = useState('')
    const [installCommand, setInstallCommand] = useState('');
    const [startServerCommand, setStartServerCommand] = useState('');
    const [logFilePath, setLogFilePath] = useState('');
    const [projectUrl, setProjectUrl] = useState();
    const [socketOutput, setSocketOutput] = useState([]);

    const [reposLoading, setReposLoading] = useState(false);
    const [repoDownloadLoading, setRepoDownloadLoading] = useState(false)

    const location = useLocation();

    const [envVars, setEnvVars] = useState([]);
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');

    const handleAddEnvVar = () => {
        if (newKey && newValue) {
            setEnvVars([...envVars, { key: newKey, value: newValue }]);
            setNewKey('');
            setNewValue('');
        }
    };

    const handleDeleteEnvVar = (index) => {
        const updatedEnvVars = envVars.filter((_, i) => i !== index);
        setEnvVars(updatedEnvVars);
    };
    const handleInstallChange = (e) => {
        setInstallCommand(e.target.value);
    };

    const handleStartServerChange = (e) => {
        setStartServerCommand(e.target.value);
    };


    const frameworks = [
        { id: 1, name: 'Flask' },
        { id: 2, name: 'FastApi' },
        { id: 3, name: 'Django' },
        // { id: 4, name: 'Nodejs' },
        // { id: 5, name: 'React' },
    ];

    // Default commands mapping
    const defaultCommands = {
        1: { install: 'pip install --break-system-packages -r requirements.txt', start: 'python3 app.py' },
        2: { install: 'pip install fastapi uvicorn', start: 'uvicorn main:app --reload' },
        3: { install: 'pip install django', start: 'python manage.py runserver' },
        // 4: { install: 'npm install', start: 'node app.js' },
        // 5: { install: 'npm i', start: 'npm start' },
    };

    const handleSelectFramework = (framework) => {
        setSelectedFramework(framework);
        const commands = defaultCommands[framework.id];
        setInstallCommand(commands.install);
        setStartServerCommand(commands.start);
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
                        setCode(response.data.code)
                        setAccessToken(response.data.accessToken)
                        showSuccessToast('Successfully authenticated with GitHub!');
                    }
                    else {
                        console.error('Internal Server Error:', response.data.warn);
                        showErrorToast(response.data.warn || 'Internal Server Error');
                    }
                } catch (error) {
                    console.error('Error fetching repositories:', error);
                    showErrorToast('Failed to authenticate with GitHub.');
                } finally {
                    setReposLoading(false);
                }
            };
            authenticateAndRedirect();
        }
    }, []);

    const handleGetRepo = async () => {
        setRepoDownloadLoading(true)
        try {
            const token = localStorage.getItem('token')
            const response = await axiosInstance.post('/github-repo', { code, selectedRepo, accessToken }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (response.status === 200) {
                console.log('Repositories processed:', response.data);
                showSuccessToast(response.data.info)
                setProjectName(response.data.projectName)
                console.log(response.data.zipUrl)
            }
            else {
                console.error('Internal Server Error:', response.data.warn);
                showErrorToast(response.data.warn || 'Internal Server Error');
            }
        } catch (error) {
            console.error('Error processing repositories:', error);
            showErrorToast(`Failed to process repositories.`);
        }
        finally {
            setRepoDownloadLoading(false)
        }
    };

    const handleDeployment = async () => {
        try {
            setSocketOutput([]);

            let token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found in local storage');
                showErrorToast('No token found. Failed to start Jupyter server.');
                return;
            }

            const socket = socketIOClient(process.env.REACT_APP_NODEJS_API, {
                transports: ['polling', 'websocket'],
                extraHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });

            socket.on('projectOutput', (data) => {
                const { output } = data;
                setSocketOutput((prevMessages) => [...prevMessages, output]);
            });
            socket.on('projectInfo', (data) => {

                const { logFilePath, projectUrl } = data;
                setLogFilePath(logFilePath);
                setProjectUrl(projectUrl);
                showSuccessToast('Project deployed.')
            });

            socket.on('projectError', (data) => {
                const { error, details } = data;
                console.log(details)
                showErrorToast(error)
                setSocketOutput((prevMessages) => [...prevMessages, error]);
            });

            socket.emit('deployProject', { code, selectedRepo, accessToken, installCommand, startServerCommand });

            return () => {
                showErrorToast('disconnected...');
                socket.disconnect();
            };
        } finally {
        }
    };



    return (

        <div className="profile d-flex">
            <div>
                <Sidebar />
            </div>
            <div style={{ flex: "1 1 auto", display: "flex", flexFlow: "column", height: "100vh", overflowY: "hidden" }}>
                <Navbar pageTitle={'Projects'} />
                <div style={{ height: "100%" }}>
                    <div style={{ height: "calc(100% - 64px)", overflowY: "scroll" }}>


                        <div className="d-flex card-section">
                            <div className="cards-container">

                                <div className="card-bg w-100 d-flex flex-column border" style={{ gridRow: "span 2", backgroundColor: "black", color: "white" }}>
                                    <div className="p-4 d-flex flex-column h-100">

                                        {!repoDownloadLoading ? (
                                            <div>




                                                {projectName ? (
                                                    <div>
                                                        <h3>{projectName}</h3>

                                                        {projectUrl ? (
                                                            <a href={projectUrl} target="_blank" rel="noopener noreferrer" style={{marginBottom:'5px'}}>{projectUrl} </a>

                                                           
                                                        ) : (
                                                            <></>
                                                        )}

                                                    </div>

                                                ) : (
                                                    <div><div className="d-flex align-items-center justify-content-between">
                                                        <h4 className="m-0 h5 font-weight-bold text-white">1. Select Repository</h4>
                                                    </div>
                                                        <div className="mt-3">
                                                            {!reposLoading ? (
                                                                <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
                                                                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                                                                        {repos.map(repo => (
                                                                            <li key={repo.id} style={{
                                                                                display: 'flex', alignItems: 'center', marginBottom: '10px', padding: '10px', border: `1px solid ${selectedRepo?.id === repo.id ? '#007bff' : '#ccc'}`, borderRadius: '5px', backgroundColor: selectedRepo?.id === repo.id ? 'rgba(0, 123, 255, 0.1)' : 'black',
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
                                                                                <label style={{ flex: 1, cursor: 'pointer', userSelect: 'none' }}>
                                                                                    {repo.name}
                                                                                </label>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                    <button onClick={handleGetRepo} style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', backgroundColor: '#007bff', color: 'white', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', }} >Downlad</button>
                                                                </div>
                                                            ) : (
                                                                <p>Loading...</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}


                                            </div>
                                        ) : (
                                            <>
                                                <p>Your repository is being downloaded, meanwhile setup other project settings.</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="card-bg w-100 d-flex flex-column border" style={{ gridRow: "span 2", backgroundColor: "black", color: "white" }}>
                                    <div className="p-4 d-flex flex-column h-100">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <h4 className="m-0 h5 font-weight-bold text-white">2. Project Setup</h4>
                                        </div>
                                        <div className="mt-3">
                                            <div style={{ marginBottom: '15px' }}>
                                                <label htmlFor="framework" style={{ display: 'block', color: 'white', marginBottom: '5px' }}>Select Framework:</label>
                                                <select
                                                    id="framework"
                                                    value={selectedFramework?.id || ''}
                                                    onChange={(e) => {
                                                        const selected = frameworks.find(fw => fw.id === Number(e.target.value)); handleSelectFramework(selected);
                                                    }}
                                                    style={{
                                                        width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: 'black', color: 'white',
                                                    }}>
                                                    <option value="">Select a framework</option>
                                                    {frameworks.map(framework => (
                                                        <option key={framework.id} value={framework.id}>
                                                            {framework.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div style={{ marginBottom: '15px' }}>
                                                <label htmlFor="installCommand" style={{ display: 'block', color: 'white', marginBottom: '5px' }}>Install Command:</label>
                                                <input id="installCommand" type="text" value={installCommand} onChange={handleInstallChange} placeholder="Enter install command" style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: 'black', color: 'white', }} />
                                            </div>
                                            <div>
                                                <label htmlFor="startServerCommand" style={{ display: 'block', color: 'white', marginBottom: '5px' }}>Start Server Command:</label>
                                                <input id="startServerCommand" type="text" value={startServerCommand} onChange={handleStartServerChange} placeholder="Enter start server command" style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: 'black', color: 'white', }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-bg w-100 d-flex flex-column border" style={{ gridRow: "span 2", backgroundColor: "black", color: "white" }}>
                                    <div className="p-4 d-flex flex-column h-100">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <h4 className="m-0 h5 font-weight-bold text-white">3. Environment Variables</h4>
                                        </div>
                                        <div className="mt-3">
                                            <div style={{ marginBottom: '20px' }}>
                                                <input type="text" placeholder="Key" value={newKey} onChange={(e) => setNewKey(e.target.value)} style={{ margin: '5px', padding: '5px', borderRadius: '4px', width: '100%' }} />
                                                <input type="text" placeholder="Value" value={newValue} onChange={(e) => setNewValue(e.target.value)} style={{ margin: '5px', padding: '5px', borderRadius: '4px', width: '100%' }} />
                                                <button
                                                    onClick={handleAddEnvVar}
                                                    style={{ padding: '5px 10px', borderRadius: '4px', border: 'none', backgroundColor: '#007bff', color: 'white', cursor: 'pointer', margin: '5px' }}>
                                                    Add
                                                </button>
                                            </div>
                                            <ul style={{ listStyleType: 'none', padding: 0 }}>
                                                {envVars.map((envVar, index) => (
                                                    <li key={index} style={{
                                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: 'rgba(0, 123, 255, 0.1)',
                                                    }}>
                                                        <div style={{ flex: 1 }}>
                                                            <strong>{envVar.key}:</strong> {envVar.value}
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteEnvVar(index)}
                                                            style={{ background: 'red', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}   >
                                                            Delete
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>


                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', color: 'white', }}>
                            <button
                                onClick={handleDeployment}
                                disabled={!selectedFramework || !startServerCommand || !installCommand || !(projectName || selectedRepo)}
                                style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', backgroundColor: '#007bff', color: 'white', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', }}   >
                                Start Deploy
                            </button>
                        </div>

                        <div className="d-flex card-section" style={{ marginTop: '10px', marginBottom: '30px' }}>
                            <div className="card-bg w-100 d-flex flex-column wide border d-flex flex-column" style={{ height: '400px', overflow: 'auto' }}>
                                <div className="d-flex flex-column p-0 h-100">
                                    <div className="mt-3" style={{ flex: 1 }}>
                                        <Editor
                                            readOnly
                                            value={socketOutput.join('\n')}
                                            onValueChange={code => setSocketOutput(code)}
                                            highlight={code => highlight(code, languages.text)}
                                            padding={10}
                                            style={{
                                                fontFamily: '"Fira code", "Fira Mono", monospace',
                                                color: 'white',
                                                height: '100%',
                                                overflow: 'auto'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>




                    </div>





                </div>
            </div>
        </div>
    );
}

export default GithubRepos;
