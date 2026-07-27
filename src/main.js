import * as THREE from 'three';
import { Timer } from 'three/examples/jsm/misc/Timer.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

import { MODES, MODE_KEYS } from './merkaba.js';
import { MerkabaAudio } from './merkaba-audio.js';
import { SHAPE_SETS, SHAPE_LABELS, createShape } from './sacred-geometry/index.js';

let camera, renderer, composer, timer, audio;
let scene;
let currentShape = null;
let bloomPass = null;
let gui = null;

const appState = {
  currentSet: 'Estrellas',
  currentShapeKey: 'merkaba',
  viewMode: 'simple',
  mode: 'SYNC_SAME',
  baseSpeed: 0.8,
  separation: 0,
  ratio: 34 / 21,
  colorTop: '#80d0ff',
  colorBottom: '#ff80c0',
  showFaces: true,
  showEdges: true,
  faceOpacity: 0.18,
  edgeThickness: 1,
  pulseFreq: 0.5,
  pendulumAmp: Math.PI / 2,
  pendulumFreq: 0.5,
  spiralAmp: 0.25,
  spiralFreq: 0.4,
  accelFreq: 0.3,
  free3DAmount: 0.35,
};

const bloomParams = { threshold: 0, strength: 1.5, radius: 0.5, exposure: 1 };
const audioParams = { volume: 0.3, frequency: 528, binaural: true, binauralDelta: 4, playing: false };

init();

function init() {
  const container = document.getElementById('container');
  timer = new Timer();
  audio = new MerkabaAudio();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100);
  camera.position.set(0, 2, 6);
  scene.add(camera);
  scene.add(new THREE.AmbientLight(0x404040, 0.5));
  const pointLight = new THREE.PointLight(0xffffff, 20);
  camera.add(pointLight);

  currentShape = createShape('merkaba', { mode: 'SYNC_SAME' });
  scene.add(currentShape.group);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);

  const renderScene = new RenderPass(scene, camera);
  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    bloomParams.strength, bloomParams.radius, bloomParams.threshold
  );
  const outputPass = new OutputPass();
  composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);
  composer.addPass(outputPass);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI * 0.85;
  controls.minDistance = 3;
  controls.maxDistance = 15;

  buildGUI();
  window.addEventListener('resize', onWindowResize);
}

function switchShape(shapeKey) {
  if (currentShape) {
    scene.remove(currentShape.group);
    currentShape.dispose();
  }
  appState.currentShapeKey = shapeKey;
  currentShape = createShape(shapeKey, {
    radius: 1.6,
    baseSpeed: appState.baseSpeed,
    separation: appState.separation,
    ratio: appState.ratio,
    mode: appState.mode,
    colorTop: appState.colorTop,
    colorBottom: appState.colorBottom,
    faceOpacity: appState.faceOpacity,
    edgeThickness: appState.edgeThickness,
    showFaces: appState.showFaces,
    showEdges: appState.showEdges,
  });
  scene.add(currentShape.group);
  audio.setMode(appState.mode);
}

function buildGUI() {
  if (gui) gui.destroy();
  gui = new GUI({ title: 'Merkaba Controls', closeFolders: true });

  const viewToggle = { vista: appState.viewMode === 'full' ? 'Completa' : 'Simplificada' };
  gui.add(viewToggle, 'vista', ['Completa', 'Simplificada']).name('Vista').onChange(v => {
    appState.viewMode = v === 'Completa' ? 'full' : 'simple';
    buildGUI();
  });

  const shapeSetNames = Object.keys(SHAPE_SETS);
  gui.add({ set: appState.currentSet }, 'set', shapeSetNames).name('Set').onChange(v => {
    appState.currentSet = v;
    const firstShape = SHAPE_SETS[v][0];
    if (firstShape !== appState.currentShapeKey) switchShape(firstShape);
    buildGUI();
  });

  const shapeNames = SHAPE_SETS[appState.currentSet];
  const shapeDisplayName = {};
  for (const key of shapeNames) shapeDisplayName[key] = SHAPE_LABELS[key];
  gui.add({ shape: appState.currentShapeKey }, 'shape', shapeDisplayName).name('Forma').onChange(v => {
    switchShape(v);
  });

  const modeDisplayName = {};
  for (const key of MODE_KEYS) modeDisplayName[key] = MODES[key];
  gui.add({ mode: appState.mode }, 'mode', modeDisplayName).name('Animación').onChange(v => {
    appState.mode = v;
    currentShape.setMode(v);
    audio.setMode(v);
  });

  if (appState.viewMode === 'full') {
    const motionFolder = gui.addFolder('Movimiento');
    motionFolder.add(appState, 'baseSpeed', 0, 3, 0.05).name('Velocidad base').onChange(v => { appState.baseSpeed = v; currentShape.baseSpeed = v; });
    motionFolder.add(appState, 'separation', 0, 3, 0.05).name('Separación').onChange(v => { appState.separation = v; currentShape.setSeparation(v); });
    motionFolder.add(appState, 'ratio', 1, 5, 0.1).name('Ratio').onChange(v => { appState.ratio = v; currentShape.setRatio(v); });

    const pulseFolder = gui.addFolder('Pulso / Efectos');
    pulseFolder.add(appState, 'pulseFreq', 0.1, 3, 0.1).name('Freq pulso').onChange(v => { currentShape.pulseFreq = v; });
    pulseFolder.add(appState, 'pendulumAmp', 0, Math.PI, 0.05).name('Amplitud péndulo').onChange(v => { currentShape.pendulumAmp = v; });
    pulseFolder.add(appState, 'pendulumFreq', 0.1, 3, 0.1).name('Freq péndulo').onChange(v => { currentShape.pendulumFreq = v; });
    pulseFolder.add(appState, 'spiralAmp', 0, 1, 0.05).name('Amplitud espiral').onChange(v => { currentShape.spiralAmp = v; });
    pulseFolder.add(appState, 'spiralFreq', 0.1, 2, 0.1).name('Freq espiral').onChange(v => { currentShape.spiralFreq = v; });
    pulseFolder.add(appState, 'accelFreq', 0.1, 2, 0.1).name('Freq aceleración').onChange(v => { currentShape.accelFreq = v; });
    pulseFolder.add(appState, 'free3DAmount', 0, 1, 0.05).name('Libre 3D amount').onChange(v => { currentShape.free3DAmount = v; });
  }

  const visualFolder = appState.viewMode === 'full' ? gui.addFolder('Visual') : gui;
  visualFolder.add(appState, 'showFaces').name('Caras').onChange(v => { appState.showFaces = v; currentShape.setVisuals({ showFaces: v }); });
  visualFolder.add(appState, 'showEdges').name('Bordes').onChange(v => { appState.showEdges = v; currentShape.setVisuals({ showEdges: v }); });
  if (appState.viewMode === 'full') {
    visualFolder.add(appState, 'faceOpacity', 0, 1, 0.01).name('Opacidad caras').onChange(v => { appState.faceOpacity = v; currentShape.setVisuals({ faceOpacity: v }); });
    visualFolder.add(appState, 'edgeThickness', 1, 5, 1).name('Grosor bordes').onChange(v => { appState.edgeThickness = v; currentShape.setVisuals({ edgeThickness: v }); });
  }

  const colorFolder = gui.addFolder('Colores');
  colorFolder.addColor(appState, 'colorTop').name('Superior').onChange(v => { appState.colorTop = v; currentShape.setColors(v, undefined); });
  colorFolder.addColor(appState, 'colorBottom').name('Inferior').onChange(v => { appState.colorBottom = v; currentShape.setColors(undefined, v); });

  if (appState.viewMode === 'full') {
    const bloomFolder = gui.addFolder('Bloom');
    bloomFolder.add(bloomParams, 'threshold', 0, 1, 0.05).name('Threshold').onChange(v => bloomPass.threshold = v);
    bloomFolder.add(bloomParams, 'strength', 0, 3, 0.1).name('Strength').onChange(v => bloomPass.strength = v);
    bloomFolder.add(bloomParams, 'radius', 0, 1, 0.05).name('Radius').onChange(v => bloomPass.radius = v);
    bloomFolder.add(bloomParams, 'exposure', 0.1, 2, 0.1).name('Exposure').onChange(v => renderer.toneMappingExposure = Math.pow(v, 4.0));
  }

  const audioFolder = gui.addFolder('Audio');
  audioFolder.add(audioParams, 'playing').name('▶ Iniciar / Detener').onChange(v => { if (v) audio.start(); else audio.stop(); });
  audioFolder.add(audioParams, 'volume', 0, 1, 0.01).name('Volumen').onChange(v => audio.setVolume(v));
  if (appState.viewMode === 'full') {
    audioFolder.add(audioParams, 'frequency', 396, 963, 1).name('Frecuencia (Hz)').onChange(v => audio.setFrequency(v));
    audioFolder.add(audioParams, 'binaural').name('Binaural beats').onChange(v => audio.toggleBinaural(v));
    audioFolder.add(audioParams, 'binauralDelta', 1, 30, 1).name('Delta binaural (Hz)').onChange(v => audio.setBinauralDelta(v));
    audioFolder.add({ chakra: 'plexo' }, 'chakra', {
      'Raíz (396 Hz)': 396, 'Sacro (417 Hz)': 417, 'Plexo (528 Hz)': 528,
      'Corazón (639 Hz)': 639, 'Garganta (741 Hz)': 741, 'Tercera (852 Hz)': 852,
      'Corona (963 Hz)': 963,
    }).name('Chakra').onChange(v => { audioParams.frequency = v; audio.setFrequency(v); });
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  timer.update();
  const delta = timer.getDelta();
  currentShape.update(delta);
  audio.update(delta, currentShape);
  composer.render();
}
