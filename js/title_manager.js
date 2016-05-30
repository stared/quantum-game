/*global window:false*/
import {displayMessageTimeout} from './config';

export class TitleManager {
  constructor(titleElem, subtitleElem, levelNumberElem) {
    this.titleElem = titleElem;
    this.subtitleElem = subtitleElem;
    this.messageElem = this.subtitleElem.select('.subtitle-message');
    this.levelNumberElem = levelNumberElem;
  }

  setTitle(title) {
    this.titleElem.html(title);
  }

  setLevelNumber(levelNumber) {
    this.levelNumberElem.html(levelNumber);
  }

  displayMessage(message, type, timeout = displayMessageTimeout) {
    this.messageElem
      .html(message)
      .classed('message-success', type === 'success')
      .classed('message-failure', type === 'failure')
      .classed('message-progress', type === 'progress');
    this.messageElem.interrupt().style('opacity', 1);
    if (timeout > 0) {
      this.messageElem.transition().duration(displayMessageTimeout)
        .style('opacity', 0);
    }
  }
}
