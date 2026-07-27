import * as THREE from 'three';
import { SacredShape } from './base.js';

export class TetrahedronShape extends SacredShape {
  constructor(options = {}) {
    super(options);
    this.topGroup = new THREE.Group();
    this.bottomGroup = new THREE.Group();
    const geom = new THREE.TetrahedronGeometry(this.radius, 0);
    this._addMeshWithEdges(geom, this.topGroup, this.colorTop, this.colorBottom, false);
    this._addMeshWithEdges(geom, this.topGroup, this.colorTop, this.colorBottom, true);
    this._addMeshWithEdges(geom, this.bottomGroup, this.colorTop, this.colorBottom, false);
    this._addMeshWithEdges(geom, this.bottomGroup, this.colorTop, this.colorBottom, true);
    this.bottomGroup.rotation.x = Math.PI;
    this.group.add(this.topGroup);
    this.group.add(this.bottomGroup);
    if (this.instanceCount === 1) this.bottomGroup.visible = false;
    this._updateVisibility();
    this._updateSeparation();
  }
}

export class CubeShape extends SacredShape {
  constructor(options = {}) {
    super(options);
    this.topGroup = new THREE.Group();
    this.bottomGroup = new THREE.Group();
    const geom = new THREE.BoxGeometry(this.radius * 1.4, this.radius * 1.4, this.radius * 1.4);
    this._addMeshWithEdges(geom, this.topGroup, this.colorTop, this.colorBottom, false);
    this._addMeshWithEdges(geom, this.topGroup, this.colorTop, this.colorBottom, true);
    this._addMeshWithEdges(geom, this.bottomGroup, this.colorTop, this.colorBottom, false);
    this._addMeshWithEdges(geom, this.bottomGroup, this.colorTop, this.colorBottom, true);
    this.bottomGroup.rotation.x = Math.PI;
    this.group.add(this.topGroup);
    this.group.add(this.bottomGroup);
    if (this.instanceCount === 1) this.bottomGroup.visible = false;
    this._updateVisibility();
    this._updateSeparation();
  }
}

export class OctahedronShape extends SacredShape {
  constructor(options = {}) {
    super(options);
    this.topGroup = new THREE.Group();
    this.bottomGroup = new THREE.Group();
    const geom = new THREE.OctahedronGeometry(this.radius, 0);
    this._addMeshWithEdges(geom, this.topGroup, this.colorTop, this.colorBottom, false);
    this._addMeshWithEdges(geom, this.topGroup, this.colorTop, this.colorBottom, true);
    this._addMeshWithEdges(geom, this.bottomGroup, this.colorTop, this.colorBottom, false);
    this._addMeshWithEdges(geom, this.bottomGroup, this.colorTop, this.colorBottom, true);
    this.bottomGroup.rotation.x = Math.PI;
    this.group.add(this.topGroup);
    this.group.add(this.bottomGroup);
    if (this.instanceCount === 1) this.bottomGroup.visible = false;
    this._updateVisibility();
    this._updateSeparation();
  }
}

export class DodecahedronShape extends SacredShape {
  constructor(options = {}) {
    super(options);
    this.topGroup = new THREE.Group();
    this.bottomGroup = new THREE.Group();
    const geom = new THREE.DodecahedronGeometry(this.radius, 0);
    this._addMeshWithEdges(geom, this.topGroup, this.colorTop, this.colorBottom, false);
    this._addMeshWithEdges(geom, this.topGroup, this.colorTop, this.colorBottom, true);
    this._addMeshWithEdges(geom, this.bottomGroup, this.colorTop, this.colorBottom, false);
    this._addMeshWithEdges(geom, this.bottomGroup, this.colorTop, this.colorBottom, true);
    this.bottomGroup.rotation.x = Math.PI;
    this.group.add(this.topGroup);
    this.group.add(this.bottomGroup);
    if (this.instanceCount === 1) this.bottomGroup.visible = false;
    this._updateVisibility();
    this._updateSeparation();
  }
}

export class IcosahedronShape extends SacredShape {
  constructor(options = {}) {
    super(options);
    this.topGroup = new THREE.Group();
    this.bottomGroup = new THREE.Group();
    const geom = new THREE.IcosahedronGeometry(this.radius, 0);
    this._addMeshWithEdges(geom, this.topGroup, this.colorTop, this.colorBottom, false);
    this._addMeshWithEdges(geom, this.topGroup, this.colorTop, this.colorBottom, true);
    this._addMeshWithEdges(geom, this.bottomGroup, this.colorTop, this.colorBottom, false);
    this._addMeshWithEdges(geom, this.bottomGroup, this.colorTop, this.colorBottom, true);
    this.bottomGroup.rotation.x = Math.PI;
    this.group.add(this.topGroup);
    this.group.add(this.bottomGroup);
    if (this.instanceCount === 1) this.bottomGroup.visible = false;
    this._updateVisibility();
    this._updateSeparation();
  }
}
