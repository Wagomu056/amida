import { shuffle } from "./utils.js";

export class NameCollector {
  constructor(parameters, isRandom) {
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
    this.openIndexes = [];
    for (let i = 0; i < this.nameNum; i++) {
      this.openIndexes[i] = i;
    }

    if (isRandom) {
      shuffle(names);
      shuffle(names);
      shuffle(this.openIndexes);
      shuffle(this.openIndexes);
    }

    console.log("srcNames");
    for (let i = 0; i < this.nameNum; i++) {
      console.log(this.names[i]);
    }

    this.currentIdx = 0;
  }

  getCurrentIndex() {
    return this.openIndexes[this.currentIdx];
  }

  getCurrentName() {
    return this.names[this.getCurrentIndex()];
  }

  getNamebyIndex(idx) {
    return this.names[idx];
  }

  getNameNum() {
    return this.nameNum;
  }

  next() {
    if (!this.isEnd()) {
      this.currentIdx += 1;
    }
  }

  isEnd() {
    return (this.currentIdx === this.nameNum - 1);
  }
}
