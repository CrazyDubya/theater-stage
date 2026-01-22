/**
 * Collaboration Integration - Connects collaboration system with stage.js
 */

(function() {
    'use strict';
    
    // Wait for stage to initialize
    window.addEventListener('load', function() {
        initCollaborationUI();
    });
    
    function initCollaborationUI() {
        const toggleBtn = document.getElementById('collaboration-toggle');
        const connectionPanel = document.getElementById('connection-panel');
        const collaborationPanel = document.getElementById('collaboration-panel');
        const connectBtn = document.getElementById('connect-btn');
        const cancelBtn = document.getElementById('cancel-connection');
        const chatInput = document.getElementById('chat-input');
        const chatSend = document.getElementById('chat-send');
        
        // Show connection panel
        toggleBtn.addEventListener('click', function() {
            if (collaborationManager && collaborationManager.connected) {
                // Toggle collaboration panel
                collaborationPanel.classList.toggle('active');
            } else {
                // Show connection panel
                connectionPanel.classList.add('active');
            }
        });
        
        // Cancel connection
        cancelBtn.addEventListener('click', function() {
            connectionPanel.classList.remove('active');
        });
        
        // Connect to collaboration server
        connectBtn.addEventListener('click', async function() {
            const username = document.getElementById('username-input').value.trim();
            const roomId = document.getElementById('room-input').value.trim();
            const permission = document.getElementById('permission-select').value;
            
            if (!username || !roomId) {
                alert('Please enter your name and room ID');
                return;
            }
            
            try {
                connectBtn.disabled = true;
                connectBtn.textContent = 'Connecting...';
                
                // Initialize collaboration manager
                if (!collaborationManager) {
                    collaborationManager = new CollaborationManager();
                }
                
                // Connect to server
                const serverUrl = `ws://${window.location.hostname}:8080`;
                await collaborationManager.connect(serverUrl, roomId, username, permission);
                
                // Hide connection panel
                connectionPanel.classList.remove('active');
                
                // Show collaboration panel
                collaborationPanel.classList.add('active');
                
                // Update toggle button
                toggleBtn.textContent = 'Collaboration';
                toggleBtn.classList.add('connected');
                
                // Setup integration
                setupCollaborationIntegration();
                
                collaborationManager.showNotification('Connected successfully!', 'success');
                
            } catch (error) {
                console.error('Connection failed:', error);
                alert('Failed to connect to collaboration server. Make sure the server is running on port 8080.');
            } finally {
                connectBtn.disabled = false;
                connectBtn.textContent = 'Connect';
            }
        });
        
        // Chat functionality
        chatSend.addEventListener('click', sendChatMessage);
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
        
        function sendChatMessage() {
            const message = chatInput.value.trim();
            if (message && collaborationManager && collaborationManager.connected) {
                collaborationManager.sendChatMessage(message);
                // Add own message to chat
                collaborationManager.addChatMessage(
                    collaborationManager.username + ' (You)', 
                    message, 
                    Date.now()
                );
                chatInput.value = '';
            }
        }
    }
    
    function setupCollaborationIntegration() {
        if (!collaborationManager || !collaborationManager.connected) return;
        
        // Listen for state updates from other users
        collaborationManager.on('state_update', handleRemoteStateUpdate);
        
        // Track mouse movement for cursor
        setupCursorTracking();
        
        // Intercept stage modifications
        interceptStageModifications();
        
        // Disable controls for viewers
        if (!collaborationManager.canEdit()) {
            disableEditingControls();
        }
    }
    
    function handleRemoteStateUpdate(message) {
        const update = message.update;
        
        // Apply remote changes to local stage
        if (update.type === 'prop_added') {
            // Add prop without sending update
            const prop = createPropFromData(update.data);
            props.push(prop);
            scene.add(prop);
        } else if (update.type === 'prop_moved') {
            // Move prop
            const prop = props.find(p => p.userData.id === update.objectId);
            if (prop) {
                prop.position.set(update.position.x, update.position.y, update.position.z);
            }
        } else if (update.type === 'actor_added') {
            // Add actor
            const actor = createActorFromData(update.data);
            actors.push(actor);
            scene.add(actor);
        } else if (update.type === 'actor_moved') {
            // Move actor
            const actor = actors.find(a => a.userData.id === update.objectId);
            if (actor) {
                actor.position.set(update.position.x, update.position.y, update.position.z);
            }
        } else if (update.type === 'lighting_changed') {
            // Change lighting
            applyLightingPreset(update.preset);
        } else if (update.type === 'curtains_toggled') {
            // Toggle curtains
            if (curtainState !== update.state) {
                toggleCurtains();
            }
        } else if (update.type === 'platforms_moved') {
            // Move platforms
            movePlatforms();
        }
        
        console.log('Applied remote update:', update.type);
    }
    
    function createPropFromData(data) {
        const geometry = getPropGeometry(data.type);
        const material = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
        const prop = new THREE.Mesh(geometry, material);
        
        prop.position.set(data.position.x, data.position.y, data.position.z);
        prop.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
        prop.userData.id = data.id;
        prop.userData.name = data.name;
        prop.userData.propType = data.type;
        prop.castShadow = true;
        prop.receiveShadow = true;
        
        return prop;
    }
    
    function createActorFromData(data) {
        const actorGroup = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 16);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x4488ff });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.75;
        body.castShadow = true;
        actorGroup.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.9;
        head.castShadow = true;
        actorGroup.add(head);
        
        actorGroup.position.set(data.position.x, data.position.y, data.position.z);
        actorGroup.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
        actorGroup.userData.id = data.id;
        actorGroup.userData.name = data.name;
        
        return actorGroup;
    }
    
    function getPropGeometry(type) {
        switch(type) {
            case 'cube': return new THREE.BoxGeometry(1, 1, 1);
            case 'sphere': return new THREE.SphereGeometry(0.5, 16, 16);
            case 'cylinder': return new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
            case 'chair': return new THREE.BoxGeometry(0.8, 1, 0.8);
            case 'table': return new THREE.BoxGeometry(1.5, 0.1, 1);
            case 'crate': return new THREE.BoxGeometry(1, 1, 1);
            case 'barrel': return new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
            default: return new THREE.BoxGeometry(1, 1, 1);
        }
    }
    
    function setupCursorTracking() {
        let lastCursorSend = 0;
        const cursorSendInterval = 100; // ms
        
        window.addEventListener('mousemove', function(event) {
            if (!collaborationManager || !collaborationManager.connected) return;
            
            const now = Date.now();
            if (now - lastCursorSend < cursorSendInterval) return;
            lastCursorSend = now;
            
            // Convert screen coordinates to 3D world coordinates
            const mouse = new THREE.Vector2(
                (event.clientX / window.innerWidth) * 2 - 1,
                -(event.clientY / window.innerHeight) * 2 + 1
            );
            
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camera);
            
            // Intersect with stage
            const intersects = raycaster.intersectObject(stage);
            if (intersects.length > 0) {
                const point = intersects[0].point;
                collaborationManager.sendCursorPosition(point.x, point.z);
            }
        });
    }
    
    function interceptStageModifications() {
        // Override prop placement
        const originalAddPropAt = window.addPropAt;
        window.addPropAt = function(x, z) {
            if (!collaborationManager || !collaborationManager.canEdit()) {
                if (collaborationManager) {
                    collaborationManager.showNotification('You do not have permission to edit', 'error');
                }
                return;
            }
            
            // Call original function
            originalAddPropAt.call(this, x, z);
            
            // Send update to other users
            const lastProp = props[props.length - 1];
            if (lastProp) {
                collaborationManager.sendStateUpdate({
                    type: 'prop_added',
                    data: {
                        id: lastProp.userData.id,
                        name: lastProp.userData.name,
                        type: lastProp.userData.propType,
                        position: { 
                            x: lastProp.position.x, 
                            y: lastProp.position.y, 
                            z: lastProp.position.z 
                        },
                        rotation: { 
                            x: lastProp.rotation.x, 
                            y: lastProp.rotation.y, 
                            z: lastProp.rotation.z 
                        }
                    }
                });
            }
        };
        
        // Override actor placement
        const originalAddActorAt = window.addActorAt;
        window.addActorAt = function(x, z) {
            if (!collaborationManager || !collaborationManager.canEdit()) {
                if (collaborationManager) {
                    collaborationManager.showNotification('You do not have permission to edit', 'error');
                }
                return;
            }
            
            // Call original function
            originalAddActorAt.call(this, x, z);
            
            // Send update to other users
            const lastActor = actors[actors.length - 1];
            if (lastActor) {
                collaborationManager.sendStateUpdate({
                    type: 'actor_added',
                    data: {
                        id: lastActor.userData.id,
                        name: lastActor.userData.name,
                        position: { 
                            x: lastActor.position.x, 
                            y: lastActor.position.y, 
                            z: lastActor.position.z 
                        },
                        rotation: { 
                            x: lastActor.rotation.x, 
                            y: lastActor.rotation.y, 
                            z: lastActor.rotation.z 
                        }
                    }
                });
            }
        };
        
        // Override lighting changes
        const originalApplyLightingPreset = window.applyLightingPreset;
        window.applyLightingPreset = function(preset) {
            if (collaborationManager && collaborationManager.connected && 
                collaborationManager.canEdit() && currentLightingPreset !== preset) {
                
                collaborationManager.sendStateUpdate({
                    type: 'lighting_changed',
                    preset: preset
                });
            }
            
            // Call original function
            originalApplyLightingPreset.call(this, preset);
        };
        
        // Override curtain toggle
        const originalToggleCurtains = window.toggleCurtains;
        window.toggleCurtains = function() {
            if (!collaborationManager || !collaborationManager.canEdit()) {
                if (collaborationManager) {
                    collaborationManager.showNotification('You do not have permission to edit', 'error');
                }
                return;
            }
            
            // Call original function
            originalToggleCurtains.call(this);
            
            // Send update
            collaborationManager.sendStateUpdate({
                type: 'curtains_toggled',
                state: curtainState
            });
        };
        
        // Override platform movement
        const originalMovePlatforms = window.movePlatforms;
        window.movePlatforms = function() {
            if (!collaborationManager || !collaborationManager.canEdit()) {
                if (collaborationManager) {
                    collaborationManager.showNotification('You do not have permission to edit', 'error');
                }
                return;
            }
            
            // Call original function
            originalMovePlatforms.call(this);
            
            // Send update
            collaborationManager.sendStateUpdate({
                type: 'platforms_moved'
            });
        };
    }
    
    function disableEditingControls() {
        // Disable buttons for viewers
        const editButtons = [
            'placePropBtn', 'placeActorBtn', 'movePlatformsBtn',
            'rotateCenterBtn', 'toggleTrapdoorsBtn', 'toggleCurtainsBtn'
        ];
        
        editButtons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.disabled = true;
                btn.title = 'You do not have permission to edit (Viewer role)';
            }
        });
        
        collaborationManager.showNotification('Connected as Viewer (read-only)', 'info');
    }
})();
