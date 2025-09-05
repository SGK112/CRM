import React from 'react';

const FooterDropdown: React.FC = () => {
    const [communicationMethod, setCommunicationMethod] = React.useState('email');

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setCommunicationMethod(event.target.value);
    };

    return (
        <div className="footer-dropdown">
            <label htmlFor="communication-method">Select Communication Method:</label>
            <select id="communication-method" value={communicationMethod} onChange={handleChange}>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
            </select>
        </div>
    );
};

export default FooterDropdown;