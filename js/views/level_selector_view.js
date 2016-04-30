import d3 from 'd3';

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
    d3.select('.level-selector > ul')
      .selectAll('li')
      .data(level.levels)
      .enter()
      .append('li')
      .attr('class', 'level-item unselectable')
      .text((d) => `[${d.group}] ${d.i}. ${d.name}`)
      .on('click', (d) => {
        this.game.gameBoard.loadLevel(d.id);
        this.game.setView('game');
      });
  }
}
