import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Profile.css';
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

const Profile = () => {


	return (

		<div className="profile d-flex">
			<div>
				<Sidebar />
			</div>
			<div style={{ flex: "1 1 auto", display: "flex", flexFlow: "column", height: "100vh", overflowY: "hidden" }}>
				<Navbar pageTitle={'Profile'} />
				<div style={{ height: "100%" }}>
					<div style={{ height: "calc(100% - 64px)", overflowY: "scroll" }}>


						<div className="info">
							<div className="d-flex card-section">
								<div className="cards-container">
									<div className="card-bg w-100 border d-flex flex-column">
										<div className="p-4 d-flex flex-column h-100">
											<div className="d-flex align-items-center justify-content-between">
												<h4 className="m-0 h5 font-weight-bold text-dark">Sales</h4>
												<div className="py-1 px-2 bg-grey rounded-circle"><i className="fas fa-suitcase"></i></div>
											</div>
											<h4 className="my-4 text-right text-dark h2 font-weight-bold">$30,000</h4>
											<CDBProgress value={65} height={8} colors="primary"></CDBProgress>
											<p className="mt-2 text-success small">
												<i className="fas fa-angle-up p-0"></i> 27.4%
												<span style={{ fontSize: "0.95em" }} className="ml-2 font-weight-bold text-muted">Since last month</span>
											</p>
											<p className="c-p mb-0 text-dark font-weight-bold text-right mt-auto">
												More Details
												<i className="fas fa-arrow-right ml-1"></i>
											</p>
										</div>
									</div>
									<div className="card-bg w-100 border d-flex flex-column">
										<div className="p-4 d-flex flex-column h-100">
											<div className="d-flex align-items-center justify-content-between">
												<h4 className="m-0 h5 font-weight-bold text-dark">Traffic by Source</h4>
												<div className="px-2 py-1 bg-grey rounded-circle"><i className="fas fa-chart-line"></i></div>
											</div>
											<div className="mt-3 d-flex justify-content-between">

												<div className="text-right w-25">
													<p className="m-0">Google</p>
													<p className="text-success small">10.57</p>
													<div>
														<div className="d-flex align-items-center justify-content-between text-success">
															<span style={{ fontSize: "3em", margin: "-2rem 0px -1.5rem 0px" }}>&#8226;</span>
															<span className="small">Google</span>
														</div>
														<div className="d-flex align-items-center justify-content-between" style={{ color: "#9B51E0" }}>
															<span style={{ fontSize: "3em", margin: "-2rem 0px -1.5rem 0px" }}>&#8226;</span>
															<span className="small">Yahoo</span>
														</div>
														<div className="d-flex align-items-center justify-content-between text-warning">
															<span style={{ fontSize: "3em", margin: "-2rem 0px -1.5rem 0px" }}>&#8226;</span>
															<span className="small">Bing</span>
														</div>
													</div>
												</div>
											</div>
											<p className="c-p text-dark mb-0 font-weight-bold text-right mt-auto">
												More Details
												<i className="fas fa-arrow-right ml-1"></i>
											</p>
										</div>
									</div>
									<div className="card-bg w-100 border d-flex flex-column p-4" style={{ gridRow: "span 2" }}>
										<div className="d-flex">
											<h6 className="h5 font-weight-bold text-dark">Team Members</h6>
											<div className="ml-auto rounded-circle bg-grey py-1 px-2"><i className="fas fa-user"></i></div>
										</div>
										<div className="d-flex mt-4">
											<img alt="panelImage" src="img/pane/pane1.png" className="pane-image" size="md" />
											<div>
												<h6 className="mb-0" style={{ fontWeight: "600" }}>Mezue</h6>
												<p className="m-0" style={{ fontSize: "0.75em" }}>Online</p>
											</div>
											<CDBBtn style={{ background: "#333" }} flat size="small" className="border-0 ml-auto px-2 my-2"><span className="msg-rem">Send</span> Message</CDBBtn>
										</div>
										<div className="d-flex mt-4">
											<img alt="panelImage" src="img/pane/pane2.png" className="pane-image" size="md" />
											<div>
												<h6 className="mb-0" style={{ fontWeight: "600" }}>Mezue</h6>
												<p className="m-0" style={{ fontSize: "0.75em" }}>Online</p>
											</div>
											<CDBBtn style={{ background: "#333" }} flat size="small" className="border-0 ml-auto px-2 my-2"><span className="msg-rem">Send</span> Message</CDBBtn>
										</div>
										<div className="d-flex mt-4">
											<img alt="panelImage" src="img/pane/pane3.png" className="pane-image" size="md" />
											<div>
												<h6 className="mb-0" style={{ fontWeight: "600" }}>Mezue</h6>
												<p className="m-0" style={{ fontSize: "0.75em" }}>Online</p>
											</div>
											<CDBBtn style={{ background: "#333" }} flat size="small" className="border-0 ml-auto px-2 my-2"><span className="msg-rem">Send</span> Message</CDBBtn>
										</div>
										<div className="d-flex mt-4">
											<img alt="panelImage" src="img/pane/pane4.png" className="pane-image" size="md" />
											<div>
												<h6 className="mb-0" style={{ fontWeight: "600" }}>Mezue</h6>
												<p className="m-0" style={{ fontSize: "0.75em" }}>Online</p>
											</div>
											<CDBBtn style={{ background: "#333" }} flat size="small" className="border-0 ml-auto px-2 my-2"><span className="msg-rem">Send</span> Message</CDBBtn>
										</div>
										<div className="d-flex mt-4">
											<img alt="panelImage" src="img/pane/pane5.png" className="pane-image" size="md" />
											<div>
												<h6 className="mb-0" style={{ fontWeight: "600" }}>Mezue</h6>
												<p className="m-0" style={{ fontSize: "0.75em" }}>Online</p>
											</div>
											<CDBBtn style={{ background: "#333" }} flat size="small" className="border-0 ml-auto px-2 my-2"><span className="msg-rem">Send</span> Message</CDBBtn>
										</div>
										<div className="d-flex mt-4">
											<img alt="panelImage" src="img/pane/pane1.png" className="pane-image" size="md" />
											<div>
												<h6 className="mb-0" style={{ fontWeight: "600" }}>Mezue</h6>
												<p className="m-0" style={{ fontSize: "0.75em" }}>Online</p>
											</div>
											<CDBBtn style={{ background: "#333" }} flat size="small" className="border-0 ml-auto px-2 my-2"><span className="msg-rem">Send</span> Message</CDBBtn>
										</div>
										<div className="d-flex mt-4">
											<img alt="panelImage" src="img/pane/pane2.png" className="pane-image" size="md" />
											<div>
												<h6 className="mb-0" style={{ fontWeight: "600" }}>Mezue</h6>
												<p className="m-0" style={{ fontSize: "0.75em" }}>Online</p>
											</div>
											<CDBBtn style={{ background: "#333" }} flat size="small" className="border-0 ml-auto px-2 my-2"><span className="msg-rem">Send</span> Message</CDBBtn>
										</div>
										<p className="c-p text-dark mb-0 font-weight-bold text-right mt-auto">
											More Details
											<i className="fas fa-arrow-right ml-1"></i>
										</p>
									</div>
									<div className="card-bg w-100 d-flex flex-column border d-flex flex-column" style={{ gridRow: "span 2" }}>
										<div className="p-4 d-flex flex-column h-100">
											<div className="d-flex align-items-center justify-content-between">
												<h4 className="m-0 h5 font-weight-bold text-dark">Total Orders</h4>
												<div className="px-2 py-1 bg-grey rounded-circle"><i className="fas fa-shopping-bag"></i></div>
											</div>
											<div className="mt-5 d-flex align-items-center justify-content-between">
												<div>
													<h4 className="m-0 h1 font-weight-bold text-dark">452</h4>
													<p className="text-success small">
														<i className="fas fa-angle-up p-0"></i> 18.52%
													</p>
												</div>
												<div className="text-right d-flex flex-column justify-content-between">
													<div className="d-flex align-items-center justify-content-between text-primary">
														<span style={{ fontSize: "3em", margin: "-2rem 0px -1.5rem 0px" }}>&#8226;</span>
														<span className="small">August</span>
													</div>
													<div className="d-flex align-items-center justify-content-between text-warning">
														<span style={{ fontSize: "3em", margin: "-2rem 0px -1.5rem 0px" }}>&#8226;</span>
														<span className="small ml-2">September</span>
													</div>
												</div>
											</div>
											<div className="p-0 mt-auto">

											</div>
											<p className="c-p text-dark font-weight-bold text-right mt-3 mb-0">
												More Details
												<i className="fas fa-arrow-right ml-1"></i>
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<Footer />
					</div>
				</div>
			</div>
		</div>
	);
}

export default Profile;
