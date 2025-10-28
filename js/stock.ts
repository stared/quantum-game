import d3 from './d3-wrapper';

import * as tile from './tile';
import {tileSize, tileBorder, stockHeight} from './config';
import {bindDrag} from './drag_and_drop';
import type {D3Selection} from './types';
import type {BareBoard} from './bare_board';
import type {Level} from './level';

interface StockSlotData {
  name: string;
  i: number;
  j: number;
}

export class Stock {
  svg: D3Selection;
  board: BareBoard;
  stock!: Record<string, number>;
  usedTileNames!: string[];
  level!: Level;
  stockGroup!: D3Selection;
  stockSlots!: D3Selection;

  constructor(svg: D3Selection, board: BareBoard) {
    this.svg = svg;
    this.board = board;
  }

  elementCount(level: Level): void {
    this.stock = level.initialStock;

    // initialize 0-count stock for non-frozen tiles on board
    level.tileRecipes.forEach((tileRecipe) => {
      if (!tileRecipe.frozen && !Object.hasOwn(this.stock, tileRecipe.name)) {
        this.stock[tileRecipe.name] = 0;
      }
    });

    this.usedTileNames = Object.keys(this.stock);  // add some ordering to the stock?
    this.level = level;
  }

  drawStock(): void {

    // Reset element
    this.svg.select('.stock').remove();
    this.stockGroup = this.svg
      .append('g')
        .attr('class', 'stock');

    // Create background
    const maxRows = stockHeight;
    const iShift = this.level.width + 1;

    const dataForStockDrawing = this.usedTileNames.map((name, i) => ({
        name: name,
        i: Math.floor(i / maxRows) + iShift,
        j: i % maxRows,
    }));

    this.stockSlots = this.stockGroup
      .selectAll('.stock-slot')
      .data(dataForStockDrawing);

    const stockSlotsEntered = this.stockSlots.enter()
      .append('g')
        .attr('class', 'stock-slot')
        .classed('stock-empty', (d: StockSlotData) => this.stock[d.name]! <= 0);

    stockSlotsEntered.append('rect')
      .attr('class', 'background-tile')
      .attr('width', tileSize - 2 * tileBorder)
      .attr('height', tileSize - 2 * tileBorder)
      .attr('transform', (d: StockSlotData) => `translate(${d.i * tileSize + tileBorder},${d.j * tileSize + tileBorder})`);

    stockSlotsEntered.append('text')
      .attr('class', 'stock-count unselectable')
      .attr('transform', (d: StockSlotData) => `translate(${(d.i + 0.9) * tileSize},${(d.j + 0.9) * tileSize})`)
      .text((d: StockSlotData) => `x ${this.stock[d.name]!}`);

    this.regenerateTile(stockSlotsEntered);
  }

  regenerateTile(stockSlotG: D3Selection): void {

    const newTile = stockSlotG.append('g')
      .datum((d: StockSlotData) => new tile.Tile(tile.tileMap[d.name]!, 0, false, d.i, d.j))
      .attr('class', 'tile')
      .attr('transform', ((d: tile.Tile) => `translate(${d.x + tileSize / 2},${d.y + tileSize / 2})`) as any)
      .each((function (this: SVGGElement, tileObj: tile.Tile) {
        tileObj.g = d3.select(this);
        tileObj.node = this;
        tileObj.fromStock = true;
        tileObj.draw();
      }) as any);

    newTile.append('rect')
      .attr('class', 'hitbox')
      .attr('x', -tileSize / 2)
      .attr('y', -tileSize / 2)
      .attr('width', tileSize)
      .attr('height', tileSize)
      .on('mouseover', this.board.callbacks.tileMouseover);

    bindDrag(newTile, this.board, this);

  }

  updateCount(tileName: string, change: number): void {

    this.stock[tileName]! += change;

    this.stockSlots
      .classed('stock-empty', (d: StockSlotData) => this.stock[d.name]! <= 0);

    this.stockSlots.select('text')
      .text((d: StockSlotData) => `x ${this.stock[d.name]!}`);
  }

}
