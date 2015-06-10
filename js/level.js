export class Level {
  constructor(levelRecipe) {
    this.name = levelRecipe.name;
    this.group = levelRecipe.group;
    this.width = levelRecipe.width;
    this.height = levelRecipe.height;
    this.tileRecipes = levelRecipe.tiles;
  }
}

export const levels = [
  {
    name:   "Test1",
    group:  "Blah blah",
    width:  13,
    height: 10,
    tiles: [
      {i: 2, j: 3, name: 'Source', frozen: true},
      {i: 4, j: 3, name: 'ThinBeamSplitter', rotation: 1},

      {i: 0, j: 0, name: 'ThinMirror'},
      {i: 0, j: 1, name: 'ThinSplitter'},
      {i: 0, j: 2, name: 'PolarizingSplitter'},
      {i: 0, j: 3, name: 'CornerCube'},
      {i: 0, j: 4, name: 'Polarizer'},
      {i: 0, j: 5, name: 'PhasePlate'},
      {i: 0, j: 6, name: 'SugarSolution'},
      {i: 0, j: 7, name: 'Mine'},
      {i: 0, j: 8, name: 'Rock'},
      {i: 0, j: 9, name: 'Glass'},
      {i: 1, j: 0, name: 'VacuumJar'},
      {i: 1, j: 1, name: 'Absorber'},
      {i: 1, j: 2, name: 'Detector'},

      {i: 8, j: 0, name: 'ThinMirror'},
      {i: 8, j: 1, name: 'ThinSplitter'},
      {i: 8, j: 2, name: 'PolarizingSplitter'},
      {i: 8, j: 3, name: 'CornerCube'},

      {i: 4, j: 3, name: 'ThinSplitter', rotation: 1},
      {i: 5, j: 3, name: 'ThinSplitter', rotation: 1},
      {i: 6, j: 3, name: 'Rock'},
    ]
  },
  {
    name:   "Only source",
    group:  "Blah blah",
    width:  13,
    height: 10,
    tiles: [
      {i: 0, j: 0, name: 'Source'},
    ]
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
  }
];
