'use strict'

import { ArrivalNameBox } from './arrival-name-box.js';
import { NameCollector } from './name-collector.js';
import { StartingNameButton } from './starting-name-button.js';
import { LineDrawer } from './line-core.js';
import { VerticalDrawer } from './vertical-line-drawer.js';
import { HorizontalLineDrawer } from './horizontal-line-drawer.js';
import { playAnimation } from "./utils.js";

const define = {};
Object.defineProperty(define, 'canvasWidth', {
  value: 1200.0, writable: false
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

    let traceInfo = createTraceLineDrawers(ctx, verticalLineDrawer, horizontalLineDrawer, startIdx);

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

// draw line ---------------
function createTraceLineDrawers(ctx, verticalLineDrawer, horizontalLineDrawer, startX) {
  ctx.strokeStyle = LINE_COLORS[(startX % LINE_COLORS.length)];
  ctx.lineWidth = 5;

  let lastVIdx = verticalLineDrawer.getLineNum() - 1;
  let maxHorizontalCount = define.treeBlockCount - 1;

  let routeLines = [];
  let x = startX;
  for (let y = 0; y < define.treeBlockCount; y++) {
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
var verticalLineDrawer;
var horizontalLineDrawer;
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

  verticalLineDrawer = new VerticalDrawer(
    ctx, define.canvasWidth, nameNum, define.treeBlockCount);
  verticalLineDrawer.draw();

  horizontalLineDrawer = new HorizontalLineDrawer(
    ctx, nameNum, define.treeBlockCount);
  horizontalLineDrawer.draw();
}

main();