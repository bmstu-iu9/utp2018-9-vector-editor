'use strict';


let eraser = document.getElementById('eraser');
let isErasing = false;
let fin1,len1,len2,end,strt;
let minX = 1000, minY = 1000, newX = 0, newY,Path1,Path2,currentPath;
drawPanel.addEventListener('mousedown',startErasing);
drawPanel.addEventListener('mousemove',erase);
drawPanel.addEventListener('mouseup',stopErasing);

    function startErasing (event) {
      if (!eraser.checked)
        return;
      isErasing = true;
    }

    function dist(x1,y1,x2,y2){
      return Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2))
    }

function krug(path) {
  for (let i = 0; i + 2 < path.length;) {
    shape = document.createElementNS(svgNS, "circle");
    shape.setAttribute('fill', 'red');
    shape.setAttribute('cx', path[i]);
    shape.setAttribute('cy', path[i + 1]);
    shape.setAttribute('r', '6');
    svgPanel.appendChild(shape);

    i+=2;
  }
}

    function parsePath(x, y, path) {
      newX = -1;
      end = 0;
      strt = 0;
      for (let i = 0; i + 2 < path.length;) {
        if ((x > path[i] && x < path[i + 2]) && (y > (path[i + 1] - 10) && y < (path[i + 3] + 10))) {
          newX = i;
          console.log(newX);

        }
        i += 2;
      }
      position_one(path, x, y, newX);
    }

      function position_one(path, x, y, newX) {

        if (path.length === 4)
          if (Math.abs(path[0] - path[2]) < 10) {
            newX = -1;
            currentPath.remove();
            return;
          }
        if ((x - 5) < path[0])
          strt = 1;
        if ((x + 5) > path[path.length - 2])
          end = 1;
        Path1 = 'M ' + path.slice(0, 2).join(' ') + ' L ' + (x - 5) + ' ' + 247;
        Path2 = 'M ' + (x + 5) + ' ' + 247 + ' L ' + path.slice(newX + 2).join(' ');
    }



let c=1;
    function erase (event) {

      if (isErasing) {
        if (event.target.toString() === '[object SVGPathElement]') {
          currentPath = event.target;
          parsePath(getMouseCoords(event).x, getMouseCoords(event).y, event.target.getAttribute('d').split(' ').map(Number).filter(Boolean));
          if (c===0)
          {
            krug(currentPath.getAttribute('d').split(' ').map(Number).filter(Boolean));
            c++;
          }


          if(newX!==-1) {


            currentPath.remove();
            if (Path1[Path1.length - 1] !== ' ' && strt!==1) {

              shape = document.createElementNS(svgNS, "path");
              shape.setAttribute('fill', 'none');
              shape.setAttribute('stroke-width', width);
              shape.setAttribute('stroke', 'black');
              shape.setAttribute('stroke-linecap', 'round');
              shape.setAttribute('stroke-linejoin', linejoin);
              shape.setAttribute('d', Path1);
              svgPanel.appendChild(shape);
            }
            if (Path2[Path2.length - 1] !== ' ' && end!==1) {

              shape = document.createElementNS(svgNS, "path");
              shape.setAttribute('fill', 'none');
              shape.setAttribute('stroke-width', width);
              shape.setAttribute('stroke', 'black');
              shape.setAttribute('stroke-linecap', 'round');
              shape.setAttribute('stroke-linejoin', linejoin);
              shape.setAttribute('d', Path2);
              svgPanel.appendChild(shape);
            }
          }
        }
      }
    }

    function stopErasing (event) {
      isErasing = false;
    }




