/*global window:false*/
import {displayMessageTimeout} from './config';

// TODO(migdal): passing that many selectors is nasty - refactor
export class TitleManager {
  constructor(titleElem, subtitleElem, levelNumberElem, navigationControls, blinkSvg) {
    this.titleElem = titleElem;
    this.subtitleElem = subtitleElem;
    this.messageElem = this.subtitleElem.select('.subtitle-message');
    this.levelNumberElem = levelNumberElem;
    this.defaultMessage = '';
    this.navigationControls = navigationControls;
    this.blinkSvg = blinkSvg;
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
    const navigationControls = this.navigationControls;
    navigationControls.select('.next-level')
      .on('click', nextLevelCallback);
  }

  showNextLevelButton(ifShow) {
    // Show next level button?
    this.navigationControls.select('.next-level').classed('hidden', !ifShow);
    this.blinkSvg.classed('hidden', !ifShow);
  }

}
