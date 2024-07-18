import React, { useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';

const ENDPOINT = 'http://localhost:3001';
const token = localStorage.getItem('token')
const Socket = () => {
    const [messages1, setMessages1] = useState([]);
    const [messages2, setMessages2] = useState([]);
  
    useEffect(() => {
      const socket = socketIOClient(ENDPOINT, {
        transports: ['polling', 'websocket'],
        extraHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
  
      socket.on('message1', (message) => {
        setMessages1((prevMessages) => [...prevMessages, message]);
      });
  
      socket.on('message2', (message) => {
        setMessages2((prevMessages) => [...prevMessages, message]);
      });
  
      // Example to trigger different events
      socket.emit('event1', { data: 'Some data for event1' });
      socket.emit('event2', { data: 'Some data for event2' });
  
      return () => {
        socket.disconnect();
      };
    }, []);
  
    return (
      <div>
        <h1>Socket.IO React Example</h1>
        <div>
          <h2>Messages for Event1:</h2>
          <ul>
            {messages1.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Messages for Event2:</h2>
          <ul>
            {messages2.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };
  

export default Socket;
