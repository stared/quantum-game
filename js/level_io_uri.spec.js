import _ from 'lodash';

import {name2abbr, encodeTile, decodeTile} from './level_io_uri';
import {allTiles} from './tile';


describe('Tile URI codes', () => {

  const noOfCodes = _.values(name2abbr).length;

  it('Tile codes are unique', () => {
    const uniqueLength = _(name2abbr)
      .values()
      .uniq()
      .value()
      .length;
    expect(uniqueLength).toBe(noOfCodes);
  });

  it('As many codes as tiles', () => {
    expect(noOfCodes).toBe(allTiles.length);
  });

  it('Each tile has its code', () => {
    const numberOfTilesWithCode = _(allTiles)
      .map((name) => _.has(name2abbr, name))
      .sum();
    expect(numberOfTilesWithCode).toBe(allTiles.length);
  });

});


describe('Encoding and decoding tile URI codes', () => {

  it('Decoding and encoding rotated ThinSplitter: h3 and H3', () => {
    expect(encodeTile(decodeTile('h3'))).toBe('h3');
    expect(encodeTile(decodeTile('H3'))).toBe('H3');
  });

});


// TODO(migdal) encoding and decoding whole board
