# VRM Actor Pipeline Setup

## Overview
Professional VRM actor system with Node.js build pipeline for the 3D Theater Stage.

## Phase 1: Node.js Module System ✅

### Completed
- [x] Initialized Node.js project with ES6 modules
- [x] Installed three@0.169.0 and @pixiv/three-vrm@3.4.1
- [x] Created VRMBuilder class with proper module imports
- [x] Built VRMDevServer for downloading and processing VRM files
- [x] Set up build scripts and directory structure

### File Structure
```
├── package.json (ES6 modules enabled)
├── build/
│   ├── vrm-builder.js     # Core VRM building logic
│   └── dev-server.js      # Downloads and processes VRM files
├── models/vrm/            # Downloaded VRM files
└── js/actors/             # Generated actor configurations
```

## Phase 2: VRM File Management (Next)

### Todo List
- [ ] Download actual VRM character files
- [ ] Set up local file serving with CORS
- [ ] Test VRM loading with real files
- [ ] Build actor library JSON configs

### Available VRM Sources
1. **VRoid Hub** - Free community VRM characters
2. **Pixiv VRM Samples** - Official test models
3. **VRChat Public Models** - Community avatars
4. **Custom VRM Creation** - VRoid Studio

## Build Commands

```bash
# Download and build VRM actors
npm run dev

# Serve files locally
npm run serve

# Build production bundle (future)
npm run build
```

## Backup Plan: GLB Characters

If VRM pipeline fails, fallback to Mixamo GLB characters:
- Download rigged characters from Mixamo
- Convert to GLB format
- Load with existing GLTFLoader
- Faster, more reliable option

## Status: Phase 1 Complete ✅

Ready to move to Phase 2: VRM file downloading and testing.