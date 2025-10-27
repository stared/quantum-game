/**
 * Type declaration for print.js
 */

import type { ParticleEntry, AbsorptionEvent } from './types';

export function stateToStr(state: ParticleEntry[]): string;
export function absorbedToStr(absorbed: AbsorptionEvent[]): string;
