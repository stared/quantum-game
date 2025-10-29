export class Storage {
  private ls: globalThis.Storage;

  constructor() {
    this.ls = window.localStorage;
  }

  setLevelProgress(levelId: string, boardExport: unknown): void {
    this.ls.setItem(
      `LevelProgress ${levelId}`,
      JSON.stringify(boardExport),
    );
  }

  hasLevelProgress(levelId: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.ls, `LevelProgress ${levelId}`);
  }

  getLevelProgress(levelId: string): unknown {
    const content = this.ls.getItem(`LevelProgress ${levelId}`);
    if (content == null) {
      throw new Error(`No data for levelId: ${levelId}`);
    }
    return JSON.parse(this.ls.getItem(`LevelProgress ${levelId}`) as string);
  }

  setLevelIsWon(levelId: string, value = true): void {
    this.ls.setItem(`LevelIsWon ${levelId}`, String(value));
  }

  getLevelIsWon(levelId: string): boolean {
    return this.ls.getItem(`LevelIsWon ${levelId}`) === 'true';
  }

  setCurrentLevelId(levelId: string): void {
    this.ls.setItem('CurrentLevelId', levelId);
  }

  getCurrentLevelId(): string | null {
    return this.ls.getItem('CurrentLevelId');
  }

  // TODO(migdal) accesible levels

}
