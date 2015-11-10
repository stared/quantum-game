import _ from 'lodash';

import * as config from './config';
import * as full from './tensor/full';

export const Vacuum = {
  name: 'vacuum',
  desc: {
    name: 'Nothing (except for some air)',
    flavour: 'Darkness is the best place for light',
    summary: '',
  },
  maxRotation: 1,
  rotationAngle: 0,
  transition: () => full.identity,
};

export const Source = {
  name: 'source',
  desc: {
    name: 'Single Photon Source',
    flavour: 'a\u2020',
    summary: '',
  },
  maxRotation: 4, // > ^ < v
  rotationAngle: 90,
  transition: () => full.zero,
  generation: (rotation) => full.source[rotation],
};

// maybe will be changed to a typical, one-side corner sube
export const CornerCube = {
  name: 'corner-cube',
  desc: {
    name: 'Corner Cube',
    flavour: 'Like a mirror but rotating, not - reflecting',
    summary: '',
  },
  maxRotation: 1,
  rotationAngle: 0,
  transition: () => full.cornerCube,
};

export const ThinMirror = {
  name: 'thin-mirror',
  desc: {
    name: 'Mirror',
    flavour: 'Making photons in two places at once. And binding them again.',
    summary: 'Metallic or dielectric mirror.',
  },
  maxRotation: 4, // - / | \
  rotationAngle: 45,
  transition: (rotation) => full.thinMirror[rotation],
};

// most likely it will fo as "BeamSplitter"
export const ThinSplitter = {
  name: 'thin-splitter',
  desc: {
    name: '50%-50% Beam Splitter',
    flavour: 'A thin slice of glass does amazing things!',
    summary: 'A thin slab of glass reflecting half the beam, and transmitting other half of it.',
  },
  maxRotation: 4, // - / | \
  rotationAngle: 45,
  transition: (rotation) => full.thinSplitter[rotation],
};

export const PolarizingSplitter = {
  name: 'polarizing-splitter',
  desc: {
    name: 'Polarizing Beam Splitter',
    flavour: '',
    summary: 'Reflects vertical polarization (↕), transmitts horizonal polarization (↔).',
  },
  maxRotation: 2, // / \
  rotationAngle: 90,
  transition: (rotation) => full.polarizingSplitter[rotation],
};

export const Polarizer = {
  name: 'polarizer',
  desc: {
    name: 'Absorptive Polarizer',
    flavour: '',
    summary: 'Anisotropic polymer strands capture electric oscillations parallel to them. Used in photography.',
  },
  maxRotation: 4, // - / | \
  rotationAngle: 45,
  transition: (rotation) => full.polarizer[rotation],
  drawUnrotablePart: (that) => {
    that.g.append('line')
      .attr('class', 'wire')
      .attr('x1', 25 / Math.sqrt(2))
      .attr('x2', 35)
      .attr('y1', 25 / Math.sqrt(2))
      .attr('y2', 35);
  },
};

export const PhasePlate = {
  name: 'phase-plate',
  desc: {
    name: 'Quater Wave Plate',
    flavour: '',
    summary: 'It delays one polarization (with darker lines) by \u03BB/4. When applied correctly, it can change linear polarization into circular, and vice versa.',
  },
  maxRotation: 4, // - / | \
  rotationAngle: 45,
  transition: (rotation) => full.phasePlate[rotation],
  drawUnrotablePart: (that) => {
    that.g.append('line')
      .attr('class', 'wire')
      .attr('x1', 25 / Math.sqrt(2))
      .attr('x2', 35)
      .attr('y1', 25 / Math.sqrt(2))
      .attr('y2', 35);
  },
};

export const SugarSolution = {
  name: 'sugar-solution',
  desc: {
    name: 'Sugar Solution',
    flavour: 'Vodka is a solution. But Sugar Solution is the light-twisting solution.',
    summary: 'Table sugar is a chiral molecule - it does not look the same as its mirror reflection. We put it in an amount, so it rotates polarization by 45\u00B0.',
  },
  maxRotation: 1, // []
  rotationAngle: 360,
  transition: () => full.sugarSolution,
};

export const Mine = {
  name: 'mine',
  desc: {
    name: 'Light-Sensitive Bomb',
    flavour: 'If it does NOT click, you will have sunglasses... and a pair of hands.',
    summary: 'Once it absorbs a single photon, it sets off.',
  },
  maxRotation: 1, // []
  rotationAngle: 360,
  transition: () => full.zero,
  absorbAnimaton: (that) => {

    const gDom = that.g[0][0];
    gDom.parentNode.appendChild(gDom);

    that.g.select('.element')
      .style('opacity', 0)
      .transition()
        .delay(config.absorptionDuration / 3)
        .duration(config.absorptionDuration)
        .style('opacity', 1);

    that.g.append('circle')
      .attr('r', 50)
      .style('fill', 'red')
      .transition()
        .duration(config.absorptionDuration / 3)
        .ease('linear')
        .attr('r', 2000)
        .style('fill', 'yellow')
        .style('opacity', 0)
        .remove();
  },
};

// or a brick?
export const Rock = {
  name: 'rock',
  desc: {
    name: 'Rock',
    flavour: 'Dark and immersive as your sweatheart`s pupils.',
    summary: 'Perhaps coal. I haven`t decided yet.',
  },
  maxRotation: 1, // []
  rotationAngle: 360,
  transition: () => full.zero,
};

export const Glass = {
  name: 'glass',
  desc: {
    name: 'Glass Slab',
    flavour: '',
    summary: 'Higher reflective index makes light slower. We set its thickness so it retards phase by \u03BB/4. Useful for changing interference.',
  },
  maxRotation: 1, // []
  rotationAngle: 360,
  transition: () => full.glass,
};

export const VacuumJar = {
  name: 'vacuum-jar',
  desc: {
    name: 'Vacuum Jar',
    flavour: 'Pure timespace without relativistic energy density. Served in a bottle.',
    summary: 'Even air retards light a bit. We set the thickness of vacuum so it advances phase by  \u03BB/4. Useful for changing interference.',
  },
  maxRotation: 1, // []
  rotationAngle: 360,
  transition: () => full.vacuumJar,
};

export const Absorber = {
  name: 'absorber',
  desc: {
    name: 'Absorber / Neutral-Density Filter',
    flavour: 'To click or not to click?',
    summary: 'Filter with 50% absorption probability.',
  },
  maxRotation: 1, // []
  rotationAngle: 360,
  transition: () => full.absorber,
};

export const Detector = {
  name: 'detector',
  desc: {
    name: 'Single Photon Detector',
    flavour: '',
    summary: 'Detects and amplifies electric signal from each single photon. Typically, it is the goal to get photon here.',
  },
  maxRotation: 4, // > ^ < v
  rotationAngle: 90,
  transition: () => full.zero,
  absorbAnimaton: (that) => {

    that.g.append('use')
      .attr('xlink:href', '#detector-absorbed')
      .attr('class', 'absorbed')
      .attr('transform', `rotate(${-that.type.rotationAngle * that.rotation},0,0)`)
      .transition()
        .duration(config.absorptionDuration)
        .style('opacity', 0)
        .remove();

  },
};

export const FaradayRotator = {
  name: 'faraday-rotator',
  desc: {
    name: 'Faraday Rotator',
    flavour: 'You can go back, but it won`t be the same.',
    summary: 'Rotates polarization with magnetic field, by 45\u00B0. Has different symmetreis than Sugar Solution. A building block for optical diodes.',
  },
  maxRotation: 4, // > ^ < v
  rotationAngle: 90,
  transition: (rotation) => full.faradayRotator[rotation],
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

    if (this.type.drawUnrotablePart !== undefined) {
      this.type.drawUnrotablePart(this);
    }

    this.g.append('use')
      .attr('xlink:href', () => `#${this.type.name}`)
      .attr('class', 'element')
      .attr('transform', () => `rotate(${-this.type.rotationAngle * this.rotation},0,0)`);

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

    // NOTE or maybe just class inheritance?
    if (this.type.absorbAnimaton !== undefined) {
      this.type.absorbAnimaton(this);
    } else {
      this.g.select('.element')
        .style('opacity', 0.3)
        .transition()
          .duration(config.absorptionDuration)
          .style('opacity', 1);
    }

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

export const allTiles = [
  'vacuum',
  'source',
  'corner-cube',
  'thin-mirror',
  'thin-splitter',
  'polarizing-splitter',
  'polarizer',
  'phase-plate',
  'sugar-solution',
  'mine',
  'rock',
  'glass',
  'vacuum-jar',
  'absorber',
  'detector',
  'faraday-rotator',
];

export const nonVacuumTiles = _.without(allTiles, 'vacuum');
