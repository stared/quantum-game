import {nonVacuumTiles} from './tile';
import _ from 'lodash';

const DEV_MODE = false;

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
    } else if (levelRecipe.stock === 'all') {
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
  }
}

export const levels = [
  {
    name:   "Empty",
    group:  "Development",
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
    group:  "Prototype",
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
    group:  "Prototype",
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
    group:  "Prototype",
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
    "name": "2. Introducing beam splitters",
    "group": "Clipboarded",
    "texts": {
      "before": "Sometimes in order to join you need to break.",
    },
    "width": 13,
    "height": 10,
    "tiles": [
      {
        "i": 1,
        "j": 7,
        "name": "source",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 4,
        "j": 4,
        "name": "thin-mirror",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 4,
        "j": 7,
        "name": "thin-splitter",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 8,
        "j": 1,
        "name": "mine",
        "rotation": 0,
        "frozen": true
      },
      {
        "i": 8,
        "j": 4,
        "name": "thin-splitter",
        "rotation": 1,
        "frozen": true
      },
      {
        "i": 8,
        "j": 7,
        "name": "thin-mirror",
        "rotation": 1,
        "frozen": true
      },
      {
        "i": 10,
        "j": 4,
        "name": "detector",
        "rotation": 0,
        "frozen": true
      }
    ]
  },
  {
    "name": "4. Breaking interference",
    "group": "Prototype",
    "texts": {
      "before": "Interference is fragile.",
    },
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
    "group": "Test",
    "texts": {
      "before": "Try moving sugar solution - it will cancel (not sure if its OK)",
    },
    "width": 13,
    "height": 10,
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
    "group": "Playing",
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
    "group": "Prototype",
    "width": 13,
    "height": 10,
    "tiles": [
      {
        "i": 1,
        "j": 1,
        "name": "source",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 3,
        "j": 1,
        "name": "thin-splitter",
        "rotation": 3,
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
        "frozen": false
      },
      {
        "i": 5,
        "j": 1,
        "name": "polarizer",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 5,
        "j": 4,
        "name": "polarizer",
        "rotation": 2,
        "frozen": false
      },
      {
        "i": 7,
        "j": 1,
        "name": "thin-mirror",
        "rotation": 3,
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
        "i": 7,
        "j": 6,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 9,
        "j": 4,
        "name": "polarizer",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 9,
        "j": 6,
        "name": "polarizer",
        "rotation": 2,
        "frozen": false
      },
      {
        "i": 11,
        "j": 4,
        "name": "detector",
        "rotation": 0,
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
    "name": "Sagnac-Michelson-Morley",
    "group": "Advanced",
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
    "name": "6. Sagnac interferometer",
    "group": "Prototype",
    "width": 13,
    "height": 10,
    "tiles": [
      {
        "i": 4,
        "j": 4,
        "name": "mine",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 4,
        "j": 6,
        "name": "mine",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 6,
        "j": 2,
        "name": "mine",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 6,
        "j": 4,
        "name": "thin-mirror",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 6,
        "j": 6,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 6,
        "j": 8,
        "name": "mine",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 8,
        "j": 2,
        "name": "source",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 8,
        "j": 4,
        "name": "thin-splitter",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 8,
        "j": 6,
        "name": "thin-mirror",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 8,
        "j": 8,
        "name": "mine",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 10,
        "j": 4,
        "name": "mine",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 10,
        "j": 6,
        "name": "mine",
        "rotation": 0,
        "frozen": false
      }
    ]
  },
  {
    "name": "7. Michaelson-Morley",
    "group": "Prototype",
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
    "name": "8. Make it all pass (miscoppied plus pol error)",
    "group": "Prototype",
    "width": 13,
    "height": 10,
    "tiles": [
      {
        "i": 0,
        "j": 3,
        "name": "source",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 0,
        "j": 4,
        "name": "detector",
        "rotation": 2,
        "frozen": false
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
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 3,
        "j": 4,
        "name": "polarizer",
        "rotation": 1,
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
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 7,
        "j": 4,
        "name": "polarizer",
        "rotation": 2,
        "frozen": false
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
        "rotation": 0,
        "frozen": false
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
        "frozen": false
      },
      {
        "i": 12,
        "j": 4,
        "name": "thin-mirror",
        "rotation": 1,
        "frozen": false
      }
    ]
  },
  {
    "name": "9. Sugar recycling",
    "group": "Prototype",
    "width": 13,
    "height": 10,
    "tiles": [
      {
        "i": 3,
        "j": 5,
        "name": "source",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 4,
        "j": 5,
        "name": "polarizer",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 5,
        "j": 1,
        "name": "thin-mirror",
        "rotation": 1,
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
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 5,
        "j": 8,
        "name": "detector",
        "rotation": 3,
        "frozen": false
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
        "i": 8,
        "j": 3,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 8,
        "j": 5,
        "name": "polarizer",
        "rotation": 2,
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
        "frozen": false
      }
    ]
  },
  {
    "name": "10. Interference was never easy",
    "group": "Prototype",
    "width": 13,
    "height": 10,
    "tiles": [
      {
        "i": 1,
        "j": 5,
        "name": "mine",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 3,
        "j": 1,
        "name": "thin-mirror",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 3,
        "j": 5,
        "name": "thin-splitter",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 3,
        "j": 9,
        "name": "detector",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 4,
        "j": 5,
        "name": "glass",
        "rotation": 0,
        "frozen": false
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
        "frozen": false
      },
      {
        "i": 5,
        "j": 9,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": false
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
        "frozen": false
      },
      {
        "i": 6,
        "j": 9,
        "name": "thin-mirror",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 8,
        "j": 1,
        "name": "thin-mirror",
        "rotation": 3,
        "frozen": false
      },
      {
        "i": 8,
        "j": 5,
        "name": "polarizing-splitter",
        "rotation": 1,
        "frozen": false
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
        "frozen": false
      }
    ]
  },
  {
    "name": "11. Interfrenzy",
    "group": "Prototype",
    "width": 13,
    "height": 10,
    "tiles": [
      {
        "i": 0,
        "j": 1,
        "name": "source",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 2,
        "j": 1,
        "name": "thin-splitter",
        "rotation": 3,
        "frozen": false
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
        "frozen": false
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
        "frozen": false
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
        "frozen": false
      },
      {
        "i": 11,
        "j": 7,
        "name": "mine",
        "rotation": 0,
        "frozen": false
      }
    ]
  },
  {
    "name": "12. The sign thing",
    "group": "Prototype",
    "width": 13,
    "height": 10,
    "tiles": [
      {
        "i": 1,
        "j": 2,
        "name": "detector",
        "rotation": 2,
        "frozen": false
      },
      {
        "i": 3,
        "j": 0,
        "name": "mine",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 3,
        "j": 2,
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
        "j": 9,
        "name": "source",
        "rotation": 1,
        "frozen": false
      }
    ]
  },
  {
    "name": "13. No leakage",
    "group": "Prototype",
    "width": 13,
    "height": 10,
    "tiles": [
      {
        "i": 0,
        "j": 4,
        "name": "source",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 2,
        "j": 4,
        "name": "polarizing-splitter",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 3,
        "j": 4,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
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
        "j": 4,
        "name": "sugar-solution",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 7,
        "j": 7,
        "name": "glass",
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
        "frozen": false
      },
      {
        "i": 10,
        "j": 7,
        "name": "thin-mirror",
        "rotation": 1,
        "frozen": false
      },
      {
        "i": 12,
        "j": 4,
        "name": "detector",
        "rotation": 0,
        "frozen": false
      }
    ]
  },
  {
    "name": "14. Both need it",
    "group": "Prototype",
    "width": 13,
    "height": 10,
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
        "name": "thin-splitter",
        "rotation": 3,
        "frozen": false
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
        "frozen": false
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
        "frozen": false
      },
      {
        "i": 9,
        "j": 2,
        "name": "mine",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 9,
        "j": 4,
        "name": "detector",
        "rotation": 0,
        "frozen": false
      },
      {
        "i": 9,
        "j": 6,
        "name": "detector",
        "rotation": 0,
        "frozen": false
      }
    ]
  },
  {
    "name": "Sugar vs mirrors",
    "group": "Examples",
    "width": 13,
    "height": 10,
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
    "group": "Puzzles",
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
        "frozen": false
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
    "group": "Puzzles",
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
        "frozen": false
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
    "group": "Various",
    "width": 13,
    "height": 10,
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
  }
];
