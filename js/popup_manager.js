export class PopupManager {
  constructor(popupElem, nextLevelCallback) {
    this.popupElem = popupElem;
    this.nextLevel = nextLevelCallback;
    this.bindEvents();
  }

  toggle(shown, buttons) {
    this.popupElem.classed('popup--shown', shown);
  }

  popup(content, buttons) {
    this.popupElem.select('.popup-content')
      .html(content);
    // Toggle button visibility
    this.popupElem.select('.popup-buttons .popup-action--close')
      .classed('hidden', !buttons.close);
    this.popupElem.select('.popup-buttons .popup-action--next-level')
      .classed('hidden', !buttons.nextLevel);
    this.toggle(true);
  }

  bindEvents() {
    const popupManager = this;
    this.popupElem.selectAll('.popup-action--close')
      .on('click', () => {
        popupManager.toggle(false);
      });
    this.popupElem.selectAll('.popup-action--next-level')
      .on('click', () => {
        popupManager.toggle(false);
        this.nextLevel();
      })
  }
}
