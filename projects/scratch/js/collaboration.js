/**
 * Collaboration Manager - Handles multi-user collaboration features
 * Including WebSocket connection, state synchronization, and user presence
 */

class CollaborationManager {
    constructor() {
        this.ws = null;
        this.connected = false;
        this.userId = null;
        this.username = null;
        this.permission = 'viewer';
        this.roomId = null;
        this.users = new Map(); // userId -> user info
        this.userCursors = new Map(); // userId -> cursor mesh
        this.lockedObjects = new Map(); // objectId -> userId
        this.messageHandlers = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
    }

    /**
     * Connect to collaboration server
     */
    connect(serverUrl, roomId, username, permission = 'viewer') {
        return new Promise((resolve, reject) => {
            this.roomId = roomId;
            this.username = username;
            this.permission = permission;

            try {
                this.ws = new WebSocket(serverUrl);

                this.ws.onopen = () => {
                    console.log('Connected to collaboration server');
                    this.connected = true;
                    this.reconnectAttempts = 0;
                    
                    // Send join message
                    this.send({
                        type: 'join',
                        roomId,
                        username,
                        permission
                    });
                };

                this.ws.onmessage = (event) => {
                    this.handleMessage(event.data);
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                };

                this.ws.onclose = () => {
                    console.log('Disconnected from collaboration server');
                    this.connected = false;
                    this.handleDisconnect();
                };

                // Set up handler for join success
                this.once('join_success', (data) => {
                    this.userId = data.userId;
                    this.username = data.username;
                    this.permission = data.permission;
                    
                    // Load existing users
                    if (data.users) {
                        data.users.forEach(user => {
                            if (user.userId !== this.userId) {
                                this.addUser(user);
                            }
                        });
                    }
                    
                    resolve(data);
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Disconnect from server
     */
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.connected = false;
        this.clearUserCursors();
    }

    /**
     * Send message to server
     */
    send(message) {
        if (this.ws && this.connected && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
            return true;
        }
        return false;
    }

    /**
     * Handle incoming messages
     */
    handleMessage(data) {
        try {
            const message = JSON.parse(data);
            
            // Emit to registered handlers
            if (this.messageHandlers.has(message.type)) {
                const handlers = this.messageHandlers.get(message.type);
                handlers.forEach(handler => handler(message));
            }

            // Built-in handlers
            switch (message.type) {
                case 'user_joined':
                    this.handleUserJoined(message);
                    break;
                case 'user_left':
                    this.handleUserLeft(message);
                    break;
                case 'cursor_move':
                    this.handleCursorMove(message);
                    break;
                case 'state_update':
                    this.handleStateUpdate(message);
                    break;
                case 'object_locked':
                    this.handleObjectLocked(message);
                    break;
                case 'object_unlocked':
                    this.handleObjectUnlocked(message);
                    break;
                case 'chat_message':
                    this.handleChatMessage(message);
                    break;
                case 'error':
                    this.handleError(message);
                    break;
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    }

    /**
     * Register message handler
     */
    on(messageType, handler) {
        if (!this.messageHandlers.has(messageType)) {
            this.messageHandlers.set(messageType, []);
        }
        this.messageHandlers.get(messageType).push(handler);
    }

    /**
     * Register one-time message handler
     */
    once(messageType, handler) {
        const wrappedHandler = (data) => {
            handler(data);
            this.off(messageType, wrappedHandler);
        };
        this.on(messageType, wrappedHandler);
    }

    /**
     * Unregister message handler
     */
    off(messageType, handler) {
        if (this.messageHandlers.has(messageType)) {
            const handlers = this.messageHandlers.get(messageType);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    /**
     * Handle user joined
     */
    handleUserJoined(message) {
        console.log(`User joined: ${message.username}`);
        this.addUser({
            userId: message.userId,
            username: message.username,
            permission: message.permission
        });
        this.showNotification(`${message.username} joined the session`);
    }

    /**
     * Handle user left
     */
    handleUserLeft(message) {
        console.log(`User left: ${message.username}`);
        this.removeUser(message.userId);
        this.showNotification(`${message.username} left the session`);
    }

    /**
     * Add user to the session
     */
    addUser(user) {
        this.users.set(user.userId, user);
        this.createUserCursor(user.userId, user.username);
        this.updateUserList();
    }

    /**
     * Remove user from the session
     */
    removeUser(userId) {
        this.users.delete(userId);
        this.removeUserCursor(userId);
        this.updateUserList();
    }

    /**
     * Create visual cursor for a user
     */
    createUserCursor(userId, username) {
        // Create cursor mesh (small sphere with label)
        const cursorGroup = new THREE.Group();
        
        // Cursor pointer
        const cursorGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const cursorMaterial = new THREE.MeshBasicMaterial({ 
            color: this.getUserColor(userId),
            transparent: true,
            opacity: 0.8
        });
        const cursorMesh = new THREE.Mesh(cursorGeometry, cursorMaterial);
        cursorGroup.add(cursorMesh);
        
        // Add glow effect
        const glowGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({ 
            color: this.getUserColor(userId),
            transparent: true,
            opacity: 0.3
        });
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        cursorGroup.add(glowMesh);
        
        // Username label (sprite)
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const context = canvas.getContext('2d');
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#ffffff';
        context.font = '24px Arial';
        context.textAlign = 'center';
        context.fillText(username, canvas.width / 2, canvas.height / 2 + 8);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(2, 0.5, 1);
        sprite.position.y = 1;
        cursorGroup.add(sprite);
        
        cursorGroup.visible = false; // Hidden until cursor moves
        scene.add(cursorGroup);
        this.userCursors.set(userId, cursorGroup);
    }

    /**
     * Remove user cursor
     */
    removeUserCursor(userId) {
        const cursor = this.userCursors.get(userId);
        if (cursor) {
            scene.remove(cursor);
            this.userCursors.delete(userId);
        }
    }

    /**
     * Clear all user cursors
     */
    clearUserCursors() {
        this.userCursors.forEach(cursor => {
            scene.remove(cursor);
        });
        this.userCursors.clear();
    }

    /**
     * Get color for user (deterministic based on userId)
     */
    getUserColor(userId) {
        const colors = [
            0xff4444, 0x44ff44, 0x4444ff, 0xffff44, 
            0xff44ff, 0x44ffff, 0xff8844, 0x88ff44
        ];
        // Simple hash function
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            hash = userId.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    }

    /**
     * Handle cursor movement
     */
    handleCursorMove(message) {
        const cursor = this.userCursors.get(message.userId);
        if (cursor && message.cursor) {
            cursor.position.set(message.cursor.x, 0.5, message.cursor.z);
            cursor.visible = true;
        }
    }

    /**
     * Send cursor position
     */
    sendCursorPosition(x, z) {
        this.send({
            type: 'cursor_move',
            cursor: { x, z }
        });
    }

    /**
     * Handle state update from other users
     */
    handleStateUpdate(message) {
        // This will be handled by stage.js through event listeners
        console.log('State update from', message.username, message.update);
    }

    /**
     * Send state update
     */
    sendStateUpdate(update) {
        if (!this.canEdit()) {
            console.warn('Cannot send state update: insufficient permissions');
            return false;
        }
        
        return this.send({
            type: 'state_update',
            update
        });
    }

    /**
     * Lock an object
     */
    lockObject(objectId) {
        return this.send({
            type: 'lock_object',
            objectId
        });
    }

    /**
     * Unlock an object
     */
    unlockObject(objectId) {
        return this.send({
            type: 'unlock_object',
            objectId
        });
    }

    /**
     * Handle object locked
     */
    handleObjectLocked(message) {
        this.lockedObjects.set(message.objectId, message.userId);
        console.log(`Object ${message.objectId} locked by ${message.username}`);
    }

    /**
     * Handle object unlocked
     */
    handleObjectUnlocked(message) {
        this.lockedObjects.delete(message.objectId);
        console.log(`Object ${message.objectId} unlocked`);
    }

    /**
     * Check if object is locked
     */
    isObjectLocked(objectId) {
        return this.lockedObjects.has(objectId);
    }

    /**
     * Check if current user locked the object
     */
    isObjectLockedByMe(objectId) {
        return this.lockedObjects.get(objectId) === this.userId;
    }

    /**
     * Send chat message
     */
    sendChatMessage(message) {
        return this.send({
            type: 'chat_message',
            message
        });
    }

    /**
     * Handle chat message
     */
    handleChatMessage(message) {
        this.addChatMessage(message.username, message.message, message.timestamp);
    }

    /**
     * Handle error
     */
    handleError(message) {
        console.error('Server error:', message.message);
        this.showNotification(message.message, 'error');
    }

    /**
     * Handle disconnect and attempt reconnect
     */
    handleDisconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            
            setTimeout(() => {
                this.connect(
                    `ws://${window.location.hostname}:8080`,
                    this.roomId,
                    this.username,
                    this.permission
                ).catch(error => {
                    console.error('Reconnection failed:', error);
                });
            }, this.reconnectDelay);
        } else {
            this.showNotification('Connection lost. Please refresh the page.', 'error');
        }
    }

    /**
     * Check if user can edit
     */
    canEdit() {
        return this.permission === 'director' || this.permission === 'actor';
    }

    /**
     * Check if user is director
     */
    isDirector() {
        return this.permission === 'director';
    }

    /**
     * Update user list display
     */
    updateUserList() {
        const userListEl = document.getElementById('collaboration-user-list');
        if (!userListEl) return;

        let html = `<div class="user-item me">
            <span class="user-indicator" style="background-color: #${this.getUserColor(this.userId).toString(16)}"></span>
            <span class="user-name">${this.username} (You)</span>
            <span class="user-permission">${this.permission}</span>
        </div>`;

        this.users.forEach((user, userId) => {
            html += `<div class="user-item">
                <span class="user-indicator" style="background-color: #${this.getUserColor(userId).toString(16)}"></span>
                <span class="user-name">${user.username}</span>
                <span class="user-permission">${user.permission}</span>
            </div>`;
        });

        userListEl.innerHTML = html;
    }

    /**
     * Add chat message to chat panel
     */
    addChatMessage(username, message, timestamp) {
        const chatMessagesEl = document.getElementById('chat-messages');
        if (!chatMessagesEl) return;

        const messageEl = document.createElement('div');
        messageEl.className = 'chat-message';
        
        const time = new Date(timestamp).toLocaleTimeString();
        messageEl.innerHTML = `
            <span class="chat-time">${time}</span>
            <span class="chat-username">${username}:</span>
            <span class="chat-text">${this.escapeHtml(message)}</span>
        `;
        
        chatMessagesEl.appendChild(messageEl);
        chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const notificationEl = document.getElementById('collaboration-notification');
        if (!notificationEl) return;

        notificationEl.textContent = message;
        notificationEl.className = `notification ${type}`;
        notificationEl.style.display = 'block';

        setTimeout(() => {
            notificationEl.style.display = 'none';
        }, 5000);
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global instance
let collaborationManager = null;
