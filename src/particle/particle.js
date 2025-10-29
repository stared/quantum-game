/*global window:false*/
import {velocityI, velocityJ} from '../const';
import {tileSize} from '../config';

export class Particle {

  constructor(i, j, dir, hRe, hIm, vRe, vIm) {
    this.i = i;
    this.j = j;
    this.dir = dir;
    this.hRe = hRe;
    this.hIm = hIm;
    this.vRe = vRe;
    this.vIm = vIm;
  }

  get startX() {
    return tileSize * this.i + tileSize / 2;
  }

  get endX() {
    return tileSize * (this.i + velocityI[this.dir]) + tileSize / 2;
  }

  get startY() {
    return tileSize * this.j + tileSize / 2;
  }

  get endY() {
    return tileSize * (this.j + velocityJ[this.dir]) + tileSize / 2;
  }

  get prob() {
    return this.hRe * this.hRe + this.hIm * this.hIm
         + this.vRe * this.vRe + this.vIm * this.vIm;
  }

}
