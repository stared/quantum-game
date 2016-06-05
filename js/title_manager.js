/*global window:false*/
import {displayMessageTimeout} from './config';

export class TitleManager {
  constructor(titleElem, subtitleElem, levelNumberElem) {
    this.titleElem = titleElem;
    this.subtitleElem = subtitleElem;
    this.messageElem = this.subtitleElem.select('.subtitle-message');
    this.levelNumberElem = levelNumberElem;
    this.defaultMessage = '';
  }

  setTitle(title) {
    this.titleElem.html(title);
  }

  setLevelNumber(levelNumber) {
    this.levelNumberElem.html(levelNumber);
  }

  setDefaultMessage(message, type) {
    this.messageElem.interrupt();
    this.defaultMessage = message;
    this.displayMessage(message, type, -1);
  }

  displayMessage(message, type, timeout = displayMessageTimeout) {
    this.messageElem.interrupt().style('opacity', 1);
    this.messageElem
      .text(message)
      .classed('message-success', type === 'success')
      .classed('message-failure', type === 'failure')
      .classed('message-progress', type === 'progress');
    if (timeout > 0) {
      this.messageElem.transition().duration(displayMessageTimeout)
        .style('opacity', 0)
        .delay(displayMessageTimeout)
        .style('opacity', 1)
        .text(this.defaultMessage);
    }
  }
}
