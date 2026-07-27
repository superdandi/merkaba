# Documentación Técnica — Merkaba

## Visión General

Merkaba es una herramienta de visualización interactiva de geometría sagrada en 3D, construida con Three.js y Vite. Permite explorar una **merkaba** (dos tetraedros estrellados contra-rotantes) con múltiples modos de animación, efectos de bloom, y controles interactivos.

---

## Arquitectura del Proyecto

```
merkaba/
├── index.html              # Página principal con import maps
├── package.json            # Dependencias y scripts
├── vite.config.js          # Configuración de Vite
├── docs/
│   ├── fundamentacion.md   # Investigación sobre Merkaba
│   └── documentacion.md    # Este archivo
└── src/
    ├── main.js             # Escena, cámara, bloom, GUI, loop
    └── merkaba.js          # Clase Merkaba (geometría + animación)
```

---

## Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|-----------|---------|
| Motor 3D | Three.js | 0.172.0 |
| Bundler | Vite | 6.x |
| UI Controls | lil-gui | 0.19.x |
| Post-processing | UnrealBloomPass | (Three.js addon) |
| Controles cámara | OrbitControls | (Three.js addon) |

---

## Dependencias de Three.js Utilizadas

```javascript
import * as THREE from 'three';
import { Timer } from 'three/examples/jsm/misc/Timer.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
```

---

## Clase `Merkaba` (`src/merkaba.js`)

### Constructor

```javascript
new Merkaba(options)
```

#### Opciones

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `radius` | number | 1.6 | Radio de los tetraedros |
| `baseSpeed` | number | 0.8 | Velocidad base de rotación |
| `topSpeed` | number | 0.8 | Velocidad de la pirámide superior |
| `bottomSpeed` | number | 0.8 | Velocidad de la pirámide inferior |
| `topDir` | number | 1 | Dirección de rotación superior (1 o -1) |
| `bottomDir` | number | -1 | Dirección de rotación inferior (1 o -1) |
| `ratio` | number | 34/21 | Ratio de velocidad entre pirámides |
| `separation` | number | 0 | Separación vertical entre pirámides |
| `mode` | string | SYNC_OPPOSITE | Modo de animación |
| `colorTop` | hex | 0x80d0ff | Color de la pirámide superior |
| `colorBottom` | hex | 0xff80c0 | Color de la pirámide inferior |
| `faceOpacity` | number | 0.18 | Opacidad de las caras |
| `edgeOpacity` | number | 1.0 | Opacidad de los bordes |
| `edgeThickness` | number | 1 | Grosor de los bordes |
| `showFaces` | boolean | true | Mostrar caras |
| `showEdges` | boolean | true | Mostrar bordes |
| `pulseFreq` | number | 0.5 | Frecuencia del pulso |
| `accelFreq` | number | 0.3 | Frecuencia de aceleración |
| `pendulumAmp` | number | π/2 | Amplitud del péndulo |
| `pendulumFreq` | number | 0.5 | Frecuencia del péndulo |
| `spiralAmp` | number | 0.25 | Amplitud de la espiral |
| `spiralFreq` | number | 0.4 | Frecuencia de la espiral |
| `free3DAmount` | number | 0.35 | Cantidad de movimiento 3D libre |

### Propiedades Públicas

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `group` | THREE.Group | Grupo raíz para agregar a la escena |
| `topGroup` | THREE.Group | Grupo de la pirámide superior |
| `bottomGroup` | THREE.Group | Grupo de la pirámide inferior |

### Métodos Públicos

| Método | Descripción |
|--------|-------------|
| `update(dt)` | Actualiza la animación con delta time |
| `setMode(mode)` | Cambia el modo de animación |
| `setSpeeds(base, top, bottom)` | Ajusta las velocidades |
| `setDirections(topDir, bottomDir)` | Cambia direcciones de rotación |
| `setRatio(ratio)` | Ajusta el ratio entre pirámides |
| `setSeparation(value)` | Cambia la separación vertical |
| `setColors(top, bottom)` | Cambia los colores |
| `setVisuals({showFaces, showEdges, faceOpacity, edgeThickness})` | Ajusta parámetros visuales |
| `pulseBreath()` | Activa un pulso de respiración |

### Exportaciones

```javascript
export const MODES = { ... };       // Objeto con los 15 modos
export const MODE_KEYS = [...];     // Array de keys
export const MODE_LABELS = [...];   // Array de labels en español
export class Merkaba { ... };       // La clase principal
```

---

## Modos de Animación

| Key | Label | Descripción |
|-----|-------|-------------|
| `SYNC_SAME` | Sincronizado mismo sentido | Ambas pirámides rotan en la misma dirección |
| `SYNC_OPPOSITE` | Sincronizado contrario | Pirámides rotan en sentidos opuestos |
| `SYNC_RATIO` | Sincronizado con ratio | Opuestas, pero con ratio de velocidad configurable |
| `INDEPENDENT` | Independiente | Cada pirámide con su propia velocidad |
| `TOP_ONLY` | Solo pirámide superior | Solo la superior se mueve |
| `BOTTOM_ONLY` | Solo pirámide inferior | Solo la inferior se mueve |
| `PULSE` | Pulso | Velocidad modulada por sinusoide |
| `PENDULUM` | Péndulo | Oscilación lateral tipo péndulo |
| `SPIRAL` | Espiral | Separación oscilante con movimiento espiral |
| `ACCEL` | Aceleración | Envolvente de aceleración con sin-abs |
| `CHAOS` | Caos | Velocidad aleatoria con random walk |
| `BREATH` | Respiración | Pulso periódico cada ~4 segundos |
| `AXIS_X` | Eje X | Rotación en el eje X |
| `AXIS_Z` | Eje Z | Rotación en el eje Z |
| `FREE_3D` | Libre 3D | Movimiento en los tres ejes |

---

## Pipeline de Renderizado

```
main.js
  ├── Escena (THREE.Scene)
  │   ├── AmbientLight (0x404040, 0.5)
  │   ├── Camera (PerspectiveCamera 45°)
  │   │   └── PointLight (0xffffff, 20)
  │   └── Merkaba.group
  │       ├── topGroup
  │       │   ├── topFaceMesh (TetrahedronGeometry + MeshStandardMaterial)
  │       │   └── topEdgeLine (EdgesGeometry + LineBasicMaterial)
  │       └── bottomGroup
  │           ├── bottomFaceMesh (rotado π en X)
  │           └── bottomEdgeLine (rotado π en X)
  │
  ├── EffectComposer
  │   ├── RenderPass
  │   ├── UnrealBloomPass (strength, radius, threshold)
  │   └── OutputPass
  │
  └── Loop: timer.update() → merkaba.update(dt) → composer.render()
```

---

## Geometría

### Tetraedro Estrellado (Merkaba)

La merkaba se construye usando **dos tetraedros regulares** interpenetrados:

1. **Pirámide superior**: Tetraedro con un vértice apuntando hacia +Y
2. **Pirámide inferior**: Tetraedro idéntico rotado π radianes en el eje X

La función `alignTetrahedronToUp()` ajusta la orientación del tetraedro para que un vértice apunte hacia arriba:

```javascript
function alignTetrahedronToUp(geometry) {
  const vertexDir = new THREE.Vector3(1, 1, 1).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const q = new THREE.Quaternion().setFromUnitVectors(vertexDir, up);
  geometry.applyQuaternion(q);
  return geometry;
}
```

### Materiales

**Caras** (MeshStandardMaterial):
- Color + Emissive del color de la pirámide
- `emissiveIntensity: 0.5`
- `transparent: true`, `opacity: 0.18`
- `side: THREE.DoubleSide`
- `depthWrite: false`

**Bordes** (LineBasicMaterial):
- Color de la pirámide
- `transparent: true`, `opacity: 1.0`
- `linewidth: 1`

---

## Instalación y Ejecución

```bash
# Clonar el repositorio
git clone https://github.com/superdandi/merkaba.git
cd merkaba

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

El servidor de Vite estará disponible en:
- **Local**: http://localhost:5173
- **Red**: http://<tu-ip>:5173

---

## Despliegue en GitHub Pages

```bash
# Build para producción
npm run build

# Los archivos se generan en dist/
```

El proyecto ya está configurado con `base: '/merkaba/'` en `vite.config.js` para funcionar correctamente en GitHub Pages.

**URL**: https://superdandi.github.io/merkaba/

---

## Controles GUI (lil-gui)

### Modo
- **Animación**: Selector de los 15 modos de animación

### Movimiento
- **Velocidad base**: 0 – 3
- **Separación**: 0 – 3
- **Ratio**: 1 – 5

### Pulso / Efectos
- **Freq pulso**: 0.1 – 3
- **Amplitud péndulo**: 0 – π
- **Freq péndulo**: 0.1 – 3
- **Amplitud espiral**: 0 – 1
- **Freq espiral**: 0.1 – 2
- **Freq aceleración**: 0.1 – 2
- **Libre 3D amount**: 0 – 1

### Visual
- **Caras**: Toggle on/off
- **Bordes**: Toggle on/off
- **Opacidad caras**: 0 – 1
- **Opacidad bordes**: 0 – 1
- **Grosor bordes**: 1 – 5

### Colores
- **Superior**: Color picker
- **Inferior**: Color picker

### Bloom
- **Threshold**: 0 – 1
- **Strength**: 0 – 3
- **Radius**: 0 – 1
- **Exposure**: 0.1 – 2

---

## Funcionalidades Pendientes

- [ ] Audio procedurales con tonos puros
- [ ] Efectos de sonido de sanación / chakras
- [ ] Interfaz de usuario mejorada (reemplazar lil-gui)
- [ ] Modos de animación adicionales
- [ ] Exportación de video/GIF
- [ ] Modo VR/AR
