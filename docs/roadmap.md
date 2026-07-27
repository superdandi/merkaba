# Roadmap — Merkaba: Geometría Sagrada Interactiva

## Visión del Producto

**"Explora la geometría sagrada antigua con tecnología moderna"**

Una herramienta de exploración visual y sonora de geometría sagrada en 3D, no una app de meditación genérica. Nicho único sin competencia directa en 3D interactivo.

---

## Fase 1: Prototype Web (Actual)

### Objetivo
Prototype funcional y visualmente atractivo desplegado en GitHub Pages.

### Estado
- [x] 16 geometrías sagradas en 5 sets
- [x] 15 modos de animación
- [x] Audio procedural con Web Audio API
- [x] Frecuencias de chakras (396-963 Hz)
- [x] Binaural beats
- [x] Post-processing con UnrealBloomPass
- [x] UI con Tweakpane (en progreso)
- [x] Deploy en GitHub Pages

### Tech Stack
- Three.js 0.172
- Vite
- Tweakpane (UI)
- Web Audio API

---

## Fase 2: App iOS

### Objetivo
App nativa para iPhone/iPad con experiencia pulida.

### Tech Stack
- **SwiftUI** — UI nativa (navigation, tabs, gestures)
- **SceneKit** — Rendering 3D (reemplaza Three.js)
- **AVAudioEngine** — Audio procedural (reemplaza Web Audio API)
- **Core Haptics** — Feedback háptico sincronizado con animaciones

### Funcionalidades
- Todas las formas y modos de la Fase 1
- UI nativa optimizada para touch
- Gestos: pinch para zoom, swipe para cambiar forma
- Audio binaural espacializado (head tracking)
- Modo offline (sin internet)
- Widget de iOS para acceso rápido

### Modelo de Negocio
- **Free**: 3 formas + 3 modos + audio básico
- **Pro ($4.99)**: 16 formas + 15 modos + audio completo
- **Premium ($9.99)**: Todo + modos custom + exportación

### Distribución
- App Store (iOS 16+)
- TestFlight para beta testing

---

## Fase 3: Apple Vision Pro

### Objetivo
Experiencia inmersiva de realidad mixta para spatial computing.

### Tech Stack
- **RealityKit** — Rendering 3D nativo para visionOS
- **SwiftUI** — UI espacial
- **AVAudioEngine** — Audio binaural espacializado
- **RoomPlan** — Anclar la merkaba en el espacio real

### Funcionalidades
- Merkaba flotando en el espacio real del usuario
- Audio binaural que sigue la posición de la cabeza
- Interacción con gestos oculares y de manos
- Modo "sala de meditación" con ambiente espacial
- Compartir experiencia con otros usuarios de Vision Pro

### Diferenciador
- Experiencia que **ninguna otra app ofrece**
- La geometría sagrada cobra vida en el espacio real
- Audio que se siente "dentro" de la geometría

---

## Fase 4: Expansión (Futuro)

### Posibles direcciones
- **VR (Meta Quest)**: Experiencia inmersiva completa
- **API/Library**: Licenciar el engine a otros desarrolladores
- **Instalaciones artísticas**: Museos, galerías, eventos
- **Webapp SaaS**: Versión premium con suscripción mensual
- **Colaboraciones**: Artistas, musicoterapeutas, terapeutas holísticos

---

## Métricas de Éxito

### Fase 1
- [ ] 100+ estrellas en GitHub
- [ ] 50+ usuarios activos mensuales en GitHub Pages
- [ ] Feedback positivo de la comunidad

### Fase 2
- [ ] 1000+ descargas en App Store
- [ ] Rating 4.5+ en App Store
- [ ] 100+ usuarios Pro/Premium
- [ ] Featured en "Apps de hoy" de App Store

### Fase 3
- [ ] Featured en Apple Vision Pro store
- [ ] 500+ usuarios
- [ ] Cobertura en medios de tech/art

---

## Documentación del Proyecto

- `docs/fundamentacion.md` — Investigación sobre Merkaba
- `docs/documentacion.md` — Documentación técnica
- `docs/roadmap.md` — Este archivo
- `README.md` — Para GitHub
