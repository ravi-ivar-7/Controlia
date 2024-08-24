import React, { useEffect, useState } from 'react';
import axiosInstance from '../../services/axiosInstance';
import useToast from '../../hooks/useToast';
import { useUser } from '../../context/UserContext';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'
import Sidebar from "../../components/bars/Sidebar";
import Navbar from "../../components/bars/Navbar";
import "./Dashboard.css";
import {  Table } from 'react-bootstrap';
const Dashboard = () => {

  const [workspaceInfo, setWorkdspaceInfo] = useState('');
  const [workspaceFiles, setWorkdspaceFiles] = useState('');
  const [loading, setLoading] = useState(false)
  const { showErrorToast, showSuccessToast } = useToast();
  const { user } = useUser();


  const getWorkspaceInfo = async (token) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/', {}, {
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
      const response = await axiosInstance.post('/', {}, {
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
      const response = await axiosInstance.post('/', { path }, {
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
      const response = await axiosInstance.post('/', { path }, {
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
                          <h4 className="m-0 h5 font-weight-bold text-white">Workspace Details</h4>
                        </div>
                        <div className="mt-3">
                                     
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
                    </div>

                  </div>
                </div>




                <div className="d-flex card-section">
                  {/* <div className="cards-container"> */}

                    <div className="card-bg w-100 d-flex flex-column wide border d-flex flex-column" >
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
                {/* </div> */}

              </div>)}

          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard