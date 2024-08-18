import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Terminal, { ColorMode, TerminalOutput, TerminalInput } from 'react-terminal-ui';
import axiosInstance from '../../services/axiosInstance';
import 'react-loading-skeleton/dist/skeleton.css';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import './TerminalModal.css';

const TerminalModal = ({ show, handleClose }) => {
    const [loading, setLoading] = useState(false);
    const [executing, setExecuting] = useState(false);
    const [terminalLineData, setTerminalLineData] = useState([
        <TerminalOutput key="welcome">Welcome to the Terminal</TerminalOutput>
    ]);

    const handleCommand = async (command) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axiosInstance.post('/terminal', { command }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data.output;
        } catch (error) {
            return `Error: ${error.message}`;
        }
    };

    const onInput = async (terminalInput) => {
        setExecuting(true);
        setTerminalLineData((prevData) => [
            ...prevData,
            <TerminalInput key={`input-${terminalInput}`}>{terminalInput}</TerminalInput>,
            <TerminalOutput key="executing">Executing... ⏳</TerminalOutput>
        ]);

        const output = await handleCommand(terminalInput);
        setExecuting(false);

        setTerminalLineData((prevData) => [
            ...prevData,
            <TerminalOutput key={`output-${terminalInput}`}>{output}</TerminalOutput>
        ]);
    };

    const handleRedButtonClick = () => {
        console.log('Red button clicked');
    };

    const handleYellowButtonClick = () => {
        console.log('Yellow button clicked');
    };

    const handleGreenButtonClick = () => {
        console.log('Green button clicked');
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" aria-labelledby="contained-modal-title-vcenter" centered style={{ height: '90vh' }}>
            <Modal.Body style={{ height: 'calc(100% - 56px)', padding: 0 }}>
                {loading ? (
                    <div>
                        <SkeletonTheme baseColor="#202020" highlightColor="#444">
                            <h1>{<Skeleton />}</h1>
                            <p>
                                <Skeleton count={5} />
                            </p>
                        </SkeletonTheme>
                    </div>
                ) : (
                    <div style={{ height: '100%', overflow: 'hidden' }}>
                        <div style={{ position: 'relative', height: '100%' }}>
                            <button onClick={handleClose} className="close-button">Close</button>
                            <Terminal
                                name='Workspace Terminal'
                                colorMode={ColorMode.Dark}
                                onInput={onInput}
                                redBtnCallback={handleRedButtonClick}
                                yellowBtnCallback={handleYellowButtonClick}
                                greenBtnCallback={handleGreenButtonClick}
                                style={{ height: '100%', width: '100%' }}
                            >
                                {terminalLineData}
                            </Terminal>
                        </div>
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default TerminalModal;
