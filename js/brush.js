'use strict';

let dx,dy,shape,x,y,path,pathTaken = false;
let isDrawing=false;
let color='black',width,linecap='round',linejoin='round';
const brsh = document.getElementById('brush');
const crsr = document.getElementById('cursor');

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
      pathTaken = false;
      document.removeEventListener('mousemove',move);
      drawPanel.removeEventListener('mouseup',up);
    };


  const target = (event) => {
      if (event.target.toString() === '[object SVGPathElement]')
          pathTaken = true;
  };


  const deltaMouse=()=>{
      dx=getMouseCoords(event).x-x;
      dy=getMouseCoords(event).y-y;
      x=getMouseCoords(event).x;
      y=getMouseCoords(event).y;
      console.log(dx,dy);
      return {dx,dy};
};

  const changePath=(delta,path)=>{
      for(let i=0;i<path.length-1;i+=2)
      {
          path[i]+=delta.dx;
          path[i+1]+=delta.dy;
      }
  };

  const startMoving=(event)=>{
      target(event);
      if (!crsr.checked || !pathTaken)
          return;
      currentPath = event.target;
      drawPanel.addEventListener('mousemove',movePath);
      drawPanel.addEventListener('mouseup',up);
      x=getMouseCoords(event).x;
      y=getMouseCoords(event).y;
      console.log(x,y);
  };

  const movePath=(event)=>{
      if(pathTaken) {
          console.log('ALO');
          path = currentPath.getAttribute('d').split(' ').map(Number).filter(Boolean);
          changePath(deltaMouse(), path);
          let p = 'M ' + path.slice(0, 2).join(' ') + ' L ' + path.slice(2).join(' ');
          currentPath.setAttribute('d', p);
      }
};

drawPanel.addEventListener('mousedown',start);
drawPanel.addEventListener('mousedown',startMoving);

changeThickness();

