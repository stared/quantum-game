'use strict';
import * as tensor from 'tensor/tensor'
import * as full from 'tensor/full'

class Tile {
  constructor(type = Vacuum, rotation = 0, frozen = true, i = 0, j = 0) {
    this.type = type;
    this.rotation = rotation;
    this.frozen = frozen;
    this.i = i;
    this.j = j;
  }
}

class TileType {
  generate() {
    return this.generates[this.rotation];
  }
}

export class Vacuum extends TileType {
  static name = 'vacuum';
  static maxRotation = 1;
  static rotationAngle = 0;
  static transition = () => full.identity;
}

export class Source extends TileType {
  static name = 'source';
  static maxRotation = 4; // > ^ < v
  static rotationAngle = 90;
  static transition = () => full.zero;
}

export class CornerCube extends TileType {
  static name = 'corner-cube';
  static maxRotation = 4;
  static rotationAngle = 90;
  static transition = (rotation) => full.cornerCube[rotation];
}

export class ThinMirror extends TileType {
  static name = 'thin-mirror';
  static maxRotation = 4; // - / | \
  static rotationAngle = 45;
  static transition = (rotation) => full.thinMirror[rotation];
}

export class ThinSplitter extends TileType {
  static name = 'thin-splitter';
  static maxRotation = 4; // - / | \
  static rotationAngle = 45;
  static transition = (rotation) => full.thinSplitter[rotation];
}

export class PolarizingBeamSplitter extends TileType {
  static name = 'polarizing-beam-splitter';
  static maxRotation = 2; // / \
  static rotationAngle = 90;
  static transition = (rotation) => full.polarizingSplitter[rotation];
}
