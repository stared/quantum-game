/*global window:false*/
import {displayMessageTimeout} from './config';

// TODO(migdal): passing that many selectors is nasty - refactor
export class TitleManager {
  constructor(titleBar, subtitleElem, blinkSvg) {
    this.titleBar = titleBar;
    this.titleElem = titleBar.select('.title-text');
    this.levelNumberElem = titleBar.select('.level-number');
    this.blinkSvg = blinkSvg;

    this.subtitleElem = subtitleElem;
    this.messageElem = this.subtitleElem.select('.subtitle-message');
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

  activateNextLevelButton(nextLevelCallback) {
    const titleBar = this.titleBar;
    titleBar.select('.next-level')
      .on('click', nextLevelCallback);
  }

  showNextLevelButton(ifShow) {
    // Show next level button?
    this.titleBar.select('.next-level').classed('hidden', !ifShow);
    this.blinkSvg.classed('hidden', !ifShow);
  }

}
