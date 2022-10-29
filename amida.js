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
  constructor(idxX, countY, treeNum) {
    const gap = define.canvasWidth / treeNum;
    const offset = gap * 0.5;
    this.x = (idxX * gap + offset);
    this.y = (define.treeBlockHeight * countY);
  }

  draw(ctx, drawRatio) {
    ctx.beginPath();
    ctx.moveTo(this.x, 0);
    ctx.lineTo(this.x, this.y * drawRatio);
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

function drawAmida(ctx, nameNum) {
    ctx.strokeStyle = 'black';

    let verticalLines = [];
    for (let i = 0; i < nameNum; i++) {
      verticalLines[i] = new VerticalLine(i, define.treeBlockCount, nameNum);
      verticalLines[i].draw(ctx, 1.0);
    }
}

function drawHorizontalBorder(ctx, borders, nameNum) {
  ctx.strokeStyle = 'black';

  let lines = [];
  let xCount = borders.length;
  for (let x = 0; x < xCount; x++) {
    lines[x] = [];
    let yCount = borders[x].length;
    for (let y = 0; y < yCount; y++) {
      if (borders[x][y] === 1) {
        lines[x][y] = new HorizontalLine(x, y, nameNum);
        lines[x][y].draw(ctx, 1.0);
      }
    }
  }
}

function createHorizontalBorder(xNum, yNum) {
  let borders = [];
  for (let x = 0; x < xNum; x++) {
    borders[x] = [];
    for (let y = 0; y < yNum; y++) {
      // If next to left, exclude.
      if (x > 0) {
        if (borders[x - 1][y] === 1) {
          borders[x][y] = 0;
          continue;
        }
      }

      if (Math.random() <= 0.2) {
        borders[x][y] = 1;
      } else {
        borders[x][y] = 0;
      }
    }
  }
  return borders;
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
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawAmida(ctx, nameNum);

  let borders = createHorizontalBorder(nameNum - 1, define.treeBlockCount - 1);
  drawHorizontalBorder(ctx, borders, nameNum);
}

main();