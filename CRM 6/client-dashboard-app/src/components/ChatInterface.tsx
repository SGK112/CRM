import React, { useState, useEffect } from 'react';
import ChatService from '../services/ChatService';
import FooterDropdown from './FooterDropdown';

const ChatInterface = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [communicationMethod, setCommunicationMethod] = useState('email');

    const chatService = new ChatService();

    useEffect(() => {
        const fetchMessages = async () => {
            const initialMessages = await chatService.getMessages();
            setMessages(initialMessages);
        };

        fetchMessages();

        const messageListener = chatService.onMessageReceived((message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        return () => {
            messageListener();
        };
    }, [chatService]);

    const handleSendMessage = async () => {
        if (newMessage.trim()) {
            const message = await chatService.sendMessage(newMessage, communicationMethod);
            setMessages((prevMessages) => [...prevMessages, message]);
            setNewMessage('');
        }
    };

    return (
        <div className="chat-interface">
            <div className="messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender}`}>
                        <span>{msg.sender}: </span>
                        <span>{msg.content}</span>
                    </div>
                ))}
            </div>
            <div className="input-area">
                <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
            <FooterDropdown 
                selectedMethod={communicationMethod} 
                onMethodChange={setCommunicationMethod} 
            />
        </div>
    );
};

export default ChatInterface;