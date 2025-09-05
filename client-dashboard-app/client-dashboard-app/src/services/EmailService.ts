export class EmailService {
    private apiUrl: string;

    constructor() {
        this.apiUrl = 'http://localhost:3000/api/emails'; // Adjust the API URL as needed
    }

    async sendEmail(to: string, subject: string, body: string): Promise<Response> {
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to,
                subject,
                body,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to send email');
        }

        return response;
    }

    async getEmailHistory(clientId: string): Promise<any> {
        const response = await fetch(`${this.apiUrl}/history/${clientId}`);

        if (!response.ok) {
            throw new Error('Failed to fetch email history');
        }

        return response.json();
    }
}