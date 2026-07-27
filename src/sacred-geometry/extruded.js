import * as THREE from 'three';
import { SacredShape } from './base.js';

function createVesicaPiscisShape(radius) {
  const shape = new THREE.Shape();
  const r = radius;
  const d = r * 0.6;
  shape.moveTo(0, -r);
  shape.bezierCurveTo(d, -r * 0.5, d, r * 0.5, 0, r);
  shape.bezierCurveTo(-d, r * 0.5, -d, -r * 0.5, 0, -r);
  return shape;
}

function createStar5Shape(radius) {
  const shape = new THREE.Shape();
  const outerR = radius;
  const innerR = radius * 0.4;
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

function createYantraShape(radius) {
  const shape = new THREE.Shape();
  const r = radius;
  shape.moveTo(0, -r);
  shape.lineTo(r * 0.866, r * 0.5);
  shape.lineTo(-r * 0.866, r * 0.5);
  shape.closePath();
  const hole = new THREE.Path();
  const s = r * 0.45;
  hole.moveTo(0, s);
  hole.lineTo(-s * 0.866, -s * 0.5);
  hole.lineTo(s * 0.866, -s * 0.5);
  hole.closePath();
  shape.holes.push(hole);
  return shape;
}

export class VesicaPiscisShape extends SacredShape {
  constructor(options = {}) {
    super(options);
    this.extrudeDepth = options.extrudeDepth ?? 0.3;
    this.topGroup = new THREE.Group();
    this.bottomGroup = new THREE.Group();
    const shape = createVesicaPiscisShape(this.radius);
    const extrudeSettings = { depth: this.extrudeDepth, bevelEnabled: false };
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
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

export class Star5Shape extends SacredShape {
  constructor(options = {}) {
    super(options);
    this.extrudeDepth = options.extrudeDepth ?? 0.2;
    this.topGroup = new THREE.Group();
    this.bottomGroup = new THREE.Group();
    const shape = createStar5Shape(this.radius);
    const extrudeSettings = { depth: this.extrudeDepth, bevelEnabled: false };
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
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

export class YantraShape extends SacredShape {
  constructor(options = {}) {
    super(options);
    this.extrudeDepth = options.extrudeDepth ?? 0.15;
    this.topGroup = new THREE.Group();
    this.bottomGroup = new THREE.Group();
    const shape = createYantraShape(this.radius);
    const extrudeSettings = { depth: this.extrudeDepth, bevelEnabled: false };
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
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
