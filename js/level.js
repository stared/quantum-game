export class Level {
  constructor(levelRecipe) {
    this.name = levelRecipe.name;
    this.width = levelRecipe.width;
    this.height = levelRecipe.height;
    this.tileRecipes = levelRecipe.tiles;
  }
}

export const levels =  [
  {
    name:   "Test1",
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
    name:   "Test Beam splitters",
    width:  13,
    height: 10,
    tiles: [ 
      {i: 2, j: 3, name: 'Source', frozen: true},
      {i: 4, j: 3, name: 'ThinSplitter', rotation: 1},

      {i: 0, j: 0, name: 'ThinMirror'},
      {i: 0, j: 1, name: 'ThinSplitter'},
      {i: 0, j: 2, name: 'ThinSplitter'},
      {i: 0, j: 3, name: 'ThinSplitter'},
      {i: 0, j: 4, name: 'ThinSplitter', rotation: 3},
      {i: 0, j: 5, name: 'ThinSplitter', rotation: 3},
      {i: 0, j: 6, name: 'ThinSplitter'},
      {i: 0, j: 7, name: 'ThinSplitter'},
      {i: 0, j: 8, name: 'ThinSplitter'},
      {i: 0, j: 9, name: 'ThinSplitter'},
      {i: 1, j: 0, name: 'ThinSplitter', rotation: 2},
      {i: 1, j: 1, name: 'ThinSplitter'},
      {i: 1, j: 2, name: 'ThinSplitter'},

      {i: 8, j: 0, name: 'ThinSplitter'},
      {i: 8, j: 1, name: 'ThinSplitter'},
      {i: 8, j: 2, name: 'ThinSplitter'},
      {i: 8, j: 3, name: 'ThinSplitter'},

      {i: 4, j: 3, name: 'ThinSplitter', rotation: 1},
      {i: 5, j: 3, name: 'ThinSplitter', rotation: 1},
      {i: 6, j: 3, name: 'ThinSplitter'},
    ]
  }
];