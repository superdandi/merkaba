# Merkaba

Visualización interactiva de geometría sagrada en 3D. Exploración de la merkaba (dos tetraedros estrellados contra-rotantes) con múltiples modos de animación, efectos de bloom y controles interactivos.

**Demo en vivo**: [https://superdandi.github.io/merkaba/](https://superdandi.github.io/merkaba/)

---

## Características

- **15 modos de animación**: sincronizado, independiente, péndulo, espiral, caos, respiración, ejes, 3D libre, y más
- **Post-processing con bloom**: efecto de resplandor UnrealBloomPass
- **Controles interactivos**: GUI lil-gui para ajustar animación, colores, opacidad, separación y parámetros del bloom
- **Cámara libre**: OrbitControls para navegar la escena desde cualquier ángulo
- **Geometría precisa**: tetraedros estrellados construidos con `TetrahedronGeometry` alineados con `Quaternion`

## Instalación

```bash
git clone https://github.com/superdandi/merkaba.git
cd merkaba
npm install
npm run dev
```

Abre http://localhost:5173 en tu navegador.

## Estructura

```
merkaba/
├── index.html
├── package.json
├── vite.config.js
├── docs/
│   ├── fundamentacion.md    # Investigación sobre Merkaba
│   └── documentacion.md     # Documentación técnica
└── src/
    ├── main.js              # Escena + bloom + GUI + loop
    └── merkaba.js           # Clase Merkaba (geometría + animación)
```

## Modos de Animación

| Modo | Descripción |
|------|-------------|
| Sincronizado mismo sentido | Ambas pirámides rotan igual |
| Sincronizado contrario | Rotación opuesta |
| Sincronizado con ratio | Opuestas con ratio configurable |
| Independiente | Velocidades separadas |
| Solo pirámide superior | Movimiento solo arriba |
| Solo pirámide inferior | Movimiento solo abajo |
| Pulso | Velocidad modulada por sinusoide |
| Péndulo | Oscilación lateral |
| Espiral | Separación oscilante |
| Aceleración | Envolvente con sin-abs |
| Caos | Random walk |
| Respiración | Pulso periódico cada ~4s |
| Eje X / Eje Z | Rotación en ejes específicos |
| Libre 3D | Movimiento en los tres ejes |

## Tecnologías

- [Three.js](https://threejs.org/) — Motor 3D
- [Vite](https://vitejs.dev/) — Bundler y dev server
- [lil-gui](https://lil-gui.unmht.org/) — Controles GUI

## Docs

- [Fundamentación del proyecto](docs/fundamentacion.md) — Investigación sobre Merkaba en contextos espirituales
- [Documentación técnica](docs/documentacion.md) — Arquitectura, API, modos de animación

## Licencia

MIT
