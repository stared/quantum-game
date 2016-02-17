import _ from 'lodash';

// level-level logger
// TODO also a general level logger

// NSA approves!
// PiS tez!

export class Logger {

  constructor(databaseConnector) {
    this.reset();
    this.logAction('loggingStarted', {clientAbsTime: (new Date()).toISOString()});
  }

  logAction(actionName, dict = {}) {
    this.log.push([actionName, +(new Date()) - this.time0, dict]);
  }

  reset() {
    this.log = [];
    this.time0 = +(new Date());
  }

  save() {
    // save to DB
  }

}
