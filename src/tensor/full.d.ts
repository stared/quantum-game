/**
 * Type declaration for tensor/full.js
 * Contains transition probability tensors for various optical elements
 */

import type { Tensor } from './tensor';
import type { PhotonGeneration } from '../types';

// Single tensors (no rotation dependency)
export const identity: Tensor;
export const zero: Tensor;
export const cornerCube: Tensor;
export const glass: Tensor;
export const vacuumJar: Tensor;
export const absorber: Tensor;
export const sugarSolution: Tensor;
export const doubleSugarSolution: Tensor;

// Tensor arrays (rotation-dependent) - indexed by rotation
export const thinMirror: Tensor[];
export const thinMirrorCoated: Tensor[];
export const thinSplitter: Tensor[];
export const thinSplitterCoated: Tensor[];
export const polarizingSplitter: Tensor[];
export const polarizer: Tensor[];
export const polarizerNS: Tensor[];
export const polarizerWE: Tensor[];
export const quarterWavePlate: Tensor[];
export const quarterWavePlateNS: Tensor[];
export const quarterWavePlateWE: Tensor[];
export const faradayRotator: Tensor[];

// Special arrays for photon sources and detectors
export const source: PhotonGeneration[][][]; // [rotation][photon][state]
export const detector: Tensor[];
