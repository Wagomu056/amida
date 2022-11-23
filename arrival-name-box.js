import { shuffle, getRandomInt } from "./utils.js";

export class ArrivalNameBox {
  constructor(parentElementName, nameCollector, lineColors, isShuffle) {
    this.parentElementName = parentElementName;
    this.nameCollector = nameCollector;
    this.lineColors = lineColors;
    this.isShuffle = isShuffle;

    if (isShuffle) {
      this.arrivalNameList = this.#createShuffleNameList(nameCollector);
    }
    else {
      this.arrivalNameList = this.#createNameList(nameCollector);
    }
    this.boxes = [];
  }

  addBoxes() {
    const distNameListElement = document.getElementById(this.parentElementName);
    if (distNameListElement === null) {
      return;
    }

    const nameNum = this.nameCollector.getNameNum();
    for (let i = 0; i < nameNum; i++) {
      let p = document.createElement('p');
      p.classList.add('item');

      let tp = document.createElement('p');
      tp.classList.add('name');
      tp.textContent = "　　　　　";
      tp.style.transform = "rotateX(-90deg)";
      p.appendChild(tp);
      this.boxes[i] = p;

      distNameListElement.appendChild(p);
    }
  }

  open(idx, boaderColor) {
    let box = this.boxes[idx];
    box.style.border = 'solid';
    box.style.borderColor = boaderColor;

    if (box.firstChild !== null) {
      box.firstChild.classList.add('flipIn');

      let nameListIdx;
      if (this.isShuffle) {
        nameListIdx = idx;
      }
      else {
        nameListIdx = this.nameCollector.getCurrentOpenerNameIndex();
      }
      box.firstChild.textContent = this.arrivalNameList[nameListIdx];
    }
  }

  #createNameList(nameCollector) {
    let nameList = [];
    let count = nameCollector.getNameNum();
    // 1 ~ (count - 1)
    let offset = 1 + getRandomInt(count - 2);
    for (let i = 0; i < count; i++) {
      let idx = ((i + offset) % count);
      nameList[i] = nameCollector.getName(idx);
    }

    console.log("DistNames");
    for (let i = 0; i < count; i++) {
      console.log(nameList[i]);
    }

    return nameList;
  }

  #createShuffleNameList(nameCollector) {
    let indexes = [];
    let nameNum = nameCollector.getNameNum();
    for (let i = 0; i < nameNum; i++) {
      indexes[i] = i;
    }

    shuffle(indexes);
    shuffle(indexes);

    let nameList = [];
    for (let i = 0; i < nameNum; i++) {
      nameList[i] = nameCollector.getName(indexes[i]);
    }

    return nameList;
  }
}