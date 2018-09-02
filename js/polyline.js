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
        Фигуру можно перемещать путем зажатия ЛКМ над ней.
        Возможность перемещать и удалять опорные точки:
    Для перемещения точки необходимо захватить ее одним кликом ЛКМ, затем
    переместить и снова кликнуть ЛКМ. Для удаления нужно нажать на опорную точку ПКМ.
    Если при захвате опорной точки был изменен инструмент, то она вернется на
    свою исходную позицию.
*/
'use strict';

class Polyline extends Figure {
    constructor(svgFigure) {
        super(svgFigure);
        this.tmpLine = null;

        this.addPoint = this.addPoint.bind(this);
        this.movePolyline = this.movePolyline.bind(this);
        this.moveTmpLine = this.moveTmpLine.bind(this);
        this.finish = this.finish.bind(this);
        this.finishByLeftPanel = this.finishByLeftPanel.bind(this);
        this.takePoint = this.takePoint.bind(this);
        this.deletePoint = this.deletePoint.bind(this);
        this.finishByLeftPanel = this.finishByLeftPanel.bind(this);
        this.getMergeCoords = this.getMergeCoords.bind(this);
        this.findIndexMerged = this.findIndexMerged.bind(this);
        this.isClosed = this.isClosed.bind(this);
    }

    static create(svgFigure) {
        const pl = new Polyline(svgFigure);
        for (let i = 0; i < svgFigure.points.numberOfItems; i++) {
            const rp = new PolylinePoint(pl, svgFigure.points[i]);
            rp.svgPoint = svgFigure.points[i];
            pl.refPoints.push(rp);
        }
        pl.finish(false);
        svgPanel.appendChild(pl.svgFig);
        pl.isShowing = false;
        currentFigure = null;
        return pl;
    }

    static draw(event) {
        if (!pen.checked) {
            return;
        }

        const clickCoord = getMouseCoords(event);
        const pl = new Polyline(createSVGElem('polyline', undefined, '#000000'));
        pl.createTmpLine(clickCoord);
        svgPanel.appendChild(pl.svgFig);
        svgPanel.appendChild(pl.tmpLine);
        someFigureTaken = true;
        currentFigure = pl;

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
            const polygon = createSVGElem('polygon');
            copySVGStyle(polygon, this.svgFig);
            for (let i = 0; i < this.svgFig.points.numberOfItems; i++) {
                polygon.points.appendItem(this.svgFig.points[i]);
                this.refPoints[i].svgPoint = polygon.points[i];
            }
            svgPanel.removeChild(this.svgFig);
            svgPanel.insertBefore(this.svgFig = polygon, this.refPoints[0].circle);
            this.finish();
        } else if (merged) {
            return;
        } else {
            const refp = new PolylinePoint(this, point);
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
        this.refPoints.forEach(p => svgPanel.removeChild(p.circle));
        this.svgFig.setAttribute('stroke-width', 0);
    }

    showRefPoints() {
        this.refPoints.forEach(p => svgPanel.appendChild(p.circle));
        this.svgFig.setAttribute('stroke-width', 1);
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

    finish(hasTmpLine = true) {
        this.svgFig.addEventListener('mousedown', this.movePolyline);
        drawPanel.removeEventListener('click', this.addPoint);
        drawPanel.addEventListener('click', Polyline.draw);
        document.removeEventListener('mousemove', this.moveTmpLine);
        leftPanel.removeEventListener('click', this.finishByLeftPanel);
        if (hasTmpLine) {
            svgPanel.removeChild(this.tmpLine);
            delete this.tmpLine;
        }
        this.finished = true;
        someFigureTaken = false;
        this.hideOrShow();
    }

    takePoint(event) {
        if (!cursor.checked || this.somePointTaken || someFigureTaken) {
            return;
        }

        const ind = this.findIndexMerged(getMouseCoords(event));

        const movePoint = (e) => {
            const coords = getMouseCoords(e);
            this.refPoints[ind].circle.setAttribute('fill', '#0000FF');
            this.refPoints[ind].setCoords(coords);
        };

        const fixPoint = (e) => {
            const clicked = this.findIndexMerged(getMouseCoords(e), ind);
            if (clicked !== undefined) {
                return;
            }
            this.deleteTmpCopy();
            this.somePointTaken = someFigureTaken = false;
            document.removeEventListener('mousemove', movePoint);
            document.removeEventListener('keydown', returnToOld);
            this.refPoints[ind].circle.addEventListener('click', this.takePoint);
            this.refPoints[ind].circle.addEventListener('contextmenu', this.deletePoint);
            this.refPoints[ind].circle.removeEventListener('click', fixPoint);
            leftPanel.removeEventListener('click', stopMovingByLeftPanel);
        };

        const stopMovingByLeftPanel = () => {
            movePoint(event);
            this.refPoints[ind].circle.dispatchEvent(event);
            this.refPoints[ind].circle.dispatchEvent(new Event('mouseout'));
        };

        const returnToOld = (e) => {
            if (e.keyCode == 27) {
                stopMovingByLeftPanel();
            }
        };

        this.createTmpPartCopy(ind);
        this.somePointTaken = someFigureTaken = true;
        document.addEventListener('mousemove', movePoint);
        document.addEventListener('keydown', returnToOld);
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
        let ind = this.findIndexMerged(getMouseCoords(event));
        if (ind === undefined) {
            return;
        }

        this.svgFig.points.removeItem(ind);
        svgPanel.removeChild(this.refPoints[ind].circle);
        this.refPoints.splice(ind, 1);

        if (this.refPoints.length == 1) {
            svgPanel.removeChild(this.refPoints[0].circle);
            this.svgFig.points.removeItem(0);
            svgPanel.removeChild(this.svgFig);
            this.svgFig = null;
            hideAllOptions();
            currentFigure = null;
            return;
        }

        this.svgFig.dispatchEvent(new Event('mouseout'));
    }

    movePolyline(event) {
        if (!cursor.checked || this.somePointTaken || someFigureTaken || !this.isShowing) {
            return;
        }

        const clicked = getMouseCoords(event);
        const old = [];
        for (let i = 0; i < this.refPoints.length; i++) {
            old.push({ x: this.refPoints[i].x, y: this.refPoints[i].y });
        }

        const move = (e) => {
            const coords = getMouseCoords(e);
            const dx = coords.x - clicked.x, dy = coords.y - clicked.y;
            for (let i = 0; i < this.refPoints.length; i++) {
                const point = { x: old[i].x + dx, y: old[i].y + dy };
                this.refPoints[i].setCoords(point);
            }
        };

        const stopMoving = () => {
            this.deleteTmpCopy();
            this.somePointTaken = someFigureTaken = false;
            this.svgFig.addEventListener('mousedown', this.movePolyline);
            document.removeEventListener('mousemove', move);
            document.removeEventListener('keydown', returnToOld);
            drawPanel.removeEventListener('mouseup', stopMoving);
        };

        const returnToOld = (e) => {
            if (e.keyCode == 27) {
                move(event);
                stopMoving();
            }
        };

        this.createTmpCopy();
        this.somePointTaken = someFigureTaken = true;
        this.svgFig.removeEventListener('mousedown', this.movePolyline);
        document.addEventListener('mousemove', move);
        document.addEventListener('keydown', returnToOld);
        drawPanel.addEventListener('mouseup', stopMoving);
    }

    isClosed() {
        return this.svgFig.tagName == 'polygon';
    }

    createTmpLine(start) {
        this.tmpLine = createSVGElem('line', undefined, '#000000', undefined, '0.5');
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

    createTmpPartCopy(indOfTaken) {
        this.copy = createSVGElem('polyline', 'none', '#000000', '1', '0.5', '0.5');
        svgPanel.insertBefore(this.copy, this.svgFig.nextSibling);

        const appendAll = (...inds) => {
            inds.forEach(i => this.copy.points.appendItem(this.svgFig.points[i]));
        };

        if (indOfTaken > 0 && indOfTaken < this.refPoints.length - 1) {
            appendAll(indOfTaken - 1, indOfTaken, indOfTaken + 1);
        } else if (this.isClosed() && indOfTaken == 0) {
            appendAll(1, 0, this.refPoints.length - 1);
        } else if (this.isClosed() && indOfTaken == this.refPoints.length - 1) {
            appendAll(0, this.refPoints.length - 1, this.refPoints.length - 2);
        }else if (indOfTaken == 0) {
            appendAll(0, 1);
        } else {
            appendAll(this.refPoints.length - 1, this.refPoints.length - 2);
        }
    }

    createTmpCopy(indOfTaken) {
        this.copy = createSVGElem(this.svgFig.tagName, 'none', '#000000', '1', '0.5', '0.5');
        svgPanel.insertBefore(this.copy, this.svgFig.nextSibling);
        this.copy.setAttribute('points', this.svgFig.getAttribute('points'));
    }

    showOptions() {}
}

class PolylinePoint extends RefPoint {
    constructor(polyline, coords) {
        super(polyline, coords, pen);
        this.svgPoint = null;

        this.circle.addEventListener('click', this.figure.takePoint);
        this.circle.addEventListener('contextmenu', this.figure.deletePoint);
    }

    setCoords(coords) {
        this.x = this.svgPoint.x = coords.x;
        this.y = this.svgPoint.y = coords.y;
    }
}

drawPanel.addEventListener('click', Polyline.draw = Polyline.draw.bind(Polyline));
