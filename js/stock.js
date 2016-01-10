import _ from 'lodash';
import d3 from 'd3';

import * as tile from './tile';
import {tileSize} from './config';

export class Stock {
  constructor(svg) {
    this.svg = svg;
  }

  elementCount(level) {
    this.stock = level.initialStock;
    // optionally also non-frozen tiles
    this.usedTileNames = _.keys(this.stock);  // add some ordering to the stock?
    this.level = level;
    window.console.log('this.usedTileNames', this.usedTileNames);
  }

  drawStock() {

    // Reset element
    this.svg.select('.stock').remove();
    this.stockGroup = this.svg
      .append('g')
        .attr('class', 'stock')
        .attr('transform', `translate(${(this.level.width + 1) * tileSize},0)`);

    // Create background
    const maxRows = this.level.height;
    const maxColumns = Math.ceil(this.usedTileNames.length / maxRows);

    this.stockGroup.append('rect')
      .attr('width', maxColumns * tileSize)
      .attr('height', maxRows * tileSize)
      .attr('class', 'stock-bg');

    this.stockSlots = this.stockGroup
      .selectAll('.stock-slot')
      .data(this.usedTileNames);

    const stockSlotsEntered = this.stockSlots.enter()
      .append('g')
        .attr('class', 'stock-slot')
        .attr('transform', (d, i) => `translate(${Math.floor(i / maxRows) * tileSize},${(i % maxRows) * tileSize})`);

    stockSlotsEntered.append('text')
      .attr('class', 'stock-count')
      .attr('transform', `translate(${0.9 * tileSize},${1.0 * tileSize})`)
      .text((d) => `x ${this.stock[d]}`);

    stockSlotsEntered.append('g')
      .datum((d) => new tile.Tile(tile[d], 0, false))
      .attr('transform', (d) => `translate(${tileSize / 2},${tileSize / 2})`)
      .each(function (tileObj) {
        tileObj.g = d3.select(this);
        tileObj.node = this;
        tileObj.fromStock = true;
        tileObj.draw();
        window.console.log('tileObj', tileObj);
      })
      .append('use')
        .attr('xlink:href', '#hitbox')
        .attr('class', 'hitbox');

    //  .on('mouseover', (d) => this.showTileHelper(d));

    // and bind drag!

  }

  updateCount(tileName, change) {
    _.has(this.stock, tileName)

    this.stock[tileName] += change;

    this.stockSlots
      .style('opacity', (d) => this.stock[d] > 0 ? null : 0.5);
    this.stockSlots.select('text')
      .text((d) => `x ${this.stock[d]}`);
  }

}
