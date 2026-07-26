import * as THREE from 'three';

export const MODES = {
  SYNC_SAME: 'Sincronizado mismo sentido',
  SYNC_OPPOSITE: 'Sincronizado contrario',
  SYNC_RATIO: 'Sincronizado con ratio',
  INDEPENDENT: 'Independiente',
  TOP_ONLY: 'Solo pirámide superior',
  BOTTOM_ONLY: 'Solo pirámide inferior',
  PULSE: 'Pulso',
  PENDULUM: 'Péndulo',
  SPIRAL: 'Espiral',
  ACCEL: 'Aceleración',
  CHAOS: 'Caos',
  BREATH: 'Respiración',
  AXIS_X: 'Eje X',
  AXIS_Z: 'Eje Z',
  FREE_3D: 'Libre 3D'
};

export const MODE_KEYS = Object.keys(MODES);
export const MODE_LABELS = Object.values(MODES);

function alignTetrahedronToUp(geometry) {
  const vertexDir = new THREE.Vector3(1, 1, 1).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const q = new THREE.Quaternion().setFromUnitVectors(vertexDir, up);
  geometry.applyQuaternion(q);
  return geometry;
}

export class Merkaba {
  constructor(options = {}) {
    this.radius = options.radius ?? 1.6;
    this.baseSpeed = options.baseSpeed ?? 0.8;
    this.topSpeed = options.topSpeed ?? 0.8;
    this.bottomSpeed = options.bottomSpeed ?? 0.8;
    this.topDir = options.topDir ?? 1;
    this.bottomDir = options.bottomDir ?? -1;
    this.ratio = options.ratio ?? 34 / 21;
    this.separation = options.separation ?? 0;
    this.pulseFreq = options.pulseFreq ?? 0.5;
    this.accelFreq = options.accelFreq ?? 0.3;
    this.pendulumAmp = options.pendulumAmp ?? Math.PI / 2;
    this.pendulumFreq = options.pendulumFreq ?? 0.5;
    this.spiralAmp = options.spiralAmp ?? 0.25;
    this.spiralFreq = options.spiralFreq ?? 0.4;
    this.free3DAmount = options.free3DAmount ?? 0.35;
    this.mode = options.mode ?? MODES.SYNC_OPPOSITE;

    this.colorTop = new THREE.Color(options.colorTop ?? 0x80d0ff);
    this.colorBottom = new THREE.Color(options.colorBottom ?? 0xff80c0);
    this.faceOpacity = options.faceOpacity ?? 0.18;
    this.edgeOpacity = options.edgeOpacity ?? 1.0;
    this.edgeThickness = options.edgeThickness ?? 1;
    this.showFaces = options.showFaces ?? true;
    this.showEdges = options.showEdges ?? true;

    this.group = new THREE.Group();
    this.t = 0;
    this.breathImpulse = 0;
    this.breathTimer = 0;
    this.chaosTop = (Math.random() - 0.5) * 2;
    this.chaosBottom = (Math.random() - 0.5) * 2;
    this.lastChaosUpdate = 0;

    this._build();
  }

  _build() {
    const geom = alignTetrahedronToUp(new THREE.TetrahedronGeometry(this.radius, 0));

    // --- Pirámide superior (apunta hacia arriba) ---
    this.topGroup = new THREE.Group();

    this.faceMatTop = new THREE.MeshStandardMaterial({
      color: this.colorTop,
      emissive: this.colorTop,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: this.faceOpacity,
      roughness: 0.25,
      metalness: 0.2,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.topFaceMesh = new THREE.Mesh(geom.clone(), this.faceMatTop);
    this.topGroup.add(this.topFaceMesh);

    const edgesGeomTop = new THREE.EdgesGeometry(geom.clone());
    this.edgeMatTop = new THREE.LineBasicMaterial({
      color: this.colorTop,
      transparent: true,
      opacity: this.edgeOpacity,
      linewidth: this.edgeThickness
    });
    this.topEdgeLine = new THREE.LineSegments(edgesGeomTop, this.edgeMatTop);
    this.topGroup.add(this.topEdgeLine);

    // --- Pirámide inferior (apunta hacia abajo) ---
    this.bottomGroup = new THREE.Group();

    this.faceMatBottom = new THREE.MeshStandardMaterial({
      color: this.colorBottom,
      emissive: this.colorBottom,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: this.faceOpacity,
      roughness: 0.25,
      metalness: 0.2,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.bottomFaceMesh = new THREE.Mesh(geom.clone(), this.faceMatBottom);
    this.bottomFaceMesh.rotation.x = Math.PI;
    this.bottomGroup.add(this.bottomFaceMesh);

    const edgesGeomBottom = new THREE.EdgesGeometry(geom.clone());
    this.edgeMatBottom = new THREE.LineBasicMaterial({
      color: this.colorBottom,
      transparent: true,
      opacity: this.edgeOpacity,
      linewidth: this.edgeThickness
    });
    this.bottomEdgeLine = new THREE.LineSegments(edgesGeomBottom, this.edgeMatBottom);
    this.bottomEdgeLine.rotation.x = Math.PI;
    this.bottomGroup.add(this.bottomEdgeLine);

    this.group.add(this.topGroup);
    this.group.add(this.bottomGroup);

    this._updateVisibility();
    this._updateSeparation();
  }

  _updateVisibility() {
    this.topFaceMesh.visible = this.showFaces;
    this.bottomFaceMesh.visible = this.showFaces;
    this.topEdgeLine.visible = this.showEdges;
    this.bottomEdgeLine.visible = this.showEdges;
  }

  _updateSeparation() {
    this.topGroup.position.y = this.separation * 0.5;
    this.bottomGroup.position.y = -this.separation * 0.5;
  }

  setMode(mode) {
    this.mode = mode;
  }

  setSpeeds(base, top, bottom) {
    if (base !== undefined) this.baseSpeed = base;
    if (top !== undefined) this.topSpeed = top;
    if (bottom !== undefined) this.bottomSpeed = bottom;
  }

  setDirections(topDir, bottomDir) {
    if (topDir !== undefined) this.topDir = topDir;
    if (bottomDir !== undefined) this.bottomDir = bottomDir;
  }

  setRatio(ratio) {
    this.ratio = ratio;
  }

  setSeparation(value) {
    this.separation = value;
    this._updateSeparation();
  }

  setColors(top, bottom) {
    if (top !== undefined) {
      this.colorTop.set(top);
      this.faceMatTop.color.set(top);
      this.faceMatTop.emissive.set(top);
      this.edgeMatTop.color.set(top);
    }
    if (bottom !== undefined) {
      this.colorBottom.set(bottom);
      this.faceMatBottom.color.set(bottom);
      this.faceMatBottom.emissive.set(bottom);
      this.edgeMatBottom.color.set(bottom);
    }
  }

  setVisuals({ showFaces, showEdges, faceOpacity, edgeThickness }) {
    if (showFaces !== undefined) {
      this.showFaces = showFaces;
      this.topFaceMesh.visible = this.showFaces;
      this.bottomFaceMesh.visible = this.showFaces;
    }
    if (showEdges !== undefined) {
      this.showEdges = showEdges;
      this.topEdgeLine.visible = this.showEdges;
      this.bottomEdgeLine.visible = this.showEdges;
    }
    if (faceOpacity !== undefined) {
      this.faceOpacity = faceOpacity;
      this.faceMatTop.opacity = faceOpacity;
      this.faceMatBottom.opacity = faceOpacity;
    }
    if (edgeThickness !== undefined) {
      this.edgeThickness = edgeThickness;
      this.edgeMatTop.linewidth = edgeThickness;
      this.edgeMatBottom.linewidth = edgeThickness;
    }
  }

  pulseBreath() {
    this.breathImpulse = 1;
  }

  _updateChaos(dt) {
    this.lastChaosUpdate += dt;
    if (this.lastChaosUpdate > 1.2) {
      this.lastChaosUpdate = 0;
      this.chaosTop += (Math.random() - 0.5) * 2;
      this.chaosBottom += (Math.random() - 0.5) * 2;
      this.chaosTop = THREE.MathUtils.clamp(this.chaosTop, -2, 2);
      this.chaosBottom = THREE.MathUtils.clamp(this.chaosBottom, -2, 2);
    }
  }

  update(dt) {
    this.t += dt;
    const mode = this.mode;

    let dTop = { x: 0, y: 0, z: 0 };
    let dBottom = { x: 0, y: 0, z: 0 };

    switch (mode) {
      case MODES.SYNC_SAME:
        dTop.y = this.baseSpeed * this.topDir * dt;
        dBottom.y = this.baseSpeed * this.topDir * dt;
        break;

      case MODES.SYNC_OPPOSITE:
        dTop.y = this.baseSpeed * this.topDir * dt;
        dBottom.y = -this.baseSpeed * this.topDir * dt;
        break;

      case MODES.SYNC_RATIO:
        dTop.y = this.baseSpeed * this.topDir * dt;
        dBottom.y = -this.baseSpeed * this.topDir * this.ratio * dt;
        break;

      case MODES.INDEPENDENT:
        dTop.y = this.topSpeed * this.topDir * dt;
        dBottom.y = this.bottomSpeed * this.bottomDir * dt;
        break;

      case MODES.TOP_ONLY:
        dTop.y = this.baseSpeed * this.topDir * dt;
        break;

      case MODES.BOTTOM_ONLY:
        dBottom.y = this.baseSpeed * this.bottomDir * dt;
        break;

      case MODES.PULSE: {
        const envelope = 0.5 + 0.5 * Math.sin(this.t * this.pulseFreq * Math.PI * 2);
        const s = this.baseSpeed * envelope;
        dTop.y = s * this.topDir * dt;
        dBottom.y = -s * this.topDir * dt;
        break;
      }

      case MODES.PENDULUM: {
        const angle = Math.sin(this.t * this.pendulumFreq * Math.PI * 2) * this.pendulumAmp;
        this.topGroup.rotation.y = angle;
        this.bottomGroup.rotation.y = -angle;
        this._updateSeparation();
        return;
      }

      case MODES.SPIRAL: {
        const s = this.baseSpeed;
        dTop.y = s * this.topDir * dt;
        dBottom.y = -s * this.topDir * dt;
        const spiralOffset = Math.sin(this.t * this.spiralFreq * Math.PI * 2) * this.spiralAmp;
        this.topGroup.position.y = this.separation * 0.5 + spiralOffset;
        this.bottomGroup.position.y = -this.separation * 0.5 - spiralOffset;
        break;
      }

      case MODES.ACCEL: {
        const envelope = 0.2 + 0.8 * Math.abs(Math.sin(this.t * this.accelFreq * Math.PI * 2));
        const s = this.baseSpeed * envelope;
        dTop.y = s * this.topDir * dt;
        dBottom.y = -s * this.topDir * dt;
        break;
      }

      case MODES.CHAOS: {
        this._updateChaos(dt);
        dTop.y = this.baseSpeed * this.chaosTop * this.topDir * dt;
        dBottom.y = -this.baseSpeed * this.chaosBottom * this.topDir * dt;
        break;
      }

      case MODES.BREATH: {
        this.breathTimer += dt;
        if (this.breathTimer >= 4.0) {
          this.breathTimer -= 4.0;
          this.pulseBreath();
        }
        this.breathImpulse = THREE.MathUtils.lerp(this.breathImpulse, 0, 2.5 * dt);
        const impulse = 1 + this.breathImpulse * 4;
        dTop.y = this.baseSpeed * this.topDir * impulse * dt;
        dBottom.y = this.bottomSpeed * this.bottomDir * impulse * dt;
        break;
      }

      case MODES.AXIS_X:
        dTop.x = this.baseSpeed * this.topDir * dt;
        dBottom.x = -this.baseSpeed * this.topDir * dt;
        break;

      case MODES.AXIS_Z:
        dTop.z = this.baseSpeed * this.topDir * dt;
        dBottom.z = -this.baseSpeed * this.topDir * dt;
        break;

      case MODES.FREE_3D: {
        const s = this.baseSpeed;
        const a = this.free3DAmount;
        dTop.x = s * a * this.topDir * dt;
        dTop.y = s * this.topDir * dt;
        dTop.z = s * a * 0.7 * this.topDir * dt;
        dBottom.x = -s * a * this.topDir * dt;
        dBottom.y = -s * this.topDir * dt;
        dBottom.z = -s * a * 0.7 * this.topDir * dt;
        break;
      }

      default:
        dTop.y = this.baseSpeed * dt;
        dBottom.y = -this.baseSpeed * dt;
    }

    if (mode !== MODES.SPIRAL) {
      this._updateSeparation();
    }

    this.topGroup.rotation.x += dTop.x;
    this.topGroup.rotation.y += dTop.y;
    this.topGroup.rotation.z += dTop.z;

    this.bottomGroup.rotation.x += dBottom.x;
    this.bottomGroup.rotation.y += dBottom.y;
    this.bottomGroup.rotation.z += dBottom.z;
  }
}
