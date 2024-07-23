import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Terminal, { ColorMode, TerminalOutput, TerminalInput } from 'react-terminal-ui';
import 'react-loading-skeleton/dist/skeleton.css';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import './TerminalModal.css';
import socketIOClient from 'socket.io-client';

const TerminalModal = ({ show, handleClose }) => {
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const [executing, setExecuting] = useState(false);
    const [terminalLineData, setTerminalLineData] = useState([
        <TerminalOutput key="welcome">Welcome to the Terminal</TerminalOutput>
    ]);
    const [socket, setSocket] = useState(null);

    useEffect( () => {
        if (show) {
            const token = localStorage.getItem('token');
            const newSocket = socketIOClient(process.env.REACT_APP_NODEJS_API, {
                transports: ['polling', 'websocket'],
                extraHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
            handleCommand();
            newSocket.on('sessionId', (message) => {
                console.log(message)
                setSessionId('')
                setSessionId(message.sessionId)
                setTerminalLineData((prevData) => [
                    ...prevData,
                    <TerminalOutput key={`output-${message}`}>{message.sessionId}</TerminalOutput>
                ]);
            });

            newSocket.on('data', (message) => {
                console.log(message)
                setTerminalLineData((prevData) => [
                    ...prevData,
                    <TerminalOutput key={`output-${message.data}`}>{message.data}</TerminalOutput>
                ]);
            });

            newSocket.on('error', (message) => {
                console.log(message)
                setTerminalLineData((prevData) => [
                    ...prevData,
                    <TerminalOutput key={`error-${message.error}`} style={{ color: 'red' }}>{message.error}</TerminalOutput>
                ]);
            });

            newSocket.on('success', () => {
                newSocket.disconnect();
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        }
    }, [show]);

    const handleCommand = async (command) => {
        if (socket) {
            socket.emit('containerTerminal', { command, sessionId });
        }
    };

    const onInput = async (terminalInput) => {
        setExecuting(true);
        setTerminalLineData((prevData) => [
            ...prevData,
            <TerminalInput key={`input-${terminalInput}`}>{terminalInput}</TerminalInput>,
            <TerminalOutput key="executing">Executing... ⏳</TerminalOutput>
        ]);

        await handleCommand(terminalInput);
        setExecuting(false);
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
