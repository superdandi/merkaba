import * as THREE from 'three';
import { SacredShape } from './base.js';

export class TorusShape extends SacredShape {
  constructor(options = {}) {
    super(options);
    this.tubeRadius = options.tubeRadius ?? 0.3;
    this.topGroup = new THREE.Group();
    this.bottomGroup = new THREE.Group();
    const geom = new THREE.TorusGeometry(this.radius, this.tubeRadius, 16, 48);
    this._addMeshWithEdges(geom, this.topGroup, this.colorTop, this.colorBottom, false);
    this._addMeshWithEdges(geom, this.topGroup, this.colorTop, this.colorBottom, true);
    this._addMeshWithEdges(geom, this.bottomGroup, this.colorTop, this.colorBottom, false);
    this._addMeshWithEdges(geom, this.bottomGroup, this.colorTop, this.colorBottom, true);
    this.bottomGroup.rotation.x = Math.PI;
    this.group.add(this.topGroup);
    this.group.add(this.bottomGroup);
    this._updateVisibility();
    this._updateSeparation();
  }
}

export class SphereShape extends SacredShape {
  constructor(options = {}) {
    super(options);
    this.topGroup = new THREE.Group();
    this.bottomGroup = new THREE.Group();
    const geom = new THREE.SphereGeometry(this.radius, 32, 32);
    this._addMeshWithEdges(geom, this.topGroup, this.colorTop, this.colorBottom, false);
    this._addMeshWithEdges(geom, this.topGroup, this.colorTop, this.colorBottom, true);
    this._addMeshWithEdges(geom, this.bottomGroup, this.colorTop, this.colorBottom, false);
    this._addMeshWithEdges(geom, this.bottomGroup, this.colorTop, this.colorBottom, true);
    this.bottomGroup.rotation.x = Math.PI;
    this.group.add(this.topGroup);
    this.group.add(this.bottomGroup);
    this._updateVisibility();
    this._updateSeparation();
  }
}
