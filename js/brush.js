'use strict';

let shape,x,y,path;
let isDrawing=false;
let color='black',width,linecap='round',linejoin='round';
const brsh = document.getElementById('brush');


  const changeThickness = ()=>{
    width=document.getElementById('brush_width').value;
  };


  const start = (event)=> {
      changeThickness();
    if (!brsh.checked)
      return;
    drawPanel.addEventListener('mouseup',up);
    document.addEventListener('mousemove',move);
    isDrawing = true;
    x = getMouseCoords(event).x;
    y = getMouseCoords(event).y;
    shape = document.createElementNS(svgNS, "path");
    shape.setAttribute('fill', 'none');
    shape.setAttribute('stroke-width', width);
    shape.setAttribute('stroke', color);
    shape.setAttribute('stroke-linecap', linecap);
    shape.setAttribute('stroke-linejoin', linejoin);
    path = 'M ' + x + ' ' + y + ' L ';
    svgPanel.appendChild(shape);
  };


  const move = (event)=> {
    if(event.target.id==='back-panel')
      up(event);
    if (isDrawing) {
      x = getMouseCoords(event).x;
      y = getMouseCoords(event).y;
      path +=x + ' ' + y + ' ';
      shape.setAttribute('d', path);
    }
  };


  const up = ()=> {
      isDrawing = false;
      document.removeEventListener('mousemove',move);
      drawPanel.removeEventListener('mouseup',up);
    };


drawPanel.addEventListener('mousedown',start);
changeThickness();

