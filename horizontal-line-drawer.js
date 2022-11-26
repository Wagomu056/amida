import { Line, NormalLineDrawer, TREE_BLOCK_HEIGHT, TREE_BLOCK_COUNT } from './line-core.js';
import { shuffle, getRandomInt } from "./utils.js";

function createHorizontalLine(xIdx, yIdx, length) {
  const offset = length * 0.5;
  let x1 = xIdx * length + offset;
  let x2 = x1 + length;
  let y1 = (yIdx + 1) * TREE_BLOCK_HEIGHT;
  let y2 = y1;

  return new Line(x1, y1, x2, y2);
}

export class HorizontalLineDrawer {
  constructor(ctx, nameNum) {
    this.ctx = ctx;

    let xNum = nameNum - 1;
    let yNum = TREE_BLOCK_COUNT - 1;
    this.horizontalLines = this.createHorizontalLines(
      xNum, yNum, nameNum, ctx.canvas.clientWidth);
  }

  createHorizontalLines(xNum, yNum, nameNum, canvasWidth) {
    let borders = [];
    for (let x = 0; x < xNum; x++) {
      borders[x] = [];
      for (let y = 0; y < yNum; y++) {
        borders[x][y] = null;
      }

      let indexes = [];
      for (let y = 0; y < yNum; y++) {
        if (x > 0 && borders[x - 1][y] !== null) {
          continue;
        }
        if (indexes.includes(y - 1) || indexes.includes(y - 2)) {
          continue;
        }
        indexes.push(y);
      }
      shuffle(indexes);

      let lineNum = 2 + getRandomInt(2);
      let lineLength = (canvasWidth / nameNum);
      while (lineNum > 0) {
        if (indexes.length < lineNum) {
          break;
        }

        let y = indexes.pop();
        borders[x][y] = createHorizontalLine(x, y, lineLength);
        lineNum -= 1;
      }
    }

    return borders;
  }

  draw() {
    this.ctx.strokeStyle = 'black';

    let borders = this.horizontalLines;
    let xCount = borders.length;
    for (let x = 0; x < xCount; x++) {
      let yCount = borders[x].length;
      for (let y = 0; y < yCount; y++) {
        if (borders[x][y] !== null) {
          new NormalLineDrawer(borders[x][y]).draw(this.ctx);
        }
      }
    }
  }

  getLine(x, y) {
    return this.horizontalLines[x][y];
  }
}