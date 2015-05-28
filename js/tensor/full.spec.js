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

  it('should consist of unitary tensors', () => {
    _.each(full.thinSplitter, (tensor) => {
      for (let entry of tensor.map.values()) {
        const probabilities = _.sum(_.map([...entry.values()], probability));
        expect(probabilities).toBeCloseTo(1, 5);
      }
    });
  });

  it('should pass a beam parallel to the element', () => {
    // 0th element represents splitter's "-" rotation,
    // so it's parallel to ">" beam direction.
    const transition = full.thinSplitter[0].map.get('>-');

    expect(transition.size).toBe(1);
    expect(transition.get('>-')).toBeDefined();
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
