import React from 'react';
import ChatInterface from './ChatInterface';
import QuickActions from './QuickActions';
import FooterDropdown from './FooterDropdown';

const ClientInteractions: React.FC = () => {
    return (
        <div className="client-interactions">
            <h2>Client Interactions</h2>
            <QuickActions />
            <ChatInterface />
            <FooterDropdown />
        </div>
    );
};

export default ClientInteractions;