export class Storage {
  constructor() {
    this.ls = window.localStorage;
  }

  // NOTE maybe levelCode as a level field/method?
  levelCode(level) {
    return `${level.group} ${level.name}`;
  }

  setLevelProgress(level, boardExport) {
    this.ls.setItem(
      `LevelProgress ${this.levelCode(level)}`,
      JSON.stringify(boardExport)
    );
  }

  hasLevelProgress(level) {
    return this.ls.hasOwnProperty(`LevelProgress ${this.levelCode(level)}`);
  }

  getLevelProgress(level) {
    return JSON.parse(this.ls.getItem(`LevelProgress ${this.levelCode(level)}`));
  }

  setLevelIsWon(level, value = true) {
    this.ls.setItem(`LevelIsWon ${this.levelCode(level)}`, String(value));
  }

  getLevelIsWon(level) {
    return this.ls.getItem(`LevelIsWon ${this.levelCode(level)}`) === 'true';
  }

  // TODO(migdal) last played
  // TODO(migdal) accesible levels

}
