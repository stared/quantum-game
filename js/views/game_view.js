import {View} from './view';

export class GameView extends View {
  get title() {
    return this.game.gameBoard.title;
  }
  get className() {
    return 'view--game';
  }
  initialize() {
    this.game.createGameBoard();
    this.game.bindMenuEvents();
  }

}
