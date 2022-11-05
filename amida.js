'use strict'

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

class Line {
  constructor(x1, y1, x2, y2) {
    this.x = x1;
    this.y = y1;
    this.gapX = x2 - x1;
    this.gapY = y2 - y1;
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

class VerticalLine {
  constructor(idxX, idxY, treeNum) {
    this.line = LineFactory.createVerticalLine(idxX, idxY, treeNum);
  }

  draw(ctx, drawRatio) {
    ctx.beginPath();
    ctx.moveTo(this.line.x, this.line.y);
    ctx.lineTo(this.line.x, this.line.y + (this.line.gapY * drawRatio));
    ctx.stroke();
  }
}

class HorizontalLine {
  constructor(idxX, idxY, treeNum) {
    this.line = LineFactory.createHorizontalLine(idxX, idxY, treeNum);
  }

  draw(ctx, drawRatio) {
    ctx.beginPath();
    ctx.moveTo(this.line.x, this.line.y);
    ctx.lineTo(this.line.x + (this.line.gapX * drawRatio), this.line.y);
    ctx.stroke();
  }
}

// global vars
var ctx;
var verticalLines;
var horizontalLines;

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

function addSourceNameList(nameNum, parameters) {
    const fromNameListElement = document.getElementById('fromNameList');
    if (fromNameListElement === null) {
      return;
    }

    // add items that is source name
    for (let i = 0; i < nameNum; i++) {
      let button = document.createElement('button');
      button.classList.add('item');
      const keyName = 'name' + i;
      button.textContent = parameters[keyName];

      button.addEventListener('click', () => { startDrawRedLines(i); });

      fromNameListElement.appendChild(button);
    }
}

function addDistNameList(nameNum, parameters) {
    const distNameListElement = document.getElementById('distNameList');
    if (distNameListElement === null) {
      return;
    }

    // add items that is dist name
    for (let i = 0; i < nameNum; i++) {
      let p = document.createElement('p');
      p.classList.add('item');

      let tp = document.createElement('p');
      tp.classList.add('name');
      const keyName = 'name' + i;
      tp.textContent = parameters[keyName];
      tp.style.transform = "rotateX(-90deg)";
      p.appendChild(tp);

      distNameListElement.appendChild(p);
    }
}

function startFlipAnimation(element) {
  element.classList.add('flieIn');
}

function createVerticalLines(nameNum) {
    let verticalLines = [];
    for (let x = 0; x < nameNum; x++) {
      verticalLines[x] = [];
      for (let y = 0; y < define.treeBlockCount; y++) {
        verticalLines[x][y] = new VerticalLine(x, y, nameNum);
      }
    }
    return verticalLines;
}

function drawVerticalLine(ctx, verticalLines) {
    ctx.strokeStyle = 'black';
    for (const line of verticalLines) {
      for (const lineBlock of line) {
        lineBlock.draw(ctx, 1.0);
      }
    }
}

function drawHorizontalLines(ctx, borders) {
  ctx.strokeStyle = 'black';

  let xCount = borders.length;
  for (let x = 0; x < xCount; x++) {
    let yCount = borders[x].length;
    for (let y = 0; y < yCount; y++) {
      if (borders[x][y] !== null) {
        borders[x][y].draw(ctx, 1.0);
      }
    }
  }
}

function createHorizontalLines(xNum, yNum, nameNum) {
  let borders = [];
  for (let x = 0; x < xNum; x++) {
    borders[x] = [];
    for (let y = 0; y < yNum; y++) {
      // If next to left, exclude.
      if (x > 0) {
        if (borders[x - 1][y] !== null) {
          borders[x][y] = null;
          continue;
        }
      }

      if (Math.random() <= 0.2) {
        borders[x][y] = new HorizontalLine(x, y, nameNum);
      } else {
        borders[x][y] = null;
      }
    }
  }
  return borders;
}

const LineColors = [
  '#FC0Fc0',
  '#C0Fc0F',
  '#0FC0FC',
  '#CF0CF0',
  '#F0CF0C',
  '#0CF0CF',
  '#F30F30'
];

function drawRedLinesAll(ctx, verticalLines, horizontalLines, startX) {
  ctx.strokeStyle = LineColors[(startX % LineColors.length)];
  ctx.lineWidth = 2;

  let lastVIdx = verticalLines.length - 1;
  let maxHorizontalCount = define.treeBlockCount - 1;

  let routeLines = [];
  let x = startX;
  for (let y = 0; y < define.treeBlockCount; y++) {
    routeLines.push(verticalLines[x][y]);

    if (y < maxHorizontalCount) {
      if (x < lastVIdx) {
        if (horizontalLines[x][y] !== null) {
          routeLines.push(horizontalLines[x][y]);
          x += 1;
          continue;
        }
      }

      if (x > 0) {
        if (horizontalLines[x - 1][y] !== null) {
          routeLines.push(horizontalLines[x - 1][y]);
          x -= 1;
          continue;
        }
      }
    }
  }

  return {distIdx: x, routeLines: routeLines};
}

var currentDrawingIdx;
var currentDrawingRatio;
var routeLines;
function drawRedLineLoop() {
  if (currentDrawingIdx >= routeLines.length ) {
    return;
  }

  currentDrawingRatio += 0.3;
  if (currentDrawingRatio >= 1.0) {
    currentDrawingRatio = 1.0;
  }
  routeLines[currentDrawingIdx].draw(ctx, currentDrawingRatio);

  if (currentDrawingRatio === 1.0) {
    currentDrawingRatio = 0.0;
    currentDrawingIdx += 1;
  }

  window.requestAnimationFrame(drawRedLineLoop);
}


function setBorderColor(contentId, idx, color) {
    const contentList = document.getElementById(contentId);
    if (contentList === null) {
      return null;
    }

    if (contentList.hasChildNodes === false) {
      return null;
    }

    let children = contentList.childNodes;
    for (let i = 0; i < children.length; i++) {
        console.log(children[i]);
    }

    for (let i = 0; i < children.length; i++) {
      if (i === idx) {
        // idx 0 is "text"
        children[i + 1].style.border = 'solid';
        children[i + 1].style.borderColor = color;
        return children[i + 1];
      }
    }

    return null;
}

function startDrawRedLines(startIdx) {
  let color = LineColors[startIdx];
  setBorderColor('fromNameList', startIdx, color);
  let rootInfo = drawRedLinesAll(ctx, verticalLines, horizontalLines, startIdx);

  currentDrawingIdx = 0;
  currentDrawingRatio = 0.0;
  routeLines = rootInfo.routeLines;
  window.requestAnimationFrame(drawRedLineLoop);

  let distIdx = rootInfo.distIdx;
  let distItem = setBorderColor('distNameList', distIdx, color);
  if (distItem !== null) {
    if (distItem.firstChild !== null) {
      distItem.firstChild.classList.add('flipIn');
    }
  }
}

function main()
{
  const parameters = getURLParameters();
  const nameNum = Object.keys(parameters).length;
  if (nameNum < 2) {
    return;
  }

  addSourceNameList(nameNum, parameters);
  addDistNameList(nameNum, parameters);

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