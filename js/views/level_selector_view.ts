import d3 from '../d3-wrapper';

import {View} from './view';
import * as level from '../level';
import type {LevelRecipe, TileRecipe} from '../types';

// Extended interface for level data with UI-specific properties
interface LevelWithNewTiles extends LevelRecipe {
  newTiles: string[];
}

export class LevelSelectorView extends View {
  get title(): string {
    return 'Quantum game';
  }

  get className(): string {
    return 'view--level-selector';
  }

  override initialize(): void {
    const listOfElements = d3.select('.level-selector > ul')
      .selectAll('li')
      .data(level.levels)
      .enter()
      .append('li')
      .attr('class', 'level-item unselectable')
      .text((d: LevelRecipe) => `[${d.group}] ${d.i}. ${d.name} `)
      .on('click', (_event, d: LevelRecipe) => {
        this.game.gameBoard!.loadLevel(d.id!);
        this.game.setView('game');
      });

    // as of now it is a version for developers
    // for users - graphical icons (of the new elements) or display:none;
    const elementsEncountered: Record<string, boolean> = {};
    (level.levels as LevelWithNewTiles[]).forEach((d) => {
      d.newTiles = [];
      d.tiles.forEach((tile: TileRecipe) => {
        if (!Object.hasOwn(elementsEncountered, tile.name)) {
          elementsEncountered[tile.name] = true;
          d.newTiles.push(tile.name);
        }
      });
    });

    listOfElements.append('span')
      .style('font-size', '1.5vh')
      .text((d: LevelRecipe) => {
        const grouped = d.tiles.reduce((acc: Record<string, TileRecipe[]>, tile: TileRecipe) => {
          if (!acc[tile.name]) {
            acc[tile.name] = [];
          }
          acc[tile.name]!.push(tile);
          return acc;
        }, {} as Record<string, TileRecipe[]>);
        return Object.keys(grouped)
          .filter((tileName: string) => !['Detector', 'Rock', 'Source'].includes(tileName))
          .join(' ');
      });

    listOfElements.append('span')
      .style('font-size', '1.5vh')
      .text((d: LevelWithNewTiles) => d.newTiles.length ? ` (NEW: ${d.newTiles.join(' ')})` : '');

    this.bindMenuEvents();
  }

  bindMenuEvents(): void {
    d3.select('.view--level-selector .bottom-bar__back-to-game-button').on('click', (_event) => {
      this.game.setView('game');
    });
  }
}
