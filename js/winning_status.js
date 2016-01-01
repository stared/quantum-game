import _ from 'lodash';

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

    this.absorptionProbabilities = _(simulationC.measurementHistory)
      .flatten()
      .groupBy((entry) => `${entry.i} ${entry.j}`)
      .mapValues((groupedEntry) =>
        _.sum(groupedEntry, 'probability')
    )
      .map((probability, location) => ({
        probability: probability,
        i: parseInt(location.split(' ')[0]),
        j: parseInt(location.split(' ')[1]),
      }))
      .value();

    this.probsAtDets = _(this.absorptionProbabilities)
      .filter((entry) =>
        this.tileMatrix[entry.i] && this.tileMatrix[entry.i][entry.j] && this.tileMatrix[entry.i][entry.j].tileName === 'Detector'
      )
      .pluck('probability')
      .value();

    // maybe also 'probability at mine'?

    this.totalProbAtDets = _.sum(this.probsAtDets);
    this.noOfFedDets = this.probsAtDets
      .filter((probability) => probability > EPSILON_DETECTION)
      .length;
  }

  compareToObjectives(requiredDetectionProbability, detectorsToFeed) {
    this.enoughProbability = this.totalProbAtDets > requiredDetectionProbability - EPSILON_DETECTION;
    this.enoughDetectors = this.noOfFedDets >= detectorsToFeed;
    this.isWon = this.enoughProbability && this.enoughDetectors;

    if (this.isWon) {
      this.message = 'You did it!';
    } else if (this.enoughProbability) {
      this.message = `${detectorsToFeed - this.noOfFedDets} detector feels sad and forgotten. Be fair! Give some chance to every detector!`;
    } else if (this.totalProbAtDets > EPSILON_DETECTION) {
      this.message = `Only ${(100 * this.totalProbAtDets).toFixed(0)}% (out of ${(100 * requiredDetectionProbability).toFixed(0)}%) chance of detecting a photon at a detector. Try harder!`
    } else {
      this.message = 'No chance to detect a photon at a detector.';
    }

    return this.isWon;
  }

}
