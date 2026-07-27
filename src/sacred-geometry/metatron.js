import * as THREE from 'three';
import { SacredShape } from './base.js';

function hexRingPositions(radius) {
  const positions = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    positions.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
  }
  return positions;
}

export class SeedOfLifeShape extends SacredShape {
  constructor(options = {}) {
    super(options);
    this.sphereRadius = options.sphereRadius ?? 0.35;
    this.topGroup = new THREE.Group();
    this.bottomGroup = new THREE.Group();
    this._buildSeed(this.topGroup, this.colorTop, false);
    this._buildSeed(this.bottomGroup, this.colorBottom, true);
    this.group.add(this.topGroup);
    this.group.add(this.bottomGroup);
    if (this.instanceCount === 1) this.bottomGroup.visible = false;
    this._updateVisibility();
    this._updateSeparation();
  }

  _buildSeed(parent, color, isBottom) {
    const sphereGeom = new THREE.SphereGeometry(this.sphereRadius, 16, 16);
    const center = new THREE.Mesh(sphereGeom.clone(), this._createFaceMaterial(color));
    if (isBottom) center.rotation.x = Math.PI;
    parent.add(center);
    this._meshes.push(center);
    const positions = hexRingPositions(this.radius * 0.6);
    for (const pos of positions) {
      const mesh = new THREE.Mesh(sphereGeom.clone(), this._createFaceMaterial(color));
      mesh.position.copy(pos);
      if (isBottom) mesh.rotation.x = Math.PI;
      parent.add(mesh);
      this._meshes.push(mesh);
    }
    const edgesGeom = new THREE.EdgesGeometry(new THREE.SphereGeometry(this.sphereRadius, 8, 8));
    const edgeMat = this._createEdgeMaterial(color);
    const centerEdges = new THREE.LineSegments(edgesGeom.clone(), edgeMat);
    if (isBottom) centerEdges.rotation.x = Math.PI;
    parent.add(centerEdges);
    this._edgeLines.push(centerEdges);
    for (const pos of positions) {
      const edges = new THREE.LineSegments(edgesGeom.clone(), edgeMat);
      edges.position.copy(pos);
      if (isBottom) edges.rotation.x = Math.PI;
      parent.add(edges);
      this._edgeLines.push(edges);
    }
  }
}

export class FlowerOfLifeShape extends SacredShape {
  constructor(options = {}) {
    super(options);
    this.sphereRadius = options.sphereRadius ?? 0.25;
    this.topGroup = new THREE.Group();
    this.bottomGroup = new THREE.Group();
    this._buildFlower(this.topGroup, this.colorTop, false);
    this._buildFlower(this.bottomGroup, this.colorBottom, true);
    this.group.add(this.topGroup);
    this.group.add(this.bottomGroup);
    if (this.instanceCount === 1) this.bottomGroup.visible = false;
    this._updateVisibility();
    this._updateSeparation();
  }

  _buildFlower(parent, color, isBottom) {
    const sphereGeom = new THREE.SphereGeometry(this.sphereRadius, 12, 12);
    const positions = [];
    positions.push(new THREE.Vector3(0, 0, 0));
    const ring1 = hexRingPositions(this.radius * 0.45);
    positions.push(...ring1);
    for (const pos of ring1) {
      const ring2 = hexRingPositions(this.radius * 0.45);
      for (const p of ring2) {
        const np = pos.clone().add(p);
        if (np.length() < this.radius * 0.95 && !positions.some(e => e.distanceTo(np) < 0.1)) {
          positions.push(np);
        }
      }
    }
    const faceMat = this._createFaceMaterial(color);
    const edgeMat = this._createEdgeMaterial(color);
    const edgesGeom = new THREE.EdgesGeometry(new THREE.SphereGeometry(this.sphereRadius, 8, 8));
    for (const pos of positions) {
      const mesh = new THREE.Mesh(sphereGeom.clone(), faceMat);
      mesh.position.copy(pos);
      if (isBottom) mesh.rotation.x = Math.PI;
      parent.add(mesh);
      this._meshes.push(mesh);
      const edges = new THREE.LineSegments(edgesGeom.clone(), edgeMat);
      edges.position.copy(pos);
      if (isBottom) edges.rotation.x = Math.PI;
      parent.add(edges);
      this._edgeLines.push(edges);
    }
  }
}

export class MetatronCubeShape extends SacredShape {
  constructor(options = {}) {
    super(options);
    this.sphereRadius = options.sphereRadius ?? 0.2;
    this.lineOpacity = options.lineOpacity ?? 0.6;
    this.topGroup = new THREE.Group();
    this.bottomGroup = new THREE.Group();
    this._buildCube(this.topGroup, this.colorTop, false);
    this._buildCube(this.bottomGroup, this.colorBottom, true);
    this.group.add(this.topGroup);
    this.group.add(this.bottomGroup);
    if (this.instanceCount === 1) this.bottomGroup.visible = false;
    this._updateVisibility();
    this._updateSeparation();
  }

  _buildCube(parent, color, isBottom) {
    const sphereGeom = new THREE.SphereGeometry(this.sphereRadius, 12, 12);
    const positions = [];
    positions.push(new THREE.Vector3(0, 0, 0));
    const ring1 = hexRingPositions(this.radius * 0.5);
    positions.push(...ring1);
    const ring2 = hexRingPositions(this.radius * 1.0);
    positions.push(...ring2);
    const faceMat = this._createFaceMaterial(color);
    const edgeMat = this._createEdgeMaterial(color);
    const edgesGeom = new THREE.EdgesGeometry(new THREE.SphereGeometry(this.sphereRadius, 8, 8));
    for (const pos of positions) {
      const mesh = new THREE.Mesh(sphereGeom.clone(), faceMat);
      mesh.position.copy(pos);
      if (isBottom) mesh.rotation.x = Math.PI;
      parent.add(mesh);
      this._meshes.push(mesh);
      const edges = new THREE.LineSegments(edgesGeom.clone(), edgeMat);
      edges.position.copy(pos);
      if (isBottom) edges.rotation.x = Math.PI;
      parent.add(edges);
      this._edgeLines.push(edges);
    }
    const lineGeom = new THREE.BufferGeometry();
    const lineVerts = [];
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const a = positions[i];
        const b = positions[j];
        if (a.distanceTo(b) < this.radius * 1.2) {
          lineVerts.push(a.x, a.y, a.z, b.x, b.y, b.z);
        }
      }
    }
    lineGeom.setAttribute('position', new THREE.Float32BufferAttribute(lineVerts, 3));
    const lineMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: this.lineOpacity });
    const lines = new THREE.LineSegments(lineGeom, lineMat);
    if (isBottom) lines.rotation.x = Math.PI;
    parent.add(lines);
    this._edgeLines.push(lines);
  }
}
