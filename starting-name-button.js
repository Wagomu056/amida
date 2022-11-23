import { NameCollector } from './name-collector.js';

const PLACE_HOLDER_STR = "　　　　　";
export class StartingNameButton {
  constructor(parentElementName, nameCollector, lineColors) {
    this.parentElementName = parentElementName;
    this.nameCollector = nameCollector;
    this.isAllowClick = true;
    this.lineColors = lineColors;
  }

  addButtons(onClickCallback) {
      const fromNameListElement = document.getElementById(this.parentElementName);
      if (fromNameListElement === null) {
        return;
      }

      const nameNum = this.nameCollector.getNameNum();
      for (let i = 0; i < nameNum; i++) {
        let button = document.createElement('button');
        button.classList.add('item');
        button.textContent = PLACE_HOLDER_STR;

        button.addEventListener('click', () => { 
          if (!this.isAllowClick) {
            return;
          }

          if (button.textContent !== PLACE_HOLDER_STR) {
            return;
          }

          button.textContent = this.nameCollector.getCurrentName();
          button.style.border = 'solid';
          button.style.borderColor = this.lineColors[i];

          if (onClickCallback !== null) {
            onClickCallback(i);
          }
        });

        fromNameListElement.appendChild(button);
      }
  }

  setIsAllowClick(isAllow) {
    this.isAllowClick = isAllow;
  }
}
