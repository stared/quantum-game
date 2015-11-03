import _ from 'lodash';
import changeCase from 'change-case';

import * as tile from './tile';

export class Stock {
  constructor(level) {
    this.stock = this.initializeStock(level);
    this.maxStock = this.initializeMaxStock(this.stock, level);
  }

  // Calculate how many and which tiles there are in the beginning in the stock.
  initializeStock(level) {
    const stock = {};
    // Initialize empty stock - map from all non-vacuum tiles to their count: 0
    _.forEach(tile.nonVacuumTiles, (tileName) => {
      stock[changeCase.pascalCase(tileName)] = 0;
    });
    // Go through the level's initial stock
    if (level.initialStock) {
      _.forEach(level.initialStock, (tileCount, tileName) => {
        stock[changeCase.pascalCase(tileName)] = tileCount;
      });
    }
    return stock;
  }

  // Calculate how much tiles there can possibly be in the stock.
  initializeMaxStock(stock, level) {
    const maxStock = _.clone(stock);
    // Go through the level's initial tiles
    if (level.tileRecipes) {
      _.forEach(level.tileRecipes, (tileDef) => {
        if (!tileDef.frozen) {
          maxStock[changeCase.pascalCase(tileDef.name)]++;
        }
      });
    }
    return maxStock;
  }
}
