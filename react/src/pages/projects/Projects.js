import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from "react-router-dom";
import './Projects.css';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useUser } from '../../context/UserContext';
import Footer from '../../components/bars/Footer';
import {
    CDBBtn,
    CDBProgress,
    CDBTable,
    CDBTableHeader,
    CDBTableBody,
    CDBContainer,
    CDBLink
} from "cdbreact";
import Sidebar from "../../components/bars/Sidebar";
import Navbar from "../../components/bars/Navbar";
import { Container, Row, Col, Card } from 'react-bootstrap';

const Projects = () => {
    const { user } = useUser();
    const [loading, setLoading] = useState(false)
    const [projectDropDown, setProjectDropDown] = useState(false);

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
                                        <div className="popup" onClick={() => setProjectDropDown(!projectDropDown)} style={{ cursor: 'pointer', marginLeft: '15px', marginTop: '15px' }}>


                                            <div style={{ textDecoration: 'none', marginBottom: '10px', display: 'flex', alignItems: 'center', padding: '5px 14px', color: '#fff', borderRadius: '4px', border: '2px solid #007bff' }}>
                                                <i className="fas fa-plus" style={{ fontSize: '25px', color: 'white' }}>
                                                    &nbsp;Add Project
                                                </i>
                                            </div>

                                            {projectDropDown && (
                                                <div className="popup-menu" style={{
                                                    position: 'absolute',
                                                    top: '50px',
                                                    right: '0',
                                                    background: 'black',
                                                    border: '1px solid #ccc',
                                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                                    zIndex: '1000',
                                                    padding: '10px',
                                                    borderRadius: '4px',
                                                    minWidth: '150px'
                                                }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', padding: '10px' }}>

                                                        <a href={`https://github.com/login/oauth/authorize?client_id=Ov23liJhpyR8Kjsrq7x5&redirect_uri=http://localhost:3000/github-redirect&scope=repo`} style={{ textDecoration: 'none', marginBottom: '10px', display: 'flex', alignItems: 'center', padding: '8px 16px', color: '#fff', borderRadius: '5px', border: '2px solid #007bff' }}>
                                                            <i className="fab fa-github" style={{ marginRight: '8px' }}></i> From Github
                                                        </a>

                                                        <a href={`/upload`} style={{ textDecoration: 'none', marginBottom: '10px', display: 'flex', alignItems: 'center', padding: '8px 16px', color: '#fff', borderRadius: '5px', border: '2px solid #007bff' }}>
                                                            <i className="fas fa-upload" style={{ marginRight: '8px' }}></i> Upload
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
                                            <div className="card-bg w-100 border d-flex flex-column">
                                                <div className="p-4 d-flex flex-column h-100">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <h4 className="m-0 h5 font-weight-bold text-white">Account Information</h4>
                                                        <div className="py-1 px-2 bg-grey rounded-circle"><i className="fas fa-user"></i></div>
                                                    </div>
                                                    <h4 className="my-4 text-right text-white h2 font-weight-bold">{user.name}</h4>

                                                    <p >
                                                        User-Id:	{user.userId}
                                                    </p>
                                                    <p >
                                                        Email: {user.email}
                                                    </p>

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

export default Projects;
