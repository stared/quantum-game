import * as level from 'level';
import * as tile from 'tile';

class Board {
  constructor(level) {
    this.level = level;
  }
  reset() {
    // Create matrix
    this.tiles = _.range(this.level.width).map((i) => {
        return _.range(this.level.height).map((j) => {
            return new tile.Tile(tile.Vacuum, 0, false, i, j)
          }
        )
      }
    );
    // Fill it with proper tiles
    _.each(this.level.tiles, (tile) => {
      this.tiles[tile.i][tile.j] = _.clone(tile);
    });
  }
}
