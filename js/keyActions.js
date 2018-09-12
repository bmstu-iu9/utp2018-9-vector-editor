/* Скрипт для для копирования и вставки фигур с помощью Ctrl+C, Ctrl+V*/

'use strict'

let newSvgFig;
let constr;

const copy = () => {
    switch(constr.name) {
        case 'Rectangle':
            newSvgFig = createSVGElem('rect');
            newSvgFig.setAttribute('x', +(currentFigure.x + 33));
            newSvgFig.setAttribute('y', +(currentFigure.y + 33));
            newSvgFig.setAttribute('width', +currentFigure.width);
            newSvgFig.setAttribute('height', +currentFigure.height);
            newSvgFig.setAttribute('rx', +currentFigure.r);
            newSvgFig.setAttribute('ry', +currentFigure.r);
            copySVGStyle(newSvgFig, currentFigure.svgFig);
            break;
        case 'Polygon':
            newSvgFig = createSVGElem('polygon');
            for (let i = 0; i < currentFigure.svgFig.points.numberOfItems; i++) {
                const point = svgPanel.createSVGPoint();
                point.x = currentFigure.svgFig.points[i].x + 30;
                point.y = currentFigure.svgFig.points[i].y + 30;
                newSvgFig.points.appendItem(point);
            }
            break;
        case 'Ellipse':
            newSvgFig = createSVGElem('ellipse');
            newSvgFig.setAttribute('cx', +(currentFigure.x + 33));
            newSvgFig.setAttribute('cy', +(currentFigure.y + 33));
            newSvgFig.setAttribute('rx', +currentFigure.rx);
            newSvgFig.setAttribute('ry', +currentFigure.ry);
            copySVGStyle(newSvgFig, currentFigure.svgFig);
            break;
        case 'Line':
            newSvgFig = createSVGElem('line');
            newSvgFig.setAttribute('x1', +(currentFigure.x1 + 33));
            newSvgFig.setAttribute('y1', +(currentFigure.y1 + 33));
            newSvgFig.setAttribute('x2', +(currentFigure.x2 + 33));
            newSvgFig.setAttribute('y2', +(currentFigure.y2 + 33));
            copySVGStyle(newSvgFig, currentFigure.svgFig);
            break;
        case 'Polyline':
            newSvgFig = createSVGElem('polyline');
            for (let i = 0; i < currentFigure.svgFig.points.numberOfItems; i++) {
                const point = svgPanel.createSVGPoint();
                point.x = currentFigure.svgFig.points[i].x + 30;
                point.y = currentFigure.svgFig.points[i].y + 30;
                newSvgFig.points.appendItem(point);
            }
            copySVGStyle(newSvgFig, currentFigure.svgFig);
            break;
    }
};

document.addEventListener('keydown', (e) => {
    if(e.ctrlKey && e.keyCode == 67 && currentFigure) {
        constr = currentFigure.constructor;
        copy();
    }
    if(e.ctrlKey && e.keyCode == 86 && newSvgFig) {
        if(constr.name !== 'Polygon'){
            currentFigure = constr.create(newSvgFig);
        } else {
            currentFigure = Polyline.create(newSvgFig);
        }
        copy();
    }
});
