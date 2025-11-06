/**

Three.js 3D Game Template

A simple 3D game template using Three.js with first-person controls
Works in both browser and jsgamelauncher

Controls:
- WASD: Move (fly in direction you're looking)
- Arrow keys: Look around (camera)
- Space: Play sound

**/

import * as THREE from 'three';
import { loadSound, playSound, getInput } from './utils.js';

const canvas = document.getElementById('game-canvas');
const { width, height } = canvas;

console.log('Setting up 3D game...');

// Create Three.js scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Sky blue

const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
camera.position.set(0, 1.6, 5); // Eye level height

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: false,
});
renderer.setSize(width, height);

console.log('✓ Three.js renderer created');

// Add ambient light
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Add directional light (sun)
const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
sunLight.position.set(5, 10, 5);
scene.add(sunLight);

// Create ground
const groundGeometry = new THREE.PlaneGeometry(20, 20);
const groundMaterial = new THREE.MeshPhongMaterial({
  color: 0x228B22, // Forest green
  side: THREE.DoubleSide,
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Load crate texture
let crateTexture;
let crates = [];

loadImage('images/crate.jpg').then((img) => {
  console.log('✓ Crate texture loaded');

  crateTexture = new THREE.Texture(img._imgImpl || img);
  crateTexture.needsUpdate = true;
  // Non-power-of-two texture settings
  crateTexture.wrapS = THREE.ClampToEdgeWrapping;
  crateTexture.wrapT = THREE.ClampToEdgeWrapping;
  crateTexture.minFilter = THREE.LinearFilter;

  // Create crates with texture
  const crateGeometry = new THREE.BoxGeometry(1, 1, 1);
  const crateMaterial = new THREE.MeshPhongMaterial({
    map: crateTexture,
  });

  const crate1 = new THREE.Mesh(crateGeometry, crateMaterial);
  crate1.position.set(-3, 0.5, -2);
  scene.add(crate1);
  crates.push(crate1);

  const crate2 = new THREE.Mesh(crateGeometry, crateMaterial);
  crate2.position.set(2, 0.5, -4);
  scene.add(crate2);
  crates.push(crate2);

  const crate3 = new THREE.Mesh(crateGeometry, crateMaterial);
  crate3.position.set(0, 0.5, -7);
  scene.add(crate3);
  crates.push(crate3);

  const crate4 = new THREE.Mesh(crateGeometry, crateMaterial);
  crate4.position.set(-2, 0.5, -5);
  scene.add(crate4);
  crates.push(crate4);

  const crate5 = new THREE.Mesh(crateGeometry, crateMaterial);
  crate5.position.set(-2, 1.5, -5);
  scene.add(crate5);
  crates.push(crate5);
}).catch((err) => {
  console.warn('Could not load crate texture, using fallback color:', err);

  // Fallback: create crates without texture
  const crateGeometry = new THREE.BoxGeometry(1, 1, 1);
  const crateMaterial = new THREE.MeshPhongMaterial({
    color: 0x8B4513,
  });

  const crate1 = new THREE.Mesh(crateGeometry, crateMaterial);
  crate1.position.set(-3, 0.5, -2);
  scene.add(crate1);
  crates.push(crate1);

  const crate2 = new THREE.Mesh(crateGeometry, crateMaterial);
  crate2.position.set(2, 0.5, -4);
  scene.add(crate2);
  crates.push(crate2);

  const crate3 = new THREE.Mesh(crateGeometry, crateMaterial);
  crate3.position.set(0, 0.5, -7);
  scene.add(crate3);
  crates.push(crate3);

  const crate4 = new THREE.Mesh(crateGeometry, crateMaterial);
  crate4.position.set(-2, 0.5, -5);
  scene.add(crate4);
  crates.push(crate4);

  const crate5 = new THREE.Mesh(crateGeometry, crateMaterial);
  crate5.position.set(-2, 1.5, -5);
  scene.add(crate5);
  crates.push(crate5);
});

// Load laser sound
let laserSound;
let lastShotTime = 0;
console.log('Loading laser sound...');
loadSound('sounds/laser.mp3').then((sound) => {
  console.log('✓ Laser sound loaded');
  laserSound = sound;
}).catch((err) => {
  console.warn('Could not load laser sound:', err);
});

console.log('✓ 3D scene ready');

let lastTime = performance.now();

// Camera rotation
let cameraYaw = 0; // Left/right
let cameraPitch = 0; // Up/down

function animate(time) {
  const currentTime = time;
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  // Handle input
  const players = getInput();
  const player = players[0]; // First player (gamepad or keyboard)

  const moveSpeed = 3; // units per second
  const lookSpeed = 2; // radians per second

  // Movement (WASD or Left stick analog) - relative to camera direction (full 6DOF flying)
  const moveX = player.LEFT_STICK_X;
  const moveZ = player.LEFT_STICK_Y;

  if (moveX !== 0 || moveZ !== 0) {
    // Get camera's forward direction including pitch (up/down)
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyAxisAngle(new THREE.Vector3(1, 0, 0), cameraPitch); // Apply pitch
    forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw);   // Apply yaw

    // Get camera's right direction (strafe)
    const right = new THREE.Vector3(1, 0, 0);
    right.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw);

    // Combine forward/back and left/right movement
    const direction = new THREE.Vector3();
    direction.addScaledVector(right, moveX);
    direction.addScaledVector(forward, -moveZ); // Negate Z for correct forward direction

    direction.multiplyScalar(moveSpeed * deltaTime);
    camera.position.add(direction);
  }

  // Camera look (Arrow keys/IJKL or Right stick)
  const lookX = player.RIGHT_STICK_X;
  const lookY = player.RIGHT_STICK_Y;

  if (lookX !== 0 || lookY !== 0) {
    cameraYaw -= lookX * lookSpeed * deltaTime;
    cameraPitch -= lookY * lookSpeed * deltaTime; // Down stick = look down

    // Clamp pitch to avoid flipping
    cameraPitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraPitch));
  }

  // Apply camera rotation
  camera.rotation.order = 'YXZ';
  camera.rotation.y = cameraYaw;
  camera.rotation.x = cameraPitch;

  // Play laser sound when south button is pressed (with cooldown)
  if (player.BUTTON_SOUTH.pressed && laserSound) {
    if (currentTime - lastShotTime > 300) { // 300ms cooldown
      playSound(laserSound);
      lastShotTime = currentTime;
    }
  }

  // Render scene
  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}

// Start animation
requestAnimationFrame(animate);

console.log('3D game started!');
