import {tileSize, pearlsPerRow} from './config';

const pearlRadius = 0.2 * tileSize;
const pearlDistance = 0.5 * tileSize;

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

    const pearlsEntered = this.pearls.enter()
      .append('g')
        .attr('class', 'pearl')
        .attr('transform', (d, i) => `translate(${pearlDistance * (i % pearlsPerRow + 0.5)}, ${pearlDistance * (Math.floor(i / pearlsPerRow) - 0.75)})`)
        .on('click', (d) => {
          this.gameBoard.stop();
          this.gameBoard.loadLevel(d.id);
        });

    pearlsEntered.append('circle')
      .attr('r', pearlRadius);

    pearlsEntered.append('text')
      .text((d) => d.i);

    this.update();
  }

  update() {

    // TODO(migdal) accesible levels

    const isWon = (d) => this.gameBoard.storage.getLevelIsWon(d.id);

    this.pearls
      .classed('pearl--passed', isWon)
      .classed('pearl--current', (d) => d.id === this.gameBoard.storage.getCurrentLevelId())
      .on('mouseover', (d) => {
        this.gameBoard.titleManager.displayMessage(
          `GO TO: ${d.i}. ${d.name} ${isWon(d) ? '[won]' : ''}`,
          ''
        )
      });
  }

}
