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

function krug(path,i) {
  console.log(i);
  shape = document.createElementNS(svgNS, "circle");
  shape.setAttribute('fill', 'red');
  shape.setAttribute('cx', Number(path[i]));
  shape.setAttribute('cy', Number(path[i + 1]));
  shape.setAttribute('r', '10');
  svgPanel.appendChild(shape);
}
function krug1(path) {
  for (let i=0;i<path.length;i+=2) {
    shape = document.createElementNS(svgNS, "circle");
    shape.setAttribute('fill', 'blue');
    shape.setAttribute('cx', Number(path[i]));
    shape.setAttribute('cy', Number(path[i + 1]));
    shape.setAttribute('r', '5');
    svgPanel.appendChild(shape);
  }
}

function parsePath(x, y, path) {
  newX = -1;
  end = 0;
  strt = 0;
  for (let i = 0; i + 2 < path.length;) {
    c
    if ((x > path[i] && x < path[i + 2]) && (y > (path[i + 1] - 10) && y < (path[i + 3] + 10))) {

      newX = i;


    }
    i += 2;
  }
  position_one(path, x, y, newX);
}



function parseP(x, y, path) {
  newX = -1;
  end = 0;
  strt = 0;

  for (let i = 0; i + 2 < path.length;) {
    if (((x > (path[i]) && x <= (path[i + 2])) || (x <= (path[i]) && x >= (path[i + 2]))) &&
      ((y > (path[i + 1] - 10) && y < (path[i + 3] + 10)) || (y < (path[i + 1] - 10) && y > (path[i + 3] + 10)))) {
      newX = i;
    }
    i += 2;
  }

  if (newX!==-1)
  {
    e(path,x,y);
  }
}


function e(path,x,y){
  console.log(newX+' !!2!');
  let  l=newX,r=newX+2;
    while(dist(x,y,path[l],path[l+1])<5 && l>0)
    {
      console.log('!@# '+dist(x,y,path[l],path[l+1]));
      l-=2;
    }

    while(dist(x,y,path[r],path[r+1])<5 && r<path.length-2)
    {
      console.log('!@..# '+dist(path[newX],path[newX+1],path[r],path[r+1]));
      r+=2;
    }
  if (l<0)
    l=0;
  if (r>path.length-2)
    r=path.length-2;
    console.log(l,r,newX);
    let k;
    if(dist(path[0],path[1],path[path.length-2],path[path.length-1])<10)
    {
      console.log('del ta');
      currentPath.remove();
      newX=-1;
      return;
    }
    if(dist(x,y,path[0],path[1])<5)
    {
      strt=1;
      console.log('strt');
    }
  if(dist(x,y,path[path.length-2],path[path.length-1])<5)
    {
      console.log('end');
      end=1;
    }


    k = (dist(x, path[l + 1], path[l], path[l + 1]) - 10) / dist(x, path[l + 1], path[l], path[l + 1]);
    console.log('k1dadsada ' + k * x);
    Path1 = 'M ' + path.slice(0, 2).join(' ') + ' L ' + path.slice(2, l + 2).join(' ') + ' ' + (path[l] + (x - path[l]) * k) + ' ' + path[l + 1];
    k = (dist(x, path[l + 1], path[l], path[l + 1]) + 5) / dist(x, path[l + 1], path[l], path[l + 1]);
    console.log('k2 ' + k);
    Path2 = 'M ' + (x + 5) + ' ' + path[r + 1] + ' L ' + path.slice(r).join(' ');
  
}


function position_one(path, x, y, newX) {
  if (path.length === 4)
    if (Math.abs(path[0] - path[2]) < 10 || Math.abs(path[1] - path[3]) <10) {
      newX = -1;
      currentPath.remove();
      return;
    }
  if ((x - 5) < path[0])
    strt = 1;
  if ((x + 5) > path[path.length - 2])
    end = 1;
  if ((y - 5) < path[1])
    strt = 1;
  if ((y + 5) > path[path.length - 1])
    end = 1;
  Path1 = 'M ' + path.slice(0, 2).join(' ') + ' L ' + (x - 5) + ' ' + 247;
  Path2 = 'M ' + (x + 5) + ' ' + 247 + ' L ' + path.slice(newX + 2).join(' ');
}



let c=0;
function erase (event) {
strt=0;
end=0;
  if (isErasing) {
    if (event.target.toString() === '[object SVGPathElement]') {
      currentPath = event.target;
      if(c===0) {
        c++;
      }
      parseP(getMouseCoords(event).x, getMouseCoords(event).y, event.target.getAttribute('d').split(' ').map(Number).filter(Boolean));
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




