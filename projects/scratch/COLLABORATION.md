# Multi-User Collaboration Guide

This document explains how to use the multi-user collaboration features in the Theater Stage application.

## Overview

The collaboration system enables multiple users to work on the same stage simultaneously with real-time synchronization. Features include:

- **Real-time state synchronization** - All changes are instantly visible to all users
- **User presence indicators** - See cursors and names of other users
- **Permission levels** - Director, Actor, and Viewer roles with different capabilities
- **Chat system** - Communicate with other users in the session
- **Conflict resolution** - Object locking prevents simultaneous edits
- **Automatic reconnection** - Seamlessly recover from connection issues

## Getting Started

### 1. Start the Collaboration Server

First, start the WebSocket collaboration server:

```bash
cd projects/scratch
npm install  # If you haven't already
npm run server
```

The server will start on port 8080.

### 2. Start the Web Application

In a separate terminal, start the HTTP server for the web application:

```bash
cd projects/scratch
python3 -m http.server 8000
```

Or use the combined dev script:

```bash
npm run dev
```

### 3. Open the Application

Open your web browser and navigate to:

```
http://localhost:8000
```

### 4. Join a Collaboration Session

1. Click the "Join Collaboration" button in the top-right corner
2. Enter your name
3. Enter a room ID (all users in the same room can collaborate)
4. Select your role:
   - **Director** - Full control over all stage elements
   - **Actor** - Can edit and place props/actors
   - **Viewer** - Read-only access
5. Click "Connect"

## Features

### Permission Levels

#### Director
- Full control over all stage elements
- Can add/remove props and actors
- Can control lighting, curtains, platforms
- Can modify all stage settings

#### Actor
- Can add/remove props and actors
- Can move existing objects
- Can control some stage elements
- Cannot modify certain restricted settings

#### Viewer
- Read-only access
- Can view all changes in real-time
- Can participate in chat
- Cannot modify the stage

### User Presence

- **Colored cursors** - Each user has a uniquely colored cursor visible on the stage
- **Username labels** - See who is working on different areas
- **Active user list** - View all connected users in the collaboration panel

### Chat System

- Send messages to all users in the room
- System notifications for user joins/leaves
- Timestamp on all messages
- Chat history preserved during session

### Conflict Resolution

The system uses object locking to prevent conflicts:

- When you start editing an object, it's automatically locked
- Other users see that the object is locked and by whom
- Locks are automatically released when you're done or disconnect
- This prevents simultaneous edits that could cause conflicts

### State Synchronization

The following changes are synchronized in real-time:

- Adding props and actors
- Moving objects
- Lighting changes
- Curtain open/close
- Platform elevation
- Rotating stage
- Trap doors
- Scenery panel positions

## Testing the Collaboration

To test with multiple users:

1. Open multiple browser windows (or different browsers)
2. Navigate to `http://localhost:8000` in each window
3. Connect each window to the same room ID with different usernames
4. Make changes in one window and watch them appear in the others

## Architecture

### Server Components

- **WebSocket Server** (`server/collaboration-server.js`)
  - Handles client connections
  - Manages rooms and user sessions
  - Broadcasts state changes
  - Enforces permissions

### Client Components

- **Collaboration Manager** (`js/collaboration.js`)
  - WebSocket connection management
  - Message handling
  - User presence tracking
  - Chat functionality

- **Collaboration Integration** (`js/collaboration-integration.js`)
  - Integrates with existing stage.js code
  - Intercepts and broadcasts stage modifications
  - Applies remote updates to local stage
  - Manages permission-based UI controls

## Troubleshooting

### Cannot Connect to Server

- Make sure the collaboration server is running on port 8080
- Check that no firewall is blocking the connection
- Verify the server URL is correct (default: `ws://localhost:8080`)

### Changes Not Syncing

- Check the browser console for errors
- Verify you have the correct permissions (not Viewer)
- Try disconnecting and reconnecting
- Restart the collaboration server

### Server Crashes

- Check the server console for error messages
- Ensure all dependencies are installed (`npm install`)
- Verify Node.js version (requires Node.js 14+)

## Security Considerations

**Important:** This is a basic implementation for demonstration purposes. For production use, you should add:

- User authentication
- Encrypted WebSocket connections (wss://)
- Input validation and sanitization
- Rate limiting
- Session management
- Persistent storage for rooms
- More robust error handling

## Future Enhancements

Potential improvements for the collaboration system:

- Voice chat integration
- Video presence
- Undo/redo synchronization
- Persistent room history
- User authentication and authorization
- Room administration tools
- Analytics and session recording
- Mobile device support
- Performance optimizations for large numbers of users

## API Reference

### CollaborationManager Methods

```javascript
// Connect to server
collaborationManager.connect(serverUrl, roomId, username, permission)

// Send state update
collaborationManager.sendStateUpdate(update)

// Send chat message
collaborationManager.sendChatMessage(message)

// Lock/unlock objects
collaborationManager.lockObject(objectId)
collaborationManager.unlockObject(objectId)

// Check permissions
collaborationManager.canEdit()
collaborationManager.isDirector()

// Disconnect
collaborationManager.disconnect()
```

### Message Types

The system uses these message types for communication:

- `join` - Join a room
- `state_update` - Broadcast state change
- `cursor_move` - Update cursor position
- `chat_message` - Send chat message
- `lock_object` - Lock an object for editing
- `unlock_object` - Release object lock
- `user_joined` - Notification of user joining
- `user_left` - Notification of user leaving
- `object_locked` - Object locked notification
- `object_unlocked` - Object unlocked notification

## License

Same as the main Theater Stage project.
