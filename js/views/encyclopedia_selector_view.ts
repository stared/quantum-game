import d3 from '../d3-wrapper';

import {View} from './view';
import * as tile from '../tile';

export class EncyclopediaSelectorView extends View {
  get title(): string {
    return 'Encyclopedia';
  }

  get className(): string {
    return 'view--encyclopedia-selector';
  }

  override initialize(): void {
    this.createSelectorEntries();
    this.bindMenuEvents();
  }

  createSelectorEntries(): void {
    const items = d3.select('.encyclopedia-selector > ul')
      .selectAll('li')
      .data(tile.nonVacuumTiles)
      .enter()
      .append('li')
      .append('button')
      .attr('class', 'unselectable')
      .on('click', (d: string) => {
        this.game.setEncyclopediaItem(d);
        this.game.setView('encyclopediaItem');
      });
    items
      .append('svg')
      .attr('viewBox', '0 0 100 100')
      .append('use')
      .attr('xlink:href', (d: string) => `#${tile.tileMap[d]!.svgName}`)
      .attr('transform', 'translate(50, 50)');
    items
      .append('h4')
      .text((d: string) => tile.tileMap[d]!.desc.name);
  }

  bindMenuEvents(): void {
    d3.select('.view--encyclopedia-selector .bottom-bar__back-to-game-button').on('click', () => {
      this.game.setView('game');
    });
  }
}
