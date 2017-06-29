import _ from 'lodash';
import d3 from 'd3';

import * as tile from './tile';
import {tileSize, tileBorder, stockHeight} from './config';
import {bindDrag} from './drag_and_drop';

export class Stock {
  constructor(svg, board) {
    this.svg = svg;
    this.board = board;
  }

  elementCount(level) {
    this.stock = level.initialStock;

    // initialize 0-count stock for non-frozen tiles on board
    level.tileRecipes.forEach((tileRecipe) => {
      if (!tileRecipe.frozen && !_.has(this.stock, tileRecipe.name)) {
        this.stock[tileRecipe.name] = 0;
      }
    });

    this.usedTileNames = _.keys(this.stock);  // add some ordering to the stock?
    this.level = level;
  }

  drawStock() {

    // Reset element
    this.svg.select('.stock').remove();
    this.stockGroup = this.svg
      .append('g')
        .attr('class', 'stock');

    // Create background
    const maxRows = stockHeight;
    const iShift = this.level.width + 1;

    const dataForStockDrawing = _.map(this.usedTileNames, (name, i) => ({
        name: name,
        i: (window.mobileLayout ? (i % maxRows) : (Math.floor(i / maxRows) + iShift)),
        j: (window.mobileLayout ? (Math.floor(i / maxRows) + iShift) : Math.floor(i / maxRows) + iShift),
    }));
    
    const xOffset = window.mobileLayout ? 400 : 0;
    const yOffset = window.mobileLayout ? -1720 : 0;

    this.stockSlots = this.stockGroup
      .selectAll('.stock-slot')
      .data(dataForStockDrawing);

    const stockSlotsEntered = this.stockSlots.enter()
      .append('g')
        .attr('class', 'stock-slot')
        .classed('stock-empty', (d) => this.stock[d.name] <= 0);

    stockSlotsEntered.append('rect')
      .attr('class', 'background-tile')
      .attr('width', tileSize - 2 * tileBorder)
      .attr('height', tileSize - 2 * tileBorder)
      .attr('transform', (d) => `translate(${d.i * tileSize + tileBorder + xOffset},${d.j * tileSize + tileBorder + yOffset})`);

    stockSlotsEntered.append('text')
      .attr('class', 'stock-count unselectable')
      .attr('transform', (d) => `translate(${(d.i + 0.9) * tileSize + xOffset},${(d.j + 0.9) * tileSize + yOffset})`)
      .text((d) => `x ${this.stock[d.name]}`);

    this.regenerateTile(stockSlotsEntered);
  }

  regenerateTile(stockSlotG) {

    const newTile = stockSlotG.append('g')
      .datum((d) => new tile.Tile(tile[d.name], 0, false, d.i, d.j))
      .attr('class', 'tile')
      .attr('transform', (d) => `translate(${d.x + tileSize / 2 + xOffset},${d.y + tileSize / 2 + yOffset})`)
      .each(function (tileObj) {
        tileObj.g = d3.select(this);
        tileObj.node = this;
        tileObj.fromStock = true;
        tileObj.draw();
      });

    newTile.append('rect')
      .attr('class', 'hitbox')
      .attr('x', -tileSize / 2)
      .attr('y', -tileSize / 2)
      .attr('width', tileSize)
      .attr('height', tileSize)
      .on('mouseover', this.board.callbacks.tileMouseover);

    bindDrag(newTile, this.board, this);

  }

  updateCount(tileName, change) {

    this.stock[tileName] += change;

    this.stockSlots
      .classed('stock-empty', (d) => this.stock[d.name] <= 0);

    this.stockSlots.select('text')
      .text((d) => `x ${this.stock[d.name]}`);
  }

}
