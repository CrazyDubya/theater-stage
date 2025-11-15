# Sound System Documentation

## Overview

The theater stage includes a comprehensive 3D positional audio system built on the Web Audio API. This system provides spatial audio capabilities, allowing sounds to originate from specific locations on the stage, creating an immersive theatrical experience.

## Features

### 1. 3D Positional Audio
Sounds can be positioned anywhere in 3D space on the stage. The audio system uses HRTF (Head-Related Transfer Function) for realistic spatial audio that changes based on:
- Distance from the listener (camera)
- Direction relative to the listener
- The listener's orientation

### 2. Audio Categories
The system organizes audio into three categories, each with independent volume control:

- **Background**: For ambient sounds and background music (default volume: 0.5)
- **Effects**: For sound effects and one-time audio events (default volume: 0.7)
- **Voices**: For actor dialog and narration (default volume: 0.8)

### 3. Volume Controls
- **Master Volume**: Controls overall audio level (0.0 to 1.0)
- **Category Volumes**: Independent control for background, effects, and voices
- Real-time volume adjustment that affects all playing sounds

### 4. Audio Cue System
Schedule audio events to trigger at specific times, useful for:
- Synchronized performances
- Timed sound effects
- Scripted audio sequences

### 5. Audio Management
- Pause/Resume all audio playback
- Stop all sounds at once
- Per-sound control (stop individual sounds)
- Automatic cleanup of finished sounds

## API Reference

### SoundSystem Class

#### Initialization
```javascript
const soundSystem = new SoundSystem();
soundSystem.initialize(); // Must be called after user interaction
```

#### Loading and Playing Sounds

**Load a sound file:**
```javascript
const sound = await soundSystem.loadSound(url, category, loop);
// url: string - URL to audio file
// category: 'background' | 'effects' | 'voices'
// loop: boolean - whether to loop the audio
```

**Play a sound:**
```javascript
soundSystem.playSound(sound, position, volume);
// sound: loaded sound object
// position: {x, y, z} or null for non-positional
// volume: 0.0 to 1.0
```

**Quick play methods:**
```javascript
// Background music/ambience
soundSystem.playBackground(url, volume);

// Sound effect at position
soundSystem.playSoundEffect(url, position, volume);

// Actor voice at position
soundSystem.playActorVoice(url, actorPosition, volume);
```

#### Volume Control
```javascript
// Set volume for a category
soundSystem.setVolume('master', 1.0);
soundSystem.setVolume('background', 0.5);
soundSystem.setVolume('effects', 0.7);
soundSystem.setVolume('voices', 0.8);
```

#### Audio Cues
```javascript
// Schedule a callback at a specific time
const triggerTime = Date.now() / 1000 + 5; // 5 seconds from now
soundSystem.scheduleAudioCue(triggerTime, () => {
    soundSystem.playSoundEffect('/sounds/applause.mp3', {x: 0, y: 0, z: 0});
});

// Update cues in animation loop
soundSystem.updateAudioCues(Date.now() / 1000);
```

#### Listener Position
```javascript
// Update listener (camera) position
soundSystem.updateListenerPosition(camera.position);

// With orientation
soundSystem.updateListenerPosition(camera.position, forwardVector, upVector);
```

#### Playback Control
```javascript
// Stop a specific sound
soundSystem.stopSound(sound);

// Stop all sounds in a category
soundSystem.stopCategory('effects');

// Stop all sounds
soundSystem.stopAll();

// Pause/Resume
soundSystem.suspend();
soundSystem.resume();
```

#### Sound Position Updates
```javascript
// For moving sound sources (e.g., actor speaking while walking)
soundSystem.updateSoundPosition(sound, newPosition);
```

## Usage Examples

### Example 1: Background Ambience
```javascript
// Play looping background music
soundSystem.playBackground('/audio/theater-ambience.mp3', 0.3);
```

### Example 2: Positional Sound Effect
```javascript
// Play door creak at stage left
const doorPosition = { x: -8, y: 1, z: 0 };
soundSystem.playSoundEffect('/audio/door-creak.mp3', doorPosition, 0.8);
```

### Example 3: Actor Dialog
```javascript
// Play actor voice at their position
const actor = actors[0]; // Get first actor
const actorPos = { x: actor.position.x, y: actor.position.y, z: actor.position.z };
soundSystem.playActorVoice('/audio/dialog/line1.mp3', actorPos, 1.0);
```

### Example 4: Scheduled Audio Cues
```javascript
// Create a sequence of applause sounds
const startTime = Date.now() / 1000;

soundSystem.scheduleAudioCue(startTime + 2, () => {
    soundSystem.playSoundEffect('/audio/applause1.mp3', {x: -5, y: 0, z: 10}, 0.8);
});

soundSystem.scheduleAudioCue(startTime + 2.5, () => {
    soundSystem.playSoundEffect('/audio/applause2.mp3', {x: 5, y: 0, z: 10}, 0.8);
});

soundSystem.scheduleAudioCue(startTime + 3, () => {
    soundSystem.playSoundEffect('/audio/applause3.mp3', {x: 0, y: 0, z: 12}, 0.9);
});
```

### Example 5: Moving Sound Source
```javascript
// Load a sound for a moving actor
const sound = await soundSystem.loadSound('/audio/footsteps.mp3', 'effects', true);
soundSystem.playSound(sound, actor.position, 0.6);

// In animation loop, update sound position as actor moves
function animate() {
    if (sound.isPlaying) {
        soundSystem.updateSoundPosition(sound, {
            x: actor.position.x,
            y: actor.position.y,
            z: actor.position.z
        });
    }
    requestAnimationFrame(animate);
}
```

## Integration with Stage

The sound system is automatically initialized when the stage loads, but requires a user gesture (click or key press) to activate due to browser autoplay policies.

### In the Animation Loop
```javascript
function animate() {
    // ... other animation code ...
    
    // Update sound listener position with camera
    if (soundSystem && soundSystem.initialized) {
        soundSystem.updateListenerPosition(camera.position);
        
        // Update any scheduled audio cues
        const currentTime = Date.now() / 1000;
        soundSystem.updateAudioCues(currentTime);
    }
    
    // ... render ...
}
```

## Browser Compatibility

The sound system uses the Web Audio API, which is supported in:
- Chrome/Edge 35+
- Firefox 25+
- Safari 14.1+
- Opera 22+

### Important Notes

1. **User Gesture Required**: Due to browser autoplay policies, the audio context must be initialized after a user interaction (click, tap, or key press).

2. **Audio File Formats**: Use widely supported formats like MP3, OGG, or WAV for best compatibility.

3. **Performance**: The 3D audio processing is efficient, but be mindful of:
   - Number of simultaneous sounds (generally < 32 is safe)
   - Audio file sizes (compress appropriately)
   - Update frequency for moving sounds

4. **CORS**: If loading audio from external URLs, ensure proper CORS headers are set.

## Troubleshooting

### Audio doesn't play
- Ensure `soundSystem.initialize()` has been called after a user gesture
- Check browser console for errors
- Verify audio file URLs are accessible
- Check that volume levels aren't set to 0

### Positional audio not working
- Verify position coordinates are reasonable (within audible range)
- Check that a position object is being passed to `playSound()`
- Ensure the listener position is being updated in the animation loop

### Audio cuts off or stutters
- Reduce number of simultaneous sounds
- Use compressed audio files
- Check system audio performance
- Increase `refDistance` on panner nodes for distant sounds

## Future Enhancements

Potential additions to the sound system:
- Audio visualization
- Reverb and environmental effects
- Audio ducking (automatic volume reduction)
- Preset audio scenes
- Integration with save/load system
- Audio recording and playback
- Doppler effect for moving sources
