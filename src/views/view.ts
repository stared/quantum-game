import type {Game} from '../game';

export class View {
  game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  initialize(): void {}
}
