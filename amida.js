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

function drawAmida(nameNum) {
    const canvas = document.getElementById('canvas');
    if (!canvas || !canvas.getContext){
        return;
    }

    // draw amida to canvas
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'black';

    let verticalLines = [];
    for (let i = 0; i < nameNum; i++) {
      verticalLines[i] = new VerticalLine(i, define.treeBlockCount, nameNum);
      verticalLines[i].draw(ctx, 1.0);
    }
}

{
  const parameters = getURLParameters();
  const nameNum = Object.keys(parameters).length;
  if (nameNum !== 0) {
    addSourceNameList(nameNum, parameters);
    addDistNameList(nameNum, parameters);

    drawAmida(nameNum);
  }
}