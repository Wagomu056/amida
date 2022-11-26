import { shuffle } from "./utils.js";

export class NameCollector {
  constructor(parameters, isShuffle) {
    this.nameNum = 0;
    while(true) {
      let key = "name" + this.nameNum;
      if (!(key in parameters)) {
        break;
      }
      this.nameNum++;
    }

    let names = [];
    for (let i = 0; i < this.nameNum; i++) {
      const keyName = 'name' + i;
      names[i] = parameters[keyName];
    }
    this.names = names;

    // to change opener order to random
    this.openerNameIndexes = [];
    for (let i = 0; i < this.nameNum; i++) {
      this.openerNameIndexes[i] = i;
    }

    if (isShuffle) {
      shuffle(names);
      shuffle(names);
      shuffle(this.openerNameIndexes);
      shuffle(this.openerNameIndexes);
    }

    console.log("startingNames");
    for (let i = 0; i < this.nameNum; i++) {
      console.log(this.names[i]);
    }

    this.currentIdx = 0;
  }

  getCurrentOpenerNameIndex() {
    return this.openerNameIndexes[this.currentIdx];
  }

  getCurrentOpenerName() {
    return this.names[this.getCurrentOpenerNameIndex()];
  }

  getName(idx) {
    return this.names[idx];
  }

  getNameNum() {
    return this.nameNum;
  }

  nextOpener() {
    if (!this.isEndOpener()) {
      this.currentIdx += 1;
    }
  }

  isEndOpener() {
    return (this.currentIdx === this.nameNum - 1);
  }
}
