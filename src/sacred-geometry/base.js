import * as THREE from 'three';

export class SacredShape {
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
    this.mode = options.mode ?? 'SYNC_OPPOSITE';
    this.pulseAmp = options.pulseAmp ?? 0;
    this.breathIntensity = options.breathIntensity ?? 0;

    this.colorTop = new THREE.Color(options.colorTop ?? 0x80d0ff);
    this.colorBottom = new THREE.Color(options.colorBottom ?? 0xff80c0);
    this.faceOpacity = options.faceOpacity ?? 0.18;
    this.edgeOpacity = options.edgeOpacity ?? 1.0;
    this.edgeThickness = options.edgeThickness ?? 1;
    this.showFaces = options.showFaces ?? true;
    this.showEdges = options.showEdges ?? true;
    this.instanceCount = options.instanceCount ?? 1;
    this._lockedInstances = options.lockedInstances ?? false;

    this.group = new THREE.Group();
    this.t = 0;
    this.breathImpulse = 0;
    this.breathTimer = 0;
    this.chaosTop = (Math.random() - 0.5) * 2;
    this.chaosBottom = (Math.random() - 0.5) * 2;
    this.lastChaosUpdate = 0;

    this._meshes = [];
    this._edgeLines = [];
  }

  _createFaceMaterial(color) {
    return new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: this.faceOpacity,
      roughness: 0.25,
      metalness: 0.2,
      side: THREE.DoubleSide,
      depthWrite: false
    });
  }

  _createEdgeMaterial(color) {
    return new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: this.edgeOpacity,
      linewidth: this.edgeThickness
    });
  }

  _addMeshWithEdges(geometry, parent, colorTop, colorBottom, isBottom = false) {
    const faceMat = this._createFaceMaterial(isBottom ? colorBottom : colorTop);
    const mesh = new THREE.Mesh(geometry.clone(), faceMat);
    if (isBottom) mesh.rotation.x = Math.PI;
    parent.add(mesh);
    this._meshes.push(mesh);

    const edgesGeom = new THREE.EdgesGeometry(geometry.clone());
    const edgeMat = this._createEdgeMaterial(isBottom ? colorBottom : colorTop);
    const edgeLine = new THREE.LineSegments(edgesGeom, edgeMat);
    if (isBottom) edgeLine.rotation.x = Math.PI;
    parent.add(edgeLine);
    this._edgeLines.push(edgeLine);

    return { mesh, edgeLine, faceMat, edgeMat };
  }

  _updateVisibility() {
    for (const m of this._meshes) m.visible = this.showFaces;
    for (const e of this._edgeLines) e.visible = this.showEdges;
  }

  _updateColors() {
    for (let i = 0; i < this._meshes.length; i++) {
      const isBottom = i >= this._meshes.length / 2;
      const c = isBottom ? this.colorBottom : this.colorTop;
      this._meshes[i].material.color.set(c);
      this._meshes[i].material.emissive.set(c);
      this._edgeLines[i].material.color.set(c);
    }
  }

  setMode(mode) {
    if (this.topGroup) this.topGroup.rotation.set(0, 0, 0);
    if (this.bottomGroup) this.bottomGroup.rotation.set(0, 0, 0);
    this.mode = mode;
  }

  setInstanceCount(n) {
    if (this._lockedInstances) return;
    this.instanceCount = n;
    if (this.bottomGroup) this.bottomGroup.visible = (n === 2);
    if (n === 1) {
      this.topGroup.position.y = 0;
    } else {
      this._updateSeparation();
    }
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

  setRatio(ratio) { this.ratio = ratio; }

  setSeparation(value) {
    this.separation = value;
    this._updateSeparation();
  }

  _updateSeparation() {
    if (this.topGroup && this.bottomGroup) {
      this.topGroup.position.y = this.separation * 0.5;
      this.bottomGroup.position.y = -this.separation * 0.5;
    }
  }

  setColors(top, bottom) {
    if (top !== undefined) this.colorTop.set(top);
    if (bottom !== undefined) this.colorBottom.set(bottom);
    this._updateColors();
  }

  setVisuals({ showFaces, showEdges, faceOpacity, edgeThickness }) {
    if (showFaces !== undefined) this.showFaces = showFaces;
    if (showEdges !== undefined) this.showEdges = showEdges;
    if (faceOpacity !== undefined) {
      this.faceOpacity = faceOpacity;
      for (const m of this._meshes) m.material.opacity = faceOpacity;
    }
    if (edgeThickness !== undefined) {
      this.edgeThickness = edgeThickness;
      for (const e of this._edgeLines) e.material.linewidth = edgeThickness;
    }
    this._updateVisibility();
  }

  pulseBreath() { this.breathImpulse = 1; }

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

  _computeRotations(dt) {
    let dTop = { x: 0, y: 0, z: 0 };
    let dBottom = { x: 0, y: 0, z: 0 };

    switch (this.mode) {
      case 'SYNC_SAME':
        dTop.y = this.baseSpeed * this.topDir * dt;
        dBottom.y = this.baseSpeed * this.topDir * dt;
        break;
      case 'SYNC_OPPOSITE':
        dTop.y = this.baseSpeed * this.topDir * dt;
        dBottom.y = -this.baseSpeed * this.topDir * dt;
        break;
      case 'SYNC_RATIO':
        dTop.y = this.baseSpeed * this.topDir * dt;
        dBottom.y = -this.baseSpeed * this.topDir * this.ratio * dt;
        break;
      case 'INDEPENDENT':
        dTop.y = this.topSpeed * this.topDir * dt;
        dBottom.y = this.bottomSpeed * this.bottomDir * dt;
        break;
      case 'TOP_ONLY':
        dTop.y = this.baseSpeed * this.topDir * dt;
        break;
      case 'BOTTOM_ONLY':
        dBottom.y = this.baseSpeed * this.bottomDir * dt;
        break;
      case 'PULSE': {
        const envelope = 0.5 + 0.5 * Math.sin(this.t * this.pulseFreq * Math.PI * 2);
        const s = this.baseSpeed * envelope;
        dTop.y = s * this.topDir * dt;
        dBottom.y = -s * this.topDir * dt;
        break;
      }
      case 'SPIRAL': {
        const s = this.baseSpeed;
        dTop.y = s * this.topDir * dt;
        dBottom.y = -s * this.topDir * dt;
        const spiralOffset = Math.sin(this.t * this.spiralFreq * Math.PI * 2) * this.spiralAmp;
        this.topGroup.position.y = this.separation * 0.5 + spiralOffset;
        this.bottomGroup.position.y = -this.separation * 0.5 - spiralOffset;
        break;
      }
      case 'ACCEL': {
        const envelope = 0.2 + 0.8 * Math.abs(Math.sin(this.t * this.accelFreq * Math.PI * 2));
        const s = this.baseSpeed * envelope;
        dTop.y = s * this.topDir * dt;
        dBottom.y = -s * this.topDir * dt;
        break;
      }
      case 'CHAOS': {
        this._updateChaos(dt);
        dTop.y = this.baseSpeed * this.chaosTop * this.topDir * dt;
        dBottom.y = -this.baseSpeed * this.chaosBottom * this.topDir * dt;
        break;
      }
      case 'BREATH': {
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
      case 'AXIS_X':
        dTop.x = this.baseSpeed * this.topDir * dt;
        dBottom.x = -this.baseSpeed * this.topDir * dt;
        break;
      case 'AXIS_Z':
        dTop.z = this.baseSpeed * this.topDir * dt;
        dBottom.z = -this.baseSpeed * this.topDir * dt;
        break;
      case 'FREE_3D': {
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
    return { dTop, dBottom };
  }

  update(dt) {
    this.t += dt;
    if (!this.topGroup || !this.bottomGroup) return;

    if (this.mode !== 'SPIRAL') this._updateSeparation();

    if (this.mode === 'PENDULUM') {
      const angle = Math.sin(this.t * this.pendulumFreq * Math.PI * 2) * this.pendulumAmp;
      this.topGroup.rotation.y = angle;
      this.bottomGroup.rotation.y = -angle;
      return;
    }

    const { dTop, dBottom } = this._computeRotations(dt);

    this.topGroup.rotation.x += dTop.x;
    this.topGroup.rotation.y += dTop.y;
    this.topGroup.rotation.z += dTop.z;

    this.bottomGroup.rotation.x += dBottom.x;
    this.bottomGroup.rotation.y += dBottom.y;
    this.bottomGroup.rotation.z += dBottom.z;
  }

  dispose() {
    for (const m of this._meshes) {
      m.geometry.dispose();
      m.material.dispose();
    }
    for (const e of this._edgeLines) {
      e.geometry.dispose();
      e.material.dispose();
    }
  }
}
