import axios from 'axios';

class SmsService {
    private apiUrl: string;

    constructor() {
        this.apiUrl = 'https://api.smsprovider.com/send'; // Replace with actual SMS provider API URL
    }

    public async sendSms(to: string, message: string): Promise<void> {
        try {
            const response = await axios.post(this.apiUrl, {
                to,
                message,
            });
            if (response.status !== 200) {
                throw new Error('Failed to send SMS');
            }
        } catch (error) {
            console.error('Error sending SMS:', error);
            throw error;
        }
    }

    public composeMessage(content: string): string {
        return content.trim();
    }
}

export default SmsService;