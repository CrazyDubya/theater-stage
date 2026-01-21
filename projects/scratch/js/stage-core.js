/**
 * @file Stage Core Module - Scene, camera, renderer, lighting, and controls
 * @module stage-core
 */

/**
 * @typedef {Object} THREE.Scene
 * @typedef {Object} THREE.PerspectiveCamera
 * @typedef {Object} THREE.WebGLRenderer
 * @typedef {Object} THREE.OrbitControls
 * @typedef {Object} THREE.Light
 */

/** @type {THREE.Scene} */
export let scene;
/** @type {THREE.PerspectiveCamera} */
export let camera;
/** @type {THREE.WebGLRenderer} */
export let renderer;
/** @type {THREE.OrbitControls} */
export let controls;
/** @type {Array<THREE.Light>} */
export let lights = [];

/**
 * Initialize the Three.js scene, camera, and renderer
 * Sets up the basic 3D environment for the theater stage
 * @returns {void}
 */
export function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x001122);
    scene.fog = new THREE.Fog(0x001122, 10, 100);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 20);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);
}

/**
 * Create and configure stage lighting
 * Sets up ambient light and multiple spotlights for dramatic effect
 * @returns {void}
 */
export function createLighting() {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const spotLight1 = new THREE.SpotLight(0xffffff, 1);
    spotLight1.position.set(-10, 15, 10);
    spotLight1.target.position.set(-5, 0, 0);
    spotLight1.angle = Math.PI / 6;
    spotLight1.penumbra = 0.3;
    spotLight1.castShadow = true;
    spotLight1.shadow.mapSize.width = 1024;
    spotLight1.shadow.mapSize.height = 1024;
    scene.add(spotLight1);
    scene.add(spotLight1.target);

    const spotLight2 = new THREE.SpotLight(0xffffff, 1);
    spotLight2.position.set(10, 15, 10);
    spotLight2.target.position.set(5, 0, 0);
    spotLight2.angle = Math.PI / 6;
    spotLight2.penumbra = 0.3;
    spotLight2.castShadow = true;
    spotLight2.shadow.mapSize.width = 1024;
    spotLight2.shadow.mapSize.height = 1024;
    scene.add(spotLight2);
    scene.add(spotLight2.target);

    const centerSpotLight = new THREE.SpotLight(0xffd700, 0.8);
    centerSpotLight.position.set(0, 15, 10);
    centerSpotLight.target.position.set(0, 0, 0);
    centerSpotLight.angle = Math.PI / 4;
    centerSpotLight.penumbra = 0.5;
    centerSpotLight.castShadow = true;
    scene.add(centerSpotLight);
    scene.add(centerSpotLight.target);

    const footLight1 = new THREE.PointLight(0x4169e1, 0.5, 10);
    footLight1.position.set(-8, 0.5, 7);
    scene.add(footLight1);

    const footLight2 = new THREE.PointLight(0x4169e1, 0.5, 10);
    footLight2.position.set(0, 0.5, 7);
    scene.add(footLight2);

    const footLight3 = new THREE.PointLight(0x4169e1, 0.5, 10);
    footLight3.position.set(8, 0.5, 7);
    scene.add(footLight3);

    lights.push(spotLight1, spotLight2, centerSpotLight);
}

/**
 * Add OrbitControls for camera manipulation
 * Enables mouse/touch controls for rotating and zooming the camera
 * @returns {void}
 */
export function addControls() {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2;
}

/**
 * Handle window resize events
 * Updates camera aspect ratio and renderer size to maintain proper display
 * @returns {void}
 */
export function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
