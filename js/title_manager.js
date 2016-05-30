/*global window:false*/
import {displayMessageTimeout} from './config';

export class TitleManager {
  constructor(titleElem, subtitleElem, levelNumberElem) {
    this.titleElem = titleElem;
    this.subtitleElem = subtitleElem;
    this.levelNumberElem = levelNumberElem;
    this.classChangeTimeout = null;
  }

  setTitle(title) {
    this.titleElem.html(title);
  }

  setLevelNumber(levelNumber) {
    this.levelNumberElem.html(levelNumber);
  }

  displayMessage(message, type, timeout = displayMessageTimeout) {
    this.subtitleElem.select('.subtitle-message')
      .html(message)
      .classed('message-success', type === 'success')
      .classed('message-failure', type === 'failure')
      .classed('message-progress', type === 'progress');
    this.subtitleElem.classed('message-is-on', true);
    if (this.classChangeTimeout) {
      window.clearTimeout(this.classChangeTimeout);
    }
    if (timeout > 0) {
      this.classChangeTimeout = setTimeout(() => {
        this.subtitleElem.classed('message-is-on', false);
      }, timeout);
    }
  }
}
