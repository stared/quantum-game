import _ from 'lodash';
import changeCase from 'change-case';

import * as tile from './tile';

export class Stock {
  constructor(level) {
    this.stock = {};
    this.initialCount(level);
    this.maxCount(level);
  }

  // Calculate how many and which tiles there are in the beginning in the stock.
  initialCount(level) {
    // Initialize empty stock - map from all non-vacuum tiles to their count: 0
    _.forEach(tile.nonVacuumTiles, (tileName) => {
      this.stock[changeCase.pascalCase(tileName)] = {
        currentCount: 0,
      };
    });
    // Go through the level's initial stock
    if (level.initialStock) {
      _.forEach(level.initialStock, (tileCount, tileName) => {
        this.stock[changeCase.pascalCase(tileName)].currentCount = tileCount;
      });
    }
  }

  // Calculate how much tiles there can possibly be in the stock.
  maxCount(level) {
    // Copy stock information to maxStock
    _.forEach(tile.nonVacuumTiles, (tileName) => {
      this.stock[changeCase.pascalCase(tileName)].maxCount =
        this.stock[changeCase.pascalCase(tileName)].currentCount;
    });
    // Go through the level's initial tiles
    if (level.tileRecipes) {
      _.forEach(level.tileRecipes, (tileDef) => {
        if (!tileDef.frozen) {
          this.stock[changeCase.pascalCase(tileDef.name)].maxCount++;
        }
      });
    }
  }

  // Return actually useful stock cells, e.g. filter out those that
  // have no chance of being used.
  // Use the ordering of stock items as in tile.nonVacuumTiles.
  usedStockNames() {
    const usedStockNames = [];
    _.forEach(tile.nonVacuumTiles, (tileName) => {
      tileName = changeCase.pascalCase(tileName);
      if (this.stock[tileName].maxCount > 0) {
        usedStockNames.push(tileName);
      }
    });
    return usedStockNames;
  }
}
