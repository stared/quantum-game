import _ from 'lodash';

import { nonVacuumTiles } from './tile';
import { isProduction } from './config';
import type { LevelRecipe, LevelMode, Stock, TileRecipe, BoardHint } from './types';

import levelsGame from '../data/levels_game.json';
import levelsCandidate from '../data/levels_candidate.json';
import levelsOther from '../data/levels_other.json';
import lastLevel from '../data/levels_last.json';


export class Level {
  next?: string;
  name: string;
  group: string;
  i?: number | string;
  id?: string;
  width: number;
  height: number;
  initialHint?: string;
  boardHints: BoardHint[];
  texts: Record<string, string>;
  tileRecipes: TileRecipe[];
  initialStock: Stock;
  requiredDetectionProbability: number;
  detectorsToFeed: number;

  constructor(levelRecipe: LevelRecipe, mode: LevelMode = 'game') {
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

    // Determine stock based on mode and levelRecipe
    let stockConfig = levelRecipe.stock;
    if (stockConfig == null && _.filter(levelRecipe.tiles, 'frozen').length === 0) {
      stockConfig = 'all';
    }

    if (typeof stockConfig === 'object' || mode === 'as_it_is') {
      this.initialStock = (stockConfig as Stock) || {};
    } else if (stockConfig === 'all' || mode === 'dev') {
      nonVacuumTiles.forEach((tile) => {
        this.initialStock[tile] = (tile === 'Source' ? 1 : 99);
      });
    } else if (stockConfig === 'non-frozen' || mode === 'game') {
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

const levelId = (level: LevelRecipe): string => `${level.group} ${level.name}`;

if (!isProduction) {
  levelsCandidate.forEach((level) => (level as unknown as LevelRecipe).group = 'Game');
} else {
  levelsCandidate.forEach((level) => (level as unknown as LevelRecipe).group = 'X Candidate');
}

export const levels: LevelRecipe[] = _(levelsGame as unknown as LevelRecipe[])
  .concat(levelsCandidate as unknown as LevelRecipe[])
  .concat(levelsOther as unknown as LevelRecipe[])
  .map((level, i) => {
    level.i = i;
    level.id = levelId(level);
    return level;
  })
  .sortBy((level) => `${level.group} ${1e6 + (level.i ?? 0)}`)
  .value();

if (isProduction) {
  const last = lastLevel as unknown as LevelRecipe;
  last.i = -1;
  last.group = 'Special';
  last.id = '3413472342';
  levels.push(last);
}

levels.forEach((level, i) => {
  level.next = _.get(levels[i + 1], 'id') as string | undefined;
  delete level.i;
});

// ordering within groups
_(levels)
  .groupBy('group')
  .forEach((group) =>
    group.forEach((level, i) => level.i = i + 1)
  );

(levels[0]! as { i?: number | string }).i = '\u221E';

export const idToLevel: Record<string, LevelRecipe> = _.keyBy(levels, 'id');
