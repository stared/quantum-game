import {nonVacuumTiles} from './tile';
import {isProduction} from './config';

import levelsGame from '../data/levels_game.json';
import levelsCandidate from '../data/levels_candidate.json';
import levelsOther from '../data/levels_other.json';
import lastLevel from '../data/levels_last.json';


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
    if (levelRecipe.stock == null && levelRecipe.tiles.filter((t) => t.frozen).length === 0) {
      levelRecipe.stock = 'all';
    }
    if (typeof levelRecipe.stock === 'object' || mode === 'as_it_is') {
      this.initialStock = levelRecipe.stock || {};
    } else if (levelRecipe.stock === 'all' || mode === 'dev') {
      nonVacuumTiles.forEach((tile) => {
        this.initialStock[tile] = (tile === 'Source' ? 1 : 99);
      });
    } else if (levelRecipe.stock === 'non-frozen' || mode === 'game') {
      this.tileRecipes = levelRecipe.tiles.filter((t) => t.frozen);
      this.initialStock = levelRecipe.tiles
        .filter((tile) => !tile.frozen)
        .reduce((acc, tile) => {
          acc[tile.name] = (acc[tile.name] || 0) + 1;
          return acc;
        }, {});
    }
    this.requiredDetectionProbability = levelRecipe.requiredDetectionProbability === undefined ? 1 : levelRecipe.requiredDetectionProbability;
    this.detectorsToFeed = levelRecipe.detectorsToFeed || levelRecipe.tiles.filter((tile) => tile.frozen && (tile.name === 'Detector' || tile.name === 'DetectorFour')).length;
  }
}

const levelId = (level) => `${level.group} ${level.name}`;

if (!isProduction) {
  levelsCandidate.forEach((level) => level.group = 'Game');
} else {
  levelsCandidate.forEach((level) => level.group = 'X Candidate');
}

export const levels = [...levelsGame, ...levelsCandidate, ...levelsOther]
  .map((level, i) => {
    level.i = i;
    level.id = levelId(level);
    return level;
  })
  .sort((a, b) => {
    const keyA = `${a.group} ${1e6 + a.i}`;
    const keyB = `${b.group} ${1e6 + b.i}`;
    return keyA.localeCompare(keyB);
  });

if (isProduction) {
  lastLevel.i = -1;
  lastLevel.group = 'Special';
  lastLevel.id = '3413472342';
  levels.push(lastLevel);
}

levels.forEach((level, i) => {
  level.next = levels[i + 1]?.id;
  delete level.i;
});

// ordering within groups
const groupedLevels = levels.reduce((acc, level) => {
  if (!acc[level.group]) {
    acc[level.group] = [];
  }
  acc[level.group].push(level);
  return acc;
}, {});

Object.values(groupedLevels).forEach((group) =>
  group.forEach((level, i) => level.i = i + 1)
);

levels[0].i = '\u221E';

export const idToLevel = levels.reduce((acc, level) => {
  acc[level.id] = level;
  return acc;
}, {});
