import d3 from 'd3';

import {View} from './view';
import * as tile from '../tile';

export class EncyclopediaSelectorView extends View {
  get title() {
    return 'Encyclopedia';
  }
  get className() {
    return 'view--encyclopedia-selector';
  }
  initialize() {
    this.createSelectorEntries();
    this.bindMenuEvents();
  }
  createSelectorEntries() {
    const items = d3.select('.encyclopedia-selector > ul')
      .selectAll('li')
      .data(tile.nonVacuumTiles)
      .enter()
      .append('li')
      .append('button')
      .attr('class', 'unselectable')
      .on('click', (d) => {
        this.game.setEncyclopediaItem(d);
        this.game.setView('encyclopediaItem');
      });
    items
      .append('svg')
      .attr('viewBox', '0 0 100 100')
      .append('use')
      .attr('xlink:href', (d) => `#${tile[d].svgName}`)
      .attr('transform', 'translate(50, 50)');
    items
      .append('h4')
      .text((d) => tile[d].desc.name);
  }
  bindMenuEvents() {
    d3.select('.bottom-bar__back-to-game-button').on('click', () => {
      this.game.setView('game');
    });
  }
}
