import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';
import useToast from '../../hooks/useToast';
import { Form, InputGroup, DropdownButton, Dropdown, Button, Table } from 'react-bootstrap';
import socketIOClient from 'socket.io-client';
import { useUser } from '../../context/UserContext';
import { CodeiumEditor } from "@codeium/react-code-editor";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'
import {
  CDBBtn,
  CDBTable,
  CDBTableHeader,
  CDBTableBody,
} from "cdbreact";
import Sidebar from "../../components/bars/Sidebar";
import Navbar from "../../components/bars/Navbar";
import "./Dashboard.css";

const Dashboard = () => {

  const [workspaceInfo, setWorkdspaceInfo] = useState('');
  const [workspaceFiles, setWorkdspaceFiles] = useState('');
  const [loading, setLoading] = useState(false)
  const [moduleInstall, setModuleInstall] = useState({ provider: '', type: '', module: '' });
  const [executeCommand, setExecuteCommand] = useState('');
  const [socketOutput, setSocketOutput] = useState([]);
  const [waiting, setWating] = useState(false)
  const { showErrorToast, showSuccessToast } = useToast();
  const { user } = useUser();


  const getWorkspaceInfo = async (token) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/get-workspace-details', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      console.log(response)

      if (response.status === 200) {
        if (response.data && response.data.info) {
          showSuccessToast(response.data.info);
        }
        setWorkdspaceInfo(response.data.workspaceInfo);
        console.log(workspaceInfo)
      } else {
        console.error('Internal Server Error:', response.data.warn);
        showErrorToast(response.data.warn || 'Internal Server Error');
      }
    } catch (error) {
      console.error('Failed to get workspace info.', error);
      showErrorToast('Failed to get workspace info.');
    } finally {
      setLoading(false);
    }
  }

  const getWorkspaceFile = async (token) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/get-workspace-files', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (response.status === 200) {
        if (response.data && response.data.info) {
          showSuccessToast(response.data.info);
        }
        setWorkdspaceFiles(response.data.workspaceFiles);
        console.log(workspaceFiles)
      } else {
        console.error('Internal Server Error:', response.data.warn);
        showErrorToast(response.data.warn || 'Internal Server Error');
      }
    } catch (error) {
      console.error('Failed to get workspace files.', error);
      showErrorToast('Failed to get workspace files.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getWorkspaceInfo(token);
      getWorkspaceFile(token);
    }
  }, []);

  const handleFileDownload = async (path) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.post('/download-workspace-data', { path }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob' // Important for handling binary data
      });

      if (response.status === 200) {
        const blob = new Blob([response.data], { type: 'application/zip' });
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'volume-data.zip'; // Default filename for the downloaded file
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl); // Clean up the URL object

        if (response.data && response.data.info) {
          showSuccessToast(response.data.info);
        }
      } else {
        console.error('Internal Server Error:', response.data.warn);
        showErrorToast(response.data.warn || 'Internal Server Error');
      }
    } catch (error) {
      console.error('Failed to get file.', error);
      showErrorToast('Failed to get file');
    } finally {
      setLoading(false);
    }
  };

  const handleFileDelete = async (path) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token')
      const response = await axiosInstance.post('/delete-workspace-file', { path }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (response.status === 200) {
        if (response.data && response.data.info) {
          showSuccessToast(response.data.info);
        }
      } else {
        console.error('Internal Server Error:', response.data.warn);
        showErrorToast(response.data.warn || 'Internal Server Error');
      }
    } catch (error) {
      console.error('Failed to get file.', error);
      showErrorToast('Failed to get file');
    } finally {
      setLoading(false);
    }
  }

  const handleProviderChange = (provider) => {
    setModuleInstall(prevState => ({ ...prevState, provider }));
  };

  const handleTypeChange = (type) => {
    setModuleInstall(prevState => ({ ...prevState, type }));
  };

  const handleModuleChange = (e) => {
    setModuleInstall(prevState => ({ ...prevState, module: e.target.value }));
  };

  const handleWorkspaceCommands = (type) => {
    setSocketOutput([])
    setWating(true)
    const socket = socketIOClient(process.env.REACT_APP_NODEJS_API, {
      transports: ['polling', 'websocket'],
      extraHeaders: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });

    socket.on('data', (message) => {
      const formattedMessage = JSON.stringify(message.message);
      setSocketOutput((prevMessages) => [...prevMessages, formattedMessage]);
    });
    socket.on('error', (message) => {
      const formattedMessage = JSON.stringify(message.message);
      setSocketOutput((prevMessages) => [...prevMessages, formattedMessage]);
      setWating(false)
    });
    socket.on('success', (message) => {
      showSuccessToast(message.message);
      socket.disconnect();
      setWating(false)
    });

    if (type === 'containerModule') {
      socket.emit('containerModule', { moduleInstall });
    } else if (type === 'containerCommand') {
      socket.emit('containerCommand', { executeCommand });
    } else {
      showErrorToast('Failed to run command.');
    }

    return () => {
      socket.disconnect();
      setWating(false)
    };
  };


  const renderFiles = (files, parentPath = '') => {
    const directories = [];
    const fileRows = [];

    Object.keys(files).forEach((key) => {
      const filePath = `${parentPath}/${key}`;
      if (files[key] === null) {
        fileRows.push(
          <tr key={filePath} style={{ backgroundColor: "black", color: "white" }}>
            <td>{key}</td>
            <td>
              <button className="btn btn-outline-light btn-sm mr-2" onClick={() => handleFileDownload(filePath)}>Download</button>
              <button
                className="btn btn-outline-light btn-sm"
                onClick={() => handleFileDelete(filePath)}
                disabled={filePath.includes(`/${user.userId}/scripts`) || filePath.includes(`/${user.userId}/projects`)}
              >
                Delete
              </button>
            </td>
          </tr>
        );
      } else {
        directories.push({ name: key, contents: files[key], path: filePath });
      }
    });

    return { directories, fileRows };
  };

  const renderDirectoryTables = (directories) => {
    return (
      <div className="d-flex flex-wrap">
        {directories.map((dir, index) => (
          <div key={index} className="mb-4 mr-4" style={{ minWidth: '300px' }}>
            <h5 style={{ color: "white" }}>{dir.path}</h5>
            <Table striped bordered hover variant="dark">
              <thead>
                <tr>
                  <th>File/Folder</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {renderFiles(dir.contents, dir.path).fileRows}
              </tbody>
            </Table>
          </div>
        ))}
      </div>
    );
  };



  const { directories, fileRows } = renderFiles(workspaceFiles);

  const bytesToMB = (bytes) => (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  const nanoSecondsToSeconds = (nanoSeconds) => (nanoSeconds / 1e9).toFixed(2) + ' s';

  return (
    <div className="dashboard d-flex" >
      <div>
        <Sidebar />
      </div>
      <div style={{ flex: "1 1 auto", display: "flex", flexFlow: "column", height: "100vh", overflowY: "hidden" }}>
        <Navbar pageTitle={'Dashboard'} />
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

                <div className="d-flex card-section">
                  <div className="cards-container">




                    <div className="card-bg w-100 d-flex flex-column border" style={{ gridRow: "span 2", backgroundColor: "black", color: "white" }}>
                      <div className="p-4 d-flex flex-column h-100">
                        <div className="d-flex align-items-center justify-content-between">
                          <h4 className="m-0 h5 font-weight-bold text-white">Install/Uninstall Packages/Library/Modules</h4>
                        </div>
                        <div className="mt-3">
                          <Form>
                            <Form.Group className="mb-3">
                              <Form.Label>Provider</Form.Label>
                              <DropdownButton
                                variant="outline-light"
                                title={moduleInstall.provider || "Select Provider"}
                                onSelect={handleProviderChange}
                              >
                                <Dropdown.Item eventKey="apt-get">apt-get</Dropdown.Item>
                                <Dropdown.Item eventKey="pip">pip</Dropdown.Item>
                                <Dropdown.Item eventKey="npm">npm</Dropdown.Item>
                              </DropdownButton>
                            </Form.Group>

                            <Form.Group className="mb-3">
                              <Form.Label>Action</Form.Label>
                              <DropdownButton
                                variant="outline-light"
                                title={moduleInstall.type || "Select Action"}
                                onSelect={handleTypeChange}
                              >
                                <Dropdown.Item eventKey="install">Install</Dropdown.Item>
                                <Dropdown.Item eventKey="uninstall">Uninstall/remove/purge</Dropdown.Item>
                              </DropdownButton>
                            </Form.Group>

                            <Form.Group className="mb-3">
                              <Form.Label htmlFor="module">Module/Package Name</Form.Label>
                              <InputGroup className="mb-3">
                                <Form.Control
                                  id="module"
                                  aria-describedby="module"
                                  onChange={handleModuleChange}
                                />
                              </InputGroup>
                            </Form.Group>
                            <Button variant="primary" disabled = {waiting} onClick={() => { setExecuteCommand(''); handleWorkspaceCommands('containerModule'); }}>
                              {moduleInstall.type === 'install' ? 'Install' : 'Uninstall'} Module
                            </Button>

                          </Form>
                        </div>
                      </div>
                    </div>

                    <div className="card-bg w-100 d-flex flex-column border" style={{ gridRow: "span 2", backgroundColor: "black", color: "white" }}>
                      <div className="p-4 d-flex flex-column h-100">
                        <div className="d-flex align-items-center justify-content-between">
                          <h4 className="m-0 h5 font-weight-bold text-white">Run a command inside workspace.</h4>
                        </div>
                        <div className="mt-3">
                          <Form>
                            {/* Warning Alert */}
                            <div className="alert alert-danger" role="alert">
                              <strong>Caution:</strong> Executing commands can impact your workspace and data. Be sure of what you're executing.
                              <ul className="mt-2">
                                <li>Only execute commands you understand and trust.</li>
                                <li>Commands like <code>rm -f filename</code> can irreversibly delete files.</li>
                                <li>Avoid running commands from untrusted sources.</li>
                                <li>Always verify the command and its consequences before execution.</li>
                              </ul>
                            </div>
                            <InputGroup className="mb-3">
                              <Form.Control
                                type="text"
                                placeholder="Command to execute"
                                aria-label="Command to execute"
                                aria-describedby="basic-addon2"
                                value={executeCommand}
                                onChange={(e) => setExecuteCommand(e.target.value)}
                              />
                              <Button variant="primary" disabled = {waiting} onClick={() => { handleWorkspaceCommands('containerCommand')  }}>
                                Execute
                              </Button>
                            </InputGroup>
                          </Form>
                        </div>
                      </div>
                    </div>

                    <div className="card-bg w-100 d-flex flex-column border" style={{ gridRow: "span 2", backgroundColor: "black", color: "white" }}>
                      <div className="p-4 d-flex flex-column h-100">
                        <div className="d-flex align-items-center justify-content-between">
                          <h4 className="m-0 h5 font-weight-bold text-white">Workspace Output</h4>
                        </div>
                        <div className="mt-3">
                          <Form.Group controlId="output" style={{ margin: '5px' }}>
                            <div style={{ height: 'calc(100% - 30px)' }}>
                              <CodeiumEditor
                                theme="vs-dark"
                                value={socketOutput.join('\n')}
                              />
                            </div>
                          </Form.Group>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>




                <div className="d-flex card-section">
                  <div className="cards-container">

                    <div className="card-bg w-100 border d-flex flex-column p-4" style={{ gridRow: "span 2", backgroundColor: "black", color: "white" }}>
                      <div className="d-flex">
                        <h6 className="h5 font-weight-bold text-white">Workspace Details</h6>
                      </div>
                      <div className="mt-4">
                        <Table striped bordered hover variant="dark">
                          <tbody>
                            <tr>
                              <td><strong>Name</strong></td>
                              <td>{workspaceInfo ? workspaceInfo.name : 'N/A'}</td>
                            </tr>
                            <tr>
                              <td><strong>State</strong></td>
                              <td>{workspaceInfo ? workspaceInfo.state.Status : 'N/A'}</td>
                            </tr>
                            <tr>
                              <td><strong>Memory Usage</strong></td>
                              <td>{workspaceInfo ? bytesToMB(workspaceInfo.stats.memoryUsage) : 'N/A'}</td>
                            </tr>
                            <tr>
                              <td><strong>Memory Limit</strong></td>
                              <td>{workspaceInfo ? bytesToMB(workspaceInfo.stats.memoryLimit) : 'N/A'}</td>
                            </tr>
                            <tr>
                              <td><strong>CPU Usage</strong></td>
                              <td>{workspaceInfo ? nanoSecondsToSeconds(workspaceInfo.stats.cpuUsage) : 'N/A'}</td>
                            </tr>
                            <tr>
                              <td><strong>CPU System Usage</strong></td>
                              <td>{workspaceInfo ? nanoSecondsToSeconds(workspaceInfo.stats.cpuSystemUsage) : 'N/A'}</td>
                            </tr>
                          </tbody>
                        </Table>
                      </div>
                    </div>

                    <div className="card-bg w-100 d-flex flex-column wide border d-flex flex-column">
                      <div className="d-flex flex-column p-0 h-100">
                        <div className="mx-4 mt-3 d-flex justify-content-between align-items-center">
                          <h4 className="m-0 h5 font-weight-bold text-white">Workspace File System</h4>
                        </div>
                        <div className="mt-3" style={{ margin: '10px' }}>
                          {workspaceFiles ? (
                            <>
                              {fileRows.length > 0 && (
                                <Table striped bordered hover variant="dark">
                                  <thead>
                                    <tr>
                                      <th>File/Folder</th>
                                      <th>Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {fileRows}
                                  </tbody>
                                </Table>
                              )}
                              {renderDirectoryTables(directories)}
                            </>
                          ) : (
                            <p style={{ color: "white" }}>Loading...</p>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard