import {tileSize, pearlsPerCol} from './config';

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
        .attr('cx', (d, i) => (0.25 * Math.floor(i / pearlsPerCol) - 0.75) * tileSize)
        .attr('cy', (d, i) => (0.25 * (i % pearlsPerCol) + 0.5) * tileSize)
        .on('click', (d) => {
          this.gameBoard.stop();
          this.gameBoard.loadLevel(d.id);
        });

    this.update();
  }

  update() {

    // TODO(migdal) accesible levels

    const isWon = (d) => this.gameBoard.storage.getLevelIsWon(d.id);

    this.pearls
      .classed('pearl--passed', isWon)
      .classed('pearl--current', (d) => {
        return this.gameBoard.level ? this.gameBoard.level.name === d.name : false;
      })
      .on('mouseover', (d) => {
        this.gameBoard.titleManager.displayMessage(
          `GO TO: ${d.i}. ${d.name} ${isWon(d) ? '[won]' : ''}`,
          ''
        )
      });
  }

}
