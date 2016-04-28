export class Storage {
  constructor() {
    this.ls = window.localStorage;
  }

  setLevelProgress(levelId, boardExport) {
    this.ls.setItem(
      `LevelProgress ${levelId}`,
      JSON.stringify(boardExport)
    );
  }

  hasLevelProgress(levelId) {
    return this.ls.hasOwnProperty(`LevelProgress ${levelId}`);
  }

  getLevelProgress(levelId) {
    return JSON.parse(this.ls.getItem(`LevelProgress ${levelId}`));
  }

  setLevelIsWon(levelId, value = true) {
    this.ls.setItem(`LevelIsWon ${levelId}`, String(value));
  }

  getLevelIsWon(levelId) {
    return this.ls.getItem(`LevelIsWon ${levelId}`) === 'true';
  }

  setCurrentLevelId(levelId) {
    this.ls.setItem('CurrentLevelId', levelId);
  }

  getCurrentLevelId() {
    return this.ls.getItem('CurrentLevelId');
  }

  // TODO(migdal) accesible levels

}
