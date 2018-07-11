/*Скрипт для работы инструмента "Рука"*/
/*Drag and Drop холста*/

'use strict';

const hand = document.getElementById("hand");

drawPanel.onmousedown = function(event) {
  if (!hand.checked) {
    return;
  }
  let coords = getBoxCoords(drawPanel);
  let shiftX = event.pageX - coords.left;
  let shiftY = event.pageY - coords.top;

  drawPanel.style.position = 'fixed';
  drawPanel.style.cursor = 'pointer';

  move(event);

  function move(event) {
    drawPanel.style.top = event.pageY - shiftY + 'px';
    drawPanel.style.left = event.pageX - shiftX + 'px';
  }

  document.onmousemove = function(event) {
    move(event);
  }

  drawPanel.onmouseup = function(event) {
    document.onmousemove = null;
    drawPanel.onmouseup = null;
    drawPanel.style.cursor = 'default';
  }

  drawPanel.ondragstart = function() {
    return false;
  };
}
