import _ from 'lodash';

import {levels, Level} from './level';

describe('All level JSON recipes have required fields', () => {
  levels.forEach((levelRecipe) => {
    it(`${levelRecipe.group} ${levelRecipe.i} ${levelRecipe.name}`, () => {
      expect(levelRecipe.group).toBeDefined();
      expect(levelRecipe.name).toBeDefined();
      expect(levelRecipe.width).toBeDefined();
      expect(levelRecipe.height).toBeDefined();
      expect(levelRecipe.tiles).toBeDefined();
    });
  })
});

describe('Levels are present', () => {

  it('At least 1 dev level', () => {

    expect(
      levels.filter((levelRecipe) =>
        levelRecipe.tiles.length === 0 && levelRecipe.stock === 'all'
      ).length
    ).toBeGreaterThan(0);

  });

  it('At least 10 game levels', () => {
    expect(levels.filter((levelRecipe) => levelRecipe.group === 'Game').length).toBeGreaterThan(9);
  });

});

describe('Game levels: source, detector, mines - present, fixed', () => {

  levels
    .filter((levelRecipe) => levelRecipe.group === 'Game')
    .forEach((levelRecipe) => {
    it(`${levelRecipe.i} ${levelRecipe.name}`, () => {

      const tileCount = _.countBy(levelRecipe.tiles, 'name');

      expect(tileCount['Source']).toBe(1);
      expect((tileCount['Detector'] || 0) + (tileCount['Mine'] || 0)).toBeGreaterThan(0);

      const nonfrozenCount = _(levelRecipe.tiles)
        .filter((tile) => !tile.frozen)
        .countBy('name')
        .value();

      expect(nonfrozenCount['Source']).toBeUndefined();
      expect(nonfrozenCount['Detector']).toBeUndefined();
      expect(nonfrozenCount['Mine']).toBeUndefined();

    });
  })
});

describe('Level group-name pairs are unique', () => {

  it(`${levels.length} level names are unique`, () => {
    const uniqueLength = _(levels)
      .map((levelRecipe) => `${levelRecipe.group} ${levelRecipe.name}`)
      .uniq()
      .value()
      .length;
    expect(uniqueLength).toBe(levels.length);
  });

});
