'use strict';
/*
    Скрипт для инструмента ластик.
*/

let eraser = document.getElementById('eraser');
let isErasing = false;
let end, strt, type, value, index = 0, Path1, Path2, currentPath,pathColor;

const startErasing = () => {

    if (!eraser.checked)
        return;
    isErasing = true;
};


const dist = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
};


const changeEraserThickness = ()=>{
    value=document.getElementById('eraser_width').value/2;
};


const parseP = (x, y, path) => {
    index = -1;
    end = 0;
    strt = 0;
    for (let i = 0; i + 2 < path.length;) {
        if (((x >= (path[i] - 1) && x <= (path[i + 2] + 1))
            || (x <= (path[i] + 1) && x >= (path[i + 2] - 1))) && ((y >= (path[i + 1] - 1) && y <= (path[i + 3] + 1))
            || (y <= (path[i + 1] + 1) && y >= (path[i + 3] - 1)))) {
            index = i;
            break;
        }
        i += 2;
    }
    if (index !== -1)
        e(path, x, y);
};


const e = (path, x, y) => {
    changeEraserThickness();
    let l = index, r = index + 2;
    while (dist(x, y, path[l], path[l + 1]) < value && l > 0) {
        l -= 2;
    }
    while ((dist(x, y, path[r], path[r + 1]) < value
        || (path[r] === path[l] && path[r + 1] === path[l + 1])) && r < path.length - 2) {
        r += 2;
    }
    if (l < 0)
        l = 0;
    if (r > path.length - 2)
        r = path.length - 2;
    let k;
    if (pathLength(path) < 2*value) {
        currentPath.remove();
        index = -1;
        return;
    }
    if (pl(path.slice(0, l+2),x,y) < value) {
        strt = 1;
    } else if (pr(path.slice(r, path.length),x,y) < value) {
        end = 1;
    }
    let dis = dist(x, y, path[l], path[l + 1]);
    let dis1 = dist(path[l], path[l + 1], path[r], path[r + 1]);
    if (strt === 1) {
        dis = dist(x, y, path[r], path[r + 1]);
        k = (dis - value) / dis1;
        Path2 = 'M ' + (path[r] - (path[r] - path[l]) * k) + ' ' + (path[r + 1] - (path[r + 1] - path[l + 1]) * k) + ' L ' + path.slice(r).join(' ');
    } else {
        k = (dis - value) / dis;
        Path1 = 'M ' + path.slice(0, 2).join(' ') + ' L ' + path.slice(2, l + 2).join(' ') + ' ' + (path[l] + (x - path[l]) * k) + ' ' + (path[l + 1] + (y - path[l + 1]) * k);
        dis = dist(x, y, path[r], path[r + 1]);
        k = (dis - value) / dis;
        Path2 = 'M ' + (path[r] - (path[r]-x) * k) + ' ' +  (path[r + 1] - (path[r + 1]-y) * k) + ' L ' + path.slice(r).join(' ');
    }
};


const pathLength=(path) => {
    let l = 0;
    for (let i = 0; i < path.length - 3; i += 2) {
        l += dist(path[i], path[i + 1], path[i + 2], path[i + 3]);
    }
    return l;
};


const pl=(path,x,y) => {
    let l = 0;
    path.push(x,y);
    for (let i = 0; i < path.length - 3; i += 2) {
        l += dist(path[i], path[i + 1], path[i + 2], path[i + 3]);
    }
    return l;
};


const pr=(path,x,y) => {
    let l = 0;
    path.unshift(x,y);
    for (let i = 0; i < path.length - 3; i += 2) {
        l += dist(path[i], path[i + 1], path[i + 2], path[i + 3]);
    }
    return l;
};


const erase = (event) => {
    strt = 0;
    end = 0;
    if (isErasing) {
        if (event.target.toString() === '[object SVGPathElement]') {
            currentPath = event.target;
            pathColor = event.target.getAttribute('stroke');
            width = event.target.getAttribute('stroke-width');
            type = event.target.getAttribute('stroke-linecap');
            linejoin = event.target.getAttribute('stroke-linejoin');
            parseP(getMouseCoords(event).x, getMouseCoords(event).y, event.target.getAttribute('d').split(' ').map(parseFloat).filter(Number));
            if (index !== -1) {
                currentPath.remove();
                if (strt !== 1 && Path1[Path1.length - 1] !== ' ' && pathLength(Path1.split(' ').map(Number).filter(Boolean)) > 2) {
                    shape = document.createElementNS(svgNS, "path");
                    shape.setAttribute('fill', 'none');
                    shape.setAttribute('stroke-width', width);
                    shape.setAttribute('stroke', pathColor);
                    shape.setAttribute('stroke-linecap', type);
                    shape.setAttribute('stroke-linejoin', linejoin);
                    shape.setAttribute('d', Path1);
                    svgPanel.appendChild(shape);
                    BrushBox.create(shape);
                }
                if (Path2[Path2.length - 1] !== ' ' && end !== 1 && pathLength(Path2.split(' ').map(Number).filter(Boolean)) > 2) {
                    shape = document.createElementNS(svgNS, "path");
                    shape.setAttribute('fill', 'none');
                    shape.setAttribute('stroke-width', width);
                    shape.setAttribute('stroke', pathColor);
                    shape.setAttribute('stroke-linecap', type);
                    shape.setAttribute('stroke-linejoin', linejoin);
                    shape.setAttribute('d', Path2);
                    svgPanel.appendChild(shape);
                    BrushBox.create(shape);
                }
            }
        }
    }
};


function stopErasing() {
    isErasing = false;
}


drawPanel.addEventListener('mousedown', startErasing);
drawPanel.addEventListener('mousemove', erase);
drawPanel.addEventListener('mouseup', stopErasing);




