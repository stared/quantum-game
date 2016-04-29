export class PopupManager {
  constructor(popupElem) {
    this.popupElem = popupElem;
    this.bindCloseEvents();
  }
  
  toggle(shown) {
    this.popupElem.classed('popup--shown', shown);
  }
  
  popup(content) {
    this.popupElem.select('.popup-content')
      .html(content);
    this.toggle(true);
  }
  
  bindCloseEvents() {
    const popupManager = this;
    this.popupElem.selectAll('.popup-action--close')
      .on('click', function () {
        popupManager.toggle(false);
      });
  }
}
