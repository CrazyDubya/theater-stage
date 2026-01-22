const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

class CollaborationServer {
    constructor(port = 8080) {
        this.port = port;
        this.wss = null;
        this.rooms = new Map(); // roomId -> Room
        this.clients = new Map(); // ws -> Client
    }

    start() {
        this.wss = new WebSocket.Server({ port: this.port });
        
        this.wss.on('connection', (ws) => {
            console.log('New client connected');
            
            ws.on('message', (message) => {
                this.handleMessage(ws, message);
            });
            
            ws.on('close', () => {
                this.handleDisconnect(ws);
            });
            
            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
            });
        });
        
        console.log(`Collaboration server running on port ${this.port}`);
    }

    handleMessage(ws, message) {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'join':
                    this.handleJoin(ws, data);
                    break;
                case 'state_update':
                    this.handleStateUpdate(ws, data);
                    break;
                case 'cursor_move':
                    this.handleCursorMove(ws, data);
                    break;
                case 'chat_message':
                    this.handleChatMessage(ws, data);
                    break;
                case 'lock_object':
                    this.handleLockObject(ws, data);
                    break;
                case 'unlock_object':
                    this.handleUnlockObject(ws, data);
                    break;
                default:
                    console.warn('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    }

    handleJoin(ws, data) {
        const { roomId, username, permission = 'viewer' } = data;
        const userId = uuidv4();
        
        // Create or get room
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Room(roomId));
        }
        const room = this.rooms.get(roomId);
        
        // Create client
        const client = {
            id: userId,
            username: username || `User_${userId.substr(0, 6)}`,
            permission,
            ws,
            roomId,
            cursor: { x: 0, y: 0 }
        };
        
        this.clients.set(ws, client);
        room.addClient(client);
        
        // Send join confirmation with userId
        ws.send(JSON.stringify({
            type: 'join_success',
            userId,
            username: client.username,
            permission,
            roomState: room.getState(),
            users: room.getUsers()
        }));
        
        // Notify other users
        room.broadcast({
            type: 'user_joined',
            userId,
            username: client.username,
            permission
        }, client.id);
        
        console.log(`User ${client.username} joined room ${roomId}`);
    }

    handleStateUpdate(ws, data) {
        const client = this.clients.get(ws);
        if (!client) return;
        
        const room = this.rooms.get(client.roomId);
        if (!room) return;
        
        // Check permissions
        if (!this.canEdit(client)) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Permission denied: You do not have edit permissions'
            }));
            return;
        }
        
        // Update room state
        room.updateState(data.update);
        
        // Broadcast to other users
        room.broadcast({
            type: 'state_update',
            userId: client.id,
            username: client.username,
            update: data.update,
            timestamp: Date.now()
        }, client.id);
    }

    handleCursorMove(ws, data) {
        const client = this.clients.get(ws);
        if (!client) return;
        
        const room = this.rooms.get(client.roomId);
        if (!room) return;
        
        client.cursor = data.cursor;
        
        // Broadcast cursor position
        room.broadcast({
            type: 'cursor_move',
            userId: client.id,
            cursor: data.cursor
        }, client.id);
    }

    handleChatMessage(ws, data) {
        const client = this.clients.get(ws);
        if (!client) return;
        
        const room = this.rooms.get(client.roomId);
        if (!room) return;
        
        // Broadcast chat message
        room.broadcast({
            type: 'chat_message',
            userId: client.id,
            username: client.username,
            message: data.message,
            timestamp: Date.now()
        });
    }

    handleLockObject(ws, data) {
        const client = this.clients.get(ws);
        if (!client) return;
        
        const room = this.rooms.get(client.roomId);
        if (!room) return;
        
        if (!this.canEdit(client)) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Permission denied: Cannot lock objects'
            }));
            return;
        }
        
        const locked = room.lockObject(data.objectId, client.id);
        
        if (locked) {
            // Broadcast lock
            room.broadcast({
                type: 'object_locked',
                objectId: data.objectId,
                userId: client.id,
                username: client.username
            });
        } else {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Object is already locked by another user'
            }));
        }
    }

    handleUnlockObject(ws, data) {
        const client = this.clients.get(ws);
        if (!client) return;
        
        const room = this.rooms.get(client.roomId);
        if (!room) return;
        
        room.unlockObject(data.objectId, client.id);
        
        // Broadcast unlock
        room.broadcast({
            type: 'object_unlocked',
            objectId: data.objectId,
            userId: client.id
        });
    }

    handleDisconnect(ws) {
        const client = this.clients.get(ws);
        if (!client) return;
        
        const room = this.rooms.get(client.roomId);
        if (room) {
            // Release all locks held by this user
            room.releaseUserLocks(client.id);
            
            // Remove client from room
            room.removeClient(client.id);
            
            // Notify other users
            room.broadcast({
                type: 'user_left',
                userId: client.id,
                username: client.username
            });
            
            // Delete room if empty
            if (room.isEmpty()) {
                this.rooms.delete(client.roomId);
                console.log(`Room ${client.roomId} deleted (empty)`);
            }
        }
        
        this.clients.delete(ws);
        console.log(`User ${client.username} disconnected`);
    }

    canEdit(client) {
        return client.permission === 'director' || client.permission === 'actor';
    }
}

class Room {
    constructor(id) {
        this.id = id;
        this.clients = new Map(); // userId -> client
        this.state = {}; // Shared state
        this.locks = new Map(); // objectId -> userId
    }

    addClient(client) {
        this.clients.set(client.id, client);
    }

    removeClient(userId) {
        this.clients.delete(userId);
    }

    getUsers() {
        return Array.from(this.clients.values()).map(c => ({
            userId: c.id,
            username: c.username,
            permission: c.permission,
            cursor: c.cursor
        }));
    }

    getState() {
        return {
            ...this.state,
            locks: Object.fromEntries(this.locks)
        };
    }

    updateState(update) {
        // Merge update into state
        Object.assign(this.state, update);
    }

    lockObject(objectId, userId) {
        if (this.locks.has(objectId)) {
            return false; // Already locked
        }
        this.locks.set(objectId, userId);
        return true;
    }

    unlockObject(objectId, userId) {
        if (this.locks.get(objectId) === userId) {
            this.locks.delete(objectId);
            return true;
        }
        return false;
    }

    releaseUserLocks(userId) {
        for (const [objectId, lockUserId] of this.locks.entries()) {
            if (lockUserId === userId) {
                this.locks.delete(objectId);
            }
        }
    }

    broadcast(message, excludeUserId = null) {
        const messageStr = JSON.stringify(message);
        for (const client of this.clients.values()) {
            if (client.id !== excludeUserId && client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(messageStr);
            }
        }
    }

    isEmpty() {
        return this.clients.size === 0;
    }
}

// Start server
const server = new CollaborationServer(8080);
server.start();
