// level-level logger
// TODO also a general level logger

// NSA approves!
// PiS tez!

type LogEntry = [string, number, Record<string, unknown>];

export class Logger {
  private log: LogEntry[] = [];
  private time0: number = +(new Date());

  constructor(_databaseConnector?: unknown) {
    this.reset();
    this.logAction('loggingStarted', {clientAbsTime: (new Date()).toISOString()});
  }

  logAction(actionName: string, dict: Record<string, unknown> = {}): void {
    this.log.push([actionName, +(new Date()) - this.time0, dict]);
  }

  reset(): void {
    this.log = [];
    this.time0 = +(new Date());
  }

  save(): void {
    // save to DB
  }

}
