import _ from 'lodash';
import d3 from 'd3';
import changeCase from 'change-case';

import {tileSize, repositionSpeed} from './config';
import * as particles from './particles';
import * as simulation from './simulation';
import {Stock} from './stock';
import * as tile from './tile';
import {TransitionHeatmap} from './transition_heatmap';

function tileSimpler(name, i, j) {
  const tileClass = tile[changeCase.pascalCase(name)];
  return new tile.Tile(tileClass, 0, false, i, j);
}

export class Board {
  constructor(level, svg, helper) {
    this.level = level;
    this.svg = svg;
    this.tileMatrix = [];
    this.transitionHeatmap = new TransitionHeatmap(helper);
  }

  reset() {
    // Clear tiles
    this.clearTiles();

    // Fill board with proper tiles
    _.each(this.level.tileRecipes, (tileRecipe) => {
      this.tileMatrix[tileRecipe.i][tileRecipe.j] = new tile.Tile(
        tile[changeCase.pascalCase(tileRecipe.name)],
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
    this.drawStock();
  }

  clearTiles() {
    // Create matrix filled with Vacuum
    this.tileMatrix = _.range(this.level.width).map((i) =>
        _.range(this.level.height).map((j) =>
            new tile.Tile(tile.Vacuum, 0, false, i, j)
        )
    );
  }

  resizeSvg() {
    const margin = 1;
    const stockColumns = 2;
    const width = this.level.width + 2 * margin + stockColumns;
    const height = this.level.height + 2 * margin;
    // top left width height
    this.svg.attr('viewBox', `${-tileSize} ${-tileSize} ${tileSize * width} ${tileSize * height}`);
  }

  /**
   * Draw background - a grid of squares.
   */
  drawBackground() {

    this.svg.select('.background').remove();

    this.svg
      .append('g')
      .attr('class', 'background')
      .selectAll('.tile')
      .data(_.chain(this.tileMatrix)  // NOTE I cannot just clone due to d.x and d.y getters
        .flatten()
        .map((d) => new tile.Tile(d.type, d.rotation, d.frozen, d.i, d.j))
        .value()
      )
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
        width: tileSize,
        height: tileSize,
      });
      // TODO(pathes): remove doubleclick tile creation
      // .on('dblclick', (d) => {
      //   // NOTE adding with double click only for dev mode
      //   d3.select('#tile-selector').remove();

      //   const tileSelector = d3.select('body').append('div')
      //     .attr('id', 'tile-selector')
      //     .attr('class', 'item-selector');

      //   tileSelector.append('ul').attr('class', 'tile-item').selectAll('li')
      //     .data(tile.allTiles)
      //     .enter()
      //       .append('li')
      //         .attr('class', 'tile-item')
      //         .text((name) => name)
      //         .on('click', (name) => {
      //           if (name !== 'vacuum') {
      //             this.addTile(tileSimpler(name, d.i, d.j));
      //             window.console.log('dblclick added', d);
      //           }
      //           tileSelector.remove();
      //         });
      // });
  }

  drawStock() {
    // Reset stock object
    this.stock = new Stock(this.level);
    // Reset element
    this.svg.select('.stock').remove();
    this.stockGroup = this.svg
      .append('g')
      .attr('class', 'stock');
    const stockNames = this.stock.usedStockNames();
    // Add background
    const maxColumns = Math.ceil(stockNames.length / this.level.height);
    this.stockGroup
      .append('rect')
      .attr('width', maxColumns * tileSize)
      .attr('height', this.level.height * tileSize)
      .attr('transform', `translate(${(this.level.width + 1) * tileSize},0)`)
      .attr('class', 'stock-bg');
    // Create cells
    let column = 0;
    let row = 0;
    _.forEach(stockNames, (stockName) => {
      this.addStockCell(stockName, row, column);
      row++;
      if (row >= this.level.height) {
        row = 0;
        column++;
      }
    });
  }

  addStockCell(stockName, row, column) {
    const i = this.level.width + 1 + column;
    const j = row;
    const tileObj = tileSimpler(stockName, i, j);
    // Additional information in tile - store stock data
    tileObj.stockItem = this.stock.stock[stockName];
    const tileSelection = this.stockGroup
      .datum(tileObj)
      .append('g')
        .attr('transform', (d) => `translate(${d.x + tileSize / 2},${d.y + tileSize / 2})`);
    tileObj.g = tileSelection;
    // DOM element for g
    tileObj.node = tileSelection[0][0];
    // Draw tile
    tileObj.draw();
    // Draw count
    const tileCount = tileSelection
      .append('text')
        .attr('transform', `translate(${tileSize / 4},${tileSize / 2})`);
    // Draw hitbox
    tileSelection
      .append('use')
        .attr('xlink:href', '#hitbox')
        .attr('class', 'hitbox');
    // Bind drag handler
    this.bindDrag(tileSelection);
    // Store counter updater in stock
    tileObj.stockItem.update = () => {
      tileCount
        .html((d) => d.stockItem.currentCount);
      tileSelection
        .attr('class', (d) => {
          if (d.stockItem.currentCount > 0) {
            return 'tile stock--available';
          } else {
            return 'tile stock--depleted';
          }
        });
    };
    // ...and call it immediately.
    tileObj.stockItem.update();
  }

  /**
   * Draw board: tiles and their hitboxes.
   * Also, bind click and drag events.
   */
  drawBoard() {

    this.svg.select('.board').remove();
    this.boardGroup = this.svg
      .append('g')
      .attr('class', 'board');

    _.flatten(this.tileMatrix)
        .filter((t) => t.type !== tile.Vacuum)
        .forEach((t) => this.addTile(t));
  }

  addTile(tileObj) {

    this.removeTile(tileObj.i, tileObj.j);
    this.tileMatrix[tileObj.i][tileObj.j] = tileObj;

    const tileSelection = this.boardGroup
      .datum(tileObj)
      .append('g')
        .attr('class', 'tile')
        .attr('transform', (d) => `translate(${d.x + tileSize / 2},${d.y + tileSize / 2})`);

    tileObj.g = tileSelection;
    // DOM element for g
    tileObj.node = tileSelection[0][0];

    tileObj.draw();

    // hitbox
    tileSelection
      .append('use')
        .attr('xlink:href', '#hitbox')
        .attr('class', 'hitbox')
        .on('click', (d) => {

          // Avoid rotation when dragged
          if (d3.event.defaultPrevented) {
            return;
          }

          // Avoid rotation when frozen
          if (d.frozen) {
            return;
          }

          d.rotate();
          this.transitionHeatmap.updateFromTensor(d.transitionAmplitudes.map);

        })
        .on('mouseover', (d) =>
          this.transitionHeatmap.updateFromTensor(d.transitionAmplitudes.map)
        );

    this.bindDrag(tileSelection);

  }

  removeTile(i, j) {
    if (this.tileMatrix[i][j].node) {
      this.tileMatrix[i][j].node.remove();
    }
    this.tileMatrix[i][j] = new tile.Tile(tile.Vacuum, 0, false, i, j);
  }

  bindDrag(tileSelection) {

    function reposition(data, elem, speed = repositionSpeed) {
      delete data.newI;
      delete data.newJ;
      elem
        .transition()
        .duration(speed)
        .attr(
          'transform',
          `translate(${data.x + tileSize / 2},${data.y + tileSize / 2})`
        );
    }

    const drag = d3.behavior.drag();
    drag
      .on('dragstart', (source) => {
        d3.event.sourceEvent.stopPropagation();
        source.top = false;
      })
      .on('drag', function (source) {
        // Move element to the top
        if (!source.top) {
          // TODO still there are problems in Safari
          source.node.parentNode.appendChild(source.node);
          source.top = true;
        }
        // Is it impossible to drag item?
        if (source.frozen) {
          return;
        }

        d3.select(this)
          .attr('transform', `translate(${d3.event.x},${d3.event.y})`);
        source.newI = Math.floor(d3.event.x / tileSize);
        source.newJ = Math.floor(d3.event.y / tileSize);
      })
      .on('dragend', (source) => {
        // No drag? Return.
        if (source.newI == null || source.newJ == null) {
          return;
        }

        // Find source element
        const sourceElem = d3.select(source.node);
        const sourceTileName = changeCase.pascalCase(source.type.name);

        // Drag ended outside of board?
        if (
             source.newI < 0 || source.newI >= this.level.width
          || source.newJ < 0 || source.newJ >= this.level.height
        ) {
          if (source.stockItem) {
            // Stock tile case: reposition.
            reposition(source, sourceElem);
          } else {
            // Board tile case: remove the tile and increase the counter in stock.
            this.stock.stock[sourceTileName].currentCount++;
            this.stock.stock[sourceTileName].update();
            this.removeTile(source.i, source.j);
          }
          return;
        }

        // Find target and target element
        const target = this.tileMatrix[source.newI][source.newJ];
        const targetElem = d3.select(target.node || null);
        const targetTileName = changeCase.pascalCase(target.type.name);

        // Is it impossible to swap items? Reposition source and return.
        if (source.frozen || target.frozen) {
          reposition(source, sourceElem);
          return;
        }

        // Is it impossible to create item because stock limit depleted?
        if (source.stockItem) {
          if (source.stockItem.currentCount <= 0) {
            reposition(source, sourceElem);
            return;
          }
        }

        if (source.stockItem) {
          // Stock tile case:
          // Remove the target element
          if (targetTileName !== 'Vacuum') {
            this.removeTile(target.i, target.j);
            this.stock.stock[targetTileName].currentCount++;
            this.stock.stock[targetTileName].update();
          }
          // Create new element in place of the old one
          this.addTile(tileSimpler(sourceTileName, target.i, target.j));
          this.stock.stock[sourceTileName].currentCount--;
          this.stock.stock[sourceTileName].update();
          // Reposition instantly the stock element
          reposition(source, sourceElem, 0);
        } else {
          // Board tile case:
          // Swap items in matrix
          [this.tileMatrix[source.i][source.j], this.tileMatrix[target.i][target.j]] =
          [this.tileMatrix[target.i][target.j], this.tileMatrix[source.i][source.j]];
          // Swap items positions
          [source.i, source.j, target.i, target.j] =
          [target.i, target.j, source.i, source.j];
          // Reposition both elements
          reposition(source, sourceElem);
          reposition(target, targetElem);
        }
      });

    tileSelection
      .call(drag);
  }

  /**
   * Generate history and play animation.
   */
  play() {

    this.simulation = new simulation.Simulation(this);

    this.simulation.initialize();
    this.simulation.propagateToEnd();

    if (this.particleAnimation) {
      this.particleAnimation.stop();
    }
    this.particleAnimation = new particles.SVGParticleAnimation(this, this.simulation.history, this.simulation.measurementHistory);
    this.particleAnimation.play();
  }

  exportBoard() {
    // should match interface from level.js
    return {
      name:   this.level.name,
      group:  this.level.group,
      width:  this.level.width,
      height: this.level.height,
      tiles:  _.chain(this.tileMatrix)
        .flatten()
        .filter((d) => d.type.name !== 'vacuum')
        .map((d) => ({
          i: d.i,
          j: d.j,
          name: d.type.name,
          rotation: d.rotation,
          frozen: d.frozen,
        })),
    };
  }

  // NOTE clipboard has its char (or limit) limit
  // for other cases
  // console.log(JSON.stringify(gameBoard.exportBoard(), null, 2))
  // need to be fired by hand
  clipBoard() {
    window.prompt(
      'Copy board to clipboard: Ctrl+C, Enter',
      JSON.stringify(this.exportBoard(), null, 2)
    );
  }

}
