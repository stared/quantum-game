import _ from 'lodash';

import {levels, Level} from './level';
import {WinningStatus} from './winning_status';
import * as tile from './tile';

//TODO some semi-working results (more fine-grained than isWon)

//TODO probabilities for physical exercises

//TODO modification of puzzles so they do not work (1 missing element?)

describe('All game levels have solutions', () => {

  levels
    .filter((levelRecipe) => levelRecipe.group === 'Game')
    .forEach((levelRecipe) => {

      const level = new Level(levelRecipe, 'as_it_is');

      // clearTileMatrix and fillTileMatrix from board.js
      const tileMatrix = _.range(level.width).map((i) =>
        _.range(level.height).map((j) =>
          new tile.Tile(tile.Vacuum, 0, false, i, j)
        )
      );

      _.each(level.tileRecipes, (tileRecipe) => {
        tileMatrix[tileRecipe.i][tileRecipe.j] = new tile.Tile(
          tile[tileRecipe.name],
          tileRecipe.rotation || 0,
          !!tileRecipe.frozen,
          tileRecipe.i,
          tileRecipe.j
        );
      });

      const winningStatus = new WinningStatus(tileMatrix);
      winningStatus.run();
      winningStatus.compareToObjectives(level.requiredDetectionProbability, level.detectorsToFeed);

      it(`${level.i} ${level.name} (${level.detectorsToFeed} detectors at ${(100 * level.requiredDetectionProbability).toFixed(1)}%)`, () => {
        expect(winningStatus.isWon).toEqual(true);
      });

    });

});
