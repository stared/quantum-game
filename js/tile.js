import * as config from './config';
import * as full from './tensor/full';
import d3 from 'd3';

export const Vacuum = {
  name: 'vacuum',
  maxRotation: 1,
  rotationAngle: 0,
  transition: () => full.identity
};

export const Source = {
  name: 'source',
  maxRotation: 4, // > ^ < v
  rotationAngle: 90,
  transition: () => full.zero,
  generation: (rotation) => full.source[rotation]
};

// maybe will be changed to a typical, one-side corner sube
export const CornerCube = {
  name: 'corner-cube',
  maxRotation: 1,
  rotationAngle: 0,
  transition: () => full.cornerCube
};

export const ThinMirror = {
  name: 'thin-mirror',
  maxRotation: 4, // - / | \
  rotationAngle: 45,
  transition: (rotation) => full.thinMirror[rotation]
};

// most likely it will fo as "BeamSplitter"
export const ThinSplitter = {
  name: 'thin-splitter',
  maxRotation: 4, // - / | \
  rotationAngle: 45,
  transition: (rotation) => full.thinSplitter[rotation]
};

export const PolarizingSplitter = {
  name: 'polarizing-splitter',
  maxRotation: 2, // / \
  rotationAngle: 90,
  transition: (rotation) => full.polarizingSplitter[rotation]
};

export const Polarizer = {
  name: 'polarizer',
  maxRotation: 4, // - / | \
  rotationAngle: 45,
  transition: (rotation) => full.polarizer[rotation]
};

export const PhasePlate = {
  name: 'phase-plate',
  maxRotation: 4, // - / | \
  rotationAngle: 45,
  transition: (rotation) => full.phasePlate[rotation]
};

export const SugarSolution = {
  name: 'sugar-solution',
  maxRotation: 1, // []
  rotationAngle: 360,
  transition: () => full.sugarSolution
};

export const Mine = {
  name: 'mine',
  maxRotation: 1, // []
  rotationAngle: 360,
  transition: () => full.zero
};

// or a brick?
export const Rock = {
  name: 'rock',
  maxRotation: 1, // []
  rotationAngle: 360,
  transition: () => full.zero
};

export const Glass = {
  name: 'glass',
  maxRotation: 1, // []
  rotationAngle: 360,
  transition: () => full.glass
};

export const VacuumJar = {
  name: 'vacuum-jar',
  maxRotation: 1, // []
  rotationAngle: 360,
  transition: () => full.vacuumJar
};

export const Absorber = {
  name: 'absorber',
  maxRotation: 1, // []
  rotationAngle: 360,
  transition: () => full.absorber
};

export const Detector = {
  name: 'detector',
  maxRotation: 4, // > ^ < v
  rotationAngle: 90,
  transition: () => full.zero
};

export class Tile {
  constructor(type = Vacuum, rotation = 0, frozen = true, i = 0, j = 0) {
    this.type = type;
    this.rotation = rotation;
    this.frozen = frozen;
    this.i = i;
    this.j = j;
    // this.g // d3 group selector in which it is
  }

  draw() {

    this.g.append('use')
      .attr('xlink:href', (d) => `#${this.type.name}`)
      .attr('class', 'element')
      .attr('transform', (d) => `rotate(${-this.type.rotationAngle * this.rotation},0,0)`);

  }

  rotate() {

    const element = this.g.select('.element');
    this.rotation = (this.rotation + 1) % this.type.maxRotation;

    // Assure that rotation animation is clockwise
    const startAngle = this.type.rotationAngle * (this.rotation - 1);
    element
      .attr('transform', `rotate(${-startAngle},0,0)`);

    // Rotation animation
    const endAngle = this.type.rotationAngle * this.rotation;
    element
      .transition()
      .duration(config.rotationSpeed)
      .attr('transform', `rotate(${-endAngle},0,0)`);
  }

  absorbAnimaton() {
  }

  get x() {
    return config.tileSize * this.i;
  }

  get y() {
    return config.tileSize * this.j;
  }

  get transitionAmplitudes() {
    return this.type.transition(this.rotation);
  }
}

// NOTE maybe there is a simpler way to genarate it
export const nameToConst = {
  'vacuum': Vacuum,
  'source': Source,
  'corner-cube': CornerCube,
  'thin-mirror': ThinMirror,
  'thin-splitter': ThinSplitter,
  'polarizing-splitter': PolarizingSplitter,
  'polarizer': Polarizer,
  'phase-plate': PhasePlate,
  'sugar-solution': SugarSolution,
  'mine': Mine,
  'rock': Rock,
  'glass': Glass,
  'vacuum-jar': VacuumJar,
  'absorber': Absorber,
  'detector': Detector,
};

export const tileSimpler = (name, i = 0, j = 0) => {
  return new Tile(nameToConst[name], 0, false, i, j);
};
