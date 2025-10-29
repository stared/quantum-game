import { Simulation } from './simulation';
import { EPSILON_DETECTION } from './const';
import type { Tile } from './tile';

interface AbsorptionProbability {
  probability: number;
  i: number;
  j: number;
}

export class WinningStatus {
  tileMatrix: Tile[][];
  absorptionProbabilities: AbsorptionProbability[];
  probsAtDets: number[];
  probsAtDetsByTime: number[];
  totalProbAtDets: number;
  noOfFedDets: number;
  probsAtMines: number;
  enoughProbability: boolean;
  enoughDetectors: boolean;
  noExplosion: boolean;
  isWon: boolean;
  message: string;

  constructor(tileMatrix: Tile[][]) {
    this.tileMatrix = tileMatrix;
    this.absorptionProbabilities = [];
    this.probsAtDets = [];
    this.probsAtDetsByTime = [];
    this.totalProbAtDets = 0;
    this.noOfFedDets = 0;
    this.probsAtMines = 0;
    this.enoughProbability = false;
    this.enoughDetectors = false;
    this.noExplosion = false;
    this.isWon = false;
    this.message = '';
  }

  run(): void {
    const simulationC = new Simulation(this.tileMatrix);
    simulationC.initialize();
    simulationC.propagateToEnd(false);

    const flatHistory = simulationC.measurementHistory.flat();
    const grouped = flatHistory.reduce((acc, entry) => {
      const key = `${entry.i} ${entry.j}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(entry);
      return acc;
    }, {} as Record<string, typeof flatHistory>);

    this.absorptionProbabilities = Object.entries(grouped).map(([location, groupedEntry]): AbsorptionProbability => ({
      probability: groupedEntry.reduce((sum, e) => sum + e.probability, 0),
      i: parseInt(location.split(' ')[0]!),
      j: parseInt(location.split(' ')[1]!),
    }));

    this.probsAtDets = this.absorptionProbabilities
      .filter((entry) => this.tileMatrix[entry.i]?.[entry.j]?.isDetector === true)
      .map(entry => entry.probability);

    this.probsAtDetsByTime = simulationC.measurementHistory.map((each) =>
      each
        .filter((entry) => this.tileMatrix[entry.i]?.[entry.j]?.isDetector === true)
        .reduce((sum, entry) => sum + entry.probability, 0),
    );

    this.totalProbAtDets = this.probsAtDets.reduce((sum, prob) => sum + prob, 0);
    this.noOfFedDets = this.probsAtDets
      .filter((probability) => probability > EPSILON_DETECTION)
      .length;
    this.probsAtMines = this.absorptionProbabilities
      .filter((entry) => {
        const tile = this.tileMatrix[entry.i]?.[entry.j];
        return tile !== undefined && tile.tileName === 'Mine';
      })
      .reduce((sum, entry) => sum + entry.probability, 0);
  }

  compareToObjectives(requiredDetectionProbability: number, detectorsToFeed: number): boolean {
    this.enoughProbability = this.totalProbAtDets > requiredDetectionProbability - EPSILON_DETECTION;
    this.enoughDetectors = this.noOfFedDets >= detectorsToFeed;
    this.noExplosion = this.probsAtMines < EPSILON_DETECTION;
    this.isWon = this.enoughProbability && this.enoughDetectors && this.noExplosion;
    const missingDets = detectorsToFeed - this.noOfFedDets;
    if (this.isWon) {
      this.message = 'You did it!';
    } else if (!this.noExplosion) {
      this.message = `Nothing else matters when you have ${(100 * this.probsAtMines).toFixed(0)}% chance of setting off a mine!`;
    } else if (this.enoughProbability) {
      this.message = `${missingDets} detector${missingDets > 1 ? 's' : ''} feel${missingDets > 1 ? '' : 's'} sad and forgotten. Be fair! Give every detector a chance!`;
    } else if (this.totalProbAtDets > EPSILON_DETECTION) {
      this.message = `Only ${(100 * this.totalProbAtDets).toFixed(0)}% (out of ${(100 * requiredDetectionProbability).toFixed(0)}%) chance of detecting a photon at a detector. Try harder!`;
    } else {
      this.message = 'No chance to detect a photon at a detector.';
    }

    return this.isWon;
  }

}
