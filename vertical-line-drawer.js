import { Line, NormalLineDrawer, TREE_BLOCK_HEIGHT, TREE_BLOCK_COUNT } from './line-core.js';

function createVerticalLine(idxX, idxY, gap) {
  const offset = gap * 0.5;
  let x1 = idxX * gap + offset;
  let y1 = idxY * TREE_BLOCK_HEIGHT;
  let x2 = x1;
  let y2 = y1 + TREE_BLOCK_HEIGHT;

  return new Line(x1, y1, x2, y2);
}

export class VerticalDrawer {
  constructor(ctx, nameNum) {
    let canvasWidth = ctx.canvas.clientWidth;

    let verticalLines = [];
    let verticalGap = (canvasWidth / nameNum);
    for (let x = 0; x < nameNum; x++) {
      verticalLines[x] = [];
      for (let y = 0; y < TREE_BLOCK_COUNT; y++) {
        verticalLines[x][y] = createVerticalLine(x, y, verticalGap);
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