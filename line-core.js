export const TREE_BLOCK_HEIGHT = 30;
export const TREE_BLOCK_COUNT = 15;

export class Line {
  constructor(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }
}

export class LineDrawer {
  static getDir(from, to) {
    if (from === to) { return 0; }

    let val = to - from;
    if (val > 0) { return 1; }
    else { return -1; }
  }

  constructor(line) {
    this.line = line;
  }

  init() {
    this.currentX = this.startX;
    this.currentY = this.startY;
    this.dirX = LineDrawer.getDir(this.startX, this.goalX);
    this.dirY = LineDrawer.getDir(this.startY, this.goalY);

    this.isVertical = (this.currentX === this.goalX);
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.line.x1, this.line.y1);
    ctx.lineTo(this.line.x2, this.line.y2);
    ctx.stroke();
  }

  checkArrive(current, goal, speed) {
    let diff = Math.abs(goal - current);
    return (diff < speed);
  }

  drawBySeed(ctx, speed) {
    ctx.beginPath();

    let isFinish = false;
    this.currentX += speed * this.dirX;
    if (this.dirX !== 0 && this.checkArrive(this.currentX, this.goalX, speed)) {
      this.currentX = this.goalX;
      isFinish = true;
    }

    this.currentY += speed * this.dirY;
    if (this.dirY !== 0 && this.checkArrive(this.currentY, this.goalY, speed)) {
      this.currentY = this.goalY;
      isFinish = true;
    }

    ctx.moveTo(this.startX, this.startY);
    ctx.lineTo(this.currentX, this.currentY);

    ctx.stroke();

    // 縦描画は差分だけ描いたほうがギザギザにならない
    if (this.isVertical) {
      this.startX = this.currentX + (1 * this.dirX * -1);
      this.startY = this.currentY + (1 * this.dirY * -1);
    }

    // 描き切ったときに、改めてstartからgoalまで描画することでギザギザしないようにする
    if (isFinish) {
      this.draw(ctx);
    }

    return isFinish;
  }
}

export class NormalLineDrawer extends LineDrawer {
  constructor(line) {
    super(line);

    this.startX = line.x1;
    this.startY = line.y1;
    this.goalX = line.x2;
    this.goalY = line.y2;

    this.init();
  }
}

export class ReverseLineDrawer extends LineDrawer {
  constructor(line) {
    super(line);

    this.startX = line.x2;
    this.startY = line.y2;
    this.goalX = line.x1;
    this.goalY = line.y1;

    this.init();
  }
}
