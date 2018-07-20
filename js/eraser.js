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


function parseP(x, y, path) {
  newX = -1;
  end = 0;
  strt = 0;

  for (let i = 0; i + 2 < path.length;) {
    if (((x >= (path[i]) && x <= (path[i + 2])) || (x <= (path[i]) && x >= (path[i + 2]))) &&
      ((y >= (path[i + 1]-5) && y <= (path[i + 3]+5)) || (y <= (path[i + 1]) && y >= (path[i + 3])))) {
      newX = i;
    }
    i += 2;
  }
  console.log('newX: '+newX);
    e(path,x,y);
}


function e(path,x,y){

  let  l=newX,r=newX+2;
    while(dist(x,y,path[l],path[l+1])<5 && l>0)
    {
      l-=2;
    }

    while(dist(x,y,path[r],path[r+1])<5 && r<path.length-2)
    {

      r+=2;
    }
  if (l<0)
    l=0;
  if (r>path.length-2)
    r=path.length-2;
    let k;
    console.log(path);
    if(dist(path[0],path[1],path[path.length-2],path[path.length-1])<10)
    {
      console.log('delta');
      currentPath.remove();
      newX=-1;
      return;
    }
    if(dist(x,y,path[0],path[1])<5)
    {
      strt=1;
    }
    console.log('start '+strt+' '+dist(x,y,path[0],path[1]));
  if(dist(x,y,path[path.length-2],path[path.length-1])<5)
    {

      end=1;
    }



      let dis=dist(x, y, path[l], path[l + 1]);
      let dis1=dist(path[l], path[l+1], path[r], path[r + 1]);
      if(dis<5){

        dis=dist(x, y, path[r], path[r + 1]);

        k = (dis-5)/ dis1;
        Path2 = 'M ' +  (path[r] - (path[r]-path[l]) * k)+ ' ' + (path[r+1] - (path[r+1]-path[l+1]) * k) + ' L ' + path.slice(r).join(' ');

        return;
      }else {
        k = (dis - 5) / dis1;
        Path1 = 'M ' + path.slice(0, 2).join(' ') + ' L ' + path.slice(2, l + 2).join(' ') + ' ' + (path[l] + (path[r]-path[l]) * k) + ' ' + (path[l + 1] + (path[r + 1] - path[l + 1]) * k);
        k = (dis + 5) / dis1;
        Path2 = 'M ' + (path[l] + (path[r]-path[l]) * k) + ' ' + (path[l + 1] + (path[r + 1] - path[l + 1]) * k) + ' L ' + path.slice(r).join(' ');
        return;
      }

}


 



let c=0;
function erase (event) {
strt=0;
end=0;
  if (isErasing) {
    if (event.target.toString() === '[object SVGPathElement]') {
      console.log('path');
      currentPath = event.target;
      if(c===0) {
        c++;
      }
      parseP(getMouseCoords(event).x, getMouseCoords(event).y, event.target.getAttribute('d').split(' ').map(Number).filter(Boolean));
      if(newX!==-1) {
        currentPath.remove();
        if (strt!==1 && Path1[Path1.length - 1] !== ' ') {
          shape = document.createElementNS(svgNS, "path");
          shape.setAttribute('fill', 'none');
          shape.setAttribute('stroke-width', width);
          shape.setAttribute('stroke', 'black');
          shape.setAttribute('stroke-linecap', 'butt');
          shape.setAttribute('stroke-linejoin', linejoin);
          shape.setAttribute('d', Path1);
          svgPanel.appendChild(shape);
        }
        if (Path2[Path2.length - 1] !== ' ' && end!==1) {
          shape = document.createElementNS(svgNS, "path");
          shape.setAttribute('fill', 'none');
          shape.setAttribute('stroke-width', width);
          shape.setAttribute('stroke', 'black');
          shape.setAttribute('stroke-linecap', 'butt');
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




