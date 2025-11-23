/**
 * Alternative Stage Types for Theater-Stage
 * Implements thrust, arena, and black box theater configurations
 */

class StageTypeManager {
    constructor() {
        this.currentType = 'proscenium'; // default
        this.stageTypes = {
            proscenium: {
                name: 'Proscenium',
                description: 'Traditional theater with audience on one side',
                create: this.createProsceniumStage.bind(this)
            },
            thrust: {
                name: 'Thrust Stage',
                description: 'Stage extending into audience on three sides',
                create: this.createThrustStage.bind(this)
            },
            arena: {
                name: 'Arena (Theater in the Round)',
                description: 'Central stage with audience on all sides',
                create: this.createArenaStage.bind(this)
            },
            blackbox: {
                name: 'Black Box',
                description: 'Flexible space with moveable seating',
                create: this.createBlackBoxStage.bind(this)
            }
        };

        this.panel = null;
        this.init();
    }

    init() {
        this.createUI();
    }

    createUI() {
        // Stage type selector panel
        this.panel = document.createElement('div');
        this.panel.id = 'stage-type-panel';
        this.panel.style.cssText = `
            position: fixed;
            top: 100px;
            left: 10px;
            width: 280px;
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
            <h3 style="margin: 0; font-size: 16px;">🎭 Stage Type</h3>
            <button id="stage-type-close" style="background: transparent; border: none; color: white; font-size: 18px; cursor: pointer;">✖️</button>
        `;
        this.panel.appendChild(header);

        // Current stage type display
        const currentType = document.createElement('div');
        currentType.style.cssText = `
            padding: 12px 15px;
            background: rgba(68, 170, 255, 0.1);
            border-bottom: 1px solid rgba(68, 170, 255, 0.2);
            font-size: 13px;
        `;
        currentType.innerHTML = `
            <div style="color: #888; margin-bottom: 3px;">Current:</div>
            <div id="current-stage-type" style="font-weight: bold; color: #4af;">Proscenium</div>
        `;
        this.panel.appendChild(currentType);

        // Stage type options
        const optionsContainer = document.createElement('div');
        optionsContainer.style.cssText = `
            padding: 15px;
            max-height: 400px;
            overflow-y: auto;
        `;

        Object.entries(this.stageTypes).forEach(([key, type]) => {
            const option = document.createElement('div');
            option.className = 'stage-type-option';
            option.dataset.type = key;
            option.style.cssText = `
                padding: 12px;
                margin-bottom: 10px;
                background: rgba(0, 0, 0, 0.3);
                border: 2px solid ${key === this.currentType ? 'rgba(68, 170, 255, 0.8)' : 'rgba(68, 170, 255, 0.2)'};
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
            `;

            option.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 5px; font-size: 14px;">${type.name}</div>
                <div style="font-size: 11px; color: #aaa; line-height: 1.4;">${type.description}</div>
            `;

            option.addEventListener('click', () => {
                this.changeStageType(key);
            });

            option.addEventListener('mouseenter', () => {
                if (key !== this.currentType) {
                    option.style.background = 'rgba(68, 170, 255, 0.1)';
                    option.style.borderColor = 'rgba(68, 170, 255, 0.5)';
                }
            });

            option.addEventListener('mouseleave', () => {
                if (key !== this.currentType) {
                    option.style.background = 'rgba(0, 0, 0, 0.3)';
                    option.style.borderColor = 'rgba(68, 170, 255, 0.2)';
                }
            });

            optionsContainer.appendChild(option);
        });

        this.panel.appendChild(optionsContainer);

        document.body.appendChild(this.panel);

        // Event listeners
        document.getElementById('stage-type-close').addEventListener('click', () => {
            this.hide();
        });
    }

    show() {
        this.panel.style.display = 'flex';
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

    changeStageType(type) {
        if (!this.stageTypes[type]) {
            console.error(`Unknown stage type: ${type}`);
            return;
        }

        if (type === this.currentType) {
            return; // Already using this type
        }

        if (!confirm(`Change stage to ${this.stageTypes[type].name}? This will clear the current stage.`)) {
            return;
        }

        this.currentType = type;

        // Update UI
        document.getElementById('current-stage-type').textContent = this.stageTypes[type].name;

        // Update border colors
        document.querySelectorAll('.stage-type-option').forEach(option => {
            if (option.dataset.type === type) {
                option.style.borderColor = 'rgba(68, 170, 255, 0.8)';
                option.style.background = 'rgba(68, 170, 255, 0.15)';
            } else {
                option.style.borderColor = 'rgba(68, 170, 255, 0.2)';
                option.style.background = 'rgba(0, 0, 0, 0.3)';
            }
        });

        // Rebuild the stage
        this.rebuildStage(type);
    }

    rebuildStage(type) {
        // Clear existing stage (if exists in global scope)
        if (window.scene && window.stage) {
            window.scene.remove(window.stage);

            // Clear markers, platforms, etc.
            if (window.stageMarkers) {
                window.stageMarkers.forEach(marker => window.scene.remove(marker));
                window.stageMarkers = [];
            }
        }

        // Create new stage
        const newStage = this.stageTypes[type].create();

        // Add to scene
        if (window.scene) {
            window.scene.add(newStage);
            window.stage = newStage;

            // Recreate markers if needed
            if (window.addStageMarkers && type !== 'arena') {
                window.addStageMarkers();
            }
        }
    }

    createProsceniumStage() {
        // This is the default stage (already exists in stage.js)
        // Return a reference to create it
        const group = new THREE.Group();

        // Main stage platform
        const stageGeometry = new THREE.BoxGeometry(20, 0.5, 15);
        const stageMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
        const stageMesh = new THREE.Mesh(stageGeometry, stageMaterial);
        stageMesh.position.y = -0.25;
        stageMesh.receiveShadow = true;
        group.add(stageMesh);

        // Add texture
        const textureLoader = new THREE.TextureLoader();
        stageMaterial.map = textureLoader.load('https://threejs.org/examples/textures/hardwood2_diffuse.jpg');

        // Proscenium arch
        const archMaterial = new THREE.MeshPhongMaterial({ color: 0x8B0000 });

        // Left pillar
        const leftPillar = new THREE.Mesh(
            new THREE.BoxGeometry(1, 8, 1),
            archMaterial
        );
        leftPillar.position.set(-11, 4, -7);
        group.add(leftPillar);

        // Right pillar
        const rightPillar = new THREE.Mesh(
            new THREE.BoxGeometry(1, 8, 1),
            archMaterial
        );
        rightPillar.position.set(11, 4, -7);
        group.add(rightPillar);

        // Top arch
        const topArch = new THREE.Mesh(
            new THREE.BoxGeometry(24, 1, 1),
            archMaterial
        );
        topArch.position.set(0, 8, -7);
        group.add(topArch);

        return group;
    }

    createThrustStage() {
        const group = new THREE.Group();

        // Main thrust platform (pentagonal shape approximated)
        const thrustShape = new THREE.Shape();
        thrustShape.moveTo(-10, -10);
        thrustShape.lineTo(10, -10);
        thrustShape.lineTo(10, 0);
        thrustShape.lineTo(0, 8);
        thrustShape.lineTo(-10, 0);
        thrustShape.lineTo(-10, -10);

        const extrudeSettings = {
            steps: 1,
            depth: 0.5,
            bevelEnabled: false
        };

        const thrustGeometry = new THREE.ExtrudeGeometry(thrustShape, extrudeSettings);
        const thrustMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 });
        const thrustMesh = new THREE.Mesh(thrustGeometry, thrustMaterial);
        thrustMesh.rotation.x = -Math.PI / 2;
        thrustMesh.position.y = -0.25;
        thrustMesh.receiveShadow = true;
        group.add(thrustMesh);

        // Backstage platform
        const backstage = new THREE.Mesh(
            new THREE.BoxGeometry(20, 0.5, 5),
            new THREE.MeshPhongMaterial({ color: 0x8B4513 })
        );
        backstage.position.set(0, -0.25, -12);
        backstage.receiveShadow = true;
        group.add(backstage);

        // Side railings to indicate audience areas
        const railingMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });

        for (let side of [-1, 1]) {
            for (let i = 0; i < 8; i++) {
                const post = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.1, 0.1, 1, 8),
                    railingMaterial
                );
                post.position.set(side * 11, 0.5, -8 + i * 2);
                group.add(post);
            }
        }

        return group;
    }

    createArenaStage() {
        const group = new THREE.Group();

        // Circular central stage
        const circleGeometry = new THREE.CylinderGeometry(8, 8, 0.5, 32);
        const circleMaterial = new THREE.MeshPhongMaterial({ color: 0x2F4F4F });
        const circleMesh = new THREE.Mesh(circleGeometry, circleMaterial);
        circleMesh.position.y = -0.25;
        circleMesh.receiveShadow = true;
        group.add(circleMesh);

        // Inner circle detail
        const innerCircle = new THREE.Mesh(
            new THREE.CylinderGeometry(6, 6, 0.52, 32),
            new THREE.MeshPhongMaterial({ color: 0x556B2F })
        );
        innerCircle.position.y = -0.24;
        group.add(innerCircle);

        // Audience seating indicators (simplified as platforms)
        const seatMaterial = new THREE.MeshPhongMaterial({ color: 0x4B0082, transparent: true, opacity: 0.3 });

        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI * 2 * i) / 4;
            const seat = new THREE.Mesh(
                new THREE.BoxGeometry(6, 0.3, 3),
                seatMaterial
            );
            seat.position.set(
                Math.cos(angle) * 12,
                -0.15,
                Math.sin(angle) * 12
            );
            seat.rotation.y = angle + Math.PI / 2;
            group.add(seat);
        }

        // Entry aisles (darker pathways)
        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI * 2 * i) / 4 + Math.PI / 4;
            const aisle = new THREE.Mesh(
                new THREE.BoxGeometry(2, 0.05, 6),
                new THREE.MeshPhongMaterial({ color: 0x1a1a1a })
            );
            aisle.position.set(
                Math.cos(angle) * 10,
                0.02,
                Math.sin(angle) * 10
            );
            aisle.rotation.y = angle + Math.PI / 2;
            group.add(aisle);
        }

        return group;
    }

    createBlackBoxStage() {
        const group = new THREE.Group();

        // Main floor (large square)
        const floor = new THREE.Mesh(
            new THREE.BoxGeometry(25, 0.2, 25),
            new THREE.MeshPhongMaterial({ color: 0x0a0a0a })
        );
        floor.position.y = -0.1;
        floor.receiveShadow = true;
        group.add(floor);

        // Grid lines for flexible spacing
        const gridMaterial = new THREE.LineBasicMaterial({ color: 0x333333 });
        const gridSize = 25;
        const gridDivisions = 25;

        const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x444444, 0x222222);
        gridHelper.position.y = 0;
        group.add(gridHelper);

        // Walls (black)
        const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });

        // Back wall
        const backWall = new THREE.Mesh(
            new THREE.BoxGeometry(25, 6, 0.5),
            wallMaterial
        );
        backWall.position.set(0, 3, -12.5);
        group.add(backWall);

        // Left wall
        const leftWall = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 6, 25),
            wallMaterial
        );
        leftWall.position.set(-12.5, 3, 0);
        group.add(leftWall);

        // Right wall
        const rightWall = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 6, 25),
            wallMaterial
        );
        rightWall.position.set(12.5, 3, 0);
        group.add(rightWall);

        // Moveable riser platforms (indicated)
        const riserMaterial = new THREE.MeshPhongMaterial({ color: 0x2F4F4F, transparent: true, opacity: 0.5 });

        for (let i = 0; i < 3; i++) {
            const riser = new THREE.Mesh(
                new THREE.BoxGeometry(4, 0.4, 3),
                riserMaterial
            );
            riser.position.set(-8 + i * 5, 0.2, 10);
            group.add(riser);
        }

        // Lighting grid indicators (ceiling-mounted lights)
        const lightGridMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });

        for (let x = -10; x <= 10; x += 5) {
            for (let z = -10; z <= 10; z += 5) {
                const lightMount = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.15, 0.15, 0.3, 8),
                    lightGridMaterial
                );
                lightMount.position.set(x, 5.8, z);
                group.add(lightMount);
            }
        }

        return group;
    }

    // Export/Import
    exportStageType() {
        return {
            version: '1.0',
            currentType: this.currentType
        };
    }

    importStageType(data) {
        if (data.currentType && this.stageTypes[data.currentType]) {
            this.changeStageType(data.currentType);
        }
    }
}

// Global instance
const stageTypeManager = new StageTypeManager();

// Expose to global scope
window.stageTypeManager = stageTypeManager;

// Add keyboard shortcut (Shift+T) to toggle stage type panel
document.addEventListener('keydown', (e) => {
    if (e.shiftKey && e.key === 'T') {
        stageTypeManager.toggle();
    }
});
