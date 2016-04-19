import {tileSize} from './config';

const PEARLS_PER_COL = 36;

export class ProgressPearls {

  constructor(selector, levels, gameBoard) {
    this.g = selector.append('g')
      .attr('class', 'progress-pearls');
    this.levels = levels;
    this.gameBoard = gameBoard;
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
          this.gameBoard.stop();
          this.gameBoard.loadLevel(d);
        });

    // TODO(migdal) names on hover (or even thumbnails)

    this.update();
  }

  update() {

    // TODO(migdal) accesible levels

    this.pearls
      .classed('pearl--passed', (d) => {
        return this.gameBoard.storage.getItem(`isWon ${d.group} ${d.name}`) === 'true';
      })
      .classed('pearl--current', (d) => {
        return this.gameBoard.level ? this.gameBoard.level.name === d.name : false;
      });
  }

}
