import * as THREE from 'three';
import { Timer } from 'three/examples/jsm/misc/Timer.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

import { Merkaba, MODES, MODE_KEYS, MODE_LABELS } from './merkaba.js';
import { MerkabaAudio, CHAKRA_FREQUENCIES } from './merkaba-audio.js';

let camera, renderer, composer, merkaba, timer, audio;

const bloomParams = {
  threshold: 0,
  strength: 1.5,
  radius: 0.5,
  exposure: 1
};

const audioParams = {
  volume: 0.3,
  frequency: 528,
  binaural: true,
  binauralDelta: 4,
  playing: false
};

init();

function init() {
  const container = document.getElementById('container');

  timer = new Timer();
  audio = new MerkabaAudio();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100);
  camera.position.set(0, 2, 6);
  scene.add(camera);

  scene.add(new THREE.AmbientLight(0x404040, 0.5));

  const pointLight = new THREE.PointLight(0xffffff, 20);
  camera.add(pointLight);

  merkaba = new Merkaba();
  scene.add(merkaba.group);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);

  const renderScene = new RenderPass(scene, camera);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    bloomParams.strength,
    bloomParams.radius,
    bloomParams.threshold
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

  const gui = new GUI({ title: 'Merkaba Controls' });

  const modeFolder = gui.addFolder('Modo');
  const modeOptions = {};
  for (const key of MODE_KEYS) {
    modeOptions[key] = MODES[key];
  }
  modeFolder.add({ mode: merkaba.mode }, 'mode', modeOptions)
    .name('Animación')
    .onChange(v => {
      merkaba.setMode(v);
      audio.setMode(v);
    });

  const motionFolder = gui.addFolder('Movimiento');
  motionFolder.add(merkaba, 'baseSpeed', 0, 3, 0.05).name('Velocidad base');
  motionFolder.add(merkaba, 'separation', 0, 3, 0.05).name('Separación');
  motionFolder.add(merkaba, 'ratio', 1, 5, 0.1).name('Ratio');

  const pulseFolder = gui.addFolder('Pulso / Efectos');
  pulseFolder.add(merkaba, 'pulseFreq', 0.1, 3, 0.1).name('Freq pulso');
  pulseFolder.add(merkaba, 'pendulumAmp', 0, Math.PI, 0.05).name('Amplitud péndulo');
  pulseFolder.add(merkaba, 'pendulumFreq', 0.1, 3, 0.1).name('Freq péndulo');
  pulseFolder.add(merkaba, 'spiralAmp', 0, 1, 0.05).name('Amplitud espiral');
  pulseFolder.add(merkaba, 'spiralFreq', 0.1, 2, 0.1).name('Freq espiral');
  pulseFolder.add(merkaba, 'accelFreq', 0.1, 2, 0.1).name('Freq aceleración');
  pulseFolder.add(merkaba, 'free3DAmount', 0, 1, 0.05).name('Libre 3D amount');

  const visualFolder = gui.addFolder('Visual');
  visualFolder.add(merkaba, 'showFaces').name('Caras');
  visualFolder.add(merkaba, 'showEdges').name('Bordes');
  visualFolder.add(merkaba, 'faceOpacity', 0, 1, 0.01).name('Opacidad caras');
  visualFolder.add(merkaba, 'edgeOpacity', 0, 1, 0.01).name('Opacidad bordes');
  visualFolder.add(merkaba, 'edgeThickness', 1, 5, 1).name('Grosor bordes');

  const colorParams = {
    top: '#' + merkaba.colorTop.getHexString(),
    bottom: '#' + merkaba.colorBottom.getHexString()
  };

  const colorFolder = gui.addFolder('Colores');
  colorFolder.addColor(colorParams, 'top').name('Superior').onChange(v => merkaba.setColors(v, undefined));
  colorFolder.addColor(colorParams, 'bottom').name('Inferior').onChange(v => merkaba.setColors(undefined, v));

  const bloomFolder = gui.addFolder('Bloom');
  bloomFolder.add(bloomParams, 'threshold', 0, 1, 0.05).name('Threshold').onChange(v => bloomPass.threshold = v);
  bloomFolder.add(bloomParams, 'strength', 0, 3, 0.1).name('Strength').onChange(v => bloomPass.strength = v);
  bloomFolder.add(bloomParams, 'radius', 0, 1, 0.05).name('Radius').onChange(v => bloomPass.radius = v);
  bloomFolder.add(bloomParams, 'exposure', 0.1, 2, 0.1).name('Exposure').onChange(v => renderer.toneMappingExposure = Math.pow(v, 4.0));

  const audioFolder = gui.addFolder('Audio');
  audioFolder.add(audioParams, 'playing').name('▶ Iniciar / Detener').onChange(v => {
    if (v) audio.start(); else audio.stop();
  });
  audioFolder.add(audioParams, 'volume', 0, 1, 0.01).name('Volumen').onChange(v => audio.setVolume(v));
  audioFolder.add(audioParams, 'frequency', 396, 963, 1).name('Frecuencia (Hz)').onChange(v => audio.setFrequency(v));
  audioFolder.add(audioParams, 'binaural').name('Binaural beats').onChange(v => audio.toggleBinaural(v));
  audioFolder.add(audioParams, 'binauralDelta', 1, 30, 1).name('Delta binaural (Hz)').onChange(v => audio.setBinauralDelta(v));

  audioFolder.add({ chakra: 'plexo' }, 'chakra', {
    'Raíz (396 Hz)': 396,
    'Sacro (417 Hz)': 417,
    'Plexo (528 Hz)': 528,
    'Corazón (639 Hz)': 639,
    'Garganta (741 Hz)': 741,
    'Tercera (852 Hz)': 852,
    'Corona (963 Hz)': 963
  }).name('Chakra').onChange(v => {
    audioParams.frequency = v;
    audio.setFrequency(v);
  });

  window.addEventListener('resize', onWindowResize);
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
  merkaba.update(delta);
  audio.update(delta, merkaba);
  composer.render();
}
