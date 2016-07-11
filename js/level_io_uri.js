import _ from 'lodash';

// NOTE could be done automatically, but mnemotechnics may make sense
// just be sure to test it properly:
// - if letters are distinct
// - if each element is present
const tileAbbreviations = [
  ['Vacuum', 'u'],
  ['Source', 's'],
  ['CornerCube', 'x'],
  ['ThinMirror', 't'],
  ['ThinSplitter', 's'],
  ['ThinSplitterCoated', 'c'],
  ['PolarizingSplitter', 'b'],
  ['PolarizerNS', 'p'],
  ['PolarizerWE', 'l'],
  ['QuarterWavePlateNS', 'q'],
  ['QuarterWavePlateWE', 'w'],
  ['SugarSolution', 'g'],
  ['Mine', 'm'],
  ['Rock', 'k'],
  ['Glass', 'a'],
  ['VacuumJar', 'v'],
  ['Absorber', 'o'],
  ['Detector', 'd'],
  ['DetectorFour', 'e'],
  ['FaradayRotator', 'f'],
];

const name2abbr = _.fromPairs(tileAbbreviations);
const abbr2name = _(tileAbbreviations)
  .map((each) => [each[1], each[0]])
  .fromPairs()
  .value();

const vacuumCode = name2abbr['Vacuum'] + '0';

// e.g. {name: 'Source', frozen: true, rotation: 2} -> 'S2'
const encodeTile = (tileRecipe) => {
  let s = name2abbr[tileRecipe.name];
  if (tileRecipe.frozen) {
    s = s.toUpperCase();
  }
  return `${s}${tileRecipe.rotation.toFixed(0)}`;
}

// e.g. 'S2' -> {name: 'Source', frozen: true, rotation: 2}
const decodeTile = (abbrRot) => ({
  name:     abbr2name[abbrRot[0].toLowerCase()],
  frozen:   abbrRot[0] === abbrRot[0].toUpperCase(),
  rotation: parseInt(abbrRot[1]),
});

const encodeKeyValue = (k, v) =>
  `${k}=${window.encodeURIComponent(v)}`;

const serializeAllTiles = (tiles, width, height) => {
  const tileMatrix = _.range(height).map(() =>
    _.range(width).map(() => vacuumCode)
  );
  tiles.forEach((tileRecipe) => {
    tileMatrix[tileRecipe.j][tileRecipe.i] = encodeTile(tileRecipe);
  });
  return _(tileMatrix).flatten().join('');
};

export const levelRecipe2queryString = (levelRecipe) =>
  [
    ['n', levelRecipe.name],
    ['w', levelRecipe.width],
    ['h', levelRecipe.height],
    ['t', serializeAllTiles(levelRecipe.tiles, levelRecipe.width, levelRecipe.height)],
    // ['s', ...] for now without stock
  ]
  .map((each) => encodeKeyValue(each[0], each[1]))
  .join('&');

// for one-letter keys
const parseQueryString = (queryString) =>
   _(queryString.split('&'))
     .map((s) => [s[0], decodeURIComponent(s.slice(2))])
     .fromPairs()
     .value();

const parseAllTiles = (allTileString, width) =>
  _.range(allTileString.length / 2)
    .map((k) => ({
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

export const queryString2levelRecipe = (queryString) => {
  const params = parseQueryString(queryString);
  return {
    name:   params.n,
    group:  'Shared',
    id:     -1,  // maybe some hash?
    i:      -1,  // no idea
    next:   null,
    width:  parseInt(params.w),
    height: parseInt(params.h),
    tiles:  parseAllTiles(params.t, params.w),
  };
}

// Q:
// should I attach key? or version
// as I will add new elements
