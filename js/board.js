'use strict';
import _ from 'lodash';
import d3 from 'd3';

import * as config from './config';
import * as level from './level';
import * as tile from './tile';

export class Board {
  constructor(level, svg) {
    this.level = level;
    this.svg = svg;
    this.tiles = [];
  }
  clear() {
    // Create matrix filled with Vacuum
    this.tiles = _.range(this.level.width).map((i) =>
        _.range(this.level.height).map((j) =>
            new tile.Tile(tile.Vacuum, 0, false, i, j)
        )
    );
    return this;
  }
  reset() {
    // Clear tiles
    this.clear();
    // Fill board with proper tiles
    _.each(this.level.tileRecipes, (tileRecipe) => {
      if (!_.has(tile, tileRecipe.name)) {
        return;
      }
      this.tiles[tileRecipe.i][tileRecipe.j] = new tile.Tile(
        tile[tileRecipe.name],
        tileRecipe.rotation || 0,
        !!tileRecipe.frozen,
        tileRecipe.i,
        tileRecipe.j
      );
    });
    // Initial drawing
    this.resizeSvg();
    this.drawBackground();
    this.drawBoard();
  }
  resizeSvg() {
    this.svg.attr({
      viewBox: `0 0 ${config.tileSize * this.level.width} ${config.tileSize * this.level.height}`
    });
  }
  drawBackground() {
    this.svg
      .append('g')
      .attr('class', 'background')
      .selectAll('.tile')
      .data(_.flatten(this.tiles))
      .enter()
        .append('rect')
        .attr({
          'class': (d) => {
            if (d.frozen) {
              return 'tile tile--frozen';
            } else {
              return 'tile';
            }
          },
          x: (d) => d.x,
          y: (d) => d.y,
          width: config.tileSize,
          height: config.tileSize,
        });
  }
  drawBoard() {
    const tiles = this.svg
      .append('g')
      .attr('class', 'board')
      .selectAll('.tile')
      .data(_.filter(
        _.flatten(this.tiles),
        (t) => t.type !== tile.Vacuum
      ))
      .enter()
        .append('g')
        .attr({
          'class': 'tile',
          transform: (d) => `translate(${d.x + config.tileSize/2},${d.y +  config.tileSize/2})`
        });

    // Keep node reference
    tiles.each((d) => d.node = this);

    // Create image
    tiles
      .append('use')
      .attr({
        'xlink:href': (d) => `#${d.type.name}`,
        'class': 'element',
        transform: (d) => `rotate(${d.type.rotationAngle * d.rotation},0,0)`
      });
  }
}
