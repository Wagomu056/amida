'use strict'

import { ArrivalNameBox } from './arrival-name-box.js';
import { NameCollector } from './name-collector.js';
import { StartingNameButton } from './starting-name-button.js';
import { VerticalDrawer } from './vertical-line-drawer.js';
import { HorizontalLineDrawer } from './horizontal-line-drawer.js';
import { playAnimation } from "./utils.js";
import { TraceLineDrawer } from './trace-line-drawer.js';

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
function createStartingNameButton(ctx, nameCollector, arrivalNameBox) {
  let startingNameButton = new StartingNameButton(
    'fromNameList', nameCollector, LINE_COLORS);

  let onClickCallback = function(startIdx, color) {
    startingNameButton.setIsAllowClick(false);

    let traceLineDrawer = new TraceLineDrawer(
      ctx, verticalLineDrawer, horizontalLineDrawer, startIdx);
    let distIdx = traceLineDrawer.getDistIndex();

    let onTraceEndFunction = async function() {
      await new Promise(s => setTimeout(s, 100));

      arrivalNameBox.open(distIdx, color);

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

    traceLineDrawer.traceStart(onTraceEndFunction, color);
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

  const canvas = document.getElementById('canvas');
  if (!canvas || !canvas.getContext){
      return;
  }
  let ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // title
  setOpenerNameTitle(nameCollector.getCurrentOpenerName());

  // names
  let isShuffle = isRealMode;
  let arrivalNameBox = createArrivalNameBox(nameCollector, isShuffle);
  createStartingNameButton(ctx, nameCollector, arrivalNameBox);

  // lines
  verticalLineDrawer = new VerticalDrawer(ctx, nameNum);
  verticalLineDrawer.draw();

  horizontalLineDrawer = new HorizontalLineDrawer(ctx, nameNum);
  horizontalLineDrawer.draw();
}

main();