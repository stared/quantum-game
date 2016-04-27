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

    const article = d3.select('.encyclopedia-item__container > article');

    article
      .html(null);

    this.createBasicInfo(article, tileData);
    this.createTransitions(article, tileData);
    this.createHowItWorks(article, tileData);
    this.createUsage(article, tileData);
  }

  createBasicInfo(article, tileData) {
    article
      .append('h1')
      .attr('id', 'encyclopedia-item__basic-info')
      .text('Basic info');
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
    if (tileData.desc.flavour) {
      article
        .append('div')
        .classed('content', true)
        .append('i')
        .text(`"${tileData.desc.flavour}"`);
    }
  }

  createTransitions(article, tileData) {
    article
      .append('h1')
      .attr('id', 'encyclopedia-item__transitions')
      .text('Transitions');

    article
      .append('p')
      .classed('encyclopedia-item__hint', true)
      .text('Click on heatmap to change its ordering (direction, polarization).');

    const hm = article
      .append('div')
      .attr('class', 'content heatmap');

    // TODO something for rotation...
    const tileObj = new tile.Tile(tileData);
    const transitionHeatmap = new TransitionHeatmap(hm);
    transitionHeatmap.updateFromTensor(tileObj.transitionAmplitudes.map);
  }

  createHowItWorks(article, tileData) {
    // TODO(pathes): content
  }

  createUsage(article, tileData) {
    // TODO(pathes): content
  }


  bindMenuEvents() {
    d3.select('.bottom-bar__back-to-encyclopedia-selector-button').on('click', () => {
      this.game.setView('encyclopediaSelector');
    });
  }
}
