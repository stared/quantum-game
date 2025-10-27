import {Simulation} from './simulation';
import {EPSILON_DETECTION} from './const';

export class WinningStatus {

  constructor(tileMatrix) {
    this.tileMatrix = tileMatrix;
  }

  run() {
    const simulationC = new Simulation(this.tileMatrix);
    simulationC.initialize();
    simulationC.propagateToEnd(false);

    const flattened = simulationC.measurementHistory.flat();
    const grouped = flattened.reduce((acc, entry) => {
      const key = `${entry.i} ${entry.j}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(entry);
      return acc;
    }, {});

    this.absorptionProbabilities = Object.entries(grouped).map(([location, groupedEntry]) => ({
      probability: groupedEntry.reduce((sum, e) => sum + e.probability, 0),
      i: parseInt(location.split(' ')[0]),
      j: parseInt(location.split(' ')[1]),
    }));

    this.probsAtDets = this.absorptionProbabilities
      .filter((entry) => this.tileMatrix[entry.i]?.[entry.j]?.isDetector)
      .map((entry) => entry.probability);

    this.probsAtDetsByTime = simulationC.measurementHistory.map((each) =>
      each
        .filter((entry) => this.tileMatrix[entry.i]?.[entry.j]?.isDetector)
        .reduce((sum, e) => sum + e.probability, 0)
    );

    this.totalProbAtDets = this.probsAtDets.reduce((a, b) => a + b, 0);
    this.noOfFedDets = this.probsAtDets
      .filter((probability) => probability > EPSILON_DETECTION)
      .length;
    this.probsAtMines = this.absorptionProbabilities
      .filter((entry) =>
        this.tileMatrix[entry.i] && this.tileMatrix[entry.i][entry.j] && this.tileMatrix[entry.i][entry.j].tileName === 'Mine'
      )
      .reduce((sum, e) => sum + e.probability, 0);
  }

  compareToObjectives(requiredDetectionProbability, detectorsToFeed) {
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
