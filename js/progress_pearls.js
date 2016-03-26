import d3 from 'd3';
import {tileSize} from './config';

const PEARLS_PER_COL = 36;

export class ProgressPearls {

  constructor(selector, levels, game) {
    this.g = selector.append('g')
      .attr('class', 'progress-pearls');
    this.levels = levels;
    this.game = game;
  }

  draw() {
    this.pearls = this.g.selectAll('.pearl')
      .data(this.levels);

    this.pearls.enter()
      .append('circle')
        .attr('class', 'pearl')
        .attr('r', 0.08 * tileSize)
        .attr('cx', (d, i) => (0.25 * Math.floor(i / PEARLS_PER_COL) - 0.75) * tileSize)
        .attr('cy', (d, i) => (0.25 * (i % PEARLS_PER_COL) + 0.5) * tileSize)
        .on('click', (d) => {
          this.game.gameBoard.stop();
          this.game.gameBoard.loadLevel(d);
        });

    // TODO(migdal) names on hover (or even thumbnails)

    this.update();
  }

  update() {

    // TODO(migdal) accesible levels
    // TODO(migdal) current level indicator (line? perspective? dot?)

    this.pearls
      .classed('pearl--passed', (d) => {
        return this.game.storage.getItem(`isWon ${d.group} ${d.name}`) === 'true';
      })
      .classed('pearl--current', (d) => {
        return this.game.currentLevelName() === d.name;
      });
  }

}
