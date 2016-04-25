import d3 from 'd3';

import * as tile from '../tile';
import {View} from './view';
import {TransitionHeatmap} from '../transition_heatmap';

export class EncyclopediaItemView extends View {
  get title() {
    return tile[this.game.currentEncyclopediaItem].desc.name;
  }
  get subtitle() {
    return '';
  }
  get className() {
    return 'view--encyclopedia-item';
  }
  initialize() {
    this.bindMenuEvents();
  }
  resetContent() {
    if (!this.game.currentEncyclopediaItem) {
      return;
    }

    const tileData = tile[this.game.currentEncyclopediaItem];

    const container = d3.select('.encyclopedia-item');

    container
      .html(null);
    const article = container.append('article');
    article
      .append('svg')
      .attr('class', 'big-tile')
      .attr('viewBox', '0 0 100 100')
      .append('use')
      .attr('xlink:href', `#${tileData.svgName}`)
      .attr('transform', 'translate(50, 50)');
    article
      .append('h4')
      .text(tileData.desc.name);
    article
      .append('div')
      .classed('content', true)
      .text(tileData.desc.summary);

    article
      .append('div')
      .classed('content', true)
      .append('i')
      .text(`"${tileData.desc.flavour}"`);

    const hm = article
      .append('div')
      .attr('class', 'content heatmap');

    // TODO something for rotation...
    const tileObj = new tile.Tile(tileData);
    const transitionHeatmap = new TransitionHeatmap(hm);
    window.console.log('tileObj', tileObj);
    transitionHeatmap.updateFromTensor(tileObj.transitionAmplitudes.map);

  }
  bindMenuEvents() {
    d3.select('.bottom-bar__back-to-encyclopedia-selector-button').on('click', () => {
      this.game.setView('encyclopediaSelector');
    });
  }
}
