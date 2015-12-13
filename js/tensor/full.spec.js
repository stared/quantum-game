/*global describe:false, it:false, expect:false*/
import * as full from './full';
import _ from 'lodash';

function probability(entry) {
  return entry.re * entry.re + entry.im * entry.im;
}

describe('thinSplitter', () => {
  it('should consist of 4 tensors', () => {
    expect(full.thinSplitter.length).toBe(4);
  });

  it('diagonal orientations should consist of unitary tensors', () => {
    _.each(_.at(full.thinSplitter, [1, 3]), (tensor) => {
      for (let entry of tensor.map.values()) {
        const probabilities = _.sum(_.map([...entry.values()], probability));
        expect(probabilities).toBeCloseTo(1, 5);
      }
    });
  });

  it('should pass half of the beam perpendicular to the element', () => {
    // 2nd element represents splitter's "|" rotation,
    // so it's perpendicular to ">" beam direction.
    const transition = full.thinSplitter[2].map.get('>-');

    expect(transition.size).toBe(2);
    expect(transition.get('>-')).toBeDefined();
    expect(transition.get('<-')).toBeDefined();
  });
});
