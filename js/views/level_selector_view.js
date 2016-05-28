import d3 from 'd3';
import _ from 'lodash';

import {View} from './view';
import * as level from '../level';

export class LevelSelectorView extends View {
  get title() {
    return 'Quantum game';
  }
  get subtitle() {
    return '';
  }
  get className() {
    return 'view--level-selector';
  }
  initialize() {
    const listOfElements = d3.select('.level-selector > ul')
      .selectAll('li')
      .data(level.levels)
      .enter()
      .append('li')
      .attr('class', 'level-item unselectable')
      .text((d) => `[${d.group}] ${d.i}. ${d.name} `)
      .on('click', (d) => {
        this.game.gameBoard.loadLevel(d.id);
        this.game.setView('game');
      });

    // as of now it is a version for developers
    // for users - graphical icons (of the new elements) or display:none;
    const elementsEncountered = {};
    level.levels.forEach((d) => {
      d.newTiles = [];
      d.tiles.forEach((tile) => {
        if (!_.has(elementsEncountered, tile.name)) {
          elementsEncountered[tile.name] = true;
          d.newTiles.push(tile.name);
        }
      });
    });

    listOfElements.append('span')
      .style('font-size', '1.5vh')
      .text((d) =>
        _(d.tiles)
          .groupBy('name')
          .keys()
          .filter((tile) => !_.includes(['Detector', 'Rock', 'Source'], tile))
          .value()
          .join(' ')
      );

    listOfElements.append('span')
      .style('font-size', '1.5vh')
      .text((d) => d.newTiles.length ? ` (NEW: ${d.newTiles.join(' ')})` : '');

  }
}
