import * as THREE from 'three';
import { SacredShape } from './base.js';

function alignTetrahedronToUp(geometry) {
  const vertexDir = new THREE.Vector3(1, 1, 1).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const q = new THREE.Quaternion().setFromUnitVectors(vertexDir, up);
  geometry.applyQuaternion(q);
  return geometry;
}

export class MerkabaShape extends SacredShape {
  constructor(options = {}) {
    super(options);
    this.topGroup = new THREE.Group();
    this.bottomGroup = new THREE.Group();
    const geom = alignTetrahedronToUp(new THREE.TetrahedronGeometry(this.radius, 0));
    const topMesh = new THREE.Mesh(geom.clone(), this._createFaceMaterial(this.colorTop));
    this.topGroup.add(topMesh);
    this._meshes.push(topMesh);
    const topEdges = new THREE.LineSegments(new THREE.EdgesGeometry(geom.clone()), this._createEdgeMaterial(this.colorTop));
    this.topGroup.add(topEdges);
    this._edgeLines.push(topEdges);
    const bottomMesh = new THREE.Mesh(geom.clone(), this._createFaceMaterial(this.colorBottom));
    bottomMesh.rotation.x = Math.PI;
    this.bottomGroup.add(bottomMesh);
    this._meshes.push(bottomMesh);
    const bottomEdges = new THREE.LineSegments(new THREE.EdgesGeometry(geom.clone()), this._createEdgeMaterial(this.colorBottom));
    bottomEdges.rotation.x = Math.PI;
    this.bottomGroup.add(bottomEdges);
    this._edgeLines.push(bottomEdges);
    this.group.add(this.topGroup);
    this.group.add(this.bottomGroup);
    this._updateVisibility();
    this._updateSeparation();
  }
}

export class StarDavidShape extends SacredShape {
  constructor(options = {}) {
    super(options);
    this.topGroup = new THREE.Group();
    this.bottomGroup = new THREE.Group();
    const geom1 = new THREE.OctahedronGeometry(this.radius, 0);
    const geom2 = geom1.clone();
    geom2.rotateX(Math.PI / 2);
    this._buildPair(this.topGroup, geom1, geom2, this.colorTop, false);
    this._buildPair(this.bottomGroup, geom1, geom2, this.colorBottom, true);
    this.group.add(this.topGroup);
    this.group.add(this.bottomGroup);
    this._updateVisibility();
    this._updateSeparation();
  }

  _buildPair(parent, geom1, geom2, color, isBottom) {
    const mesh1 = new THREE.Mesh(geom1.clone(), this._createFaceMaterial(color));
    const mesh2 = new THREE.Mesh(geom2.clone(), this._createFaceMaterial(color));
    if (isBottom) { mesh1.rotation.x = Math.PI; mesh2.rotation.x = Math.PI; }
    parent.add(mesh1, mesh2);
    this._meshes.push(mesh1, mesh2);
    const edges1 = new THREE.LineSegments(new THREE.EdgesGeometry(geom1.clone()), this._createEdgeMaterial(color));
    const edges2 = new THREE.LineSegments(new THREE.EdgesGeometry(geom2.clone()), this._createEdgeMaterial(color));
    if (isBottom) { edges1.rotation.x = Math.PI; edges2.rotation.x = Math.PI; }
    parent.add(edges1, edges2);
    this._edgeLines.push(edges1, edges2);
  }
}

export class CubicStarShape extends SacredShape {
  constructor(options = {}) {
    super(options);
    this.topGroup = new THREE.Group();
    this.bottomGroup = new THREE.Group();
    const s = this.radius * 0.9;
    const geom1 = new THREE.BoxGeometry(s, s, s);
    const geom2 = new THREE.BoxGeometry(s, s, s);
    geom2.rotateX(Math.PI / 4);
    geom2.rotateZ(Math.PI / 4);
    this._buildPair(this.topGroup, geom1, geom2, this.colorTop, false);
    this._buildPair(this.bottomGroup, geom1, geom2, this.colorBottom, true);
    this.group.add(this.topGroup);
    this.group.add(this.bottomGroup);
    this._updateVisibility();
    this._updateSeparation();
  }

  _buildPair(parent, geom1, geom2, color, isBottom) {
    const mesh1 = new THREE.Mesh(geom1.clone(), this._createFaceMaterial(color));
    const mesh2 = new THREE.Mesh(geom2.clone(), this._createFaceMaterial(color));
    if (isBottom) { mesh1.rotation.x = Math.PI; mesh2.rotation.x = Math.PI; }
    parent.add(mesh1, mesh2);
    this._meshes.push(mesh1, mesh2);
    const edges1 = new THREE.LineSegments(new THREE.EdgesGeometry(geom1.clone()), this._createEdgeMaterial(color));
    const edges2 = new THREE.LineSegments(new THREE.EdgesGeometry(geom2.clone()), this._createEdgeMaterial(color));
    if (isBottom) { edges1.rotation.x = Math.PI; edges2.rotation.x = Math.PI; }
    parent.add(edges1, edges2);
    this._edgeLines.push(edges1, edges2);
  }
}
