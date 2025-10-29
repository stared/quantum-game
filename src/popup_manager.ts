import type {D3Selection} from './types';

interface PopupButtons {
  close: boolean;
  nextLevel: boolean;
}

export class PopupManager {
  private popupElem: D3Selection;
  private nextLevel: () => void;

  constructor(popupElem: D3Selection, nextLevelCallback: () => void) {
    this.popupElem = popupElem;
    this.nextLevel = nextLevelCallback;
    this.bindEvents();
  }

  toggle(shown: boolean): void {
    this.popupElem.classed('popup--shown', shown);
  }

  popup(content: string, buttons: PopupButtons): void {
    this.popupElem.select('.popup-content')
      .html(content);
    // Toggle button visibility
    this.popupElem.select('.popup-buttons .popup-action--close')
      .classed('hidden', !buttons.close);
    this.popupElem.select('.popup-buttons .popup-action--next-level')
      .classed('hidden', !buttons.nextLevel);
    this.toggle(true);
  }

  bindEvents(): void {
    this.popupElem.selectAll('.popup-action--close')
      .on('click', () => {
        this.toggle(false);
      });
    this.popupElem.selectAll('.popup-action--next-level')
      .on('click', () => {
        this.toggle(false);
        this.nextLevel();
      })
  }
}
