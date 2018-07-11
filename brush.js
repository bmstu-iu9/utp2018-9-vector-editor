'use strict';

let shape,shiftX,shiftY,x,y,path;
let isDrawing=false;
let brush = document.getElementById('brush');

svgPanel.onmousedown = startDrawing;
svgPanel.onmouseup = stopDrawing;
svgPanel.onmousemove = draw;


function startDrawing(event){
  if(!brush.checked)
    return;
  isDrawing = true;
  shiftX = getMouseCoords(event).x;
  shiftY = getMouseCoords(event).y;
  shape = document.createElementNS(svgNS, "path");
  shape.setAttribute('fill','none');
  shape.setAttribute('stroke-width','10');
  shape.setAttribute('stroke','black');
  shape.setAttribute('stroke-linecap','round');
  path='M '+shiftX+' '+shiftY+' L ';
  svgPanel.appendChild(shape);
}

function draw(event){
  if(isDrawing) {
    x=getMouseCoords(event).x;
    y=getMouseCoords(event).y;
    path+=x+' '+y+' ';
    shape.setAttribute('d',path);
  }
}

function stopDrawing() {
  isDrawing = false;
}
