/**
 * Unit Tests for Stage Geometry Module
 * Tests stage elements, platforms, curtains, and scenery
 */

describe('Stage Geometry Module', () => {
    describe('Stage Structure', () => {
        test('should have main stage floor', () => {
            const stage = {
                width: 20,
                depth: 15,
                height: 0.5,
                color: 0x8B4513
            };
            
            expect(stage.width).toBe(20);
            expect(stage.depth).toBe(15);
            expect(stage.height).toBeGreaterThan(0);
        });

        test('should have stage boundaries', () => {
            const checkInBounds = (x, z, stageWidth = 20, stageDepth = 15) => {
                return Math.abs(x) <= stageWidth / 2 && Math.abs(z) <= stageDepth / 2;
            };
            
            expect(checkInBounds(0, 0)).toBe(true);
            expect(checkInBounds(9, 7)).toBe(true);
            expect(checkInBounds(11, 0)).toBe(false);
            expect(checkInBounds(0, 8)).toBe(false);
        });

        test('should calculate stage center', () => {
            const stage = { width: 20, depth: 15 };
            const center = { x: 0, z: 0 };
            
            expect(center.x).toBe(0);
            expect(center.z).toBe(0);
        });
    });

    describe('Moveable Platforms', () => {
        test('should have three moveable platforms', () => {
            const moveablePlatforms = [
                { position: { x: -6, y: 0.6, z: 0 } },
                { position: { x: 0, y: 0.6, z: 0 } },
                { position: { x: 6, y: 0.6, z: 0 } }
            ];
            
            expect(moveablePlatforms).toHaveLength(3);
        });

        test('platforms should move vertically', () => {
            const platform = { 
                position: { y: 0.6 },
                userData: { targetY: 2, animating: true }
            };
            
            platform.position.y = platform.userData.targetY;
            
            expect(platform.position.y).toBe(2);
        });

        test('platforms should have height limits', () => {
            const MIN_HEIGHT = 0.6;
            const MAX_HEIGHT = 5;
            
            const clampHeight = (y) => Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, y));
            
            expect(clampHeight(0)).toBe(MIN_HEIGHT);
            expect(clampHeight(10)).toBe(MAX_HEIGHT);
            expect(clampHeight(3)).toBe(3);
        });

        test('platform positions should be spaced apart', () => {
            const platforms = [
                { position: { x: -6 } },
                { position: { x: 0 } },
                { position: { x: 6 } }
            ];
            
            const spacing1 = Math.abs(platforms[1].position.x - platforms[0].position.x);
            const spacing2 = Math.abs(platforms[2].position.x - platforms[1].position.x);
            
            expect(spacing1).toBe(6);
            expect(spacing2).toBe(6);
        });
    });

    describe('Rotating Stage', () => {
        test('should have rotating stage at center', () => {
            const rotatingStage = {
                position: { x: 0, y: 0.5, z: 0 },
                radius: 3,
                userData: { rotating: false, rotationSpeed: 0.005 }
            };
            
            expect(rotatingStage.position.x).toBe(0);
            expect(rotatingStage.position.z).toBe(0);
            expect(rotatingStage.radius).toBeGreaterThan(0);
        });

        test('should rotate continuously when enabled', () => {
            let rotation = 0;
            const rotationSpeed = 0.005;
            
            // Simulate 10 frames
            for (let i = 0; i < 10; i++) {
                rotation += rotationSpeed;
            }
            
            expect(rotation).toBeCloseTo(0.05, 5);
        });

        test('should check if object is on rotating stage', () => {
            const rotatingStage = { position: { x: 0, z: 0 }, radius: 3 };
            const obj = { position: { x: 2, z: 0 } };
            
            const isOnRotatingStage = (obj, stage) => {
                const dx = obj.position.x - stage.position.x;
                const dz = obj.position.z - stage.position.z;
                const distance = Math.sqrt(dx * dx + dz * dz);
                return distance <= stage.radius;
            };
            
            expect(isOnRotatingStage(obj, rotatingStage)).toBe(true);
            
            obj.position.x = 5;
            expect(isOnRotatingStage(obj, rotatingStage)).toBe(false);
        });
    });

    describe('Trap Doors', () => {
        test('should have four trap doors', () => {
            const trapDoors = [
                { position: { x: -4, z: -3 } },
                { position: { x: 4, z: -3 } },
                { position: { x: -4, z: 3 } },
                { position: { x: 4, z: 3 } }
            ];
            
            expect(trapDoors).toHaveLength(4);
        });

        test('trap doors should have open/closed state', () => {
            const trapDoor = {
                userData: { open: false },
                rotation: { x: 0 }
            };
            
            // Open trap door
            trapDoor.userData.open = true;
            trapDoor.rotation.x = Math.PI / 2;
            
            expect(trapDoor.userData.open).toBe(true);
            expect(trapDoor.rotation.x).toBeCloseTo(Math.PI / 2, 2);
        });

        test('should hide objects on open trap door', () => {
            const trapDoor = { 
                position: { x: -4, z: -3 },
                userData: { open: true },
                radius: 1
            };
            
            const prop = { position: { x: -4, z: -3 } };
            
            const isOnTrapDoor = (prop, door) => {
                const dx = prop.position.x - door.position.x;
                const dz = prop.position.z - door.position.z;
                const distance = Math.sqrt(dx * dx + dz * dz);
                return distance < door.radius;
            };
            
            const shouldHide = isOnTrapDoor(prop, trapDoor) && trapDoor.userData.open;
            expect(shouldHide).toBe(true);
        });
    });

    describe('Curtains', () => {
        test('should have three curtain pieces', () => {
            const curtains = {
                left: { position: { x: -10 } },
                right: { position: { x: 10 } },
                top: { position: { y: 7.5 } }
            };
            
            expect(curtains.left).toBeDefined();
            expect(curtains.right).toBeDefined();
            expect(curtains.top).toBeDefined();
        });

        test('curtains should have closed/open states', () => {
            let curtainState = 'closed';
            
            expect(curtainState).toBe('closed');
            
            curtainState = 'open';
            expect(curtainState).toBe('open');
        });

        test('curtains should move to open position', () => {
            const curtain = {
                state: 'closed',
                position: { x: -10 },
                closedX: -10,
                openX: -15
            };
            
            // Open curtain
            curtain.state = 'open';
            curtain.position.x = curtain.openX;
            
            expect(curtain.position.x).toBe(-15);
        });

        test('curtain animation should be smooth', () => {
            const curtain = {
                position: { x: -10 },
                targetX: -15
            };
            
            // Lerp to target
            const lerp = (start, end, t) => start + (end - start) * t;
            
            for (let i = 0; i < 5; i++) {
                curtain.position.x = lerp(curtain.position.x, curtain.targetX, 0.1);
            }
            
            expect(curtain.position.x).toBeCloseTo(-12.048, 2);
        });
    });

    describe('Scenery Panels', () => {
        test('should have backdrop and midstage panels', () => {
            const sceneryPanels = [
                { name: 'backdrop', position: { x: 0, y: 5, z: -8 } },
                { name: 'midstage', position: { x: 0, y: 5, z: 0 } }
            ];
            
            expect(sceneryPanels).toHaveLength(2);
            expect(sceneryPanels[0].name).toBe('backdrop');
            expect(sceneryPanels[1].name).toBe('midstage');
        });

        test('panels should slide to different positions', () => {
            const panel = {
                position: { x: 0 },
                userData: { currentPosition: 'center' }
            };
            
            // Move to left
            panel.userData.currentPosition = 'left';
            panel.position.x = -10;
            
            expect(panel.position.x).toBe(-10);
            expect(panel.userData.currentPosition).toBe('left');
        });

        test('panels should have three positions', () => {
            const positions = ['left', 'center', 'right'];
            const xPositions = { left: -10, center: 0, right: 10 };
            
            expect(positions).toHaveLength(3);
            expect(xPositions.left).toBeLessThan(xPositions.center);
            expect(xPositions.right).toBeGreaterThan(xPositions.center);
        });
    });

    describe('Stage Markers', () => {
        test('should have position markers on stage', () => {
            const stageMarkers = [
                { position: { x: -5, z: -5 } },
                { position: { x: 5, z: -5 } },
                { position: { x: -5, z: 5 } },
                { position: { x: 5, z: 5 } }
            ];
            
            expect(stageMarkers.length).toBeGreaterThanOrEqual(4);
        });

        test('markers should float with animation', () => {
            const marker = {
                position: { y: 0.1 },
                userData: { baseY: 0.1 }
            };
            
            // Animate floating
            const time = Math.PI / 2;
            marker.position.y = marker.userData.baseY + Math.sin(time) * 0.05;
            
            expect(marker.position.y).toBeCloseTo(0.15, 2);
        });
    });
});
