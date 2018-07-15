/*
        Скрипт для работы инструмента "Перо" и расширения возможностей "Курсора."
        Принцип работы "Пера":
    При первом клике ЛКМ на холсте устанавливается начальная точка.
    Далее, при перемещении мыши рисуется полупрозрачный отрезок от последней
    установленной точки до той, на которую в данный момент указывает курсор.
        Процесс построения фигуры оканчивается в одном из трех случаев:
    1) В качестве следующей опорной точки была выбрана начальная;
    2) При фиксировании опорной точки была зажата клавиша Ctrl;
    3) Смена инструмента.
        В панеле опций для фигуры можно выбрать толщину ребер, цвет ребер, наличие
    заливки, ее цвет(если она есть), прозрачность.
    Добавленные возможности "Курсора":
        Возможность перемещать и удалять опорные точки:
    Для перемещения точки необходимо захватить ее одним кликом ЛКМ, затем
    переместить и снова кликнуть ЛКМ. Для удаления нужно нажать на опорную точку ПКМ.
    Если при захвате опорной точки был изменен инструмент, то она вернется на
    свою исходную позицию.

        Примечание:
    В настоящий момент взаимодействие с панелью опций не реализовано.
*/
'use strict';

const RADIUS = 3; //Временная переменная
const pen = document.getElementById('pen');
const cursor = document.getElementById('cursor');

class Polyline extends Figure {
    constructor(svgFigure) {
        super(svgFigure);
        this.refPoints = [];
        this.tmpLine = null;

        this.addPoint = this.addPoint.bind(this);
        this.moveTmpLine = this.moveTmpLine.bind(this);
        this.finish = this.finish.bind(this);
        this.finishByLeftPanel = this.finishByLeftPanel.bind(this);
        this.takePoint = this.takePoint.bind(this);
        this.deletePoint = this.deletePoint.bind(this);
        this.finishByLeftPanel = this.finishByLeftPanel.bind(this);
        this.getMergeCoords = this.getMergeCoords.bind(this);
        this.findIndex = this.findIndex.bind(this);
        this.isClosed = this.isClosed.bind(this);
        this.isStartCornerPushed = this.isStartCornerPushed.bind(this);
    }

    static draw(event) {
        if (!pen.checked) {
            return;
        }
        const clickCoord = getMouseCoords(event);
        const pl = new Polyline(createSVGElem('polyline', 'none'));
        pl.createTmpLine(clickCoord);
        svgPanel.appendChild(pl.svgFig);
        svgPanel.appendChild(pl.tmpLine);
        someFigureTaken = true;

        pl.addPoint(event);
        drawPanel.addEventListener('click', pl.addPoint);
        drawPanel.removeEventListener('click', Polyline.draw);
        document.addEventListener('mousemove', pl.moveTmpLine);
        leftPanel.addEventListener('click', pl.finishByLeftPanel);
    }

    addPoint(event) {
        if (!pen.checked) {
            this.finish();
            return;
        }
        const [point, merged] = this.getMergeCoords(event);
        if (this.refPoints.length > 2 && this.refPoints[0].equals(point)) {
            const refp = new PolylinePoint(this, point, RADIUS);
            this.svgFig.points.appendItem(RefPoint.createSVGPoint(point));
            refp.svgPoint = this.svgFig.points[this.svgFig.points.numberOfItems - 1];
            this.refPoints.push(refp);
            this.finish();
        } else if (merged) {
            return;
        } else {
            const refp = new PolylinePoint(this, point, RADIUS);
            this.svgFig.points.appendItem(RefPoint.createSVGPoint(point));
            refp.svgPoint = this.svgFig.points[this.svgFig.points.numberOfItems - 1];
            svgPanel.appendChild(refp.circle);
            this.refPoints.push(refp);
            this.moveStartOfTmpLine();
            if (this.refPoints.length > 1 && event.ctrlKey) {
                this.finish();
            }
        }
    }

    hideRefPoints() {
        const end = this.isClosed() ? this.refPoints.length - 1 : this.refPoints.length;
        for (let i = 0; i < end; i++) {
            svgPanel.removeChild(this.refPoints[i].circle);
        }
    }

    showRefPoints() {
        const len = this.refPoints.length;
        for (let i = 0; i < len - 1; i++) {
            svgPanel.appendChild(this.refPoints[i].circle);
        }
        if (!this.isClosed()) {
            svgPanel.appendChild(this.refPoints[len - 1].circle);
        }
    }

    finishByLeftPanel() {
        if (pen.checked && !this.finished) {
            this.finish();
            if (this.refPoints.length == 1) {
                svgPanel.removeChild(this.svgFig);
                svgPanel.removeChild(this.refPoints[0].circle);
                this.refPoints.length = 0;
            }
        }
    }

    finish() {
        drawPanel.removeEventListener('click', this.addPoint);
        drawPanel.addEventListener('click', Polyline.draw);
        document.removeEventListener('mousemove', this.moveTmpLine);
        leftPanel.removeEventListener('click', this.finishByLeftPanel);
        svgPanel.removeChild(this.tmpLine);
        delete this.tmpLine;
        this.finished = true;
        someFigureTaken = false;

        let isShowing = (this.refPoints.length != 1) ? true : false;
        const check = ( () => cursor.checked && !this.somePointTaken && !someFigureTaken ).bind(this);
        const hide = ( () => {
            if ((check() || pen.checked) && isShowing) {
                this.hideRefPoints();
                isShowing = false;
            }
        } ).bind(this);
        drawPanel.addEventListener('click', hide);
        this.svgFig.addEventListener('click', ( () => {
            if (check() && !isShowing) {
                this.showRefPoints();
                isShowing = true;
            }
        } ).bind(this));
        this.svgFig.addEventListener('mouseover', () => {
            if (check()) {
                drawPanel.removeEventListener('click', hide);
            }
        });
        this.svgFig.addEventListener('mouseout', () => {
            if (check()) {
                drawPanel.addEventListener('click', hide);
            }
        });
    }

    takePoint(event) {
        if (!cursor.checked || this.somePointTaken || someFigureTaken) {
            return;
        }

        const ind = this.findIndex(this.getMergeCoords(event)[0]);
        const iSCP = this.isStartCornerPushed(ind);

        const movePoint = ( (e) => {
            const coords = getMouseCoords(e);
            this.refPoints[ind].circle.setAttribute('fill', '#0000FF');
            if (iSCP) {
                this.refPoints[0].setCoords(coords);
                this.refPoints[this.refPoints.length - 1].setCoords(coords);
            } else {
                this.refPoints[ind].setCoords(coords);
            }
        } ).bind(this);

        const fixPoint = ( (e) => {
            const clicked = this.findIndex(this.getMergeCoords(e)[0], ind);
            if (clicked !== undefined && !iSCP) {
                return;
            }
            this.somePointTaken = someFigureTaken = false;
            document.removeEventListener('mousemove', movePoint);
            this.refPoints[ind].circle.addEventListener('click', this.takePoint);
            this.refPoints[ind].circle.addEventListener('contextmenu', this.deletePoint);
            this.refPoints[ind].circle.removeEventListener('click', fixPoint);
            leftPanel.removeEventListener('click', stopMovingByLeftPanel);
        } ).bind(this);

        const stopMovingByLeftPanel = ( () => {
            if (cursor.checked && this.somePointTaken) {
                movePoint(event);
                this.refPoints[ind].circle.dispatchEvent(event);
                this.refPoints[ind].circle.dispatchEvent(new Event('mouseout'));
            }
        } ).bind(this);

        this.somePointTaken = someFigureTaken = true;
        document.addEventListener('mousemove', movePoint);
        this.refPoints[ind].circle.removeEventListener('click', this.takePoint);
        this.refPoints[ind].circle.removeEventListener('contextmenu', this.deletePoint);
        this.refPoints[ind].circle.addEventListener('click', fixPoint);
        leftPanel.addEventListener('click', stopMovingByLeftPanel);
    }

    deletePoint(event) {
        if (!cursor.checked || this.somePointTaken || someFigureTaken) {
            return;
        }
        event.preventDefault();
        let ind = this.findIndex(this.getMergeCoords(event)[0]);
        const iSCP = this.isStartCornerPushed(ind);
        if (ind === undefined) {
            return;
        }
        this.svgFig.points.removeItem(ind);
        svgPanel.removeChild(this.refPoints[ind].circle);
        this.refPoints.splice(ind, 1);
        if (iSCP) {
            this.svgFig.points.removeItem(this.svgFig.points.numberOfItems - 1);
            this.refPoints[this.refPoints.length - 1] = new PolylinePoint(this, this.refPoints[0], RADIUS);
            this.svgFig.points.appendItem(RefPoint.createSVGPoint(this.refPoints[0]));
            this.refPoints[this.refPoints.length - 1].svgPoint = this.svgFig.points[this.svgFig.points.numberOfItems - 1];
        }

        if (this.refPoints.length == 1) {
            svgPanel.removeChild(this.refPoints[0].circle);
            this.svgFig.points.removeItem(0);
            svgPanel.removeChild(this.svgFig);
            this.refPoints = 0;
        } else if (this.refPoints.length == 3 && this.isClosed()) {
            this.svgFig.points.removeItem(2);
            this.refPoints.splice(2, 1);
        }
    }

    getMergeCoords(event) {
        const click = getMouseCoords(event);
        for (let i = 0; i < this.refPoints.length; i++) {
            if (this.refPoints[i].containsToArea(click)) {
                return [this.refPoints[i], true];
            }
        }
        return [click, false];
    }

    findIndex(point, miss = -1) {
        for (let i = 0; i < this.refPoints.length; i++) {
            if (i != miss && this.refPoints[i].equals(point)) {
                return i;
            }
        }
    }

    isClosed() {
        return this.refPoints[0].equals(this.refPoints[this.refPoints.length - 1]);
    }

    isStartCornerPushed(ind) {
        return (ind == 0 || ind == this.refPoints.length - 1) && this.isClosed();
    }

    createTmpLine(start) {
        this.tmpLine = createSVGElem('line', undefined, undefined, undefined, '0.5');
        this.tmpLine.setAttribute('x1', start.x);
        this.tmpLine.setAttribute('y1', start.y);
        this.tmpLine.setAttribute('x2', start.x);
        this.tmpLine.setAttribute('y2', start.y);
    }

    moveEndOfTmpLine(end) {
        this.tmpLine.setAttribute('x2', end.x);
        this.tmpLine.setAttribute('y2', end.y);
    }

    moveStartOfTmpLine() {
        this.tmpLine.setAttribute('x1', this.tmpLine.getAttribute('x2'));
        this.tmpLine.setAttribute('y1', this.tmpLine.getAttribute('y2'));
    }

    moveTmpLine(event) {
        this.moveEndOfTmpLine(getMouseCoords(event));
    }
}

class PolylinePoint extends RefPoint {
    constructor(figure, coords, r) {
        super(figure, coords, r);
        this.svgPoint = null;

        this.circle.addEventListener('mouseover', this.dispatchAndColor.bind(this, 'mouseover', '#0000FF'));
        this.circle.addEventListener('mouseout', this.dispatchAndColor.bind(this, 'mouseout', '#FFFFFF'));
        this.circle.addEventListener('click', this.figure.takePoint);
        this.circle.addEventListener('contextmenu', this.figure.deletePoint);
    }

    dispatchAndColor(event, color) {
        if ( (pen.checked && (!this.figure.someFigureTaken || !this.figure.finished) ) ||
            (cursor.checked && !someFigureTaken) ) {
            this.figure.svgFig.dispatchEvent(new Event(event));
            this.circle.setAttribute('fill', color);
        }
    }

    setCoords(coords) {
        this.x = this.svgPoint.x = coords.x;
        this.y = this.svgPoint.y = coords.y;
    }

    set x(v) { this.circle.setAttribute('cx', this.svgPoint.x = v); }
    set y(v) { this.circle.setAttribute('cy', this.svgPoint.y = v); }
    set r(v) { this.circle.setAttribute('r', r); }
    get x() { return this.circle.getAttribute('cx'); }
    get y() { return this.circle.getAttribute('cy'); }
    get r() { return this.circle.getAttribute('r'); }
}

Polyline.draw = Polyline.draw.bind(Polyline)
drawPanel.addEventListener('click', Polyline.draw);
