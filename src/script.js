import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'lil-gui';
import galaxyVertexShader from './shaders/galaxy/vertex.glsl';
import galaxyFragmentShader from './shaders/galaxy/fragment.glsl';

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Galaxy
 */
const galaxyParameters = {};
galaxyParameters.count = 100000;
galaxyParameters.size = 0.02;
galaxyParameters.radius = 5;
galaxyParameters.branches = 3;
galaxyParameters.spin = 0;
galaxyParameters.randomness = 0.2;
galaxyParameters.randomnessPower = 3;
galaxyParameters.insideColor = '#ff6030';
galaxyParameters.outsideColor = '#1b3984';

let geometry = null;
let material = null;
let points = null;

const generateGalaxy = () => {
  // remove old galaxy
  if (points !== null) {
    geometry.dispose();
    material.dispose();
    scene.remove(points);
  }

  // Geometry
  geometry = new THREE.BufferGeometry();

  const positions = new Float32Array(galaxyParameters.count * 3);
  const colors = new Float32Array(galaxyParameters.count * 3); // color attribute also needs 3 values - rgb
  const scales = new Float32Array(galaxyParameters.count * 1);
  const randomness = new Float32Array(galaxyParameters.count * 3);

  const insideColor = new THREE.Color(galaxyParameters.insideColor);
  const outsideColor = new THREE.Color(galaxyParameters.outsideColor);

  for (let i = 0; i < galaxyParameters.count; i++) {
    const i3 = i * 3;

    // Position
    const radius = Math.random() * galaxyParameters.radius;
    const branchAngle =
      ((i % galaxyParameters.branches) / galaxyParameters.branches) *
      Math.PI *
      2;

    positions[i3] = Math.cos(branchAngle) * radius;
    positions[i3 + 1] = 0;
    positions[i3 + 2] = Math.sin(branchAngle) * radius;

    // Randomness
    const randomX =
      Math.pow(Math.random(), galaxyParameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      galaxyParameters.randomness *
      radius; // ternary operator was used to randomly make this value positive or negative, else all values would be positive
    const randomY =
      Math.pow(Math.random(), galaxyParameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      galaxyParameters.randomness *
      radius;
    const randomZ =
      Math.pow(Math.random(), galaxyParameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      galaxyParameters.randomness *
      radius;

    randomness[i3] = randomX;
    randomness[i3 + 1] = randomY;
    randomness[i3 + 2] = randomZ;

    // Color
    // lerp -> lerp will take the base color, then take it's first argument and interpolate between the two, depending on the second arguments value.
    // E.g. blue.lerp(red, 0) -> it will be completely blue
    //      blue.lerp(red, 1) -> it will be completely red
    //      blue.lerp(red, 0.5) -> it will be 50% blue, 50% red = purple
    // however, after using lerp, the original value (in this case 'blue') will get modified to it's new interpolated value, hence why we are cloning insideColor first, so when we go to use mixedColor the second time, it is still taking from 'insideColor', rather than a modified color value from the first loop

    const mixedColor = insideColor.clone();
    mixedColor.lerp(outsideColor, radius / galaxyParameters.radius);

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;

    // Scale
    scales[i] = Math.random();
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1)); // 'a' for attribute
  geometry.setAttribute(
    'aRandomness',
    new THREE.BufferAttribute(randomness, 3)
  );

  // Material
  material = new THREE.ShaderMaterial({
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    vertexShader: galaxyVertexShader,
    fragmentShader: galaxyFragmentShader,
    uniforms: {
      uSize: { value: 30 * renderer.getPixelRatio() },
      uTime: { value: 0 },
    },
  });

  // Points
  points = new THREE.Points(geometry, material);
  scene.add(points);
};

gui
  .add(galaxyParameters, 'count')
  .min(100)
  .max(1000000)
  .step(100)
  .onFinishChange(generateGalaxy);

gui
  .add(galaxyParameters, 'size')
  .min(0.001)
  .max(0.1)
  .step(0.001)
  .onFinishChange(generateGalaxy);

gui
  .add(galaxyParameters, 'radius')
  .min(0.01)
  .max(20)
  .step(0.01)
  .onFinishChange(generateGalaxy);

gui
  .add(galaxyParameters, 'branches')
  .min(2)
  .max(20)
  .step(1)
  .onFinishChange(generateGalaxy);

gui
  .add(galaxyParameters, 'randomness')
  .min(0)
  .max(2)
  .step(0.001)
  .onFinishChange(generateGalaxy);

gui
  .add(galaxyParameters, 'randomnessPower')
  .min(1)
  .max(10)
  .step(0.001)
  .onFinishChange(generateGalaxy);

gui.addColor(galaxyParameters, 'insideColor').onFinishChange(generateGalaxy);

gui.addColor(galaxyParameters, 'outsideColor').onFinishChange(generateGalaxy);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Generate the galaxy
generateGalaxy();

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update material
  material.uniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
