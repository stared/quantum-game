import _ from 'lodash';
import changeCase from 'change-case';

import * as config from './config';
import * as full from './tensor/full';

export const Vacuum = {
  svgName: 'vacuum',
  desc: {
    name: 'Nothing (except for some air)',
    flavour: '',
    summary: 'Visible light is only 0.03% slower in the air than in the vacuum.',
  },
  maxRotation: 1,
  rotationAngle: 0,
  transition: () => full.identity,
};

export const Source = {
  svgName: 'source',
  desc: {
    name: 'Single Photon Source',
    flavour: 'a\u2020 - an excitation, raise from the vacuum!',
    summary: 'An on-deman single photon source.',
  },
  maxRotation: 4, // > ^ < v
  rotationAngle: 90,
  transition: () => full.zero,
  generation: (rotation) => full.source[rotation],
};

// maybe will be changed to a typical, one-side corner sube
export const CornerCube = {
  svgName: 'corner-cube',
  desc: {
    name: 'Corner Cube',
    flavour: 'Like a mirror but rotating, not - reflecting',
    summary: 'Three perpendicular reflective planes makes the the reflectin going the same way. And saves lives on the streets.',
  },
  maxRotation: 1,
  rotationAngle: 0,
  transition: () => full.cornerCube,
};

export const ThinMirror = {
  svgName: 'thin-mirror',
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
  svgName: 'thin-splitter',
  desc: {
    name: '50/50 Beam Splitter',
    flavour: 'A thin slice of glass does amazing things!',
    summary: 'A thin slab of glass reflecting half the beam, and transmitting other half of it.',
  },
  maxRotation: 4, // - / | \
  rotationAngle: 45,
  transition: (rotation) => full.thinSplitter[rotation],
};

export const ThinSplitterCoated = {
  svgName: 'thin-splitter-coated',
  desc: {
    name: 'Coated 50/50 Beam Splitter',
    flavour: 'Like a bread sice with butter',
    summary: 'A thin slab of glass with a reflective layer - reflecting half the beam, and transmitting other half of it.',
  },
  maxRotation: 8, // - / | \ - / | \
  rotationAngle: 45,
  transition: (rotation) => full.thinSplitterCoated[rotation],
};

export const PolarizingSplitter = {
  svgName: 'polarizing-splitter',
  desc: {
    name: 'Polarizing Beam Splitter',
    flavour: '',
    summary: 'Reflects vertical polarization (↕), transmitts horizonal polarization (↔).',
  },
  maxRotation: 2, // / \
  rotationAngle: 90,
  transition: (rotation) => full.polarizingSplitter[rotation],
};

// deprecated
export const Polarizer = {
  svgName: 'polarizer',
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

export const PolarizerNS = {
  svgName: 'polarizer-n-s',
  desc: {
    name: 'Absorptive Polarizer (North-South)',
    flavour: '',
    summary: 'Anisotropic polymer strands capture electric oscillations parallel to them. Used in photography.',
  },
  maxRotation: 4, // - / | \
  rotationAngle: 45,
  transition: (rotation) => full.polarizerNS[rotation],
  drawUnrotablePart: (that) => {
    that.g.append('line')
      .attr('class', 'wire')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 25)
      .attr('y2', 50);
  },
};

export const PolarizerWE = {
  svgName: 'polarizer-w-e',
  desc: {
    name: 'Absorptive Polarizer (West-East)',
    flavour: '',
    summary: 'Anisotropic polymer strands capture electric oscillations parallel to them. Used in photography.',
  },
  maxRotation: 4, // - / | \
  rotationAngle: 45,
  transition: (rotation) => full.polarizerWE[rotation],
  drawUnrotablePart: (that) => {
    that.g.append('line')
      .attr('class', 'wire')
      .attr('x1', 25)
      .attr('x2', 50)
      .attr('y1', 0)
      .attr('y2', 0);
  },
};

// deprecated
export const QuarterWavePlate = {
  svgName: 'quarter-wave-plate',
  desc: {
    name: 'Quarter Wave Plate',
    flavour: '',
    summary: 'It delays one polarization (with darker lines) by \u03BB/4. When applied correctly, it can change linear polarization into circular, and vice versa.',
  },
  maxRotation: 4, // - / | \
  rotationAngle: 45,
  transition: (rotation) => full.quarterWavePlate[rotation],
  drawUnrotablePart: (that) => {
    that.g.append('line')
      .attr('class', 'wire')
      .attr('x1', 25 / Math.sqrt(2))
      .attr('x2', 35)
      .attr('y1', 25 / Math.sqrt(2))
      .attr('y2', 35);
  },
};

export const QuarterWavePlateNS = {
  svgName: 'quarter-wave-plate-n-s',
  desc: {
    name: 'Quarter Wave Plate (North-South)',
    flavour: '',
    summary: 'It delays one polarization (with darker lines) by \u03BB/4. When applied correctly, it can change linear polarization into circular, and vice versa.',
  },
  maxRotation: 4, // - / | \
  rotationAngle: 45,
  transition: (rotation) => full.quarterWavePlateNS[rotation],
  drawUnrotablePart: (that) => {
    that.g.append('line')
      .attr('class', 'wire')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 25)
      .attr('y2', 50);
  },
};

export const QuarterWavePlateWE = {
  svgName: 'quarter-wave-plate-w-e',
  desc: {
    name: 'Quarter Wave Plate (West-East)',
    flavour: '',
    summary: 'It delays one polarization (with darker lines) by \u03BB/4. When applied correctly, it can change linear polarization into circular, and vice versa.',
  },
  maxRotation: 4, // - / | \
  rotationAngle: 45,
  transition: (rotation) => full.quarterWavePlateWE[rotation],
  drawUnrotablePart: (that) => {
    that.g.append('line')
      .attr('class', 'wire')
      .attr('x1', 25)
      .attr('x2', 50)
      .attr('y1', 0)
      .attr('y2', 0);
  },
};

export const SugarSolution = {
  svgName: 'sugar-solution',
  desc: {
    name: 'Sugar Solution',
    flavour: 'Vodka is a solution. But Sugar Solution is the light-twisting solution.',
    summary: 'Table sugar is a chiral molecule – it does not look the same as its mirror reflection. We put it in an amount, so it rotates polarization by 45\u00B0.',
  },
  maxRotation: 1, // []
  rotationAngle: 360,
  transition: () => full.sugarSolution,
};

export const Mine = {
  svgName: 'mine',
  desc: {
    name: 'Light-Sensitive Bomb',
    flavour: 'If it does NOT click, you will have sunglasses… and a pair of hands.',
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

    that.g.append('use')
      .attr('xlink:href', '#mine-absorbed')
      .attr('transform', 'scale(0.1)')
      .transition()
        .duration(config.absorptionDuration / 3)
        .ease('linear')
        .attr('transform', 'scale(100)')
        .style('opacity', 0)
        .remove();
  },
};

// or a brick?
export const Rock = {
  svgName: 'rock',
  desc: {
    name: 'Rock',
    flavour: 'Dark and immersive as your sweetheart\'s depth of eyes.',
    summary: 'Perhaps coal. I haven\'t decided yet.',
  },
  maxRotation: 1, // []
  rotationAngle: 360,
  transition: () => full.zero,
};

export const Glass = {
  svgName: 'glass',
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
  svgName: 'vacuum-jar',
  desc: {
    name: 'Vacuum Jar',
    flavour: 'Pure timespace without relativistic energy density. Served in a bottle.',
    summary: 'Even air retards light a bit. We set the thickness of vacuum so it advances phase by \u03BB/4. Useful for changing interference.',
  },
  maxRotation: 1, // []
  rotationAngle: 360,
  transition: () => full.vacuumJar,
};

export const Absorber = {
  svgName: 'absorber',
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
  svgName: 'detector',
  desc: {
    name: 'Single Photon Detector',
    flavour: '',
    summary: 'Detects and amplifies electric signal from each single photon. Typically, it is the goal to get the photon here.',
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
  svgName: 'faraday-rotator',
  desc: {
    name: 'Faraday Rotator',
    flavour: 'You can go back, but it won\'t be the same.',
    summary: 'Rotates polarization with magnetic field by 45\u00B0. Has different symmetries than Sugar Solution. A building block for optical diodes.',
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
      .attr('xlink:href', () => `#${this.type.svgName}`)
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
    if (this.type.absorbAnimaton != null) {
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

  get tileName() {
    return changeCase.pascalCase(this.type.svgName);
  }
}

export const allTiles = [
  'Vacuum',
  'Source',
  'CornerCube',
  'ThinMirror',
  'ThinSplitter',
  'ThinSplitterCoated',
  'PolarizingSplitter',
  'PolarizerNS',
  'PolarizerWE',
  'QuarterWavePlateNS',
  'QuarterWavePlateWE',
  'SugarSolution',
  'Mine',
  'Rock',
  'Glass',
  'VacuumJar',
  'Absorber',
  'Detector',
  'FaradayRotator',
];

export const nonVacuumTiles = _.without(allTiles, 'Vacuum');
