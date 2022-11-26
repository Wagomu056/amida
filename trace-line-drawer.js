import { NormalLineDrawer, ReverseLineDrawer, TREE_BLOCK_COUNT } from './line-core.js';

var currentDrawingIdx = 0;
var routeLines = [];
var onTraceEndCallback = null;
var ctx = null;

function drawTraceLineLoop() {
  if (currentDrawingIdx >= routeLines.length) {
    if (onTraceEndCallback !== null) {
      onTraceEndCallback();
    }
    return;
  }

  let isFinish = routeLines[currentDrawingIdx].drawBySeed(ctx, 5);

  if (isFinish) {
    currentDrawingIdx += 1;
  }

  window.requestAnimationFrame(drawTraceLineLoop);
}

export class TraceLineDrawer {
  constructor(ctx, verticalLineDrawer, horizontalLineDrawer, startX) {
    this.ctx = ctx;
    this.traceInfo = this.createTraceLineInfo(
      verticalLineDrawer, horizontalLineDrawer, startX
    );
  }

  createTraceLineInfo(verticalLineDrawer, horizontalLineDrawer, startX) {
    let lastVIdx = verticalLineDrawer.getLineNum() - 1;
    let maxHorizontalCount = TREE_BLOCK_COUNT - 1;

    let routeLines = [];
    let x = startX;
    for (let y = 0; y < TREE_BLOCK_COUNT; y++) {
      routeLines.push(new NormalLineDrawer(verticalLineDrawer.getLine(x, y)));

      if (y < maxHorizontalCount) {
        if (x < lastVIdx) {
          let line = horizontalLineDrawer.getLine(x, y);
          if (line !== null) {
            routeLines.push(new NormalLineDrawer(line));
            x += 1;
            continue;
          }
        }

        if (x > 0) {
          let line = horizontalLineDrawer.getLine(x - 1, y);
          if (line !== null) {
            routeLines.push(new ReverseLineDrawer(line));
            x -= 1;
            continue;
          }
        }
      }
    }

    return { distIdx: x, routeLines: routeLines };
  }

  traceStart(onTraceEndCallbackFunc, color) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 5;

    // @todo make to don't use global vars
    currentDrawingIdx = 0;
    routeLines = this.traceInfo.routeLines;
    onTraceEndCallback = onTraceEndCallbackFunc;
    ctx = this.ctx;

    window.requestAnimationFrame(drawTraceLineLoop);
  }

  getDistIndex() {
    return this.traceInfo.distIdx;
  }
}