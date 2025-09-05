export interface Message {
    id: string;
    senderId: string;
    recipientId: string;
    content: string;
    timestamp: Date;
}

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
}

export interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    interactions: Message[];
}

export type CommunicationMethod = 'email' | 'sms';