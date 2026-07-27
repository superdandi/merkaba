import * as THREE from 'three';
import { Timer } from 'three/examples/jsm/misc/Timer.js';
import { Pane } from 'tweakpane';
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
let pane = null;

const params = {
  currentSet: 'Estrellas',
  currentShapeKey: 'merkaba',
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
  bloomThreshold: 0,
  bloomStrength: 1.5,
  bloomRadius: 0.5,
  bloomExposure: 1,
  audioPlaying: false,
  audioVolume: 0.3,
  audioFrequency: 528,
  audioBinaural: true,
  audioBinauralDelta: 4,
};

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
    params.bloomStrength, params.bloomRadius, params.bloomThreshold
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

  buildPane();
  window.addEventListener('resize', onWindowResize);
}

function switchShape(shapeKey) {
  if (currentShape) {
    scene.remove(currentShape.group);
    currentShape.dispose();
  }
  params.currentShapeKey = shapeKey;
  currentShape = createShape(shapeKey, {
    radius: 1.6,
    baseSpeed: params.baseSpeed,
    separation: params.separation,
    ratio: params.ratio,
    mode: params.mode,
    colorTop: params.colorTop,
    colorBottom: params.colorBottom,
    faceOpacity: params.faceOpacity,
    edgeThickness: params.edgeThickness,
    showFaces: params.showFaces,
    showEdges: params.showEdges,
  });
  scene.add(currentShape.group);
  audio.setMode(params.mode);
}

function rebuildShapeOptions() {
  if (pane) pane.dispose();
  buildPane();
}

function buildPane() {
  pane = new Pane({ title: 'Merkaba', expanded: true });

  const shapeFolder = pane.addFolder({ title: 'Forma', expanded: true });

  const setOptions = {};
  for (const name of Object.keys(SHAPE_SETS)) setOptions[name] = name;
  const setBinding = shapeFolder.addBinding(params, 'currentSet', { options: setOptions });
  setBinding.on('change', (ev) => {
    const firstShape = SHAPE_SETS[ev.value][0];
    if (firstShape !== params.currentShapeKey) switchShape(firstShape);
    rebuildShapeOptions();
  });

  const shapeOptions = {};
  for (const key of SHAPE_SETS[params.currentSet]) shapeOptions[SHAPE_LABELS[key]] = key;
  const shapeBinding = shapeFolder.addBinding(params, 'currentShapeKey', { options: shapeOptions });
  shapeBinding.on('change', (ev) => switchShape(ev.value));

  const modeOptions = {};
  for (const key of MODE_KEYS) modeOptions[MODES[key]] = key;
  const modeBinding = shapeFolder.addBinding(params, 'mode', { options: modeOptions });
  modeBinding.on('change', (ev) => {
    params.mode = ev.value;
    currentShape.setMode(ev.value);
    audio.setMode(ev.value);
  });

  const motionFolder = pane.addFolder({ title: 'Movimiento', expanded: false });
  const speedBinding = motionFolder.addBinding(params, 'baseSpeed', { label: 'Velocidad', min: 0, max: 3, step: 0.05 });
  speedBinding.on('change', (ev) => { currentShape.baseSpeed = ev.value; });
  const sepBinding = motionFolder.addBinding(params, 'separation', { label: 'Separación', min: -3, max: 3, step: 0.05 });
  sepBinding.on('change', (ev) => { currentShape.setSeparation(ev.value); });
  const ratioBinding = motionFolder.addBinding(params, 'ratio', { label: 'Ratio', min: 1, max: 5, step: 0.1 });
  ratioBinding.on('change', (ev) => { currentShape.setRatio(ev.value); });

  const pulseFolder = pane.addFolder({ title: 'Pulso / Efectos', expanded: false });
  pulseFolder.addBinding(params, 'pulseFreq', { label: 'Freq pulso', min: 0.1, max: 3, step: 0.1 }).on('change', (ev) => { currentShape.pulseFreq = ev.value; });
  pulseFolder.addBinding(params, 'pendulumAmp', { label: 'Amplitud péndulo', min: 0, max: Math.PI, step: 0.05 }).on('change', (ev) => { currentShape.pendulumAmp = ev.value; });
  pulseFolder.addBinding(params, 'pendulumFreq', { label: 'Freq péndulo', min: 0.1, max: 3, step: 0.1 }).on('change', (ev) => { currentShape.pendulumFreq = ev.value; });
  pulseFolder.addBinding(params, 'spiralAmp', { label: 'Amplitud espiral', min: 0, max: 1, step: 0.05 }).on('change', (ev) => { currentShape.spiralAmp = ev.value; });
  pulseFolder.addBinding(params, 'spiralFreq', { label: 'Freq espiral', min: 0.1, max: 2, step: 0.1 }).on('change', (ev) => { currentShape.spiralFreq = ev.value; });
  pulseFolder.addBinding(params, 'accelFreq', { label: 'Freq aceleración', min: 0.1, max: 2, step: 0.1 }).on('change', (ev) => { currentShape.accelFreq = ev.value; });
  pulseFolder.addBinding(params, 'free3DAmount', { label: 'Libre 3D', min: 0, max: 1, step: 0.05 }).on('change', (ev) => { currentShape.free3DAmount = ev.value; });

  const visualFolder = pane.addFolder({ title: 'Visual', expanded: false });
  visualFolder.addBinding(params, 'showFaces', { label: 'Caras' }).on('change', (ev) => { params.showFaces = ev.value; currentShape.setVisuals({ showFaces: ev.value }); });
  visualFolder.addBinding(params, 'showEdges', { label: 'Bordes' }).on('change', (ev) => { params.showEdges = ev.value; currentShape.setVisuals({ showEdges: ev.value }); });
  visualFolder.addBinding(params, 'faceOpacity', { label: 'Opacidad caras', min: 0, max: 1, step: 0.01 }).on('change', (ev) => { params.faceOpacity = ev.value; currentShape.setVisuals({ faceOpacity: ev.value }); });
  visualFolder.addBinding(params, 'edgeThickness', { label: 'Grosor bordes', min: 1, max: 5, step: 1 }).on('change', (ev) => { params.edgeThickness = ev.value; currentShape.setVisuals({ edgeThickness: ev.value }); });

  const colorFolder = pane.addFolder({ title: 'Colores', expanded: false });
  colorFolder.addBinding(params, 'colorTop', { label: 'Superior' }).on('change', (ev) => { params.colorTop = ev.value; currentShape.setColors(ev.value, undefined); });
  colorFolder.addBinding(params, 'colorBottom', { label: 'Inferior' }).on('change', (ev) => { params.colorBottom = ev.value; currentShape.setColors(undefined, ev.value); });

  const bloomFolder = pane.addFolder({ title: 'Bloom', expanded: false });
  bloomFolder.addBinding(params, 'bloomThreshold', { label: 'Threshold', min: 0, max: 1, step: 0.05 }).on('change', (ev) => { bloomPass.threshold = ev.value; });
  bloomFolder.addBinding(params, 'bloomStrength', { label: 'Strength', min: 0, max: 3, step: 0.1 }).on('change', (ev) => { bloomPass.strength = ev.value; });
  bloomFolder.addBinding(params, 'bloomRadius', { label: 'Radius', min: 0, max: 1, step: 0.05 }).on('change', (ev) => { bloomPass.radius = ev.value; });
  bloomFolder.addBinding(params, 'bloomExposure', { label: 'Exposure', min: 0.1, max: 2, step: 0.1 }).on('change', (ev) => { renderer.toneMappingExposure = Math.pow(ev.value, 4.0); });

  const audioFolder = pane.addFolder({ title: 'Audio', expanded: false });
  audioFolder.addBinding(params, 'audioPlaying', { label: '▶ Play / Stop' }).on('change', (ev) => { if (ev.value) audio.start(); else audio.stop(); });
  audioFolder.addBinding(params, 'audioVolume', { label: 'Volumen', min: 0, max: 1, step: 0.01 }).on('change', (ev) => audio.setVolume(ev.value));
  audioFolder.addBinding(params, 'audioFrequency', { label: 'Frecuencia (Hz)', min: 396, max: 963, step: 1 }).on('change', (ev) => audio.setFrequency(ev.value));
  audioFolder.addBinding(params, 'audioBinaural', { label: 'Binaural beats' }).on('change', (ev) => audio.toggleBinaural(ev.value));
  audioFolder.addBinding(params, 'audioBinauralDelta', { label: 'Delta binaural (Hz)', min: 1, max: 30, step: 1 }).on('change', (ev) => audio.setBinauralDelta(ev.value));

  const chakraOptions = {
    'Raíz (396 Hz)': 396,
    'Sacro (417 Hz)': 417,
    'Plexo (528 Hz)': 528,
    'Corazón (639 Hz)': 639,
    'Garganta (741 Hz)': 741,
    'Tercera (852 Hz)': 852,
    'Corona (963 Hz)': 963,
  };
  audioFolder.addBinding(params, 'audioFrequency', { label: 'Chakra', options: chakraOptions }).on('change', (ev) => audio.setFrequency(ev.value));
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
