import React, { useEffect, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { WebSocketManager } from './WebSocketManager'; // WebSocketManager handles WebSocket connection

const TerminalComponent = () => {
    const [ws, setWs] = useState(null);
    const [terminal, setTerminal] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        WebSocketManager.connect(token, handleMessage);

        const term = new Terminal();
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(document.getElementById('terminal'));
        fitAddon.fit();

        setTerminal(term);

        return () => {
            WebSocketManager.disconnect();
        };
    }, []);

    const handleMessage = (message) => {
        terminal.write(message);
    };

    const handleSendMessage = () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            WebSocketManager.sendMessage(message);
            setMessage('');
        } else {
            console.error('WebSocket is not open');
        }
    };

    return (
        <div>
            <div id="terminal"></div>
            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter command..."
            />
            <button onClick={handleSendMessage}>Send</button>
        </div>
    );
};

export default TerminalComponent;
