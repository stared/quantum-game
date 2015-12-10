import _ from 'lodash';

import {nonVacuumTiles} from './tile';
import {DEV_MODE} from './config';

import levelsGame from '../data/levels_game.json!';
import levelsOther from '../data/levels_other.json!';


export class Level {
  constructor(levelRecipe) {
    this.next = levelRecipe.next;
    this.name = levelRecipe.name;
    this.group = levelRecipe.group;
    this.i = levelRecipe.i;
    this.width = levelRecipe.width;
    this.height = levelRecipe.height;
    this.texts = levelRecipe.texts || {};
    this.tileRecipes = levelRecipe.tiles;
    this.initialStock = {};
    if (levelRecipe.stock == null && _.filter(levelRecipe.tiles, 'frozen').length === 0) {
      levelRecipe.stock = 'all';
    }
    if (typeof levelRecipe.stock === 'object') {
      this.initialStock = levelRecipe.stock;
    } else if (levelRecipe.stock === 'all' || DEV_MODE) {
      nonVacuumTiles.forEach((tile) => {
        this.initialStock[tile] = (tile === 'Source' ? 1 : 99);
      });
    } else if (levelRecipe.stock === 'non-frozen' || !DEV_MODE) {
      this.tileRecipes = _.filter(levelRecipe.tiles, 'frozen');
      this.initialStock = _(levelRecipe.tiles)
        .filter((tile) => !tile.frozen)
        .countBy('name')
        .value();
    }
    this.requiredDetectionProbability = levelRecipe.requiredDetectionProbability || 1;
    this.detectorsToFeed = levelRecipe.detectorsToFeed || _.filter(levelRecipe.tiles, (tile) => tile.frozen && tile.name === 'Detector').length;

    if (levelRecipe.stock === 'all') {
      this.kind = 'dev';
    } else if (levelRecipe.group === 'Game') {
      this.kind = 'level';
    } else {
      this.kind = 'other';
    }
  }
}

// below it's a quick&dirty hack to make the level ordering sensible
export const levels = _(levelsGame)
  .concat(levelsOther)
  .forEach((level, i) => {
    level.i = i;
  })
  .sortBy((level) => `${level.group} ${1e6 + level.i}`)
  .value();

levels.forEach((level, i) => {
  level.next = levels[i + 1];
  delete level.i;
});

// ordering within groups
_(levels)
  .groupBy('group')
  .forEach((group) =>
    group.forEach((level, i) => level.i = i + 1)
  )
  .value();
