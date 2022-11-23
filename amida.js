'use strict'

import { ArrivalNameBox } from './arrival-name-box.js';
import { NameCollector } from './name-collector.js';
import { StartingNameButton } from './starting-name-button.js';
import { shuffle, getRandomInt, playAnimation } from "./utils.js";

const define = {};
Object.defineProperty(define, 'canvasWidth', {
  value: 1200.0, writable: false
});
Object.defineProperty(define, 'treeBlockHeight', {
  value: 30, writable: false
});
Object.defineProperty(define, 'treeBlockCount', {
  value: 15, writable: false
});

const LINE_COLORS = [
  '#FC0Fc0',
  '#C0Fc0F',
  '#0FC0FC',
  '#CF0CF0',
  '#F0CF0C',
  '#0CF0CF',
  '#F30F30',
  '#4B0FFC',
];

// get parameters ---------------
function getURLParameters() {
  if (document.location.search.length === 0) {
    console.log("URL paramer is zero");
    return null;
  }

  var query = document.location.search.substring(1);
  var parameters = query.split('&');

  var result = new Object();
  for (var i = 0; i < parameters.length; i++) {
    var element = parameters[i].split('=');

    var paramName = decodeURIComponent(element[0]);
    var paramValue = decodeURIComponent(element[1]);

    result[paramName] = decodeURIComponent(paramValue);
  }
  return result;
}

// title
function setOpenerNameTitle(name) {
    const targetNameContents = document.getElementById('target_name_contents');
    if (targetNameContents === null) {
      return;
    }

    let childNodes = targetNameContents.childNodes;
    childNodes[3].childNodes[0].textContent = name;
    playAnimation(childNodes[3].childNodes[0], "flash");
}

// starting name button
function createStartingNameButton(nameCollector, arrivalNameBox) {
  let startingNameButton = new StartingNameButton(
    'fromNameList', nameCollector, LINE_COLORS);

  let onClickCallback = function(startIdx) {
    startingNameButton.setIsAllowClick(false);

    let traceInfo = createTraceLineDrawers(ctx, verticalLines, horizontalLines, startIdx);

    onTraceEndFunction = async function() {
      await new Promise(s => setTimeout(s, 100));

      let distIdx = traceInfo.distIdx;
      arrivalNameBox.open(distIdx, LINE_COLORS[startIdx]);

      // @todo
      // wait for finish anim
      await new Promise(s => setTimeout(s, 2000));

      startingNameButton.setIsAllowClick(true);
      if (nameCollector.isEndOpener()) {
        setOpenerNameTitle("End");
      }
      else {
        nameCollector.nextOpener();
        setOpenerNameTitle(nameCollector.getCurrentOpenerName());
      }
    };

    currentDrawingIdx = 0;
    routeLines = traceInfo.routeLines;
    window.requestAnimationFrame(drawTraceLineLoop);
  };
  
  startingNameButton.addButtons(onClickCallback);
}

// arrival name box
function createArrivalNameBox(nameCollector, isShuffle) {
  let arrivalNameBox = new ArrivalNameBox(
    'distNameList', nameCollector, isShuffle);
  arrivalNameBox.addBoxes();

  return arrivalNameBox;
}

// line core
class Line {
  constructor(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }
}

class LineFactory {
  static createVerticalLine(idxX, idxY, treeNum) {
    const gap = define.canvasWidth / treeNum;
    const offset = gap * 0.5;
    let x1 = idxX * gap + offset;
    let y1 = idxY * define.treeBlockHeight;
    let x2 = x1;
    let y2 = y1 + define.treeBlockHeight;

    return new Line(x1, y1, x2, y2);
  }

  static createHorizontalLine(xIdx, yIdx, treeNum) {
    const gap = define.canvasWidth / treeNum;
    const offset = gap * 0.5;
    let x1 = xIdx * gap + offset;
    let x2 = x1 + gap;
    let y1 = (yIdx + 1) * define.treeBlockHeight;
    let y2 = y1;

    return new Line(x1, y1, x2, y2);
  }
}

class LineDrawer {
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

// line drawer
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

class ReverseLineDrawer extends LineDrawer {
  constructor(line) {
    super(line);

    this.startX = line.x2;
    this.startY = line.y2;
    this.goalX = line.x1;
    this.goalY = line.y1;

    this.init();
  }
}

// global vars
var ctx;
var verticalLines;
var horizontalLines;

// draw line ---------------
function createVerticalLines(nameNum) {
    let verticalLines = [];
    for (let x = 0; x < nameNum; x++) {
      verticalLines[x] = [];
      for (let y = 0; y < define.treeBlockCount; y++) {
        verticalLines[x][y] = LineFactory.createVerticalLine(x, y, nameNum);
      }
    }
    return verticalLines;
}

function drawVerticalLine(ctx, verticalLines) {
    ctx.strokeStyle = 'black';
    for (const line of verticalLines) {
      for (const lineBlock of line) {
        new NormalLineDrawer(lineBlock, false).draw(ctx);
      }
    }
}

function createHorizontalLines(xNum, yNum, nameNum) {
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
    while (lineNum > 0) {
      if (indexes.length < lineNum) {
        break;
      }

      let y = indexes.pop();
      borders[x][y] = LineFactory.createHorizontalLine(x, y, nameNum);
      lineNum -= 1;
    }
  }

  return borders;
}

function drawHorizontalLines(ctx, borders) {
  ctx.strokeStyle = 'black';

  let xCount = borders.length;
  for (let x = 0; x < xCount; x++) {
    let yCount = borders[x].length;
    for (let y = 0; y < yCount; y++) {
      if (borders[x][y] !== null) {
        new NormalLineDrawer(borders[x][y]).draw(ctx);
      }
    }
  }
}

function createTraceLineDrawers(ctx, verticalLines, horizontalLines, startX) {
  ctx.strokeStyle = LINE_COLORS[(startX % LINE_COLORS.length)];
  ctx.lineWidth = 5;

  let lastVIdx = verticalLines.length - 1;
  let maxHorizontalCount = define.treeBlockCount - 1;

  let routeLines = [];
  let x = startX;
  for (let y = 0; y < define.treeBlockCount; y++) {
    routeLines.push(new NormalLineDrawer(verticalLines[x][y]));

    if (y < maxHorizontalCount) {
      if (x < lastVIdx) {
        if (horizontalLines[x][y] !== null) {
          routeLines.push(new NormalLineDrawer(horizontalLines[x][y]));
          x += 1;
          continue;
        }
      }

      if (x > 0) {
        if (horizontalLines[x - 1][y] !== null) {
          routeLines.push(new ReverseLineDrawer(horizontalLines[x - 1][y]));
          x -= 1;
          continue;
        }
      }
    }
  }

  return {distIdx: x, routeLines: routeLines};
}

var currentDrawingIdx;
var routeLines;
var onTraceEndFunction = null;
function drawTraceLineLoop() {
  if (currentDrawingIdx >= routeLines.length ) {
    if (onTraceEndFunction !== null) {
      onTraceEndFunction();
    }
    return;
  }

  let isFinish = routeLines[currentDrawingIdx].drawBySeed(ctx, 5);

  if (isFinish) {
    currentDrawingIdx += 1;
  }

  window.requestAnimationFrame(drawTraceLineLoop);
}

// main ----------
function main()
{
  const parameters = getURLParameters();
  let isRealMode = false;
  if ("isRealMode" in parameters) {
    let realModeVal = Number(parameters["isRealMode"]);
    isRealMode = (realModeVal > 0);
  }

  let nameCollector = new NameCollector(parameters, true);
  const nameNum = nameCollector.getNameNum();
  if (nameNum < 2) {
    return;
  }

  setOpenerNameTitle(nameCollector.getCurrentOpenerName());

  let isShuffle = isRealMode;
  let arrivalNameBox = createArrivalNameBox(nameCollector, isShuffle);
  createStartingNameButton(nameCollector, arrivalNameBox);

  const canvas = document.getElementById('canvas');
  if (!canvas || !canvas.getContext){
      return;
  }
  ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  verticalLines = createVerticalLines(nameNum);
  drawVerticalLine(ctx, verticalLines);

  horizontalLines = createHorizontalLines(
    nameNum - 1,
    define.treeBlockCount - 1,
    nameNum);
  drawHorizontalLines(ctx, horizontalLines);
}

main();