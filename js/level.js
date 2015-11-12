import {nonVacuumTiles} from './tile';
import {DEV_MODE} from './config';
import _ from 'lodash';

export class Level {
  constructor(levelRecipe) {
    this.name = levelRecipe.name;
    this.group = levelRecipe.group;
    this.width = levelRecipe.width;
    this.height = levelRecipe.height;
    this.texts = levelRecipe.texts || {};
    this.tileRecipes = levelRecipe.tiles;
    this.initialStock = {};
    if (typeof levelRecipe.stock === 'object') {
      this.initialStock = levelRecipe.stock;
    } else if (levelRecipe.stock === 'all' || DEV_MODE) {
      nonVacuumTiles.forEach((tile) => {
        this.initialStock[tile] = (tile === 'source' ? 1 : 99);
      });
    } else if (levelRecipe.stock === 'non-frozen' || !DEV_MODE) {
      this.tileRecipes = _.filter(levelRecipe.tiles, 'frozen');
      this.initialStock = _(levelRecipe.tiles)
        .filter((tile) => !tile.frozen)
        .countBy('name')
        .value();
    }
    this.requiredDetectionProbability = levelRecipe.requiredDetectionProbability || 1;
  }
}

export const levels = [
  {
    name:   "Empty",
    group:  "A Dev",
    width:  13,
    height: 10,
    tiles: [],
    stock: 'all',
    texts: {
      before: "Adventures of a Curious Character",
    },
  },
  {
    name:   "1. Introducing mirrors",
    group:  "Game",
    texts: {
      before: "Lead the way!",
    },
    width:  13,
    height: 10,
    tiles: [
      {i: 2, j: 4, name: 'Source', frozen: true},
      {i: 4, j: 4, name: 'ThinMirror', rotation: 3},
      {i: 5, j: 4, name: 'Rock', frozen: true},
      {i: 4, j: 6, name: 'ThinMirror', frozen: true, rotation: 3},
      {i: 8, j: 6, name: 'ThinMirror', rotation: 1},
      {i: 8, j: 3, name: 'Detector', frozen: true, rotation: 1},
    ]
  },
  {
    name:   "2. Introducing beam splitters",
    group:  "Game",
    texts: {
      before: "Sometimes in order to join you need to break.",
    },
    width:  13,
    height: 10,
    tiles: [
      {i: 1, j: 7, name: 'Source', frozen: true},
      {i: 4, j: 7, name: 'ThinSplitter', rotation: 1},
      {i: 8, j: 7, name: 'ThinMirror', frozen: true, rotation: 1},
      {i: 4, j: 4, name: 'ThinMirror', rotation: 1},
      {i: 8, j: 4, name: 'ThinSplitter', frozen: true, rotation: 1},
      {i: 8, j: 1, name: 'Mine', frozen: true},
      {i: 10, j: 4, name: 'Detector', frozen: true},
    ]
  },
  {
    name:   "3. Changing interference",
    group:  "Game",
    texts: {
      before: "Comebacks can turn out either way.",
    },
    width:  13,
    height: 10,
    tiles: [
      {i: 1, j: 7, name: 'Source', frozen: true},
      {i: 4, j: 7, name: 'ThinSplitter', frozen: true, rotation: 1},
      {i: 8, j: 7, name: 'ThinMirror', rotation: 1},
      {i: 4, j: 4, name: 'ThinMirror', rotation: 1},
      {i: 4, j: 5, name: 'Glass'},
      {i: 4, j: 6, name: 'Glass'},
      {i: 8, j: 4, name: 'ThinSplitter', rotation: 1},
      {i: 8, j: 1, name: 'Detector', frozen: true, rotation: 1},
      {i: 10, j: 4, name: 'Mine', frozen: true},
    ]
  },
  {
    "name": "4. Breaking interference",
    "group": "Game",
    "texts": {
      "before": "Interference is fragile.",
    },
    "requiredDetectionProbability": 0.5,
    "width": 13,
    "height": 10,
    "tiles": [
      {
        "i": 1,
        "j": 6,
        "name": "detector",
        "rotation": 2,
        "frozen": true
      },
      {
        "i": 3,
        "j": 4,
        "name": "thin-mirror",
        "rotation": 1,
        "frozen": true
      },
      {
        "i": 3,
        "j": 6,
        "name": "thin-splitter",
        "rotation": 1,
        "frozen": true
      },
      {
        "i": 3,
        "j": 8,
        "name": "detector",
        "rotation": 3,
        "frozen": true
      },
      {
        "i": 6,
        "j": 4,
        "name": "rock",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 9,
        "j": 2,
        "name": "source",
        "rotation": 3,
        "frozen": true
      },
      {
        "i": 9,
        "j": 4,
        "name": "thin-splitter",
        "rotation": 1,
        "frozen": true
      },
      {
        "i": 9,
        "j": 6,
        "name": "thin-mirror",
        "rotation": 1,
        "frozen": true
      }
    ]
  },
  {
    "name": "Mirrors and polarization - not sure",
    "group": "X Test",
    "texts": {
      "before": "Try moving sugar solution - it will cancel (not sure if its OK)",
    },
    "width": 13,
    "height": 10,
    "stock": {},
    "tiles": [
      {
        "i": 1,
        "j": 2,
        "name": "source",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 3,
        "j": 2,
        "name": "polarizing-splitter",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 4,
        "j": 2,
        "name": "thin-splitter",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 4,
        "j": 6,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 6,
        "j": 2,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 6,
        "j": 6,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 8,
        "j": 2,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 8,
        "j": 6,
        "name": "thin-mirror",
        "rotation": 1,
        "frozen": false
      }
    ]
  },
  {
    "name": "So close yet so far",
    "group": "X Playing",
    "width": 13,
    "height": 10,
    "tiles": [
      {
        "i": 0,
        "j": 2,
        "name": "source",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 1,
        "j": 1,
        "name": "detector",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 1,
        "j": 2,
        "name": "polarizing-splitter",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 3,
        "j": 2,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 5,
        "j": 2,
        "name": "thin-splitter",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 5,
        "j": 3,
        "name": "glass",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 5,
        "j": 4,
        "name": "thin-splitter",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 5,
        "j": 6,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 7,
        "j": 2,
        "name": "thin-splitter",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 7,
        "j": 6,
        "name": "thin-splitter",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 9,
        "j": 2,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 9,
        "j": 4,
        "name": "thin-splitter",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 9,
        "j": 6,
        "name": "thin-mirror",
        "rotation": 1,
        "frozen": false
      }
    ]
  },
  {
    "name": "5. Apples to apples",
    "group": "Game",
    "width": 13,
    "height": 10,
    "tiles": [
      {
        "i": 1,
        "j": 1,
        "name": "source",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 3,
        "j": 1,
        "name": "thin-splitter",
        "rotation": 3,
        "frozen": true
      },
      {
        "i": 3,
        "j": 2,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 3,
        "j": 3,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 3,
        "j": 4,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": true
      },
      {
        "i": 5,
        "j": 1,
        "name": "polarizer",
        "rotation": 2,
        "frozen": true
      },
      {
        "i": 5,
        "j": 4,
        "name": "polarizer",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 7,
        "j": 1,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": true
      },
      {
        "i": 7,
        "j": 4,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 7,
        "j": 6,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": true
      },
      {
        "i": 9,
        "j": 4,
        "name": "polarizer",
        "rotation": 2,
        "frozen": true
      },
      {
        "i": 9,
        "j": 6,
        "name": "polarizer",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 11,
        "j": 4,
        "name": "detector",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 11,
        "j": 6,
        "name": "detector",
        "rotation": 0,
        "frozen": true
      }
    ]
  },
  {
    "name": "Sagnac-Michelson-Morley",
    "group": "X Advanced",
    "width": 13,
    "height": 10,
    "tiles": [
      {
        "i": 3,
        "j": 6,
        "name": "thin-mirror",
        "rotation": 2,
        "frozen": false
      },
      {
        "i": 7,
        "j": 2,
        "name": "thin-mirror",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 7,
        "j": 4,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 8,
        "j": 4,
        "name": "glass",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 9,
        "j": 2,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 9,
        "j": 4,
        "name": "thin-splitter",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 9,
        "j": 6,
        "name": "thin-splitter",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 9,
        "j": 8,
        "name": "source",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 11,
        "j": 6,
        "name": "detector",
        "rotation": 0,
        "frozen": false
      }
    ]
  },
  {
    "name": "6. Sagnac interferemeter",
    "group": "Game",
    "width": 13,
    "height": 10,
    "tiles": [
      {
        "i": 2,
        "j": 3,
        "name": "source",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 3,
        "j": 3,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 4,
        "j": 3,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 5,
        "j": 1,
        "name": "mine",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 5,
        "j": 3,
        "name": "polarizing-splitter",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 5,
        "j": 6,
        "name": "mine",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 6,
        "j": 3,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 7,
        "j": 1,
        "name": "detector",
        "rotation": 1,
        "frozen": true
      },
      {
        "i": 7,
        "j": 3,
        "name": "thin-splitter",
        "rotation": 3,
        "frozen": true
      },
      {
        "i": 7,
        "j": 6,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": true
      },
      {
        "i": 10,
        "j": 3,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": true
      },
      {
        "i": 10,
        "j": 4,
        "name": "faraday-rotator",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 10,
        "j": 5,
        "name": "faraday-rotator",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 10,
        "j": 6,
        "name": "thin-mirror",
        "rotation": 1,
        "frozen": true
      }
    ]
  },
  {
    "name": "7. Michaelson-Morley",
    "group": "Game",
    "width": 13,
    "height": 10,
    "tiles": [
      {
        "i": 3,
        "j": 5,
        "name": "source",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 6,
        "j": 1,
        "name": "thin-mirror",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 6,
        "j": 5,
        "name": "thin-splitter",
        "rotation": 1,
        "frozen": true
      },
      {
        "i": 6,
        "j": 8,
        "name": "detector",
        "rotation": 3,
        "frozen": true
      },
      {
        "i": 10,
        "j": 5,
        "name": "thin-mirror",
        "rotation": 2,
        "frozen": false
      }
    ]
  },
  {
    "name": "8. Make it all pass",
    "group": "Game",
    "width": 13,
    "height": 10,
    "tiles": [
      {
        "i": 0,
        "j": 3,
        "name": "source",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 0,
        "j": 4,
        "name": "detector",
        "rotation": 2,
        "frozen": true
      },
      {
        "i": 1,
        "j": 3,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 3,
        "j": 3,
        "name": "polarizer",
        "rotation": 1,
        "frozen": true
      },
      {
        "i": 3,
        "j": 4,
        "name": "polarizer",
        "rotation": 1,
        "frozen": true
      },
      {
        "i": 4,
        "j": 3,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 4,
        "j": 4,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 5,
        "j": 3,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 7,
        "j": 3,
        "name": "polarizer",
        "rotation": 3,
        "frozen": true
      },
      {
        "i": 7,
        "j": 4,
        "name": "polarizer",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 8,
        "j": 3,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 9,
        "j": 4,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 10,
        "j": 3,
        "name": "polarizer",
        "rotation": 2,
        "frozen": true
      },
      {
        "i": 10,
        "j": 4,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 12,
        "j": 3,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": true
      },
      {
        "i": 12,
        "j": 4,
        "name": "thin-mirror",
        "rotation": 1,
        "frozen": true
      }
    ]
  },
  {
    "name": "9. Sugar recycling",
    "group": "Game",
    "width": 13,
    "height": 10,
    "tiles": [
      {
        "i": 3,
        "j": 5,
        "name": "source",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 4,
        "j": 5,
        "name": "polarizer",
        "rotation": 2,
        "frozen": true
      },
      {
        "i": 5,
        "j": 1,
        "name": "thin-mirror",
        "rotation": 1,
        "frozen": true
      },
      {
        "i": 5,
        "j": 3,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 5,
        "j": 5,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 5,
        "j": 7,
        "name": "polarizer",
        "rotation": 2,
        "frozen": true
      },
      {
        "i": 5,
        "j": 8,
        "name": "detector",
        "rotation": 3,
        "frozen": true
      },
      {
        "i": 6,
        "j": 1,
        "name": "polarizer",
        "rotation": 2,
        "frozen": true
      },
      {
        "i": 6,
        "j": 5,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 8,
        "j": 1,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": true
      },
      {
        "i": 8,
        "j": 2,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 8,
        "j": 3,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": true
      },
      {
        "i": 8,
        "j": 5,
        "name": "polarizer",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 9,
        "j": 3,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": true
      },
      {
        "i": 9,
        "j": 4,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 9,
        "j": 5,
        "name": "thin-mirror",
        "rotation": 1,
        "frozen": true
      }
    ]
  },
  {
    "name": "10. Interference was never easy",
    "group": "Game",
    "width": 13,
    "height": 10,
    "tiles": [
      {
        "i": 1,
        "j": 5,
        "name": "mine",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 3,
        "j": 1,
        "name": "thin-mirror",
        "rotation": 1,
        "frozen": true
      },
      {
        "i": 3,
        "j": 3,
        "name": "glass",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 3,
        "j": 5,
        "name": "thin-splitter",
        "rotation": 1,
        "frozen": true
      },
      {
        "i": 3,
        "j": 9,
        "name": "detector",
        "rotation": 3,
        "frozen": true
      },
      {
        "i": 5,
        "j": 1,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 5,
        "j": 5,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": true
      },
      {
        "i": 5,
        "j": 9,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": true
      },
      {
        "i": 6,
        "j": 1,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 6,
        "j": 5,
        "name": "thin-mirror",
        "rotation": 1,
        "frozen": true
      },
      {
        "i": 6,
        "j": 9,
        "name": "thin-mirror",
        "rotation": 1,
        "frozen": true
      },
      {
        "i": 8,
        "j": 1,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": true
      },
      {
        "i": 8,
        "j": 5,
        "name": "polarizing-splitter",
        "rotation": 1,
        "frozen": true
      },
      {
        "i": 10,
        "j": 5,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 12,
        "j": 5,
        "name": "source",
        "rotation": 2,
        "frozen": true
      }
    ]
  },
  {
    "name": "11. Interfrenzy",
    "group": "Game",
    "width": 13,
    "height": 10,
    "tiles": [
      {
        "i": 0,
        "j": 1,
        "name": "source",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 2,
        "j": 1,
        "name": "thin-splitter",
        "rotation": 3,
        "frozen": true
      },
      {
        "i": 2,
        "j": 3,
        "name": "thin-splitter",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 2,
        "j": 7,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": true
      },
      {
        "i": 5,
        "j": 1,
        "name": "thin-splitter",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 5,
        "j": 3,
        "name": "thin-splitter",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 7,
        "j": 1,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": true
      },
      {
        "i": 7,
        "j": 7,
        "name": "thin-splitter",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 7,
        "j": 9,
        "name": "mine",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 9,
        "j": 3,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": true
      },
      {
        "i": 9,
        "j": 7,
        "name": "thin-splitter",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 9,
        "j": 9,
        "name": "detector",
        "rotation": 3,
        "frozen": true
      },
      {
        "i": 11,
        "j": 7,
        "name": "mine",
        "rotation": 0,
        "frozen": true
      }
    ]
  },
  {
    "name": "12. The sign thing",
    "group": "Game",
    "width": 13,
    "height": 10,
    "tiles": [
      {
        "i": 1,
        "j": 2,
        "name": "detector",
        "rotation": 2,
        "frozen": true
      },
      {
        "i": 3,
        "j": 0,
        "name": "mine",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 3,
        "j": 2,
        "name": "thin-splitter",
        "rotation": 3,
        "frozen": true
      },
      {
        "i": 3,
        "j": 6,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": true
      },
      {
        "i": 5,
        "j": 2,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 6,
        "j": 2,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 7,
        "j": 2,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 8,
        "j": 2,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 9,
        "j": 2,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": true
      },
      {
        "i": 9,
        "j": 6,
        "name": "thin-splitter",
        "rotation": 3,
        "frozen": true
      },
      {
        "i": 9,
        "j": 9,
        "name": "source",
        "rotation": 1,
        "frozen": true
      }
    ]
  },
  {
    "name": "13. No leakage",
    "group": "Game",
    "width": 13,
    "height": 10,
    "tiles": [
      {
        "i": 3,
        "j": 4,
        "name": "source",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 4,
        "j": 4,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 5,
        "j": 4,
        "name": "polarizing-splitter",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 5,
        "j": 7,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": true
      },
      {
        "i": 6,
        "j": 4,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 7,
        "j": 4,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 8,
        "j": 4,
        "name": "polarizing-splitter",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 8,
        "j": 6,
        "name": "glass",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 8,
        "j": 7,
        "name": "thin-splitter",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 10,
        "j": 4,
        "name": "thin-mirror",
        "rotation": 1,
        "frozen": true
      },
      {
        "i": 10,
        "j": 7,
        "name": "thin-mirror",
        "rotation": 1,
        "frozen": true
      },
      {
        "i": 12,
        "j": 4,
        "name": "detector",
        "rotation": 0,
        "frozen": true
      }
    ]
  },
  {
    "name": "14. Both need it",
    "group": "Game",
    "width": 13,
    "height": 10,
    "tiles": [
      {
        "i": 1,
        "j": 2,
        "name": "source",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 3,
        "j": 2,
        "name": "thin-splitter",
        "rotation": 3,
        "frozen": true
      },
      {
        "i": 3,
        "j": 4,
        "name": "thin-splitter",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 3,
        "j": 6,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 3,
        "j": 8,
        "name": "mine",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 5,
        "j": 2,
        "name": "thin-splitter",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 5,
        "j": 4,
        "name": "thin-splitter",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 5,
        "j": 8,
        "name": "mine",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 7,
        "j": 2,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 7,
        "j": 6,
        "name": "thin-splitter",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 7,
        "j": 8,
        "name": "mine",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 9,
        "j": 2,
        "name": "mine",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 9,
        "j": 4,
        "name": "detector",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 9,
        "j": 6,
        "name": "detector",
        "rotation": 0,
        "frozen": true
      }
    ]
  },
  {
    "name": "Sugar vs mirrors",
    "group": "X Examples",
    "width": 13,
    "height": 10,
    "stock": {},
    "tiles": [
      {
        "i": 3,
        "j": 3,
        "name": "source",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 5,
        "j": 5,
        "name": "polarizing-splitter",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 6,
        "j": 3,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 8,
        "j": 5,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 9,
        "j": 3,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 9,
        "j": 5,
        "name": "thin-mirror",
        "rotation": 1,
        "frozen": false
      }
    ]
  },
  {
    "name": "Nine polarizing beam splitters",
    "group": "X Puzzles",
    "width": 13,
    "height": 10,
    "tiles": [
      {
        "i": 2,
        "j": 2,
        "name": "source",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 2,
        "j": 4,
        "name": "thin-mirror",
        "rotation": 2,
        "frozen": false
      },
      {
        "i": 3,
        "j": 4,
        "name": "faraday-rotator",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 4,
        "j": 2,
        "name": "polarizing-splitter",
        "rotation": 1,
        "frozen": true
      },
      {
        "i": 4,
        "j": 4,
        "name": "polarizing-splitter",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 4,
        "j": 6,
        "name": "polarizing-splitter",
        "rotation": 1,
        "frozen": true
      },
      {
        "i": 6,
        "j": 2,
        "name": "polarizing-splitter",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 6,
        "j": 4,
        "name": "polarizing-splitter",
        "rotation": 1,
        "frozen": true
      },
      {
        "i": 6,
        "j": 6,
        "name": "polarizing-splitter",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 8,
        "j": 2,
        "name": "polarizing-splitter",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 8,
        "j": 4,
        "name": "polarizing-splitter",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 8,
        "j": 6,
        "name": "polarizing-splitter",
        "rotation": 1,
        "frozen": true
      },
      {
        "i": 9,
        "j": 4,
        "name": "faraday-rotator",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 10,
        "j": 4,
        "name": "thin-mirror",
        "rotation": 2,
        "frozen": false
      },
      {
        "i": 10,
        "j": 6,
        "name": "detector",
        "rotation": 0,
        "frozen": true
      }
    ]
  },
  {
    "name": "Nine polarizing - hardcore mode",
    "group": "X Puzzles",
    "width": 13,
    "height": 10,
    "tiles": [
      {
        "i": 2,
        "j": 2,
        "name": "source",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 2,
        "j": 4,
        "name": "thin-mirror",
        "rotation": 2,
        "frozen": false
      },
      {
        "i": 2,
        "j": 6,
        "name": "thin-mirror",
        "rotation": 2,
        "frozen": false
      },
      {
        "i": 3,
        "j": 2,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 3,
        "j": 4,
        "name": "faraday-rotator",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 3,
        "j": 6,
        "name": "faraday-rotator",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 4,
        "j": 0,
        "name": "thin-mirror",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 4,
        "j": 1,
        "name": "faraday-rotator",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 4,
        "j": 2,
        "name": "polarizing-splitter",
        "rotation": 1,
        "frozen": true
      },
      {
        "i": 4,
        "j": 3,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 4,
        "j": 4,
        "name": "polarizing-splitter",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 4,
        "j": 6,
        "name": "polarizing-splitter",
        "rotation": 1,
        "frozen": true
      },
      {
        "i": 4,
        "j": 8,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 6,
        "j": 0,
        "name": "thin-mirror",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 6,
        "j": 1,
        "name": "faraday-rotator",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 6,
        "j": 2,
        "name": "polarizing-splitter",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 6,
        "j": 4,
        "name": "polarizing-splitter",
        "rotation": 1,
        "frozen": true
      },
      {
        "i": 6,
        "j": 6,
        "name": "polarizing-splitter",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 6,
        "j": 8,
        "name": "thin-mirror",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 8,
        "j": 0,
        "name": "thin-mirror",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 8,
        "j": 1,
        "name": "faraday-rotator",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 8,
        "j": 2,
        "name": "polarizing-splitter",
        "rotation": 1,
        "frozen": true
      },
      {
        "i": 8,
        "j": 4,
        "name": "polarizing-splitter",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 8,
        "j": 6,
        "name": "polarizing-splitter",
        "rotation": 1,
        "frozen": true
      },
      {
        "i": 8,
        "j": 7,
        "name": "faraday-rotator",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 8,
        "j": 8,
        "name": "thin-mirror",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 9,
        "j": 2,
        "name": "faraday-rotator",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 9,
        "j": 4,
        "name": "faraday-rotator",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 10,
        "j": 2,
        "name": "thin-mirror",
        "rotation": 2,
        "frozen": false
      },
      {
        "i": 10,
        "j": 4,
        "name": "thin-mirror",
        "rotation": 2,
        "frozen": false
      },
      {
        "i": 10,
        "j": 6,
        "name": "detector",
        "rotation": 0,
        "frozen": true
      }
    ]
  },
  {
    "name": "Polarization fun",
    "group": "X Various",
    "width": 13,
    "height": 10,
    "stock": {},
    "tiles": [
      {
        "i": 1,
        "j": 3,
        "name": "source",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 2,
        "j": 3,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 3,
        "j": 3,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 4,
        "j": 3,
        "name": "thin-splitter",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 4,
        "j": 4,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 5,
        "j": 2,
        "name": "thin-mirror",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 5,
        "j": 3,
        "name": "thin-mirror",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 5,
        "j": 4,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 6,
        "j": 3,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 6,
        "j": 4,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 7,
        "j": 3,
        "name": "polarizing-splitter",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 7,
        "j": 4,
        "name": "thin-mirror",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 8,
        "j": 3,
        "name": "phase-plate",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 9,
        "j": 1,
        "name": "mine",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 9,
        "j": 3,
        "name": "polarizing-splitter",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 11,
        "j": 3,
        "name": "detector",
        "rotation": 0,
        "frozen": false
      }
    ]
  },
  {
    "name": "Geometrical series - detection",
    "group": "X Test",
    "width": 13,
    "height": 10,
    "stock": {},
    "tiles": [
      {
        "i": 3,
        "j": 3,
        "name": "source",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 6,
        "j": 1,
        "name": "detector",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 6,
        "j": 3,
        "name": "thin-splitter",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 6,
        "j": 5,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 8,
        "j": 3,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 8,
        "j": 5,
        "name": "thin-mirror",
        "rotation": 1,
        "frozen": false
      }
    ]
  },
  {
    "name": "Geometrical series - train",
    "group": "X Test",
    "width": 13,
    "height": 10,
    "stock": {},
    "tiles": [
      {
        "i": 0,
        "j": 0,
        "name": "thin-mirror",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 0,
        "j": 9,
        "name": "detector",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 1,
        "j": 2,
        "name": "source",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 2,
        "j": 1,
        "name": "thin-mirror",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 2,
        "j": 2,
        "name": "thin-splitter",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 2,
        "j": 9,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 3,
        "j": 1,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 3,
        "j": 2,
        "name": "thin-mirror",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 12,
        "j": 0,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 12,
        "j": 9,
        "name": "thin-mirror",
        "rotation": 1,
        "frozen": false
      }
    ]
  }
];
