/**
 * ActorMovement.js - Advanced Movement and Pathfinding for Theatrical Actors
 * 
 * Implements sophisticated movement capabilities including:
 * - Grid-based pathfinding with A* algorithm
 * - Smooth interpolation and animation
 * - Stage boundary respect and navigation
 * - Obstacle avoidance and dynamic re-routing
 * - Performance optimization for multiple actors
 * - Theater-specific movement patterns
 */

class ActorMovement {
    constructor(actorId, stageConfig = null) {
        this.actorId = actorId;
        this.stageConfig = stageConfig || this.getDefaultStageConfig();
        
        // Movement state
        this.currentPath = [];
        this.currentPathIndex = 0;
        this.isFollowingPath = false;
        
        // Movement parameters
        this.baseSpeed = 1.0; // units per second
        this.currentSpeed = 1.0;
        this.acceleration = 2.0; // speed change rate
        this.rotationSpeed = 3.0; // radians per second
        this.arrivalThreshold = 0.1; // distance to consider "arrived"
        this.pathUpdateInterval = 500; // ms between path recalculations
        
        // Pathfinding grid
        this.gridSize = 0.5; // grid cell size in world units
        this.pathfindingGrid = null;
        this.lastPathfindTime = 0;
        
        // Smoothing and interpolation
        this.smoothingFactor = 0.1; // for velocity smoothing
        this.lookAheadDistance = 1.0; // for smooth turning
        
        // Performance optimization
        this.lastUpdateTime = 0;
        this.updateFrequency = 30; // updates per second for pathfinding
        
        // Movement history for debugging
        this.movementHistory = [];
        this.maxHistoryLength = 50;
        
        // Initialize pathfinding grid
        this.initializePathfindingGrid();
        
        console.log(`🗺️ ActorMovement created for actor ${actorId}`);
    }
    
    /**
     * Get default stage configuration
     */
    getDefaultStageConfig() {
        return {
            bounds: {
                minX: -10,
                maxX: 10,
                minZ: -10,
                maxZ: 10
            },
            obstacles: [], // Will be populated from stage state
            stageMarkers: [], // Will be populated from stage state
            restrictedAreas: [] // Areas actors shouldn't enter
        };
    }
    
    /**
     * Initialize pathfinding grid
     */
    initializePathfindingGrid() {
        const bounds = this.stageConfig.bounds;
        const cellsX = Math.ceil((bounds.maxX - bounds.minX) / this.gridSize);
        const cellsZ = Math.ceil((bounds.maxZ - bounds.minZ) / this.gridSize);
        
        this.pathfindingGrid = {
            cellsX: cellsX,
            cellsZ: cellsZ,
            originX: bounds.minX,
            originZ: bounds.minZ,
            cells: new Array(cellsX * cellsZ).fill(0) // 0 = walkable, 1 = obstacle
        };
        
        console.log(`🗺️ Pathfinding grid initialized: ${cellsX}x${cellsZ} cells`);
    }
    
    /**
     * Update stage configuration and obstacles
     */
    updateStageConfig(stageState) {
        if (!stageState) return;
        
        // Update obstacles from stage props and elements
        const obstacles = [];
        
        // Add stage props as obstacles
        if (stageState.objects && stageState.objects.props) {
            stageState.objects.props.forEach(prop => {
                if (prop.position) {
                    obstacles.push({
                        x: prop.position.x,
                        z: prop.position.z,
                        radius: prop.userData?.radius || 0.5
                    });
                }
            });
        }
        
        // Add other actors as dynamic obstacles
        if (stageState.objects && stageState.objects.actors) {
            stageState.objects.actors.forEach(actor => {
                if (actor.userData?.id !== this.actorId && actor.position) {
                    obstacles.push({
                        x: actor.position.x,
                        z: actor.position.z,
                        radius: 0.3, // Actor collision radius
                        dynamic: true,
                        actorId: actor.userData.id
                    });
                }
            });
        }
        
        this.stageConfig.obstacles = obstacles;
        this.updatePathfindingGrid();
    }
    
    /**
     * Update pathfinding grid with current obstacles
     */
    updatePathfindingGrid() {
        // Reset grid
        this.pathfindingGrid.cells.fill(0);
        
        // Mark obstacle cells
        this.stageConfig.obstacles.forEach(obstacle => {
            this.markObstacleInGrid(obstacle.x, obstacle.z, obstacle.radius);
        });
        
        // Mark restricted areas
        this.stageConfig.restrictedAreas.forEach(area => {
            this.markAreaInGrid(area, 1);
        });
    }
    
    /**
     * Mark obstacle in pathfinding grid
     */
    markObstacleInGrid(x, z, radius) {
        const grid = this.pathfindingGrid;
        const cellRadius = Math.ceil(radius / this.gridSize);
        
        const centerCellX = Math.floor((x - grid.originX) / this.gridSize);
        const centerCellZ = Math.floor((z - grid.originZ) / this.gridSize);
        
        for (let dx = -cellRadius; dx <= cellRadius; dx++) {
            for (let dz = -cellRadius; dz <= cellRadius; dz++) {
                const cellX = centerCellX + dx;
                const cellZ = centerCellZ + dz;
                
                if (cellX >= 0 && cellX < grid.cellsX && cellZ >= 0 && cellZ < grid.cellsZ) {
                    const distance = Math.sqrt(dx * dx + dz * dz) * this.gridSize;
                    if (distance <= radius) {
                        const index = cellZ * grid.cellsX + cellX;
                        this.pathfindingGrid.cells[index] = 1;
                    }
                }
            }
        }
    }
    
    /**
     * Mark rectangular area in grid
     */
    markAreaInGrid(area, value) {
        const grid = this.pathfindingGrid;
        
        const startCellX = Math.floor((area.minX - grid.originX) / this.gridSize);
        const endCellX = Math.floor((area.maxX - grid.originX) / this.gridSize);
        const startCellZ = Math.floor((area.minZ - grid.originZ) / this.gridSize);
        const endCellZ = Math.floor((area.maxZ - grid.originZ) / this.gridSize);
        
        for (let cellX = Math.max(0, startCellX); cellX <= Math.min(grid.cellsX - 1, endCellX); cellX++) {
            for (let cellZ = Math.max(0, startCellZ); cellZ <= Math.min(grid.cellsZ - 1, endCellZ); cellZ++) {
                const index = cellZ * grid.cellsX + cellX;
                this.pathfindingGrid.cells[index] = value;
            }
        }
    }
    
    /**
     * Find path from current position to target using A* algorithm
     */
    findPath(startX, startZ, targetX, targetZ) {
        const grid = this.pathfindingGrid;
        
        // Convert world coordinates to grid coordinates
        const startCellX = Math.floor((startX - grid.originX) / this.gridSize);
        const startCellZ = Math.floor((startZ - grid.originZ) / this.gridSize);
        let targetCellX = Math.floor((targetX - grid.originX) / this.gridSize);
        let targetCellZ = Math.floor((targetZ - grid.originZ) / this.gridSize);
        
        // Validate coordinates
        if (!this.isValidCell(startCellX, startCellZ) || !this.isValidCell(targetCellX, targetCellZ)) {
            console.warn(`🗺️ Actor ${this.actorId}: Invalid pathfinding coordinates`);
            return null;
        }
        
        // If target is blocked, find nearest walkable cell
        if (this.isCellBlocked(targetCellX, targetCellZ)) {
            const nearestCell = this.findNearestWalkableCell(targetCellX, targetCellZ);
            if (nearestCell) {
                targetCellX = nearestCell.x;
                targetCellZ = nearestCell.z;
            } else {
                console.warn(`🗺️ Actor ${this.actorId}: No walkable path to target`);
                return null;
            }
        }
        
        // A* pathfinding implementation
        const openSet = [];
        const closedSet = new Set();
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();
        
        const startKey = `${startCellX},${startCellZ}`;
        const targetKey = `${targetCellX},${targetCellZ}`;
        
        openSet.push({ x: startCellX, z: startCellZ, f: 0 });
        gScore.set(startKey, 0);
        fScore.set(startKey, this.heuristic(startCellX, startCellZ, targetCellX, targetCellZ));
        
        while (openSet.length > 0) {
            // Get cell with lowest f score
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();
            const currentKey = `${current.x},${current.z}`;
            
            // Reached target
            if (current.x === targetCellX && current.z === targetCellZ) {
                return this.reconstructPath(cameFrom, currentKey, grid);
            }
            
            closedSet.add(currentKey);
            
            // Check neighbors
            const neighbors = this.getNeighbors(current.x, current.z);
            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.x},${neighbor.z}`;
                
                if (closedSet.has(neighborKey) || this.isCellBlocked(neighbor.x, neighbor.z)) {
                    continue;
                }
                
                const tentativeGScore = gScore.get(currentKey) + neighbor.cost;
                
                if (!gScore.has(neighborKey) || tentativeGScore < gScore.get(neighborKey)) {
                    cameFrom.set(neighborKey, currentKey);
                    gScore.set(neighborKey, tentativeGScore);
                    const h = this.heuristic(neighbor.x, neighbor.z, targetCellX, targetCellZ);
                    fScore.set(neighborKey, tentativeGScore + h);
                    
                    // Add to open set if not already there
                    if (!openSet.find(node => node.x === neighbor.x && node.z === neighbor.z)) {
                        openSet.push({ 
                            x: neighbor.x, 
                            z: neighbor.z, 
                            f: fScore.get(neighborKey) 
                        });
                    }
                }
            }
        }
        
        console.warn(`🗺️ Actor ${this.actorId}: No path found to target`);
        return null;
    }
    
    /**
     * Get valid neighbors for A* pathfinding
     */
    getNeighbors(cellX, cellZ) {
        const neighbors = [];
        const directions = [
            { dx: -1, dz: 0, cost: 1 },   // Left
            { dx: 1, dz: 0, cost: 1 },    // Right
            { dx: 0, dz: -1, cost: 1 },   // Up
            { dx: 0, dz: 1, cost: 1 },    // Down
            { dx: -1, dz: -1, cost: 1.414 }, // Diagonal
            { dx: 1, dz: -1, cost: 1.414 },
            { dx: -1, dz: 1, cost: 1.414 },
            { dx: 1, dz: 1, cost: 1.414 }
        ];
        
        for (const dir of directions) {
            const newX = cellX + dir.dx;
            const newZ = cellZ + dir.dz;
            
            if (this.isValidCell(newX, newZ) && !this.isCellBlocked(newX, newZ)) {
                neighbors.push({ x: newX, z: newZ, cost: dir.cost });
            }
        }
        
        return neighbors;
    }
    
    /**
     * Heuristic function for A* (Manhattan distance)
     */
    heuristic(x1, z1, x2, z2) {
        return Math.abs(x1 - x2) + Math.abs(z1 - z2);
    }
    
    /**
     * Check if cell coordinates are valid
     */
    isValidCell(cellX, cellZ) {
        const grid = this.pathfindingGrid;
        return cellX >= 0 && cellX < grid.cellsX && cellZ >= 0 && cellZ < grid.cellsZ;
    }
    
    /**
     * Check if cell is blocked
     */
    isCellBlocked(cellX, cellZ) {
        if (!this.isValidCell(cellX, cellZ)) return true;
        const index = cellZ * this.pathfindingGrid.cellsX + cellX;
        return this.pathfindingGrid.cells[index] !== 0;
    }
    
    /**
     * Find nearest walkable cell to target
     */
    findNearestWalkableCell(targetCellX, targetCellZ) {
        const maxRadius = 5; // Search within 5 cells
        
        for (let radius = 1; radius <= maxRadius; radius++) {
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dz = -radius; dz <= radius; dz++) {
                    if (Math.abs(dx) === radius || Math.abs(dz) === radius) {
                        const cellX = targetCellX + dx;
                        const cellZ = targetCellZ + dz;
                        
                        if (this.isValidCell(cellX, cellZ) && !this.isCellBlocked(cellX, cellZ)) {
                            return { x: cellX, z: cellZ };
                        }
                    }
                }
            }
        }
        
        return null;
    }
    
    /**
     * Reconstruct path from A* search
     */
    reconstructPath(cameFrom, currentKey, grid) {
        const path = [];
        let current = currentKey;
        
        while (current) {
            const [cellX, cellZ] = current.split(',').map(Number);
            
            // Convert back to world coordinates (center of cell)
            const worldX = grid.originX + (cellX + 0.5) * this.gridSize;
            const worldZ = grid.originZ + (cellZ + 0.5) * this.gridSize;
            
            path.unshift({ x: worldX, z: worldZ });
            current = cameFrom.get(current);
        }
        
        return this.smoothPath(path);
    }
    
    /**
     * Smooth path to reduce sharp turns
     */
    smoothPath(path) {
        if (path.length <= 2) return path;
        
        const smoothedPath = [path[0]]; // Always keep start point
        
        for (let i = 1; i < path.length - 1; i++) {
            const prev = path[i - 1];
            const current = path[i];
            const next = path[i + 1];
            
            // Check if we can skip this waypoint (direct line possible)
            if (this.hasDirectPath(prev.x, prev.z, next.x, next.z)) {
                continue; // Skip this waypoint
            }
            
            smoothedPath.push(current);
        }
        
        smoothedPath.push(path[path.length - 1]); // Always keep end point
        
        return smoothedPath;
    }
    
    /**
     * Check if direct path exists between two points
     */
    hasDirectPath(x1, z1, x2, z2) {
        const steps = Math.max(Math.abs(x2 - x1), Math.abs(z2 - z1)) / (this.gridSize * 0.5);
        
        for (let step = 0; step <= steps; step++) {
            const t = step / steps;
            const x = x1 + (x2 - x1) * t;
            const z = z1 + (z2 - z1) * t;
            
            const cellX = Math.floor((x - this.pathfindingGrid.originX) / this.gridSize);
            const cellZ = Math.floor((z - this.pathfindingGrid.originZ) / this.gridSize);
            
            if (this.isCellBlocked(cellX, cellZ)) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Set movement target and calculate path
     */
    setTarget(targetX, targetZ, currentX, currentZ) {
        // Update stage obstacles before pathfinding
        this.updateStageConfig(window.stageState);
        
        // Find path to target
        const path = this.findPath(currentX, currentZ, targetX, targetZ);
        
        if (path && path.length > 1) {
            this.currentPath = path;
            this.currentPathIndex = 0;
            this.isFollowingPath = true;
            this.lastPathfindTime = performance.now();
            
            console.log(`🗺️ Actor ${this.actorId}: Path found with ${path.length} waypoints`);
            return true;
        } else {
            // Direct movement if no path found or target is very close
            this.currentPath = [{ x: targetX, z: targetZ }];
            this.currentPathIndex = 0;
            this.isFollowingPath = true;
            
            console.log(`🗺️ Actor ${this.actorId}: Using direct movement to target`);
            return true;
        }
    }
    
    /**
     * Update movement along current path
     */
    updateMovement(deltaTime, currentPosition, personalitySpeed = 1.0) {
        if (!this.isFollowingPath || this.currentPath.length === 0) {
            return { 
                newPosition: currentPosition, 
                newRotation: null, 
                hasArrived: false,
                isBlocked: false 
            };
        }
        
        const currentTime = performance.now();
        
        // Check if we need to recalculate path (for dynamic obstacles)
        if (currentTime - this.lastPathfindTime > this.pathUpdateInterval) {
            this.recheckCurrentPath(currentPosition.x, currentPosition.z);
        }
        
        // Get current target waypoint
        if (this.currentPathIndex >= this.currentPath.length) {
            this.isFollowingPath = false;
            return { 
                newPosition: currentPosition, 
                newRotation: null, 
                hasArrived: true,
                isBlocked: false 
            };
        }
        
        const targetWaypoint = this.currentPath[this.currentPathIndex];
        const dx = targetWaypoint.x - currentPosition.x;
        const dz = targetWaypoint.z - currentPosition.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        // Check if we've reached the current waypoint
        if (distance < this.arrivalThreshold) {
            this.currentPathIndex++;
            
            // If this was the last waypoint, we've arrived
            if (this.currentPathIndex >= this.currentPath.length) {
                this.isFollowingPath = false;
                this.addToMovementHistory(currentPosition, 'arrived');
                return { 
                    newPosition: targetWaypoint, 
                    newRotation: null, 
                    hasArrived: true,
                    isBlocked: false 
                };
            }
            
            // Move to next waypoint
            return this.updateMovement(deltaTime, currentPosition, personalitySpeed);
        }
        
        // Calculate movement toward current waypoint
        const moveSpeed = this.baseSpeed * personalitySpeed;
        const moveDistance = moveSpeed * deltaTime;
        
        // Normalize direction
        const normalizedDx = dx / distance;
        const normalizedDz = dz / distance;
        
        // Calculate new position
        const newX = currentPosition.x + normalizedDx * moveDistance;
        const newZ = currentPosition.z + normalizedDz * moveDistance;
        
        // Look ahead for smoother turning
        let lookAheadTarget = targetWaypoint;
        if (this.currentPathIndex + 1 < this.currentPath.length && distance < this.lookAheadDistance) {
            lookAheadTarget = this.currentPath[this.currentPathIndex + 1];
        }
        
        // Calculate rotation to face movement direction
        const lookDx = lookAheadTarget.x - newX;
        const lookDz = lookAheadTarget.z - newZ;
        const targetRotation = Math.atan2(lookDx, lookDz);
        
        const newPosition = { x: newX, y: currentPosition.y, z: newZ };
        
        // Add to movement history
        this.addToMovementHistory(newPosition, 'moving');
        
        return {
            newPosition: newPosition,
            newRotation: targetRotation,
            hasArrived: false,
            isBlocked: false
        };
    }
    
    /**
     * Recheck current path for dynamic obstacles
     */
    recheckCurrentPath(currentX, currentZ) {
        if (!this.isFollowingPath || this.currentPath.length === 0) return;
        
        // Update obstacles
        this.updateStageConfig(window.stageState);
        
        // Check if current path is still valid
        for (let i = this.currentPathIndex; i < this.currentPath.length - 1; i++) {
            const from = this.currentPath[i];
            const to = this.currentPath[i + 1];
            
            if (!this.hasDirectPath(from.x, from.z, to.x, to.z)) {
                // Path is blocked, recalculate from current position
                const finalTarget = this.currentPath[this.currentPath.length - 1];
                console.log(`🗺️ Actor ${this.actorId}: Path blocked, recalculating...`);
                this.setTarget(finalTarget.x, finalTarget.z, currentX, currentZ);
                break;
            }
        }
        
        this.lastPathfindTime = performance.now();
    }
    
    /**
     * Add position to movement history
     */
    addToMovementHistory(position, action) {
        this.movementHistory.push({
            position: { ...position },
            action: action,
            timestamp: performance.now()
        });
        
        // Keep history size manageable
        if (this.movementHistory.length > this.maxHistoryLength) {
            this.movementHistory.shift();
        }
    }
    
    /**
     * Stop current movement
     */
    stop() {
        this.isFollowingPath = false;
        this.currentPath = [];
        this.currentPathIndex = 0;
        console.log(`🗺️ Actor ${this.actorId}: Movement stopped`);
    }
    
    /**
     * Check if actor is currently moving
     */
    isMoving() {
        return this.isFollowingPath && this.currentPath.length > 0;
    }
    
    /**
     * Get current movement status
     */
    getMovementStatus() {
        return {
            isMoving: this.isMoving(),
            currentPath: [...this.currentPath],
            currentPathIndex: this.currentPathIndex,
            pathLength: this.currentPath.length,
            hasValidPath: this.currentPath.length > 0,
            lastPathfindTime: this.lastPathfindTime
        };
    }
    
    /**
     * Get debug information
     */
    getDebugInfo() {
        return {
            actorId: this.actorId,
            isMoving: this.isMoving(),
            pathWaypoints: this.currentPath.length,
            currentWaypoint: this.currentPathIndex,
            gridSize: `${this.pathfindingGrid.cellsX}x${this.pathfindingGrid.cellsZ}`,
            obstacleCount: this.stageConfig.obstacles.length,
            movementHistoryLength: this.movementHistory.length,
            baseSpeed: this.baseSpeed,
            arrivalThreshold: this.arrivalThreshold
        };
    }
    
    /**
     * Visualize pathfinding grid (for debugging)
     */
    visualizeGrid() {
        if (!window.stageState || !window.stageState.core.scene) return;
        
        // Remove existing visualization
        const existingViz = window.stageState.core.scene.getObjectByName(`pathfinding_viz_${this.actorId}`);
        if (existingViz) {
            window.stageState.core.scene.remove(existingViz);
        }
        
        // Create new visualization
        const vizGroup = new THREE.Group();
        vizGroup.name = `pathfinding_viz_${this.actorId}`;
        
        const grid = this.pathfindingGrid;
        
        for (let x = 0; x < grid.cellsX; x++) {
            for (let z = 0; z < grid.cellsZ; z++) {
                const index = z * grid.cellsX + x;
                const cellValue = grid.cells[index];
                
                if (cellValue !== 0) {
                    const geometry = new THREE.PlaneGeometry(this.gridSize * 0.8, this.gridSize * 0.8);
                    const material = new THREE.MeshBasicMaterial({ 
                        color: cellValue === 1 ? 0xff0000 : 0xffff00,
                        transparent: true,
                        opacity: 0.3
                    });
                    
                    const plane = new THREE.Mesh(geometry, material);
                    plane.rotation.x = -Math.PI / 2;
                    plane.position.set(
                        grid.originX + (x + 0.5) * this.gridSize,
                        0.01,
                        grid.originZ + (z + 0.5) * this.gridSize
                    );
                    
                    vizGroup.add(plane);
                }
            }
        }
        
        // Visualize current path
        if (this.currentPath.length > 1) {
            const pathGeometry = new THREE.BufferGeometry();
            const pathPoints = [];
            
            this.currentPath.forEach(waypoint => {
                pathPoints.push(waypoint.x, 0.05, waypoint.z);
            });
            
            pathGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pathPoints, 3));
            
            const pathMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 3 });
            const pathLine = new THREE.Line(pathGeometry, pathMaterial);
            vizGroup.add(pathLine);
        }
        
        window.stageState.core.scene.add(vizGroup);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (vizGroup.parent) {
                vizGroup.parent.remove(vizGroup);
            }
        }, 10000);
    }
    
    /**
     * Clear pathfinding grid visualization
     */
    clearGridVisualization() {
        if (!window.stageState || !window.stageState.core.scene) return;
        
        const existingViz = window.stageState.core.scene.getObjectByName(`pathfinding_viz_${this.actorId}`);
        if (existingViz) {
            window.stageState.core.scene.remove(existingViz);
            console.log(`🚫 Cleared pathfinding visualization for ${this.actorId}`);
        }
    }
}

// Export for global use
if (typeof window !== 'undefined') {
    window.ActorMovement = ActorMovement;
    console.log('🗺️ ActorMovement loaded - pathfinding system available globally');
}

// ES6 module export (for future use)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ActorMovement };
}