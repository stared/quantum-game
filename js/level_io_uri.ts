import type {LevelRecipe, TileRecipe} from './types';

// NOTE could be done automatically, but mnemotechnics may make sense
const tileAbbreviations: [string, string][] = [
  ['Vacuum', 'u'],
  ['Source', 's'],
  ['CornerCube', 'x'],
  ['ThinMirror', 't'],
  ['ThinSplitter', 'h'],
  ['ThinSplitterCoated', 'c'],
  ['PolarizingSplitter', 'b'],
  ['PolarizerNS', 'p'],
  ['PolarizerWE', 'l'],
  ['QuarterWavePlateNS', 'q'],
  ['QuarterWavePlateWE', 'w'],
  ['SugarSolution', 'g'],
  ['DoubleSugarSolution', 'i'],
  ['Mine', 'm'],
  ['Rock', 'k'],
  ['Glass', 'a'],
  ['VacuumJar', 'v'],
  ['Absorber', 'o'],
  ['Detector', 'd'],
  ['DetectorFour', 'e'],
  ['FaradayRotator', 'f'],
];

// export only for tests
export const name2abbr = Object.fromEntries(tileAbbreviations);
const abbr2name = Object.fromEntries(
  tileAbbreviations.map((each) => [each[1], each[0]])
);

const vacuumCode = name2abbr['Vacuum'] + '0';

// e.g. {name: 'Source', frozen: true, rotation: 2} -> 'S2'
export const encodeTile = (tileRecipe: TileRecipe): string => {
  let s = name2abbr[tileRecipe.name];
  if (tileRecipe.frozen) {
    s = s.toUpperCase();
  }
  return `${s}${tileRecipe.rotation.toFixed(0)}`;
}

// e.g. 'S2' -> {name: 'Source', frozen: true, rotation: 2}
export const decodeTile = (abbrRot: string): TileRecipe => ({
  name:     abbr2name[abbrRot[0]!.toLowerCase()]!,
  frozen:   abbrRot[0] === abbrRot[0]!.toUpperCase(),
  rotation: parseInt(abbrRot[1]!) as 0 | 1 | 2 | 3,
  i: 0,
  j: 0,
});

const encodeKeyValue = (k: string, v: string | number): string =>
  `${k}=${window.encodeURIComponent(v)}`;

const serializeAllTiles = (tiles: TileRecipe[], width: number, height: number): string => {
  const tileMatrix = Array.from({length: height}, () =>
    Array.from({length: width}, () => vacuumCode)
  );
  tiles.forEach((tileRecipe) => {
    tileMatrix[tileRecipe.j][tileRecipe.i] = encodeTile(tileRecipe);
  });
  return tileMatrix.flat().join('');
};

export const levelRecipe2queryString = (levelRecipe: LevelRecipe): string =>
  [
    ['n', levelRecipe.name],
    ['w', levelRecipe.width],
    ['h', levelRecipe.height],
    ['t', serializeAllTiles(levelRecipe.tiles, levelRecipe.width, levelRecipe.height)],
    // ['s', ...] for now without stock
  ]
  .map((each) => encodeKeyValue(each[0]!, each[1]!))
  .join('&');

// for one-letter keys
const parseQueryString = (queryString: string): Record<string, string> =>
   Object.fromEntries(
     queryString.split('&').map((s) => [s[0], decodeURIComponent(s.slice(2))])
   );

const parseAllTiles = (allTileString: string, width: number): TileRecipe[] =>
  Array.from({length: allTileString.length / 2}, (_, k) => ({
    i: k % width,
    j: Math.floor(k / width),
    t: allTileString.slice(2 * k, 2 * k + 2),
  }))
    .filter((tile) => tile.t !== vacuumCode)
    .map((tile) => {
      const res = decodeTile(tile.t);
      res.i = tile.i;
      res.j = tile.j;
      return res;
    });

export const queryString2levelRecipe = (queryString: string): LevelRecipe => {
  const params = parseQueryString(queryString);
  return {
    name:   params.n!,
    group:  'Shared',
    width:  parseInt(params.w!),
    height: parseInt(params.h!),
    tiles:  parseAllTiles(params.t!, parseInt(params.w!)),
  };
}

// Q:
// should I attach key? or version
// as I will add new elements
