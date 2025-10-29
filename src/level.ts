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
    if (stockConfig == null && levelRecipe.tiles.filter(tile => tile.frozen === true).length === 0) {
      stockConfig = 'all';
    }

    if (typeof stockConfig === 'object' || mode === 'as_it_is') {
      this.initialStock = (stockConfig as Stock) ?? {};
    } else if (stockConfig === 'all' || mode === 'dev') {
      nonVacuumTiles.forEach((tile) => {
        this.initialStock[tile] = (tile === 'Source' ? 1 : 99);
      });
    } else if (stockConfig === 'non-frozen' || mode === 'game') {
      this.tileRecipes = levelRecipe.tiles.filter(tile => tile.frozen === true);
      const nonFrozenTiles = levelRecipe.tiles.filter((tile) => tile.frozen !== true);
      this.initialStock = nonFrozenTiles.reduce((acc, tile) => {
        acc[tile.name] = (acc[tile.name] ?? 0) + 1;
        return acc;
      }, {} as Stock);
    }

    this.requiredDetectionProbability = levelRecipe.requiredDetectionProbability === undefined ? 1 : levelRecipe.requiredDetectionProbability;
    const frozenDetectors = levelRecipe.tiles.filter((tile) => tile.frozen === true && (tile.name === 'Detector' || tile.name === 'DetectorFour')).length;
    this.detectorsToFeed = levelRecipe.detectorsToFeed ?? frozenDetectors;
  }
}

const levelId = (level: LevelRecipe): string => `${level.group} ${level.name}`;

if (!isProduction) {
  levelsCandidate.forEach((level) => (level as unknown as LevelRecipe).group = 'Game');
} else {
  levelsCandidate.forEach((level) => (level as unknown as LevelRecipe).group = 'X Candidate');
}

export const levels: LevelRecipe[] = (levelsGame as unknown as LevelRecipe[])
  .concat(levelsCandidate as unknown as LevelRecipe[])
  .concat(levelsOther as unknown as LevelRecipe[])
  .map((level, i) => {
    level.i = i;
    level.id = levelId(level);
    return level;
  })
  .sort((a, b) => {
    const keyA = `${a.group} ${1e6 + (a.i ?? 0)}`;
    const keyB = `${b.group} ${1e6 + (b.i ?? 0)}`;
    return keyA.localeCompare(keyB);
  });

if (isProduction) {
  const last = lastLevel as unknown as LevelRecipe;
  last.i = -1;
  last.group = 'Special';
  last.id = '3413472342';
  levels.push(last);
}

levels.forEach((level, i) => {
  level.next = levels[i + 1]?.id;
  delete level.i;
});

// ordering within groups
const groupedLevels = levels.reduce((acc, level) => {
  if (acc[level.group] === undefined) {
    acc[level.group] = [];
  }
  acc[level.group]!.push(level);
  return acc;
}, {} as Record<string, LevelRecipe[]>);

Object.values(groupedLevels).forEach((group) =>
  group.forEach((level, i) => level.i = i + 1),
);

(levels[0]! as { i?: number | string }).i = '\u221E';

export const idToLevel: Record<string, LevelRecipe> = Object.fromEntries(
  levels.map(level => [level.id, level] as [string, LevelRecipe]),
);
