import { velocityI, velocityJ } from '../const';
import { tileSize } from '../config';
import type { Direction } from '../types';

export class Particle {
  i: number;
  j: number;
  dir: Direction;
  hRe: number;
  hIm: number;
  vRe: number;
  vIm: number;

  constructor(i: number, j: number, dir: Direction, hRe: number, hIm: number, vRe: number, vIm: number) {
    this.i = i;
    this.j = j;
    this.dir = dir;
    this.hRe = hRe;
    this.hIm = hIm;
    this.vRe = vRe;
    this.vIm = vIm;
  }

  get startX(): number {
    return tileSize * this.i + tileSize / 2;
  }

  get endX(): number {
    return tileSize * (this.i + velocityI[this.dir]) + tileSize / 2;
  }

  get startY(): number {
    return tileSize * this.j + tileSize / 2;
  }

  get endY(): number {
    return tileSize * (this.j + velocityJ[this.dir]) + tileSize / 2;
  }

  get prob(): number {
    return this.hRe * this.hRe + this.hIm * this.hIm
         + this.vRe * this.vRe + this.vIm * this.vIm;
  }
}
