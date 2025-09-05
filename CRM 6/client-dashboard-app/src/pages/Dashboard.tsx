import React from 'react';
import ChatInterface from '../components/ChatInterface';
import QuickActions from '../components/QuickActions';
import ClientInteractions from '../components/ClientInteractions';

const Dashboard: React.FC = () => {
    return (
        <div className="dashboard">
            <h1>Client Dashboard</h1>
            <ClientInteractions />
            <QuickActions />
            <ChatInterface />
        </div>
    );
};

export default Dashboard;