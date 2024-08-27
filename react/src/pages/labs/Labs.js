import React, { useState, useCallback, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Lab.css';
import axiosInstance from '../../services/axiosInstance';
import useNotification from '../../hooks/useNotification';
import { useNavigate } from 'react-router-dom';
import NewLabModal from './NewLabModal';

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import Sidebar from "../../components/bars/Sidebar";
import Navbar from "../../components/bars/Navbar";


let GITHUB_AUTHORIZED_URL = `https://github.com/login/oauth/authorize?client_id=Ov23liJhpyR8Kjsrq7x5&redirect_uri=http://localhost:3000/github-redirect&scope=repo`

const Labs = () => {
    const [loading, setLoading] = useState(false)
    const [labDropDown, setLabDropDown] = useState(false);
    const [labs, setLabs] = useState([])
    const [volumes, setVolumes] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [userResources, setUserResources] = useState(null);


    const navigate = useNavigate();
    const notify = useNotification();
    let token = localStorage.getItem('token');

    const fetchLabs = useCallback(async (token) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/labs', {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if (response.status === 200) {
                if (response.data && response.data.info) {
                    notify('Info', response.data.info || 'Fetched labs information.', 'info');
                }
                setLabs(response.data.labs || []);
                setVolumes(response.data.volumes || []);
                setUserResources(response.data.userResources);
            } else {
                console.error('Internal Server Error:', response.data.warn);
                notify('Error', response.data.warn || 'Internal Server Error', 'danger');
            }
        } catch (error) {
            console.error('Failed to fetch labs.', error);
            notify('Error', 'Failed to fetch labs.', 'danger');
        } finally {
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        if (!token) {
            console.error('No token found in local storage');
            notify('Error', 'Failed to fetch labs.', 'danger');
            return;
        }
        fetchLabs(token);
    }, []);

    const handleNewLabs = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleLabConfiguration = async (lab) => {
        navigate('/lab', { state: { lab } });
    }


    return (

        <div className="profile d-flex">
            <div>
                <Sidebar />
            </div>
            <div style={{ flex: "1 1 auto", display: "flex", flexFlow: "column", height: "100vh", overflowY: "hidden" }}>
                <Navbar pageTitle={'Profile'} />
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


                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <div className="icon-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <div className="popup" onClick={() => setLabDropDown(!labDropDown)} style={{ cursor: 'pointer', marginLeft: '15px', marginTop: '15px' }}>


                                            <div style={{ textDecoration: 'none', marginBottom: '10px', display: 'flex', alignItems: 'center', padding: '5px 14px', color: '#fff', borderRadius: '4px', border: '2px solid #007bff' }}>
                                                <i className="fas fa-plus" style={{ fontSize: '25px', color: 'white' }}>
                                                    &nbsp;Add lab
                                                </i>
                                            </div>

                                            {labDropDown && (
                                                <div className="popup-menu" style={{ top: '50px', right: '0', background: 'black', position: 'absolute', border: '1px solid #ccc', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', zIndex: '1000', padding: '10px', borderRadius: '4px', minWidth: '150px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', padding: '10px' }}>

                                                        <button onClick={handleNewLabs} style={{ textDecoration: 'none', marginBottom: '10px', display: 'flex', alignItems: 'center', padding: '8px 16px', color: '#fff', borderRadius: '5px', border: '2px solid #007bff', backgroundColor: 'black' }}>
                                                            <i className="fas fa-folder-plus" style={{ marginRight: '8px' }}></i> New Lab
                                                        </button>


                                                        <a href={GITHUB_AUTHORIZED_URL} style={{ pointerEvents: 'none', textDecoration: 'none', marginBottom: '10px', display: 'flex', alignItems: 'center', padding: '8px 16px', color: '#fff', borderRadius: '5px', border: '2px solid #007bff' }}>
                                                            <i className="fab fa-github" style={{ marginRight: '8px' }}></i> New lab With GitHub Repository
                                                        </a>

                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>




                                <div className="info">
                                    <div className="d-flex card-section">
                                        <div className="cards-container">

                                            {labs.map((lab, index) => (
                                                <div key={index} className="card-bg w-100 border d-flex flex-column">
                                                    <div className="p-4 d-flex flex-column h-100">
                                                        <h4 className="my-4 text-right text-white h2 font-weight-bold">
                                                            Lab: {lab.labName}
                                                        </h4>

                                                        <div>
                                                            <h5 className="text-white mt-3">Resource Allocated</h5>
                                                            <p className="text-white">Memory: {lab.resourceAllocated.Memory / (1024 * 1024)} MB</p>
                                                            <p className="text-white">CPUs: {lab.resourceAllocated.NanoCpus / 1e9} cores</p>
                                                            <p className="text-white">Storage: {lab.resourceAllocated.Storage} MB</p>
                                                            <p style={{ color: 'red', fontWeight: 'bold' }}>
                                                                ⚠️ Restart from Configure below if code-server is not working.
                                                                <br />
                                                                Do verify that  <span style={{ color: 'white', fontWeight: 'bold' }}> ALL URL</span> ends with
                                                                <span style={{ color: 'white', fontWeight: 'bold' }}> .bycontrolia.com</span>
                                                            </p>

                                                        </div>

                                                        <div
                                                            style={{backgroundColor: '#708090',padding: '10px',borderRadius: '5px',display: 'inline-block'}}>
                                                            <a
                                                                href={`${lab?.subdomains?.labServer}.bycontrolia.com` || "#"}
                                                                target={lab?.subdomains?.labServer  ? "_blank" : "_self"}
                                                                style={{color:'white'}}
                                                            >
                                                                {lab?.subdomains?.labServer}.bycontrolia.com
                                                            </a>
                                                        </div>



                                                        <div>
                                                            <div className="d-flex justify-content-between mt-2">
                                                                <button className="btn btn-primary" onClick={() => handleLabConfiguration(lab)}>
                                                                    Configure lab
                                                                </button>
                                                            </div>


                                                        </div>
                                                    </div>

                                                </div>



                                            ))}


                                        </div>
                                    </div>
                                </div>

                            
                            </div>


                        )}
                    </div>
                </div>
            </div>
            <NewLabModal isOpen={isModalOpen} onClose={handleCloseModal} existingVolumes={volumes} userResources={userResources} />
        </div>
    );
}

export default Labs;
