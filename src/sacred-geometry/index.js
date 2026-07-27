import { TetrahedronShape, CubeShape, OctahedronShape, DodecahedronShape, IcosahedronShape } from './platonic.js';
import { MerkabaShape, StarDavidShape, CubicStarShape } from './stars.js';
import { SeedOfLifeShape, FlowerOfLifeShape, MetatronCubeShape } from './metatron.js';
import { VesicaPiscisShape, Star5Shape, YantraShape } from './extruded.js';
import { TorusShape, SphereShape } from './extras.js';

const SHAPE_CLASSES = {
  'merkaba': MerkabaShape,
  'tetrahedron': TetrahedronShape,
  'cube': CubeShape,
  'octahedron': OctahedronShape,
  'dodecahedron': DodecahedronShape,
  'icosahedron': IcosahedronShape,
  'star-david': StarDavidShape,
  'cubic-star': CubicStarShape,
  'seed-of-life': SeedOfLifeShape,
  'flower-of-life': FlowerOfLifeShape,
  'metatron-cube': MetatronCubeShape,
  'vesica-piscis': VesicaPiscisShape,
  'star-5': Star5Shape,
  'yantra': YantraShape,
  'torus': TorusShape,
  'sphere': SphereShape,
};

const SHAPE_SETS = {
  'Platónicos': ['tetrahedron', 'cube', 'octahedron', 'dodecahedron', 'icosahedron'],
  'Estrellas': ['merkaba', 'star-david', 'cubic-star'],
  'Metatrón': ['seed-of-life', 'flower-of-life', 'metatron-cube'],
  'Extruidas': ['vesica-piscis', 'star-5', 'yantra'],
  'Extras': ['torus', 'sphere'],
};

const SHAPE_LABELS = {
  'merkaba': 'Merkaba',
  'tetrahedron': 'Tetraedro',
  'cube': 'Cubo',
  'octahedron': 'Octaedro',
  'dodecahedron': 'Dodecaedro',
  'icosahedron': 'Icosaedro',
  'star-david': 'Estrella de David 3D',
  'cubic-star': 'Cubo Estelar',
  'seed-of-life': 'Semilla de la Vida',
  'flower-of-life': 'Flor de la Vida',
  'metatron-cube': 'Cubo de Metatrón',
  'vesica-piscis': 'Vesica Piscis',
  'star-5': 'Estrella 5 Puntas',
  'yantra': 'Yantra',
  'torus': 'Toroide',
  'sphere': 'Esfera',
};

function createShape(name, options = {}) {
  const ShapeClass = SHAPE_CLASSES[name];
  if (!ShapeClass) throw new Error(`Shape "${name}" not found`);
  return new ShapeClass(options);
}

export { SHAPE_CLASSES, SHAPE_SETS, SHAPE_LABELS, createShape };
