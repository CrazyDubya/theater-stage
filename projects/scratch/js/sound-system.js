/**
 * Sound System with Audio Cue Management for Theater-Stage
 * Manages background music, sound effects, and audio cues for theatrical productions
 */

class SoundSystem {
    constructor() {
        this.audioContext = null;
        this.sounds = new Map(); // soundId -> { audio, name, type, volume }
        this.cues = []; // Array of { time, soundId, action }
        this.masterVolume = 1.0;
        this.isPlaying = false;
        this.currentCueIndex = 0;

        // Sound categories
        this.categories = {
            music: 'Background Music',
            sfx: 'Sound Effects',
            ambient: 'Ambient',
            voice: 'Voice/Dialogue'
        };

        this.panel = null;
        this.init();
    }

    init() {
        // Initialize Web Audio API
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.error('Web Audio API not supported', e);
        }

        this.createUI();
        this.loadDefaultSounds();
    }

    createUI() {
        // Main sound panel
        this.panel = document.createElement('div');
        this.panel.id = 'sound-system-panel';
        this.panel.style.cssText = `
            position: fixed;
            top: 100px;
            right: 10px;
            width: 350px;
            max-height: 600px;
            background: linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%);
            border: 1px solid rgba(68, 170, 255, 0.3);
            border-radius: 8px;
            color: white;
            font-family: Arial, sans-serif;
            display: none;
            flex-direction: column;
            z-index: 9500;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        `;

        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 12px 15px;
            background: rgba(0, 0, 0, 0.3);
            border-bottom: 1px solid rgba(68, 170, 255, 0.3);
            display: flex;
            align-items: center;
            justify-content: space-between;
        `;
        header.innerHTML = `
            <h3 style="margin: 0; font-size: 16px;">🔊 Sound System</h3>
            <button id="sound-close" style="background: transparent; border: none; color: white; font-size: 18px; cursor: pointer;">✖️</button>
        `;
        this.panel.appendChild(header);

        // Master volume control
        const masterVolumeContainer = document.createElement('div');
        masterVolumeContainer.style.cssText = `
            padding: 12px 15px;
            background: rgba(0, 0, 0, 0.2);
            border-bottom: 1px solid rgba(68, 170, 255, 0.2);
        `;
        masterVolumeContainer.innerHTML = `
            <label style="font-size: 12px; display: flex; align-items: center; gap: 10px;">
                <span style="min-width: 80px;">Master Volume:</span>
                <input type="range" id="master-volume" min="0" max="100" value="100" style="flex: 1;">
                <span id="master-volume-value" style="min-width: 35px; text-align: right;">100%</span>
            </label>
        `;
        this.panel.appendChild(masterVolumeContainer);

        // Tabs
        const tabs = document.createElement('div');
        tabs.style.cssText = `
            display: flex;
            background: rgba(0, 0, 0, 0.2);
            border-bottom: 1px solid rgba(68, 170, 255, 0.3);
        `;
        tabs.innerHTML = `
            <button class="sound-tab active" data-tab="library">Sound Library</button>
            <button class="sound-tab" data-tab="cues">Cue List</button>
            <button class="sound-tab" data-tab="upload">Upload</button>
        `;
        this.panel.appendChild(tabs);

        // Tab content container
        const tabContent = document.createElement('div');
        tabContent.id = 'sound-tab-content';
        tabContent.style.cssText = `
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
        `;
        this.panel.appendChild(tabContent);

        // Sound Library Tab
        const libraryTab = document.createElement('div');
        libraryTab.className = 'tab-pane active';
        libraryTab.dataset.tab = 'library';
        libraryTab.style.cssText = 'padding: 15px;';
        libraryTab.innerHTML = `
            <div id="sound-library-list"></div>
        `;
        tabContent.appendChild(libraryTab);

        // Cue List Tab
        const cuesTab = document.createElement('div');
        cuesTab.className = 'tab-pane';
        cuesTab.dataset.tab = 'cues';
        cuesTab.style.cssText = 'padding: 15px; display: none;';
        cuesTab.innerHTML = `
            <button id="add-cue-btn" style="width: 100%; padding: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; color: white; border-radius: 4px; cursor: pointer; margin-bottom: 15px;">+ Add Cue</button>
            <div id="cue-list"></div>
        `;
        tabContent.appendChild(cuesTab);

        // Upload Tab
        const uploadTab = document.createElement('div');
        uploadTab.className = 'tab-pane';
        uploadTab.dataset.tab = 'upload';
        uploadTab.style.cssText = 'padding: 15px; display: none;';
        uploadTab.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <p style="margin-bottom: 15px; color: #aaa;">Upload your own audio files (MP3, WAV, OGG)</p>
                <input type="file" id="audio-file-input" accept="audio/*" style="display: none;">
                <button id="upload-audio-btn" style="padding: 10px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; color: white; border-radius: 4px; cursor: pointer;">Choose File</button>
                <div id="upload-status" style="margin-top: 15px; font-size: 12px; color: #4af;"></div>
            </div>
            <div style="margin-top: 20px;">
                <h4 style="margin-bottom: 10px; font-size: 14px;">Sound Details</h4>
                <label style="display: block; margin-bottom: 10px; font-size: 12px;">
                    Name:
                    <input type="text" id="sound-name-input" placeholder="Sound name" style="width: 100%; padding: 6px; margin-top: 5px; background: rgba(255,255,255,0.1); border: 1px solid rgba(68,170,255,0.3); color: white; border-radius: 3px;">
                </label>
                <label style="display: block; margin-bottom: 10px; font-size: 12px;">
                    Category:
                    <select id="sound-category-input" style="width: 100%; padding: 6px; margin-top: 5px; background: rgba(255,255,255,0.1); border: 1px solid rgba(68,170,255,0.3); color: white; border-radius: 3px;">
                        <option value="music">Background Music</option>
                        <option value="sfx">Sound Effects</option>
                        <option value="ambient">Ambient</option>
                        <option value="voice">Voice/Dialogue</option>
                    </select>
                </label>
            </div>
        `;
        tabContent.appendChild(uploadTab);

        document.body.appendChild(this.panel);

        // Add CSS styles
        const style = document.createElement('style');
        style.textContent = `
            .sound-tab {
                flex: 1;
                padding: 10px;
                background: transparent;
                border: none;
                border-bottom: 2px solid transparent;
                color: #aaa;
                cursor: pointer;
                font-size: 13px;
                transition: all 0.2s ease;
            }
            .sound-tab:hover {
                color: white;
                background: rgba(255, 255, 255, 0.05);
            }
            .sound-tab.active {
                color: #4af;
                border-bottom-color: #4af;
            }
            .sound-item {
                padding: 10px;
                margin-bottom: 8px;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(68, 170, 255, 0.2);
                border-radius: 4px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .sound-item:hover {
                background: rgba(68, 170, 255, 0.1);
            }
            .sound-item-info {
                flex: 1;
                min-width: 0;
            }
            .sound-item-name {
                font-size: 13px;
                font-weight: bold;
                margin-bottom: 3px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .sound-item-category {
                font-size: 11px;
                color: #888;
            }
            .sound-item-controls {
                display: flex;
                gap: 5px;
            }
            .sound-btn {
                padding: 5px 10px;
                background: rgba(68, 170, 255, 0.3);
                border: 1px solid rgba(68, 170, 255, 0.5);
                color: white;
                border-radius: 3px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s ease;
            }
            .sound-btn:hover {
                background: rgba(68, 170, 255, 0.5);
            }
            .sound-btn.playing {
                background: rgba(0, 255, 0, 0.3);
                border-color: rgba(0, 255, 0, 0.5);
            }
            .cue-item {
                padding: 8px;
                margin-bottom: 6px;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(68, 170, 255, 0.2);
                border-radius: 4px;
                font-size: 12px;
            }
            .cue-item-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
            }
            .cue-item-time {
                color: #4af;
                font-weight: bold;
            }
            .cue-item-actions {
                display: flex;
                gap: 5px;
            }
        `;
        document.head.appendChild(style);

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Close button
        document.getElementById('sound-close').addEventListener('click', () => {
            this.hide();
        });

        // Master volume
        document.getElementById('master-volume').addEventListener('input', (e) => {
            this.masterVolume = parseInt(e.target.value) / 100;
            document.getElementById('master-volume-value').textContent = `${e.target.value}%`;
            this.updateAllVolumes();
        });

        // Tab switching
        document.querySelectorAll('.sound-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Upload button
        document.getElementById('upload-audio-btn').addEventListener('click', () => {
            document.getElementById('audio-file-input').click();
        });

        document.getElementById('audio-file-input').addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0]);
        });

        // Add cue button
        document.getElementById('add-cue-btn').addEventListener('click', () => {
            this.addCue();
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.sound-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update tab panes
        document.querySelectorAll('.tab-pane').forEach(pane => {
            if (pane.dataset.tab === tabName) {
                pane.style.display = 'block';
            } else {
                pane.style.display = 'none';
            }
        });
    }

    show() {
        this.panel.style.display = 'flex';
        this.updateSoundLibrary();
    }

    hide() {
        this.panel.style.display = 'none';
    }

    toggle() {
        if (this.panel.style.display === 'none') {
            this.show();
        } else {
            this.hide();
        }
    }

    loadDefaultSounds() {
        // Add some default placeholder sounds (would be actual audio files in production)
        this.addSound('default-music-1', 'Dramatic Theme', 'music', null);
        this.addSound('default-music-2', 'Light Background', 'music', null);
        this.addSound('default-sfx-1', 'Door Knock', 'sfx', null);
        this.addSound('default-sfx-2', 'Applause', 'sfx', null);
        this.addSound('default-ambient-1', 'Rain', 'ambient', null);
        this.addSound('default-ambient-2', 'City Street', 'ambient', null);
    }

    addSound(id, name, category, audioElement) {
        this.sounds.set(id, {
            audio: audioElement,
            name: name,
            category: category,
            volume: 1.0,
            loop: false
        });

        this.updateSoundLibrary();
    }

    updateSoundLibrary() {
        const list = document.getElementById('sound-library-list');
        if (!list) return;

        list.innerHTML = '';

        // Group by category
        const byCategory = new Map();
        this.sounds.forEach((sound, id) => {
            if (!byCategory.has(sound.category)) {
                byCategory.set(sound.category, []);
            }
            byCategory.get(sound.category).push({ id, ...sound });
        });

        // Display by category
        byCategory.forEach((sounds, category) => {
            const categoryHeader = document.createElement('div');
            categoryHeader.style.cssText = 'font-size: 12px; color: #4af; margin-top: 15px; margin-bottom: 8px; font-weight: bold;';
            categoryHeader.textContent = this.categories[category] || category;
            list.appendChild(categoryHeader);

            sounds.forEach(sound => {
                const item = document.createElement('div');
                item.className = 'sound-item';
                item.innerHTML = `
                    <div class="sound-item-info">
                        <div class="sound-item-name">${sound.name}</div>
                        <div class="sound-item-category">${this.categories[sound.category]}</div>
                    </div>
                    <div class="sound-item-controls">
                        <button class="sound-btn" data-action="play" data-sound-id="${sound.id}">▶️</button>
                        <button class="sound-btn" data-action="stop" data-sound-id="${sound.id}">⏹️</button>
                        <button class="sound-btn" data-action="delete" data-sound-id="${sound.id}">🗑️</button>
                    </div>
                `;

                // Event listeners for buttons
                item.querySelector('[data-action="play"]').addEventListener('click', () => {
                    this.playSound(sound.id);
                });
                item.querySelector('[data-action="stop"]').addEventListener('click', () => {
                    this.stopSound(sound.id);
                });
                item.querySelector('[data-action="delete"]').addEventListener('click', () => {
                    if (confirm(`Delete "${sound.name}"?`)) {
                        this.sounds.delete(sound.id);
                        this.updateSoundLibrary();
                    }
                });

                list.appendChild(item);
            });
        });

        if (this.sounds.size === 0) {
            list.innerHTML = '<div style="text-align: center; color: #888; padding: 40px;">No sounds loaded</div>';
        }
    }

    playSound(id) {
        const sound = this.sounds.get(id);
        if (!sound) return;

        if (sound.audio) {
            sound.audio.volume = sound.volume * this.masterVolume;
            sound.audio.currentTime = 0;
            sound.audio.play();
        } else {
            console.warn(`Sound "${id}" has no audio source - placeholder only`);
            alert(`This is a placeholder sound. In production, this would play "${sound.name}".`);
        }
    }

    stopSound(id) {
        const sound = this.sounds.get(id);
        if (!sound || !sound.audio) return;

        sound.audio.pause();
        sound.audio.currentTime = 0;
    }

    updateAllVolumes() {
        this.sounds.forEach((sound, id) => {
            if (sound.audio) {
                sound.audio.volume = sound.volume * this.masterVolume;
            }
        });
    }

    handleFileUpload(file) {
        if (!file) return;

        const reader = new FileReader();
        const statusDiv = document.getElementById('upload-status');

        statusDiv.textContent = 'Loading...';

        reader.onload = (e) => {
            const audio = new Audio();
            audio.src = e.target.result;

            audio.onloadedmetadata = () => {
                const name = document.getElementById('sound-name-input').value || file.name.replace(/\.[^/.]+$/, '');
                const category = document.getElementById('sound-category-input').value;
                const id = `custom-${Date.now()}`;

                this.addSound(id, name, category, audio);

                statusDiv.textContent = `✓ Loaded: ${name}`;
                document.getElementById('sound-name-input').value = '';

                setTimeout(() => {
                    statusDiv.textContent = '';
                }, 3000);

                // Switch to library tab to show the new sound
                this.switchTab('library');
            };

            audio.onerror = () => {
                statusDiv.textContent = '✗ Failed to load audio file';
                statusDiv.style.color = '#f44';
            };
        };

        reader.readAsDataURL(file);
    }

    addCue() {
        const cue = {
            id: `cue-${Date.now()}`,
            time: window.animationTimeline ? window.animationTimeline.currentTime : 0,
            soundId: Array.from(this.sounds.keys())[0] || null,
            action: 'play', // 'play', 'stop', 'pause'
            volume: 1.0
        };

        this.cues.push(cue);
        this.cues.sort((a, b) => a.time - b.time);

        this.updateCueList();
    }

    updateCueList() {
        const list = document.getElementById('cue-list');
        if (!list) return;

        list.innerHTML = '';

        if (this.cues.length === 0) {
            list.innerHTML = '<div style="text-align: center; color: #888; padding: 20px;">No cues added yet</div>';
            return;
        }

        this.cues.forEach(cue => {
            const sound = this.sounds.get(cue.soundId);
            const soundName = sound ? sound.name : 'Unknown';

            const item = document.createElement('div');
            item.className = 'cue-item';
            item.innerHTML = `
                <div class="cue-item-header">
                    <span class="cue-item-time">${cue.time.toFixed(2)}s</span>
                    <div class="cue-item-actions">
                        <button class="sound-btn" data-action="edit-cue" data-cue-id="${cue.id}">✏️</button>
                        <button class="sound-btn" data-action="delete-cue" data-cue-id="${cue.id}">🗑️</button>
                    </div>
                </div>
                <div>${cue.action.toUpperCase()}: ${soundName}</div>
            `;

            item.querySelector('[data-action="delete-cue"]').addEventListener('click', () => {
                this.cues = this.cues.filter(c => c.id !== cue.id);
                this.updateCueList();
            });

            list.appendChild(item);
        });
    }

    // Integration with animation timeline
    processCuesAtTime(time) {
        this.cues.forEach(cue => {
            // Check if we've crossed this cue's time
            if (Math.abs(cue.time - time) < 0.1) { // 100ms tolerance
                this.executeCue(cue);
            }
        });
    }

    executeCue(cue) {
        switch (cue.action) {
            case 'play':
                this.playSound(cue.soundId);
                break;
            case 'stop':
                this.stopSound(cue.soundId);
                break;
            case 'pause':
                // Pause implementation
                break;
        }
    }

    // Export/Import
    exportSoundData() {
        return {
            version: '1.0',
            masterVolume: this.masterVolume,
            sounds: Array.from(this.sounds.entries()).map(([id, sound]) => ({
                id,
                name: sound.name,
                category: sound.category,
                volume: sound.volume,
                loop: sound.loop
                // Note: actual audio data not exported
            })),
            cues: this.cues
        };
    }

    importSoundData(data) {
        if (data.masterVolume !== undefined) {
            this.masterVolume = data.masterVolume;
            document.getElementById('master-volume').value = this.masterVolume * 100;
            document.getElementById('master-volume-value').textContent = `${Math.round(this.masterVolume * 100)}%`;
        }

        if (data.cues) {
            this.cues = data.cues;
            this.updateCueList();
        }
    }
}

// Global instance
const soundSystem = new SoundSystem();

// Expose to global scope
window.soundSystem = soundSystem;

// Add keyboard shortcut (Shift+S) to toggle sound panel
document.addEventListener('keydown', (e) => {
    if (e.shiftKey && e.key === 'S') {
        soundSystem.toggle();
    }
});
