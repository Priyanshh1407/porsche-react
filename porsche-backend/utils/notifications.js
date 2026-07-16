class NotificationService {
    constructor() {
        this.subscribers = new Set();
    }

    subscribe(res, userId) {
        const subscriber = { res, userId, id: Date.now() };
        this.subscribers.add(subscriber);

        // remove subscriber when connection closes 
        res.on('close', () => {
            this.subscribers.delete(subscriber);
        });

        // Setup SSE headers
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control'
        });

        //Send initial connection 
        this.sendToSubscriber(subscriber, 'connected', { message: 'Connected to notifications' });

        return subscriber;
    }

    // send message to specific subscriber
    sendToSubscriber(subscriber, event, data) {
        try {
            const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
            subscriber.res.write(message);
        } catch (error) {
            this.subscribers.delete(subscriber);
        }
    }

    // broadcast to all subscribers
    broadcast(event, data) {
        this.subscribers.forEach(subscriber => {
            this.sendToSubscriber(subscriber, event, data);
        });
    }

    //notify about new contact
    newContact(contact) {
        this.broadcast('new_contact', {
            id: contact.id,
            name: `${contact.firstName} ${contact.lastName}`,
            email: contact.email,
            inquiryType: contact.inquiryType,
            modelInterest: contact.modelInterest,
            createdAt: contact.createdAt
        });
    }

    //notify about contact status update 
    contactUpdated(contact) {
        this.broadcast('contact_updated', {
            id: contact.id,
            status: contact.status,
            updatedAt: contact.updatedAt
        });
    }
}

const notificationService = new NotificationService();

export default notificationService;