import {displayMessageTimeout} from './config';
import type {D3Selection} from './types';

type MessageType = 'success' | 'failure' | 'progress';

// TODO(migdal): passing that many selectors is nasty - refactor
export class TitleManager {
  private titleBar: D3Selection;
  private titleElem: D3Selection;
  private levelNumberElem: D3Selection;
  public blinkSvg: D3Selection;
  private subtitleElem: D3Selection;
  private messageElem: D3Selection;
  private defaultMessage: string;

  constructor(titleBar: D3Selection, subtitleElem: D3Selection, blinkSvg: D3Selection) {
    this.titleBar = titleBar;
    this.titleElem = titleBar.select('.title-text');
    this.levelNumberElem = titleBar.select('.level-number');
    this.blinkSvg = blinkSvg;

    this.subtitleElem = subtitleElem;
    this.messageElem = this.subtitleElem.select('.subtitle-message');
    this.defaultMessage = '';
  }

  setTitle(title: string): void {
    this.titleElem.html(title);
  }

  setLevelNumber(levelNumber: string): void {
    this.levelNumberElem.html(levelNumber);
  }

  setDefaultMessage(message: string, type: MessageType): void {
    this.messageElem.interrupt();
    this.defaultMessage = message;
    this.displayMessage(message, type, -1);
  }

  displayMessage(message: string, type: MessageType, timeout = displayMessageTimeout): void {
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

  activateNextLevelButton(nextLevelCallback: () => void): void {
    const titleBar = this.titleBar;
    titleBar.select('.next-level')
      .on('click', nextLevelCallback);
  }

  showNextLevelButton(ifShow: boolean): void {
    // Show next level button?
    this.titleBar.select('.next-level').classed('hidden', !ifShow);
    this.blinkSvg.classed('hidden', !ifShow);
  }

}
