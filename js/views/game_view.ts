import {View} from './view';

export class GameView extends View {
  get title(): string {
    return this.game.gameBoard!.title;
  }

  get className(): string {
    return 'view--game';
  }

  override initialize(): void {
    this.game.createGameBoard();
    this.game.bindMenuEvents();
  }
}
