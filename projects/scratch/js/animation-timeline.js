/**
 * Animation Timeline & Sequencer for Theater-Stage
 * Allows choreographing actor movements and prop interactions over time
 */

class AnimationTimeline {
    constructor() {
        this.keyframes = [];
        this.currentTime = 0;
        this.duration = 60; // seconds
        this.isPlaying = false;
        this.playbackSpeed = 1.0;
        this.loop = false;

        // Track original states for reset
        this.originalStates = new Map();

        // Animation interpolation
        this.activeAnimations = [];

        // UI elements
        this.panel = null;
        this.timeline = null;
        this.playhead = null;

        this.init();
    }

    init() {
        this.createUI();
        this.setupEventListeners();
    }

    createUI() {
        // Main timeline panel
        this.panel = document.createElement('div');
        this.panel.id = 'animation-timeline-panel';
        this.panel.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 250px;
            background: linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(22, 33, 62, 0.98) 100%);
            border-top: 2px solid rgba(68, 170, 255, 0.5);
            color: white;
            font-family: Arial, sans-serif;
            display: none;
            flex-direction: column;
            z-index: 9000;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5);
        `;

        // Header with controls
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 10px 15px;
            background: rgba(0, 0, 0, 0.3);
            border-bottom: 1px solid rgba(68, 170, 255, 0.3);
            display: flex;
            align-items: center;
            gap: 10px;
        `;

        header.innerHTML = `
            <h3 style="margin: 0; font-size: 16px; flex: 1;">🎬 Animation Timeline</h3>
            <button id="timeline-play" class="timeline-btn" title="Play/Pause">▶️</button>
            <button id="timeline-stop" class="timeline-btn" title="Stop">⏹️</button>
            <button id="timeline-record" class="timeline-btn" title="Record Keyframe">⏺️</button>
            <button id="timeline-delete" class="timeline-btn" title="Delete Selected">🗑️</button>
            <label style="font-size: 12px;">
                Speed:
                <select id="timeline-speed" style="margin-left: 5px; padding: 3px; background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(68,170,255,0.3); border-radius: 3px;">
                    <option value="0.25">0.25x</option>
                    <option value="0.5">0.5x</option>
                    <option value="1" selected>1x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2x</option>
                </select>
            </label>
            <label style="font-size: 12px;">
                <input type="checkbox" id="timeline-loop"> Loop
            </label>
            <label style="font-size: 12px;">
                Duration:
                <input type="number" id="timeline-duration" value="60" min="10" max="600" step="10" style="width: 60px; padding: 3px; background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(68,170,255,0.3); border-radius: 3px;">s
            </label>
            <button id="timeline-close" class="timeline-btn" title="Close Timeline">✖️</button>
        `;

        this.panel.appendChild(header);

        // Timeline visualization
        const timelineContainer = document.createElement('div');
        timelineContainer.style.cssText = `
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            position: relative;
        `;

        // Time ruler
        this.timeRuler = document.createElement('div');
        this.timeRuler.style.cssText = `
            height: 30px;
            background: rgba(0, 0, 0, 0.3);
            border-bottom: 1px solid rgba(68, 170, 255, 0.3);
            position: relative;
            cursor: pointer;
        `;
        timelineContainer.appendChild(this.timeRuler);

        // Playhead
        this.playhead = document.createElement('div');
        this.playhead.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 2px;
            height: 100%;
            background: #ff0000;
            z-index: 100;
            pointer-events: none;
        `;
        timelineContainer.appendChild(this.playhead);

        // Tracks container
        this.tracksContainer = document.createElement('div');
        this.tracksContainer.id = 'timeline-tracks';
        this.tracksContainer.style.cssText = `
            min-height: 150px;
            position: relative;
        `;
        timelineContainer.appendChild(this.tracksContainer);

        this.panel.appendChild(timelineContainer);

        // Time display
        const timeDisplay = document.createElement('div');
        timeDisplay.id = 'timeline-time-display';
        timeDisplay.style.cssText = `
            padding: 5px 15px;
            background: rgba(0, 0, 0, 0.3);
            border-top: 1px solid rgba(68, 170, 255, 0.3);
            font-size: 12px;
            text-align: center;
        `;
        timeDisplay.textContent = '0.00s / 60.00s';
        this.panel.appendChild(timeDisplay);

        document.body.appendChild(this.panel);

        // Add button styles
        const style = document.createElement('style');
        style.textContent = `
            .timeline-btn {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: white;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s ease;
            }
            .timeline-btn:hover {
                background: linear-gradient(135deg, #7c8df8 0%, #8c5bb2 100%);
                transform: translateY(-1px);
            }
            .timeline-btn:active {
                transform: translateY(0);
            }
            .timeline-btn.recording {
                background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
                animation: pulse-recording 1s infinite;
            }
            @keyframes pulse-recording {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.6; }
            }
            .keyframe-marker {
                position: absolute;
                width: 10px;
                height: 10px;
                background: #4af;
                border: 2px solid white;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .keyframe-marker:hover {
                transform: translate(-50%, -50%) scale(1.3);
                background: #6cf;
            }
            .keyframe-marker.selected {
                background: #ff0;
                border-color: #ff0;
            }
            .timeline-track {
                height: 40px;
                border-bottom: 1px solid rgba(68, 170, 255, 0.2);
                position: relative;
                display: flex;
                align-items: center;
                padding-left: 10px;
            }
            .timeline-track-label {
                width: 150px;
                font-size: 12px;
                color: #aaa;
            }
            .timeline-track-content {
                flex: 1;
                height: 100%;
                position: relative;
            }
        `;
        document.head.appendChild(style);

        this.updateTimeRuler();
    }

    setupEventListeners() {
        // Play/Pause
        document.getElementById('timeline-play').addEventListener('click', () => {
            this.togglePlayback();
        });

        // Stop
        document.getElementById('timeline-stop').addEventListener('click', () => {
            this.stop();
        });

        // Record
        document.getElementById('timeline-record').addEventListener('click', () => {
            this.recordKeyframe();
        });

        // Delete
        document.getElementById('timeline-delete').addEventListener('click', () => {
            this.deleteSelectedKeyframes();
        });

        // Speed
        document.getElementById('timeline-speed').addEventListener('change', (e) => {
            this.playbackSpeed = parseFloat(e.target.value);
        });

        // Loop
        document.getElementById('timeline-loop').addEventListener('change', (e) => {
            this.loop = e.target.checked;
        });

        // Duration
        document.getElementById('timeline-duration').addEventListener('change', (e) => {
            this.duration = parseInt(e.target.value);
            this.updateTimeRuler();
        });

        // Close
        document.getElementById('timeline-close').addEventListener('click', () => {
            this.hide();
        });

        // Click on time ruler to seek
        this.timeRuler.addEventListener('click', (e) => {
            const rect = this.timeRuler.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = x / rect.width;
            this.currentTime = percent * this.duration;
            this.updatePlayhead();
            this.applyAnimationAtTime(this.currentTime);
        });
    }

    show() {
        this.panel.style.display = 'flex';
        this.updateTracks();
    }

    hide() {
        this.panel.style.display = 'none';
        this.stop();
    }

    toggle() {
        if (this.panel.style.display === 'none') {
            this.show();
        } else {
            this.hide();
        }
    }

    updateTimeRuler() {
        this.timeRuler.innerHTML = '';
        const steps = 10;
        const stepTime = this.duration / steps;

        for (let i = 0; i <= steps; i++) {
            const marker = document.createElement('div');
            marker.style.cssText = `
                position: absolute;
                left: ${(i / steps) * 100}%;
                top: 0;
                height: 100%;
                border-left: 1px solid rgba(68, 170, 255, 0.3);
                font-size: 10px;
                color: #888;
                padding-left: 3px;
                padding-top: 2px;
            `;
            marker.textContent = `${(i * stepTime).toFixed(1)}s`;
            this.timeRuler.appendChild(marker);
        }
    }

    updateTracks() {
        this.tracksContainer.innerHTML = '';

        // Get all objects that can be animated
        const objects = [...(window.actors || []), ...(window.props || [])];

        objects.forEach(obj => {
            const track = document.createElement('div');
            track.className = 'timeline-track';

            const label = document.createElement('div');
            label.className = 'timeline-track-label';
            label.textContent = obj.userData.name || 'Unnamed';

            const content = document.createElement('div');
            content.className = 'timeline-track-content';

            // Add keyframe markers for this object
            this.keyframes
                .filter(kf => kf.objectId === obj.userData.id)
                .forEach(kf => {
                    const marker = this.createKeyframeMarker(kf, content);
                    content.appendChild(marker);
                });

            track.appendChild(label);
            track.appendChild(content);
            this.tracksContainer.appendChild(track);
        });
    }

    createKeyframeMarker(keyframe, container) {
        const marker = document.createElement('div');
        marker.className = 'keyframe-marker';
        marker.dataset.keyframeId = keyframe.id;

        const percent = (keyframe.time / this.duration) * 100;
        marker.style.left = `${percent}%`;
        marker.style.top = '50%';

        marker.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectKeyframe(keyframe);
        });

        marker.title = `${keyframe.time.toFixed(2)}s\n${keyframe.property}`;

        return marker;
    }

    recordKeyframe() {
        // Record current state of all selected objects
        const selectedObjects = this.getSelectedObjects();

        if (selectedObjects.length === 0) {
            alert('Please select an actor or prop to record');
            return;
        }

        selectedObjects.forEach(obj => {
            const keyframe = {
                id: `kf_${Date.now()}_${Math.random()}`,
                objectId: obj.userData.id,
                time: this.currentTime,
                property: 'transform',
                value: {
                    position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
                    rotation: { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z },
                    scale: { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z }
                }
            };

            this.keyframes.push(keyframe);
        });

        // Sort keyframes by time
        this.keyframes.sort((a, b) => a.time - b.time);

        this.updateTracks();
        console.log(`Recorded ${selectedObjects.length} keyframe(s) at ${this.currentTime.toFixed(2)}s`);
    }

    getSelectedObjects() {
        // Get currently selected actors/props
        const selected = [];

        if (window.selectedActor) {
            selected.push(window.selectedActor);
        }
        if (window.selectedProp) {
            selected.push(window.selectedProp);
        }

        return selected;
    }

    selectKeyframe(keyframe) {
        // Clear previous selection
        document.querySelectorAll('.keyframe-marker').forEach(m => {
            m.classList.remove('selected');
        });

        // Select this keyframe
        const marker = document.querySelector(`[data-keyframe-id="${keyframe.id}"]`);
        if (marker) {
            marker.classList.add('selected');
        }

        this.selectedKeyframe = keyframe;
    }

    deleteSelectedKeyframes() {
        if (!this.selectedKeyframe) {
            alert('No keyframe selected');
            return;
        }

        this.keyframes = this.keyframes.filter(kf => kf.id !== this.selectedKeyframe.id);
        this.selectedKeyframe = null;
        this.updateTracks();
    }

    togglePlayback() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        if (this.keyframes.length === 0) {
            alert('No keyframes to play. Record some keyframes first!');
            return;
        }

        this.isPlaying = true;
        document.getElementById('timeline-play').textContent = '⏸️';

        // Store original states
        this.storeOriginalStates();

        // Start animation loop
        this.lastFrameTime = performance.now();
        this.animationFrame = requestAnimationFrame(() => this.updateAnimation());
    }

    pause() {
        this.isPlaying = false;
        document.getElementById('timeline-play').textContent = '▶️';

        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }

    stop() {
        this.pause();
        this.currentTime = 0;
        this.updatePlayhead();
        this.restoreOriginalStates();
    }

    storeOriginalStates() {
        this.originalStates.clear();

        [...(window.actors || []), ...(window.props || [])].forEach(obj => {
            this.originalStates.set(obj.userData.id, {
                position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
                rotation: { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z },
                scale: { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z }
            });
        });
    }

    restoreOriginalStates() {
        [...(window.actors || []), ...(window.props || [])].forEach(obj => {
            const original = this.originalStates.get(obj.userData.id);
            if (original) {
                obj.position.set(original.position.x, original.position.y, original.position.z);
                obj.rotation.set(original.rotation.x, original.rotation.y, original.rotation.z);
                obj.scale.set(original.scale.x, original.scale.y, original.scale.z);
            }
        });
    }

    updateAnimation() {
        if (!this.isPlaying) return;

        const now = performance.now();
        const deltaTime = (now - this.lastFrameTime) / 1000; // Convert to seconds
        this.lastFrameTime = now;

        // Update current time
        this.currentTime += deltaTime * this.playbackSpeed;

        // Check if we've reached the end
        if (this.currentTime >= this.duration) {
            if (this.loop) {
                this.currentTime = 0;
            } else {
                this.stop();
                return;
            }
        }

        // Apply animation at current time
        this.applyAnimationAtTime(this.currentTime);

        // Update UI
        this.updatePlayhead();

        // Continue animation loop
        this.animationFrame = requestAnimationFrame(() => this.updateAnimation());
    }

    applyAnimationAtTime(time) {
        // Group keyframes by object
        const objectKeyframes = new Map();

        this.keyframes.forEach(kf => {
            if (!objectKeyframes.has(kf.objectId)) {
                objectKeyframes.set(kf.objectId, []);
            }
            objectKeyframes.get(kf.objectId).push(kf);
        });

        // Apply animation to each object
        objectKeyframes.forEach((keyframes, objectId) => {
            const obj = this.findObjectById(objectId);
            if (!obj) return;

            // Find surrounding keyframes
            let prevKeyframe = null;
            let nextKeyframe = null;

            for (let i = 0; i < keyframes.length; i++) {
                if (keyframes[i].time <= time) {
                    prevKeyframe = keyframes[i];
                }
                if (keyframes[i].time > time && !nextKeyframe) {
                    nextKeyframe = keyframes[i];
                    break;
                }
            }

            // Interpolate between keyframes
            if (prevKeyframe && nextKeyframe) {
                const t = (time - prevKeyframe.time) / (nextKeyframe.time - prevKeyframe.time);
                this.interpolate(obj, prevKeyframe.value, nextKeyframe.value, t);
            } else if (prevKeyframe) {
                // Just use the previous keyframe
                this.applyValue(obj, prevKeyframe.value);
            } else if (nextKeyframe) {
                // Just use the next keyframe
                this.applyValue(obj, nextKeyframe.value);
            }
        });
    }

    interpolate(obj, startValue, endValue, t) {
        // Linear interpolation (lerp)
        obj.position.x = startValue.position.x + (endValue.position.x - startValue.position.x) * t;
        obj.position.y = startValue.position.y + (endValue.position.y - startValue.position.y) * t;
        obj.position.z = startValue.position.z + (endValue.position.z - startValue.position.z) * t;

        obj.rotation.x = startValue.rotation.x + (endValue.rotation.x - startValue.rotation.x) * t;
        obj.rotation.y = startValue.rotation.y + (endValue.rotation.y - startValue.rotation.y) * t;
        obj.rotation.z = startValue.rotation.z + (endValue.rotation.z - startValue.rotation.z) * t;

        obj.scale.x = startValue.scale.x + (endValue.scale.x - startValue.scale.x) * t;
        obj.scale.y = startValue.scale.y + (endValue.scale.y - startValue.scale.y) * t;
        obj.scale.z = startValue.scale.z + (endValue.scale.z - startValue.scale.z) * t;
    }

    applyValue(obj, value) {
        obj.position.set(value.position.x, value.position.y, value.position.z);
        obj.rotation.set(value.rotation.x, value.rotation.y, value.rotation.z);
        obj.scale.set(value.scale.x, value.scale.y, value.scale.z);
    }

    findObjectById(id) {
        const all = [...(window.actors || []), ...(window.props || [])];
        return all.find(obj => obj.userData.id === id);
    }

    updatePlayhead() {
        const percent = (this.currentTime / this.duration) * 100;
        this.playhead.style.left = `${percent}%`;

        const timeDisplay = document.getElementById('timeline-time-display');
        if (timeDisplay) {
            timeDisplay.textContent = `${this.currentTime.toFixed(2)}s / ${this.duration.toFixed(2)}s`;
        }
    }

    // Export/Import
    exportTimeline() {
        return {
            version: '1.0',
            duration: this.duration,
            keyframes: this.keyframes
        };
    }

    importTimeline(data) {
        if (data.version !== '1.0') {
            console.warn('Timeline version mismatch');
        }

        this.duration = data.duration;
        this.keyframes = data.keyframes;
        this.updateTimeRuler();
        this.updateTracks();
    }

    clearTimeline() {
        if (confirm('Clear all keyframes?')) {
            this.keyframes = [];
            this.currentTime = 0;
            this.updateTracks();
            this.updatePlayhead();
        }
    }
}

// Global instance
const animationTimeline = new AnimationTimeline();

// Expose to global scope
window.animationTimeline = animationTimeline;

// Add keyboard shortcut (Shift+A) to toggle timeline
document.addEventListener('keydown', (e) => {
    if (e.shiftKey && e.key === 'A') {
        animationTimeline.toggle();
    }
});
