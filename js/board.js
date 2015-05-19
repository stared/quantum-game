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
    this.tileMatrix = [];
    this.tileList = [];
    this.tileSelection = d3.select();
  }

  clear() {
    // Create matrix filled with Vacuum
    this.tileMatrix = _.range(this.level.width).map((i) =>
        _.range(this.level.height).map((j) =>
            new tile.Tile(tile.Vacuum, 0, false, i, j)
        )
    );
    // Clear tile list
    this.tileList = [];
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
      this.tileMatrix[tileRecipe.i][tileRecipe.j] = new tile.Tile(
        tile[tileRecipe.name],
        tileRecipe.rotation || 0,
        !!tileRecipe.frozen,
        tileRecipe.i,
        tileRecipe.j
      );
    });
    // Generate flat list
    this.tileList = _.flatten(this.tileMatrix);
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
      .data(this.tileList)
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
    this.spawnTiles();
    this.keepNodeReference();
    this.drawTiles();
    this.drawHitboxes();
    this.bindClick();
    this.bindDrag();
  }

  spawnTiles() {
    this.tileSelection = this.svg
      .append('g')
      .attr('class', 'board')
      .selectAll('.tile')
      .data(_.filter(
        this.tileList,
        (t) => t.type !== tile.Vacuum
      ))
      .enter()
      .append('g')
      .attr({
        'class': 'tile',
        transform: (d) => `translate(${d.x + config.tileSize / 2},${d.y + config.tileSize / 2})`
      });
  }

  keepNodeReference() {
    this.tileSelection
      .each(function (d) {
        d.node = this;
      });
  }

  drawTiles() {
    this.tileSelection
      .append('use')
      .attr({
        'xlink:href': (d) => `#${d.type.name}`,
        'class': 'element',
        transform: (d) => `rotate(${d.type.rotationAngle * d.rotation},0,0)`
      });
  }

  drawHitboxes() {
    this.tileSelection
      .append('use')
      .attr({
        'xlink:href': '#hitbox',
        'class': 'hitbox',
      });
  }

  bindClick() {
    this.tileSelection
      .select('.hitbox')
      .on('click', function (d) {
        // Avoid rotation when dragged
        if (d3.event.defaultPrevented) {
          return;
        }
        // Avoid rotation when frozen
        if (d.frozen) {
          return;
        }
        const element = d3.select(d.node).select('.element');
        d.rotation = (d.rotation + 1) % d.type.maxRotation;
        // Assure that rotation animation is clockwise
        const startAngle = d.type.rotationAngle * (d.rotation - 1);
        element
          .attr('transform', `rotate(${startAngle},0,0)`);
        // Rotation animation
        const endAngle = d.type.rotationAngle * d.rotation;
        element
          .transition()
          .duration(config.rotationSpeed)
          .attr('transform', `rotate(${endAngle},0,0)`);
      });
  }

  bindDrag() {
    function reposition(data, elem) {
      delete data.newI;
      delete data.newJ;
      elem
        .transition()
        .duration(config.repositionSpeed)
        .attr(
          'transform',
          `translate(${data.x + config.tileSize / 2},${data.y + config.tileSize / 2})`
        );
    }

    const drag = d3.behavior.drag();
    drag
      .on('dragstart', () => {
        d3.event.sourceEvent.stopPropagation();
      })
      .on('drag', function (source) {
        // Is it impossible to drag item?
        if (source.frozen) {
          return;
        }

        d3.select(this)
          .attr('transform', `translate(${d3.event.x},${d3.event.y})`);
        source.newI = Math.floor(d3.event.x / config.tileSize);
        source.newJ = Math.floor(d3.event.y / config.tileSize);
      })
      .on('dragend', (source) => {
        // No drag? Return.
        if (source.newI == null || source.newJ == null) {
          return;
        }

        // Find source element
        const sourceElem = d3.select(source.node);

        // Drag ended outside of board? Reposition source and return.
        if (
             source.newI < 0 || source.newI >= this.level.width
          || source.newJ < 0 || source.newJ >= this.level.height
        ) {
          reposition(source, sourceElem);
          return;
        }

        // Find target and target element
        const target = this.tileMatrix[source.newI][source.newJ];
        const targetElem = d3.select(target.node || null);

        // Is it impossible to swap items? Reposition source and return.
        if (source.frozen || target.frozen) {
          reposition(source, sourceElem);
          return;
        }

        // Swap items in matrix
        [this.tileMatrix[source.i][source.j], this.tileMatrix[target.i][target.j]] =
        [this.tileMatrix[target.i][target.j], this.tileMatrix[source.i][source.j]];

        // Swap items positions
        [source.i, source.j, target.i, target.j] =
        [target.i, target.j, source.i, source.j];

        // Reposition both elements
        reposition(source, sourceElem);
        reposition(target, targetElem);
      });

    this.tileSelection
      .call(drag);
  }
}
