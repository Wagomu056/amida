const define = {};
Object.defineProperty(define, 'canvasWidth', {
  value: 1200.0, writable: false
});
Object.defineProperty(define, 'treeBlockHeight', {
  value: 30, writable: false
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

{
  'use strict'
  function random() {
      return Math.floor(Math.random() * 2);
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

  function drawAmida() {
      const canvas = document.getElementById('canvas');
      if (!canvas || !canvas.getContext){
          return;
      }

      const parameters = getURLParameters();
      const parameterNum = Object.keys(parameters).length;

      const Tree = parameterNum;
      const TreeBlockCount = 15;

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'black';

      let verticalLines = [];
      for (let i = 0; i < Tree; i++) {
        verticalLines[i] = new VerticalLine(i, TreeBlockCount, Tree);
        verticalLines[i].draw(ctx, 1.0);
      }
  }

  drawAmida();
}