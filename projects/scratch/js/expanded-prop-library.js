/**
 * Expanded Prop Library for Theater-Stage
 * 50+ props organized by category for educational theater productions
 */

// Merge this with existing PROP_CATALOG
const EXPANDED_PROP_CATALOG = {
    // ======================================
    // FURNITURE (Extended)
    // ======================================
    chair: {
        name: 'Wooden Chair',
        category: 'furniture',
        create: () => {
            const group = new THREE.Group();
            const seat = new THREE.Mesh(
                new THREE.BoxGeometry(1, 0.1, 1),
                new THREE.MeshPhongMaterial({ color: 0x8B4513 })
            );
            seat.position.y = 0.5;
            group.add(seat);
            const back = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 0.1),
                new THREE.MeshPhongMaterial({ color: 0x8B4513 })
            );
            back.position.set(0, 1, -0.45);
            group.add(back);
            const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5);
            const legMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 });
            for (let x of [-0.4, 0.4]) {
                for (let z of [-0.4, 0.4]) {
                    const leg = new THREE.Mesh(legGeometry, legMaterial);
                    leg.position.set(x, 0.25, z);
                    group.add(leg);
                }
            }
            return group;
        },
        y: 0,
        interactions: { sittable: true, seatHeight: 0.5 }
    },
    armchair: {
        name: 'Armchair',
        category: 'furniture',
        create: () => {
            const group = new THREE.Group();
            const seat = new THREE.Mesh(
                new THREE.BoxGeometry(1.2, 0.15, 1.2),
                new THREE.MeshPhongMaterial({ color: 0x8B0000 })
            );
            seat.position.y = 0.5;
            group.add(seat);
            const back = new THREE.Mesh(
                new THREE.BoxGeometry(1.2, 1.2, 0.15),
                new THREE.MeshPhongMaterial({ color: 0x8B0000 })
            );
            back.position.set(0, 1.05, -0.5);
            group.add(back);
            // Arms
            for (let x of [-0.6, 0.6]) {
                const arm = new THREE.Mesh(
                    new THREE.BoxGeometry(0.15, 0.5, 0.8),
                    new THREE.MeshPhongMaterial({ color: 0x654321 })
                );
                arm.position.set(x, 0.75, 0);
                group.add(arm);
            }
            return group;
        },
        y: 0,
        interactions: { sittable: true, seatHeight: 0.5 }
    },
    bench: {
        name: 'Bench',
        category: 'furniture',
        create: () => {
            const group = new THREE.Group();
            const seat = new THREE.Mesh(
                new THREE.BoxGeometry(2.5, 0.1, 0.8),
                new THREE.MeshPhongMaterial({ color: 0x8B4513 })
            );
            seat.position.y = 0.5;
            group.add(seat);
            const back = new THREE.Mesh(
                new THREE.BoxGeometry(2.5, 0.8, 0.1),
                new THREE.MeshPhongMaterial({ color: 0x8B4513 })
            );
            back.position.set(0, 0.9, -0.35);
            group.add(back);
            for (let x of [-1.1, 0, 1.1]) {
                const leg = new THREE.Mesh(
                    new THREE.BoxGeometry(0.1, 0.5, 0.1),
                    new THREE.MeshPhongMaterial({ color: 0x654321 })
                );
                leg.position.set(x, 0.25, 0);
                group.add(leg);
            }
            return group;
        },
        y: 0,
        interactions: { sittable: true, seatHeight: 0.5 }
    },
    stool: {
        name: 'Stool',
        category: 'furniture',
        create: () => {
            const group = new THREE.Group();
            const seat = new THREE.Mesh(
                new THREE.CylinderGeometry(0.35, 0.35, 0.08, 16),
                new THREE.MeshPhongMaterial({ color: 0x654321 })
            );
            seat.position.y = 0.65;
            group.add(seat);
            const legGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.65);
            const legMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 2) {
                const leg = new THREE.Mesh(legGeometry, legMaterial);
                leg.position.set(Math.cos(angle) * 0.25, 0.325, Math.sin(angle) * 0.25);
                group.add(leg);
            }
            return group;
        },
        y: 0,
        interactions: { sittable: true, seatHeight: 0.65 }
    },
    table: {
        name: 'Table',
        category: 'furniture',
        create: () => {
            const group = new THREE.Group();
            const top = new THREE.Mesh(
                new THREE.BoxGeometry(2, 0.1, 1.5),
                new THREE.MeshPhongMaterial({ color: 0x8B4513 })
            );
            top.position.y = 1;
            group.add(top);
            const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1);
            const legMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 });
            for (let x of [-0.9, 0.9]) {
                for (let z of [-0.65, 0.65]) {
                    const leg = new THREE.Mesh(legGeometry, legMaterial);
                    leg.position.set(x, 0.5, z);
                    group.add(leg);
                }
            }
            return group;
        },
        y: 0,
        interactions: {}
    },
    roundTable: {
        name: 'Round Table',
        category: 'furniture',
        create: () => {
            const group = new THREE.Group();
            const top = new THREE.Mesh(
                new THREE.CylinderGeometry(1.2, 1.2, 0.1, 32),
                new THREE.MeshPhongMaterial({ color: 0x8B4513 })
            );
            top.position.y = 1;
            group.add(top);
            const pedestal = new THREE.Mesh(
                new THREE.CylinderGeometry(0.15, 0.3, 0.95),
                new THREE.MeshPhongMaterial({ color: 0x654321 })
            );
            pedestal.position.y = 0.475;
            group.add(pedestal);
            const base = new THREE.Mesh(
                new THREE.CylinderGeometry(0.5, 0.5, 0.05),
                new THREE.MeshPhongMaterial({ color: 0x654321 })
            );
            base.position.y = 0.025;
            group.add(base);
            return group;
        },
        y: 0,
        interactions: {}
    },
    desk: {
        name: 'Writing Desk',
        category: 'furniture',
        create: () => {
            const group = new THREE.Group();
            const top = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 0.08, 1),
                new THREE.MeshPhongMaterial({ color: 0x654321 })
            );
            top.position.y = 0.9;
            group.add(top);
            // Drawers
            for (let i = 0; i < 2; i++) {
                const drawer = new THREE.Mesh(
                    new THREE.BoxGeometry(0.4, 0.15, 0.95),
                    new THREE.MeshPhongMaterial({ color: 0x8B4513 })
                );
                drawer.position.set(-0.5, 0.3 + i * 0.25, 0);
                group.add(drawer);
            }
            // Legs
            for (let x of [-0.65, 0.65]) {
                for (let z of [-0.45, 0.45]) {
                    const leg = new THREE.Mesh(
                        new THREE.BoxGeometry(0.08, 0.9, 0.08),
                        new THREE.MeshPhongMaterial({ color: 0x654321 })
                    );
                    leg.position.set(x, 0.45, z);
                    group.add(leg);
                }
            }
            return group;
        },
        y: 0,
        interactions: {}
    },
    bookshelf: {
        name: 'Bookshelf',
        category: 'furniture',
        create: () => {
            const group = new THREE.Group();
            // Frame
            const frame = new THREE.Mesh(
                new THREE.BoxGeometry(2, 2.5, 0.4),
                new THREE.MeshPhongMaterial({ color: 0x654321 })
            );
            frame.position.y = 1.25;
            group.add(frame);
            // Shelves
            for (let i = 0; i < 4; i++) {
                const shelf = new THREE.Mesh(
                    new THREE.BoxGeometry(1.9, 0.05, 0.38),
                    new THREE.MeshPhongMaterial({ color: 0x8B4513 })
                );
                shelf.position.y = 0.2 + i * 0.65;
                group.add(shelf);
            }
            // Books (simple rectangles)
            const bookColors = [0xFF0000, 0x0000FF, 0x008000, 0x8B4513, 0x800080];
            for (let shelf = 0; shelf < 4; shelf++) {
                for (let book = 0; book < 8; book++) {
                    const bookMesh = new THREE.Mesh(
                        new THREE.BoxGeometry(0.2, 0.3, 0.1),
                        new THREE.MeshPhongMaterial({ color: bookColors[Math.floor(Math.random() * bookColors.length)] })
                    );
                    bookMesh.position.set(-0.8 + book * 0.22, 0.35 + shelf * 0.65, 0);
                    group.add(bookMesh);
                }
            }
            return group;
        },
        y: 0,
        interactions: {}
    },
    sofa: {
        name: 'Sofa',
        category: 'furniture',
        create: () => {
            const group = new THREE.Group();
            const seat = new THREE.Mesh(
                new THREE.BoxGeometry(2.5, 0.2, 1.2),
                new THREE.MeshPhongMaterial({ color: 0x4169E1 })
            );
            seat.position.y = 0.5;
            group.add(seat);
            const back = new THREE.Mesh(
                new THREE.BoxGeometry(2.5, 1, 0.2),
                new THREE.MeshPhongMaterial({ color: 0x4169E1 })
            );
            back.position.set(0, 1, -0.5);
            group.add(back);
            // Arms
            for (let x of [-1.25, 1.25]) {
                const arm = new THREE.Mesh(
                    new THREE.BoxGeometry(0.2, 0.6, 1),
                    new THREE.MeshPhongMaterial({ color: 0x36648B })
                );
                arm.position.set(x, 0.7, 0);
                group.add(arm);
            }
            return group;
        },
        y: 0,
        interactions: { sittable: true, seatHeight: 0.5 }
    },
    coffeeTable: {
        name: 'Coffee Table',
        category: 'furniture',
        create: () => {
            const group = new THREE.Group();
            const top = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 0.08, 1),
                new THREE.MeshPhongMaterial({ color: 0x654321 })
            );
            top.position.y = 0.4;
            group.add(top);
            const legGeometry = new THREE.BoxGeometry(0.1, 0.4, 0.1);
            const legMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
            for (let x of [-0.65, 0.65]) {
                for (let z of [-0.4, 0.4]) {
                    const leg = new THREE.Mesh(legGeometry, legMaterial);
                    leg.position.set(x, 0.2, z);
                    group.add(leg);
                }
            }
            return group;
        },
        y: 0,
        interactions: {}
    },

    // ======================================
    // STAGE PROPS
    // ======================================
    crate: {
        name: 'Wooden Crate',
        category: 'stage',
        create: () => {
            const group = new THREE.Group();
            const box = new THREE.Mesh(
                new THREE.BoxGeometry(1.2, 1.2, 1.2),
                new THREE.MeshPhongMaterial({ color: 0xD2691E })
            );
            box.position.y = 0.6;
            group.add(box);
            const lineMaterial = new THREE.MeshBasicMaterial({ color: 0x654321 });
            for (let i = 0; i < 3; i++) {
                const line = new THREE.Mesh(
                    new THREE.BoxGeometry(1.21, 0.02, 1.21),
                    lineMaterial
                );
                line.position.y = 0.2 + i * 0.4;
                group.add(line);
            }
            return group;
        },
        y: 0,
        interactions: { grabbable: true, throwable: false }
    },
    barrel: {
        name: 'Wooden Barrel',
        category: 'stage',
        create: () => {
            const group = new THREE.Group();
            const barrel = new THREE.Mesh(
                new THREE.CylinderGeometry(0.5, 0.5, 1.2, 12),
                new THREE.MeshPhongMaterial({ color: 0x8B4513 })
            );
            barrel.position.y = 0.6;
            group.add(barrel);
            const bandMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
            for (let y of [0.2, 0.6, 1.0]) {
                const band = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.52, 0.52, 0.05, 12),
                    bandMaterial
                );
                band.position.y = y;
                group.add(band);
            }
            return group;
        },
        y: 0,
        interactions: { grabbable: true, throwable: false }
    },
    chest: {
        name: 'Treasure Chest',
        category: 'stage',
        create: () => {
            const group = new THREE.Group();
            const bottom = new THREE.Mesh(
                new THREE.BoxGeometry(1.2, 0.6, 0.8),
                new THREE.MeshPhongMaterial({ color: 0x8B4513 })
            );
            bottom.position.y = 0.3;
            group.add(bottom);
            const lid = new THREE.Mesh(
                new THREE.BoxGeometry(1.2, 0.4, 0.8),
                new THREE.MeshPhongMaterial({ color: 0x654321 })
            );
            lid.position.set(0, 0.7, 0);
            group.add(lid);
            // Latch
            const latch = new THREE.Mesh(
                new THREE.BoxGeometry(0.2, 0.1, 0.1),
                new THREE.MeshPhongMaterial({ color: 0xFFD700 })
            );
            latch.position.set(0, 0.6, 0.4);
            group.add(latch);
            return group;
        },
        y: 0,
        interactions: { openable: true, states: ['closed', 'open'] }
    },
    suitcase: {
        name: 'Suitcase',
        category: 'stage',
        create: () => {
            const group = new THREE.Group();
            const body = new THREE.Mesh(
                new THREE.BoxGeometry(0.8, 0.3, 0.5),
                new THREE.MeshPhongMaterial({ color: 0x8B4513 })
            );
            body.position.y = 0.15;
            group.add(body);
            const handle = new THREE.Mesh(
                new THREE.TorusGeometry(0.15, 0.02, 8, 16, Math.PI),
                new THREE.MeshPhongMaterial({ color: 0x654321 })
            );
            handle.rotation.x = Math.PI / 2;
            handle.position.y = 0.35;
            group.add(handle);
            return group;
        },
        y: 0,
        interactions: { grabbable: true, throwable: false }
    },
    trunk: {
        name: 'Storage Trunk',
        category: 'stage',
        create: () => {
            const group = new THREE.Group();
            const body = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 0.8, 0.9),
                new THREE.MeshPhongMaterial({ color: 0x654321 })
            );
            body.position.y = 0.4;
            group.add(body);
            // Metal bands
            for (let x of [-0.5, 0, 0.5]) {
                const band = new THREE.Mesh(
                    new THREE.BoxGeometry(0.05, 0.82, 0.92),
                    new THREE.MeshPhongMaterial({ color: 0x444444 })
                );
                band.position.set(x, 0.4, 0);
                group.add(band);
            }
            return group;
        },
        y: 0,
        interactions: { openable: true, states: ['closed', 'open'] }
    },
    ladder: {
        name: 'Ladder',
        category: 'stage',
        create: () => {
            const group = new THREE.Group();
            const sideGeometry = new THREE.BoxGeometry(0.1, 2.5, 0.1);
            const sideMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
            for (let x of [-0.3, 0.3]) {
                const side = new THREE.Mesh(sideGeometry, sideMaterial);
                side.position.set(x, 1.25, 0);
                group.add(side);
            }
            // Rungs
            const rungGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8);
            const rungMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 });
            for (let i = 0; i < 8; i++) {
                const rung = new THREE.Mesh(rungGeometry, rungMaterial);
                rung.rotation.z = Math.PI / 2;
                rung.position.y = 0.3 + i * 0.3;
                group.add(rung);
            }
            return group;
        },
        y: 0,
        interactions: {}
    },

    // ======================================
    // BASIC SHAPES
    // ======================================
    cube: {
        name: 'Cube',
        category: 'basic',
        create: () => new THREE.BoxGeometry(1, 1, 1),
        color: 0x808080,
        y: 0.5,
        interactions: { grabbable: true, throwable: true }
    },
    sphere: {
        name: 'Sphere',
        category: 'basic',
        create: () => new THREE.SphereGeometry(0.5, 16, 16),
        color: 0x808080,
        y: 0.5,
        interactions: { grabbable: true, throwable: true }
    },
    cylinder: {
        name: 'Cylinder',
        category: 'basic',
        create: () => new THREE.CylinderGeometry(0.5, 0.5, 1, 16),
        color: 0x808080,
        y: 0.5,
        interactions: { grabbable: true, throwable: true }
    },
    cone: {
        name: 'Cone',
        category: 'basic',
        create: () => new THREE.ConeGeometry(0.5, 1, 16),
        color: 0xFFA500,
        y: 0.5,
        interactions: { grabbable: true, throwable: true }
    },
    pyramid: {
        name: 'Pyramid',
        category: 'basic',
        create: () => new THREE.ConeGeometry(0.7, 1.2, 4),
        color: 0xFFD700,
        y: 0.6,
        interactions: { grabbable: true, throwable: false }
    },
    torus: {
        name: 'Torus',
        category: 'basic',
        create: () => new THREE.TorusGeometry(0.5, 0.2, 16, 32),
        color: 0x00CED1,
        y: 0.5,
        interactions: { grabbable: true, throwable: true }
    },

    // ======================================
    // DECORATIVE
    // ======================================
    plant: {
        name: 'Potted Plant',
        category: 'decorative',
        create: () => {
            const group = new THREE.Group();
            const pot = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.25, 0.4, 8),
                new THREE.MeshPhongMaterial({ color: 0x8B4513 })
            );
            pot.position.y = 0.2;
            group.add(pot);
            const plantGeometry = new THREE.ConeGeometry(0.4, 0.8, 6);
            const plantMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });
            const plant = new THREE.Mesh(plantGeometry, plantMaterial);
            plant.position.y = 0.8;
            group.add(plant);
            return group;
        },
        y: 0,
        interactions: { grabbable: true, throwable: false }
    },
    fern: {
        name: 'Fern Plant',
        category: 'decorative',
        create: () => {
            const group = new THREE.Group();
            const pot = new THREE.Mesh(
                new THREE.CylinderGeometry(0.25, 0.2, 0.3, 8),
                new THREE.MeshPhongMaterial({ color: 0xCD853F })
            );
            pot.position.y = 0.15;
            group.add(pot);
            // Multiple fronds
            for (let i = 0; i < 6; i++) {
                const frond = new THREE.Mesh(
                    new THREE.ConeGeometry(0.15, 0.8, 4),
                    new THREE.MeshPhongMaterial({ color: 0x006400 })
                );
                frond.rotation.x = Math.PI / 6;
                frond.rotation.y = (Math.PI * 2 * i) / 6;
                frond.position.y = 0.5;
                group.add(frond);
            }
            return group;
        },
        y: 0,
        interactions: { grabbable: true, throwable: false }
    },
    lamp: {
        name: 'Floor Lamp',
        category: 'decorative',
        create: () => {
            const group = new THREE.Group();
            const base = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.3, 0.1, 8),
                new THREE.MeshPhongMaterial({ color: 0x444444 })
            );
            base.position.y = 0.05;
            group.add(base);
            const pole = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.05, 1.5),
                new THREE.MeshPhongMaterial({ color: 0x666666 })
            );
            pole.position.y = 0.75;
            group.add(pole);
            const shade = new THREE.Mesh(
                new THREE.CylinderGeometry(0.4, 0.2, 0.3, 8),
                new THREE.MeshPhongMaterial({ color: 0xFFFFE0 })
            );
            shade.position.y = 1.4;
            group.add(shade);
            return group;
        },
        y: 0,
        interactions: { toggleable: true, states: ['off', 'on'] }
    },
    tableLamp: {
        name: 'Table Lamp',
        category: 'decorative',
        create: () => {
            const group = new THREE.Group();
            const base = new THREE.Mesh(
                new THREE.CylinderGeometry(0.15, 0.15, 0.05, 8),
                new THREE.MeshPhongMaterial({ color: 0x8B4513 })
            );
            base.position.y = 0.025;
            group.add(base);
            const stem = new THREE.Mesh(
                new THREE.CylinderGeometry(0.03, 0.03, 0.4),
                new THREE.MeshPhongMaterial({ color: 0x666666 })
            );
            stem.position.y = 0.2;
            group.add(stem);
            const shade = new THREE.Mesh(
                new THREE.ConeGeometry(0.2, 0.15, 16),
                new THREE.MeshPhongMaterial({ color: 0xFFFACD })
            );
            shade.position.y = 0.48;
            group.add(shade);
            return group;
        },
        y: 0,
        interactions: { toggleable: true, states: ['off', 'on'] }
    },
    candelabra: {
        name: 'Candelabra',
        category: 'decorative',
        create: () => {
            const group = new THREE.Group();
            const base = new THREE.Mesh(
                new THREE.CylinderGeometry(0.2, 0.25, 0.1, 12),
                new THREE.MeshPhongMaterial({ color: 0xFFD700 })
            );
            base.position.y = 0.05;
            group.add(base);
            const stem = new THREE.Mesh(
                new THREE.CylinderGeometry(0.04, 0.04, 0.6),
                new THREE.MeshPhongMaterial({ color: 0xFFD700 })
            );
            stem.position.y = 0.3;
            group.add(stem);
            // Three candle holders
            for (let x of [-0.3, 0, 0.3]) {
                const holder = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.03, 0.03, 0.15),
                    new THREE.MeshPhongMaterial({ color: 0xFFD700 })
                );
                holder.position.set(x, 0.675, 0);
                group.add(holder);
                const candle = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.02, 0.02, 0.2),
                    new THREE.MeshPhongMaterial({ color: 0xFFFACD })
                );
                candle.position.set(x, 0.85, 0);
                group.add(candle);
            }
            return group;
        },
        y: 0,
        interactions: { toggleable: true, states: ['off', 'on'] }
    },
    vase: {
        name: 'Decorative Vase',
        category: 'decorative',
        create: () => {
            const group = new THREE.Group();
            const vase = new THREE.Mesh(
                new THREE.CylinderGeometry(0.2, 0.15, 0.6, 16),
                new THREE.MeshPhongMaterial({ color: 0x4169E1 })
            );
            vase.position.y = 0.3;
            group.add(vase);
            // Flowers
            for (let i = 0; i < 3; i++) {
                const flower = new THREE.Mesh(
                    new THREE.SphereGeometry(0.08, 8, 8),
                    new THREE.MeshPhongMaterial({ color: i === 0 ? 0xFF69B4 : i === 1 ? 0xFFFF00 : 0xFF0000 })
                );
                flower.position.set((i - 1) * 0.15, 0.7 + Math.random() * 0.2, 0);
                group.add(flower);
            }
            return group;
        },
        y: 0,
        interactions: { grabbable: true, throwable: false }
    },
    picture: {
        name: 'Picture Frame',
        category: 'decorative',
        create: () => {
            const group = new THREE.Group();
            const frame = new THREE.Mesh(
                new THREE.BoxGeometry(1, 0.8, 0.05),
                new THREE.MeshPhongMaterial({ color: 0x8B4513 })
            );
            frame.position.y = 1.5;
            group.add(frame);
            const canvas = new THREE.Mesh(
                new THREE.BoxGeometry(0.85, 0.65, 0.02),
                new THREE.MeshPhongMaterial({ color: 0x87CEEB })
            );
            canvas.position.set(0, 1.5, 0.015);
            group.add(canvas);
            return group;
        },
        y: 0,
        interactions: {}
    },
    mirror: {
        name: 'Standing Mirror',
        category: 'decorative',
        create: () => {
            const group = new THREE.Group();
            const frame = new THREE.Mesh(
                new THREE.BoxGeometry(1.2, 1.8, 0.1),
                new THREE.MeshPhongMaterial({ color: 0xFFD700 })
            );
            frame.position.y = 1;
            group.add(frame);
            const glass = new THREE.Mesh(
                new THREE.BoxGeometry(1.1, 1.7, 0.02),
                new THREE.MeshPhongMaterial({ color: 0xC0C0C0, shininess: 100 })
            );
            glass.position.set(0, 1, 0.04);
            group.add(glass);
            // Base
            const base = new THREE.Mesh(
                new THREE.BoxGeometry(0.8, 0.1, 0.4),
                new THREE.MeshPhongMaterial({ color: 0x654321 })
            );
            base.position.y = 0.05;
            group.add(base);
            return group;
        },
        y: 0,
        interactions: {}
    },
    rug: {
        name: 'Area Rug',
        category: 'decorative',
        create: () => {
            const group = new THREE.Group();
            const rug = new THREE.Mesh(
                new THREE.BoxGeometry(2.5, 0.02, 1.8),
                new THREE.MeshPhongMaterial({ color: 0x8B0000 })
            );
            rug.position.y = 0.01;
            group.add(rug);
            // Pattern
            const pattern = new THREE.Mesh(
                new THREE.BoxGeometry(2, 0.03, 1.3),
                new THREE.MeshPhongMaterial({ color: 0xFFD700 })
            );
            pattern.position.y = 0.015;
            group.add(pattern);
            return group;
        },
        y: 0,
        interactions: {}
    },
    curtain: {
        name: 'Window Curtain',
        category: 'decorative',
        create: () => {
            const group = new THREE.Group();
            // Rod
            const rod = new THREE.Mesh(
                new THREE.CylinderGeometry(0.02, 0.02, 1.5, 8),
                new THREE.MeshPhongMaterial({ color: 0x444444 })
            );
            rod.rotation.z = Math.PI / 2;
            rod.position.y = 2;
            group.add(rod);
            // Curtain panels
            for (let x of [-0.5, 0.5]) {
                const panel = new THREE.Mesh(
                    new THREE.BoxGeometry(0.6, 1.8, 0.05),
                    new THREE.MeshPhongMaterial({ color: 0x4169E1 })
                );
                panel.position.set(x, 1, 0);
                group.add(panel);
            }
            return group;
        },
        y: 0,
        interactions: {}
    },

    // ======================================
    // SPECIAL / THEATRICAL
    // ======================================
    throne: {
        name: 'Throne',
        category: 'special',
        create: () => {
            const group = new THREE.Group();
            // Seat
            const seat = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 0.15, 1.5),
                new THREE.MeshPhongMaterial({ color: 0x8B0000 })
            );
            seat.position.y = 0.8;
            group.add(seat);
            // Back
            const back = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 2, 0.15),
                new THREE.MeshPhongMaterial({ color: 0x8B0000 })
            );
            back.position.set(0, 1.8, -0.7);
            group.add(back);
            // Crown decoration
            const crown = new THREE.Mesh(
                new THREE.ConeGeometry(0.3, 0.4, 8),
                new THREE.MeshPhongMaterial({ color: 0xFFD700 })
            );
            crown.position.set(0, 2.9, -0.7);
            group.add(crown);
            // Arms
            for (let x of [-0.75, 0.75]) {
                const arm = new THREE.Mesh(
                    new THREE.BoxGeometry(0.2, 0.8, 1),
                    new THREE.MeshPhongMaterial({ color: 0x654321 })
                );
                arm.position.set(x, 1.2, 0);
                group.add(arm);
            }
            return group;
        },
        y: 0,
        interactions: { sittable: true, seatHeight: 0.8 }
    },
    podium: {
        name: 'Speaker Podium',
        category: 'special',
        create: () => {
            const group = new THREE.Group();
            const base = new THREE.Mesh(
                new THREE.BoxGeometry(0.6, 0.1, 0.6),
                new THREE.MeshPhongMaterial({ color: 0x654321 })
            );
            base.position.y = 0.05;
            group.add(base);
            const column = new THREE.Mesh(
                new THREE.BoxGeometry(0.5, 1.2, 0.5),
                new THREE.MeshPhongMaterial({ color: 0x8B4513 })
            );
            column.position.y = 0.65;
            group.add(column);
            const top = new THREE.Mesh(
                new THREE.BoxGeometry(0.8, 0.05, 0.6),
                new THREE.MeshPhongMaterial({ color: 0x654321 })
            );
            top.position.y = 1.275;
            top.rotation.x = -0.1;
            group.add(top);
            return group;
        },
        y: 0,
        interactions: {}
    },
    fountain: {
        name: 'Decorative Fountain',
        category: 'special',
        create: () => {
            const group = new THREE.Group();
            // Base
            const base = new THREE.Mesh(
                new THREE.CylinderGeometry(0.8, 0.9, 0.3, 16),
                new THREE.MeshPhongMaterial({ color: 0x708090 })
            );
            base.position.y = 0.15;
            group.add(base);
            // Mid tier
            const mid = new THREE.Mesh(
                new THREE.CylinderGeometry(0.5, 0.6, 0.2, 16),
                new THREE.MeshPhongMaterial({ color: 0x708090 })
            );
            mid.position.y = 0.5;
            group.add(mid);
            // Top
            const top = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.35, 0.15, 16),
                new THREE.MeshPhongMaterial({ color: 0x708090 })
            );
            top.position.y = 0.8;
            group.add(top);
            // Central spout
            const spout = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.05, 0.9),
                new THREE.MeshPhongMaterial({ color: 0x708090 })
            );
            spout.position.y = 0.6;
            group.add(spout);
            return group;
        },
        y: 0,
        interactions: {}
    },
    altar: {
        name: 'Altar',
        category: 'special',
        create: () => {
            const group = new THREE.Group();
            // Platform
            const platform = new THREE.Mesh(
                new THREE.BoxGeometry(2, 0.15, 1),
                new THREE.MeshPhongMaterial({ color: 0xFFFFFF })
            );
            platform.position.y = 0.075;
            group.add(platform);
            // Main block
            const main = new THREE.Mesh(
                new THREE.BoxGeometry(1.8, 1, 0.8),
                new THREE.MeshPhongMaterial({ color: 0xF5F5DC })
            );
            main.position.y = 0.65;
            group.add(main);
            // Candles
            for (let x of [-0.6, 0, 0.6]) {
                const candle = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.04, 0.04, 0.3),
                    new THREE.MeshPhongMaterial({ color: 0xFFFACD })
                );
                candle.position.set(x, 1.3, 0);
                group.add(candle);
            }
            return group;
        },
        y: 0,
        interactions: {}
    },
    statue: {
        name: 'Decorative Statue',
        category: 'special',
        create: () => {
            const group = new THREE.Group();
            // Pedestal
            const pedestal = new THREE.Mesh(
                new THREE.BoxGeometry(0.6, 0.8, 0.6),
                new THREE.MeshPhongMaterial({ color: 0x708090 })
            );
            pedestal.position.y = 0.4;
            group.add(pedestal);
            // Statue body
            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.2, 0.25, 0.8, 8),
                new THREE.MeshPhongMaterial({ color: 0xC0C0C0 })
            );
            body.position.y = 1.2;
            group.add(body);
            // Head
            const head = new THREE.Mesh(
                new THREE.SphereGeometry(0.2, 16, 16),
                new THREE.MeshPhongMaterial({ color: 0xC0C0C0 })
            );
            head.position.y = 1.7;
            group.add(head);
            return group;
        },
        y: 0,
        interactions: {}
    },
    door: {
        name: 'Door with Frame',
        category: 'special',
        create: () => {
            const group = new THREE.Group();
            // Door frame
            const frameMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 });
            const leftPost = new THREE.Mesh(
                new THREE.BoxGeometry(0.1, 2.5, 0.1),
                frameMaterial
            );
            leftPost.position.set(-1, 1.25, 0);
            group.add(leftPost);
            const rightPost = new THREE.Mesh(
                new THREE.BoxGeometry(0.1, 2.5, 0.1),
                frameMaterial
            );
            rightPost.position.set(1, 1.25, 0);
            group.add(rightPost);
            const topPost = new THREE.Mesh(
                new THREE.BoxGeometry(2.2, 0.1, 0.1),
                frameMaterial
            );
            topPost.position.set(0, 2.5, 0);
            group.add(topPost);
            // Door panel
            const door = new THREE.Mesh(
                new THREE.BoxGeometry(1.8, 2.3, 0.1),
                new THREE.MeshPhongMaterial({ color: 0x8B4513 })
            );
            door.position.set(0, 1.15, 0);
            door.userData.isDoorPanel = true;
            group.add(door);
            // Door knob
            const knob = new THREE.Mesh(
                new THREE.SphereGeometry(0.08, 8, 8),
                new THREE.MeshPhongMaterial({ color: 0xFFD700 })
            );
            knob.position.set(0.7, 1.15, 0.1);
            group.add(knob);
            return group;
        },
        y: 0,
        interactions: { openable: true, states: ['closed', 'open'] }
    },
    window: {
        name: 'Window Frame',
        category: 'special',
        create: () => {
            const group = new THREE.Group();
            // Frame
            const frameGeometry = new THREE.BoxGeometry(1.5, 1.8, 0.1);
            const frameMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
            const frame = new THREE.Mesh(frameGeometry, frameMaterial);
            frame.position.y = 1.5;
            group.add(frame);
            // Glass panes
            const glassGeometry = new THREE.BoxGeometry(0.7, 0.85, 0.02);
            const glassMaterial = new THREE.MeshPhongMaterial({ color: 0x87CEEB, transparent: true, opacity: 0.3 });
            for (let x of [-0.375, 0.375]) {
                for (let y of [1.1, 1.9]) {
                    const pane = new THREE.Mesh(glassGeometry, glassMaterial);
                    pane.position.set(x, y, 0);
                    group.add(pane);
                }
            }
            // Mullions
            const mullionMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
            const vertMullion = new THREE.Mesh(
                new THREE.BoxGeometry(0.05, 1.7, 0.05),
                mullionMaterial
            );
            vertMullion.position.set(0, 1.5, 0);
            group.add(vertMullion);
            const horzMullion = new THREE.Mesh(
                new THREE.BoxGeometry(1.4, 0.05, 0.05),
                mullionMaterial
            );
            horzMullion.position.set(0, 1.5, 0);
            group.add(horzMullion);
            return group;
        },
        y: 0,
        interactions: {}
    },

    // ======================================
    // KITCHEN / RESTAURANT
    // ======================================
    stove: {
        name: 'Kitchen Stove',
        category: 'kitchen',
        create: () => {
            const group = new THREE.Group();
            const body = new THREE.Mesh(
                new THREE.BoxGeometry(1.2, 0.9, 0.8),
                new THREE.MeshPhongMaterial({ color: 0xC0C0C0 })
            );
            body.position.y = 0.45;
            group.add(body);
            // Burners
            for (let x of [-0.4, 0.4]) {
                for (let z of [-0.2, 0.2]) {
                    const burner = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.12, 0.12, 0.02, 16),
                        new THREE.MeshPhongMaterial({ color: 0x444444 })
                    );
                    burner.position.set(x, 0.91, z);
                    group.add(burner);
                }
            }
            return group;
        },
        y: 0,
        interactions: {}
    },
    refrigerator: {
        name: 'Refrigerator',
        category: 'kitchen',
        create: () => {
            const group = new THREE.Group();
            const body = new THREE.Mesh(
                new THREE.BoxGeometry(1, 2, 0.8),
                new THREE.MeshPhongMaterial({ color: 0xFFFFFF })
            );
            body.position.y = 1;
            group.add(body);
            // Handles
            for (let y of [1.5, 0.5]) {
                const handle = new THREE.Mesh(
                    new THREE.BoxGeometry(0.05, 0.3, 0.05),
                    new THREE.MeshPhongMaterial({ color: 0xC0C0C0 })
                );
                handle.position.set(0.4, y, 0.41);
                group.add(handle);
            }
            return group;
        },
        y: 0,
        interactions: {}
    },
    counter: {
        name: 'Kitchen Counter',
        category: 'kitchen',
        create: () => {
            const group = new THREE.Group();
            const top = new THREE.Mesh(
                new THREE.BoxGeometry(2, 0.08, 0.8),
                new THREE.MeshPhongMaterial({ color: 0x654321 })
            );
            top.position.y = 0.9;
            group.add(top);
            const cabinet = new THREE.Mesh(
                new THREE.BoxGeometry(1.9, 0.8, 0.75),
                new THREE.MeshPhongMaterial({ color: 0x8B4513 })
            );
            cabinet.position.y = 0.4;
            group.add(cabinet);
            return group;
        },
        y: 0,
        interactions: {}
    },
    sink: {
        name: 'Kitchen Sink',
        category: 'kitchen',
        create: () => {
            const group = new THREE.Group();
            const basin = new THREE.Mesh(
                new THREE.BoxGeometry(0.6, 0.3, 0.5),
                new THREE.MeshPhongMaterial({ color: 0xC0C0C0 })
            );
            basin.position.y = 0.85;
            group.add(basin);
            const faucet = new THREE.Mesh(
                new THREE.CylinderGeometry(0.03, 0.03, 0.3),
                new THREE.MeshPhongMaterial({ color: 0xC0C0C0 })
            );
            faucet.position.set(0, 1.15, -0.2);
            group.add(faucet);
            return group;
        },
        y: 0,
        interactions: {}
    },

    // ======================================
    // MEDICAL / HOSPITAL
    // ======================================
    hospitalBed: {
        name: 'Hospital Bed',
        category: 'medical',
        create: () => {
            const group = new THREE.Group();
            const frame = new THREE.Mesh(
                new THREE.BoxGeometry(2, 0.1, 1),
                new THREE.MeshPhongMaterial({ color: 0xC0C0C0 })
            );
            frame.position.y = 0.6;
            group.add(frame);
            const mattress = new THREE.Mesh(
                new THREE.BoxGeometry(1.9, 0.2, 0.9),
                new THREE.MeshPhongMaterial({ color: 0xFFFFFF })
            );
            mattress.position.y = 0.75;
            group.add(mattress);
            // Headboard
            const headboard = new THREE.Mesh(
                new THREE.BoxGeometry(1.1, 0.8, 0.1),
                new THREE.MeshPhongMaterial({ color: 0xC0C0C0 })
            );
            headboard.position.set(0, 1, -0.5);
            group.add(headboard);
            // Wheels
            for (let x of [-0.9, 0.9]) {
                for (let z of [-0.4, 0.4]) {
                    const wheel = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.08, 0.08, 0.05, 8),
                        new THREE.MeshPhongMaterial({ color: 0x444444 })
                    );
                    wheel.rotation.x = Math.PI / 2;
                    wheel.position.set(x, 0.08, z);
                    group.add(wheel);
                }
            }
            return group;
        },
        y: 0,
        interactions: {}
    },
    ivStand: {
        name: 'IV Stand',
        category: 'medical',
        create: () => {
            const group = new THREE.Group();
            const base = new THREE.Mesh(
                new THREE.CylinderGeometry(0.25, 0.25, 0.05, 8),
                new THREE.MeshPhongMaterial({ color: 0xC0C0C0 })
            );
            base.position.y = 0.025;
            group.add(base);
            const pole = new THREE.Mesh(
                new THREE.CylinderGeometry(0.02, 0.02, 2),
                new THREE.MeshPhongMaterial({ color: 0xC0C0C0 })
            );
            pole.position.y = 1;
            group.add(pole);
            const hook = new THREE.Mesh(
                new THREE.TorusGeometry(0.1, 0.02, 8, 16, Math.PI),
                new THREE.MeshPhongMaterial({ color: 0xC0C0C0 })
            );
            hook.rotation.x = Math.PI / 2;
            hook.position.y = 1.9;
            group.add(hook);
            const bag = new THREE.Mesh(
                new THREE.SphereGeometry(0.15, 16, 16),
                new THREE.MeshPhongMaterial({ color: 0xCCE5FF, transparent: true, opacity: 0.7 })
            );
            bag.position.y = 1.7;
            bag.scale.y = 1.3;
            group.add(bag);
            return group;
        },
        y: 0,
        interactions: {}
    },
    medicalCart: {
        name: 'Medical Cart',
        category: 'medical',
        create: () => {
            const group = new THREE.Group();
            // Shelves
            for (let i = 0; i < 3; i++) {
                const shelf = new THREE.Mesh(
                    new THREE.BoxGeometry(0.8, 0.05, 0.6),
                    new THREE.MeshPhongMaterial({ color: 0xC0C0C0 })
                );
                shelf.position.y = 0.3 + i * 0.3;
                group.add(shelf);
            }
            // Wheels
            for (let x of [-0.3, 0.3]) {
                for (let z of [-0.25, 0.25]) {
                    const wheel = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.05, 0.05, 0.05, 8),
                        new THREE.MeshPhongMaterial({ color: 0x444444 })
                    );
                    wheel.rotation.x = Math.PI / 2;
                    wheel.position.set(x, 0.05, z);
                    group.add(wheel);
                }
            }
            return group;
        },
        y: 0,
        interactions: {}
    }
};

// If PROP_CATALOG exists, merge the expanded catalog into it
if (typeof PROP_CATALOG !== 'undefined') {
    Object.assign(PROP_CATALOG, EXPANDED_PROP_CATALOG);
} else {
    // Otherwise, create it
    var PROP_CATALOG = EXPANDED_PROP_CATALOG;
}
