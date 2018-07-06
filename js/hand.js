/*Скрипт для работы инструмента "Рука"*/
/*Drag and Drop холста*/

hand = document.getElementById("hand");
drawPanel = document.getElementById("draw-panel");

drawPanel.onmousedown = function(event) {
  if (!hand.checked) {
    return;
  }
  let coords = getCoords(drawPanel);
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

  function getCoords(elem) {
    let box = elem.getBoundingClientRect();
    return { top: box.top + pageYOffset, left: box.left + pageXOffset};
  }
}
