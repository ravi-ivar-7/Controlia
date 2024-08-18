import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Profile.css';
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

const Profile = () => {
	const { user } = useUser();

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
												<h4 className="m-0 h5 font-weight-bold text-white">Account Information</h4>
												<div className="py-1 px-2 bg-grey rounded-circle"><i className="fas fa-user"></i></div>
											</div>
											<h4 className="my-4 text-right text-white h2 font-weight-bold">{user.name}</h4>

											<p >
												User-Id:	{user.username}
											</p>
											<p >
												Email: {user.email}
											</p>

										</div>
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

export default Profile;
