import {tileSize, pearlsPerRow} from './config';
import type {D3Selection, LevelRecipe} from './types';
import type {GameBoard} from './game_board';

const pearlRadius = 0.2 * tileSize;
const pearlDistance = 0.5 * tileSize;

export class ProgressPearls {
  g: D3Selection;
  levels: LevelRecipe[];
  gameBoard: GameBoard;
  pearls!: D3Selection;

  constructor(selector: D3Selection, levels: LevelRecipe[], gameBoard: GameBoard) {
    this.g = selector.append('g')
      .attr('class', 'progress-pearls');
    this.levels = levels;
    this.gameBoard = gameBoard;
  }

  draw(): void {
    this.pearls = this.g['selectAll']('.pearl')
      .data(this.levels);

    const pearlsEntered = this.pearls['enter']()
      .append('g')
        .attr('class', 'pearl')
        .attr('transform', (_d, i) => `translate(${pearlDistance * (i % pearlsPerRow + 0.5)}, ${pearlDistance * (Math.floor(i / pearlsPerRow) - 0.75)})`)
        .on('click', (d: LevelRecipe) => {
          this.gameBoard.loadLevel(d.id!);
        });

    pearlsEntered.append('circle')
      .attr('r', pearlRadius);

    pearlsEntered.append('text')
      .text((d: LevelRecipe) => d.i);

    this.update();
  }

  update(): void {

    // TODO(migdal) accesible levels

    const isWon = (d: LevelRecipe): boolean => this.gameBoard.storage.getLevelIsWon(d.id!);

    this.pearls
      ['classed']('pearl--passed', isWon)
      ['classed']('pearl--current', (d: LevelRecipe) => d.id === this.gameBoard.storage.getCurrentLevelId())
      ['on']('mouseover', (d: LevelRecipe) => {
        this.gameBoard.titleManager.displayMessage(
          `GO TO: ${d.i}. ${d.name} ${isWon(d) ? '[won]' : ''}`,
          ''
        );
      });
  }

}
