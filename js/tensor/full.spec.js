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
      _.each(tensor, (entry) => {
        const probabilities = _.sum(_.map(entry, probability));
        expect(probabilities).toBeCloseTo(1, 5);
      });
    });
  });

  it('should pass a beam parallel to the element', () => {
    // 0th element represents splitter's "-" rotation,
    // so it's parallel to ">" beam direction.
    const transition = full.thinSplitter[0]['>-'];

    expect(transition.length).toBe(1);
    expect(transition[0].to).toBe('>-');
  });

  it('should pass half of the beam perpendicular to the element', () => {
    // 2nd element represents splitter's "|" rotation,
    // so it's perpendicular to ">" beam direction.
    const transition = full.thinSplitter[2]['>-'];

    expect(transition.length).toBe(2);
    expect(_.pluck(transition, 'to')).toContain('>-');
    expect(_.pluck(transition, 'to')).toContain('<-');
  });
});
