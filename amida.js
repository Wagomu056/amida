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

class VerticalLine {
  constructor(idxX, idxY, treeNum) {
    const gap = define.canvasWidth / treeNum;
    const offset = gap * 0.5;
    this.x = (idxX * gap + offset);
    this.y = idxY * define.treeBlockHeight;
  }

  draw(ctx, drawRatio) {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x, this.y + (define.treeBlockHeight * drawRatio));
    ctx.stroke();
  }
}

class HorizontalLine {
  constructor(xIdx, yIdx, treeNum) {
    const gap = define.canvasWidth / treeNum;
    const offset = gap * 0.5;
    this.xl = (xIdx * gap + offset);
    this.xr = ((xIdx + 1) * gap + offset);
    this.y = (yIdx + 1) * define.treeBlockHeight;
  }

  draw(ctx, drawRatio) {
    ctx.beginPath();
    ctx.moveTo(this.xl, this.y);
    ctx.lineTo(this.xr * drawRatio, this.y);
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
      const keyName = 'name' + i;
      p.textContent = parameters[keyName];
      distNameListElement.appendChild(p);
    }
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

function drawRedLines(ctx, verticalLines, horizontalLines, startX) {
  ctx.strokeStyle = LineColors[(startX % LineColors.length)];
  ctx.lineWidth = 2;

  let lastVIdx = verticalLines.length - 1;
  let maxHorizontalCount = define.treeBlockCount - 1;

  var x = startX;
  for (let y = 0; y < define.treeBlockCount; y++) {
    verticalLines[x][y].draw(ctx, 1.0);

    if (y < maxHorizontalCount) {
      if (x < lastVIdx) {
        if (horizontalLines[x][y] !== null) {
          horizontalLines[x][y].draw(ctx, 1.0);
          x += 1;
          continue;
        }
      }

      if (x > 0) {
        if (horizontalLines[x - 1][y] !== null) {
          horizontalLines[x - 1][y].draw(ctx, 1.0);
          x -= 1;
          continue;
        }
      }
    }
  }
}

function startDrawRedLines(startIdx) {
  drawRedLines(ctx, verticalLines, horizontalLines, startIdx);
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