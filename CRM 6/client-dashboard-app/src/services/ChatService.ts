export class ChatService {
    private messages: Array<{ sender: string; content: string; timestamp: Date }> = [];
    private participants: Set<string> = new Set();

    constructor() {}

    public addParticipant(participant: string): void {
        this.participants.add(participant);
    }

    public removeParticipant(participant: string): void {
        this.participants.delete(participant);
    }

    public sendMessage(sender: string, content: string): void {
        const message = {
            sender,
            content,
            timestamp: new Date(),
        };
        this.messages.push(message);
        this.notifyParticipants(message);
    }

    public getMessages(): Array<{ sender: string; content: string; timestamp: Date }> {
        return this.messages;
    }

    private notifyParticipants(message: { sender: string; content: string; timestamp: Date }): void {
        // Logic to notify participants about the new message
        // This could be implemented using WebSockets or another real-time communication method
    }
}