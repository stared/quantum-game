import * as tensor from 'tensor'
import * as tensorUtils from 'tensorUtils'

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
  static transition = () => tensorUtils.fullIdentity;
}

export class Source extends TileType {
  static name = 'source';
  static maxRotation = 4; // > ^ < v
  static rotationAngle = 90;
  static transition = () => tensorUtils.fullZero;
}

export class ThinMirror extends TileType {
  static name = 'thin-mirror';
  static maxRotation = 4; // - / | \
  static rotationAngle = 45;
  static transition = (rotation) => tensor.product(
    tensorUtils.directionMirror[rotation],
    tensorUtils.polarizationReflectPhase
  );
}

export class ThinBeamSplitter extends TileType {
  static name = 'thin-beam-splitter';
  static maxRotation = 4; // - / | \
  static rotationAngle = 45;
  static transition = (rotation) => tensor.product(
    tensorUtils.directionSplitter[rotation],
    tensorUtils.polarizationReflectPhase
  );
}

export class PolarizingBeamSplitter extends TileType {
  static name = 'polarizing-beam-splitter';
  static maxRotation = 2; // / \
  static rotationAngle = 90;
  static transition = (rotation) => tensorUtils.fullPolarizingSplitter[rotation];
}
