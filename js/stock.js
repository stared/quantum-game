import _ from 'lodash';
import d3 from 'd3';

import * as tile from './tile';
import {tileSize} from './config';

export class Stock {
  constructor(svg, board, bindDrag) {
    this.svg = svg;
    this.board = board;
    this.bindDrag = bindDrag;
  }

  elementCount(level) {
    this.stock = level.initialStock;
    // optionally also non-frozen tiles
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
    const maxRows = this.level.height;
    const maxColumns = Math.ceil(this.usedTileNames.length / maxRows);
    const iShift = this.level.width + 1;

    this.stockGroup.append('rect')
      .attr('width', maxColumns * tileSize)
      .attr('height', maxRows * tileSize)
      .attr('x', iShift * tileSize)
      .attr('class', 'stock-bg');

    const dataForStockDrawing = _.map(this.usedTileNames, (name, i) => ({
        name: name,
        i: Math.floor(i / maxRows) + iShift,
        j: i % maxRows,
    }));

    this.stockSlots = this.stockGroup
      .selectAll('.stock-slot')
      .data(dataForStockDrawing);

    const stockSlotsEntered = this.stockSlots.enter()
      .append('g')
        .attr('class', 'stock-slot');

    stockSlotsEntered.append('text')
      .attr('class', 'stock-count')
      .attr('transform', (d) => `translate(${(d.i + 0.9) * tileSize},${(d.j + 1.0) * tileSize})`)
      .text((d) => `x ${this.stock[d.name]}`);

    this.stockTiles = stockSlotsEntered.append('g')
      .datum((d) => new tile.Tile(tile[d.name], 0, false, d.i, d.j))
      .attr('class', 'tile')
      .attr('transform', (d) => `translate(${d.x + tileSize / 2},${d.y + tileSize / 2})`)
      .each(function (tileObj) {
        tileObj.g = d3.select(this);
        tileObj.node = this;
        tileObj.fromStock = true;
        tileObj.draw();
      });

    this.stockTiles.append('use')
      .attr('xlink:href', '#hitbox')
      .attr('class', 'hitbox');

    this.bindDrag(this.stockTiles, this.board, this);

  }

  regenerateTile(stockSlotG) {

    const newTile = stockSlotG.append('g')
      .datum((d) => new tile.Tile(tile[d.name], 0, false, d.i, d.j))
      .attr('class', 'tile')
      .attr('transform', (d) => `translate(${d.x + tileSize / 2},${d.y + tileSize / 2})`)
      .each(function (tileObj) {
        tileObj.g = d3.select(this);
        tileObj.node = this;
        tileObj.fromStock = true;
        tileObj.draw();
      });

    newTile.append('use')
      .attr('xlink:href', '#hitbox')
      .attr('class', 'hitbox');

    this.bindDrag(newTile, this.board, this);

  }

  updateCount(tileName, change) {

    this.stock[tileName] += change;

    this.stockSlots
      .classed('stock-empty', (d) => this.stock[d.name] <= 0);

    this.stockSlots.select('text')
      .text((d) => `x ${this.stock[d.name]}`);
  }

}
