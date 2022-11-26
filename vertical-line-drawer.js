import { LineFactory, LineDrawer } from './line-core.js';

class NormalLineDrawer extends LineDrawer {
  constructor(line) {
    super(line);

    this.startX = line.x1;
    this.startY = line.y1;
    this.goalX = line.x2;
    this.goalY = line.y2;

    this.init();
  }
}

export class VerticalDrawer {
  constructor(ctx, canvasWidth, nameNum, treeBlockCount) {
    let verticalLines = [];
    for (let x = 0; x < nameNum; x++) {
      verticalLines[x] = [];
      for (let y = 0; y < treeBlockCount; y++) {
        verticalLines[x][y] = LineFactory.createVerticalLine(
          canvasWidth, x, y, nameNum);
      }
    }

    this.verticalLines = verticalLines;
    this.ctx = ctx;
  }

  draw() {
    this.ctx.strokeStyle = 'black';
    for (const line of this.verticalLines) {
      for (const lineBlock of line) {
        new NormalLineDrawer(lineBlock, false).draw(this.ctx);
      }
    }
  }

  getLineNum() {
    return this.verticalLines.length;
  }

  getLine(x, y) {
    return this.verticalLines[x][y];
  }
}