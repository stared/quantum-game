import _ from 'lodash';

import {nonVacuumTiles} from './tile';
import {isProduction} from './config';

import levelsGame from '../data/levels_game.json!';
import levelsOther from '../data/levels_other.json!';
import lastLevel from '../data/levels_last.json!';


export class Level {
  constructor(levelRecipe, mode = 'game') {
    // TODO(migdal) remove mindless attribute copying
    // It cannot be done using _.assign(this, _.pick(levelRecipe, [...])),
    // because Level is not exactly an Object instance.
    this.next = levelRecipe.next;
    this.name = levelRecipe.name;
    if (mode === 'dev') {
      this.group = 'A Dev';
    } else {
      this.group = levelRecipe.group;
    }
    this.i = levelRecipe.i;
    this.id = levelRecipe.id;
    this.next = levelRecipe.next;
    this.width = levelRecipe.width;
    this.height = levelRecipe.height;
    this.initialHint = levelRecipe.initialHint;
    this.boardHints = levelRecipe.boardHints || [];
    this.texts = levelRecipe.texts || {};
    this.tileRecipes = levelRecipe.tiles;
    this.initialStock = {};
    if (levelRecipe.stock == null && _.filter(levelRecipe.tiles, 'frozen').length === 0) {
      levelRecipe.stock = 'all';
    }
    if (typeof levelRecipe.stock === 'object' || mode === 'as_it_is') {
      this.initialStock = levelRecipe.stock || {};
    } else if (levelRecipe.stock === 'all' || mode === 'dev') {
      nonVacuumTiles.forEach((tile) => {
        this.initialStock[tile] = (tile === 'Source' ? 1 : 99);
      });
    } else if (levelRecipe.stock === 'non-frozen' || mode === 'game') {
      this.tileRecipes = _.filter(levelRecipe.tiles, 'frozen');
      this.initialStock = _(levelRecipe.tiles)
        .filter((tile) => !tile.frozen)
        .countBy('name')
        .value();
    }
    this.requiredDetectionProbability = levelRecipe.requiredDetectionProbability === undefined ? 1 : levelRecipe.requiredDetectionProbability;
    this.detectorsToFeed = levelRecipe.detectorsToFeed || _.filter(levelRecipe.tiles, (tile) => tile.frozen && (tile.name === 'Detector' || tile.name === 'DetectorFour')).length;
  }
}

const levelId = (level) => `${level.group} ${level.name}`;

if (!isProduction) {
  levelsGame
    .filter((level) => level.group === 'Candidate')
    .forEach((level) => level.group = 'Game');
} else {
  levelsGame
    .filter((level) => level.group === 'Candidate')
    .forEach((level) => level.group = 'X Candidate');  // a hack for sorting purpose
}

export const levels = _(levelsGame)
  .concat(levelsOther)
  .map((level, i) => {
    level.i = i;
    level.id = levelId(level);
    return level;
  })
  .sortBy((level) => `${level.group} ${1e6 + level.i}`)
  .value();

if (isProduction) {
  lastLevel.i = -1;
  lastLevel.group = 'Special';
  lastLevel.id = '3413472342';
  levels.push(lastLevel);
}

levels.forEach((level, i) => {
  level.next = _.get(levels[i + 1], 'id');
  delete level.i;
});

// ordering within groups
_(levels)
  .groupBy('group')
  .forEach((group) =>
    group.forEach((level, i) => level.i = i + 1)
  );

levels[0].i = '\u221E';

export const idToLevel = _.keyBy(levels, 'id');
