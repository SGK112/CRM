import React from 'react';

const QuickActions: React.FC = () => {
    const handleAction = (action: string) => {
        // Implement action handling logic here
        console.log(`Action triggered: ${action}`);
    };

    return (
        <div className="quick-actions">
            <h3>Quick Actions</h3>
            <button onClick={() => handleAction('Send Email')}>Send Email</button>
            <button onClick={() => handleAction('Send SMS')}>Send SMS</button>
            <button onClick={() => handleAction('Schedule Meeting')}>Schedule Meeting</button>
            <button onClick={() => handleAction('View Client Profile')}>View Client Profile</button>
        </div>
    );
};

export default QuickActions;