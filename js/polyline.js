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
*/
'use strict';

class Polyline extends Figure {
    constructor(svgFigure) {
        super(svgFigure);
        this.tmpLine = null;

        this.addPoint = this.addPoint.bind(this);
        this.moveTmpLine = this.moveTmpLine.bind(this);
        this.finish = this.finish.bind(this);
        this.finishByLeftPanel = this.finishByLeftPanel.bind(this);
        this.takePoint = this.takePoint.bind(this);
        this.deletePoint = this.deletePoint.bind(this);
        this.finishByLeftPanel = this.finishByLeftPanel.bind(this);
        this.getMergeCoords = this.getMergeCoords.bind(this);
        this.findIndexMerged = this.findIndexMerged.bind(this);
        this.isClosed = this.isClosed.bind(this);
        this.isStartCornerPushed = this.isStartCornerPushed.bind(this);
    }

    static draw(event) {
        if (!pen.checked) {
            return;
        }

        const clickCoord = getMouseCoords(event);
        const options = optionsPen.getElementsByTagName('input');
        const pl = new Polyline(createSVGElem('polyline', 'none', undefined, +options[0].value));
        pl.createTmpLine(clickCoord);
        svgPanel.appendChild(pl.svgFig);
        svgPanel.appendChild(pl.tmpLine);
        someFigureTaken = true;
        currentFigure = this;

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
            const refp = new PolylinePoint(this, point);
            this.svgFig.points.appendItem(RefPoint.createSVGPoint(point));
            refp.svgPoint = this.svgFig.points[this.svgFig.points.numberOfItems - 1];
            this.refPoints.push(refp);
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
        const end = this.isClosed() ? this.refPoints.length - 1 : this.refPoints.length;
        for (let i = 0; i < end; i++) {
            svgPanel.removeChild(this.refPoints[i].circle);
        }
    }

    showRefPoints() {
        for (let i = 0; i < this.refPoints.length - 1; i++) {
            svgPanel.appendChild(this.refPoints[i].circle);
        }
        if (!this.isClosed()) {
            svgPanel.appendChild(this.refPoints[this.refPoints.length - 1].circle);
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
        this.hideOrShow((this.refPoints.length != 1) ? true : false);
    }

    takePoint(event) {
        if (!cursor.checked || this.somePointTaken || someFigureTaken) {
            return;
        }

        const ind = this.findIndexMerged(getMouseCoords(event));
        const iSCP = this.isStartCornerPushed(ind);

        const movePoint = (e) => {
            const coords = getMouseCoords(e);
            this.refPoints[ind].circle.setAttribute('fill', '#0000FF');
            if (iSCP) {
                this.refPoints[0].setCoords(coords);
                this.refPoints[this.refPoints.length - 1].setCoords(coords);
            } else {
                this.refPoints[ind].setCoords(coords);
            }
        };

        const fixPoint = (e) => {
            const clicked = this.findIndexMerged(getMouseCoords(e), ind);
            if (clicked !== undefined && !iSCP) {
                return;
            }
            this.deleteTmpCopy();
            this.somePointTaken = someFigureTaken = false;
            document.removeEventListener('mousemove', movePoint);
            this.refPoints[ind].circle.addEventListener('click', this.takePoint);
            this.refPoints[ind].circle.addEventListener('contextmenu', this.deletePoint);
            this.refPoints[ind].circle.removeEventListener('click', fixPoint);
            leftPanel.removeEventListener('click', stopMovingByLeftPanel);
        };

        const stopMovingByLeftPanel = () => {
            if (cursor.checked && this.somePointTaken) {
                movePoint(event);
                this.refPoints[ind].circle.dispatchEvent(event);
                this.refPoints[ind].circle.dispatchEvent(new Event('mouseout'));
            }
        };

        this.createTmpCopy(ind);
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
        let ind = this.findIndexMerged(getMouseCoords(event));
        const iSCP = this.isStartCornerPushed(ind);
        if (ind === undefined) {
            return;
        }
        this.svgFig.points.removeItem(ind);
        svgPanel.removeChild(this.refPoints[ind].circle);
        this.refPoints.splice(ind, 1);
        if (iSCP) {
            this.svgFig.points.removeItem(this.svgFig.points.numberOfItems - 1);
            this.refPoints[this.refPoints.length - 1] = new PolylinePoint(this, this.refPoints[0]);
            this.svgFig.points.appendItem(RefPoint.createSVGPoint(this.refPoints[0]));
            this.refPoints[this.refPoints.length - 1].svgPoint = this.svgFig.points[this.svgFig.points.numberOfItems - 1];
        }

        if (this.refPoints.length == 1) {
            svgPanel.removeChild(this.refPoints[0].circle);
            this.svgFig.points.removeItem(0);
            svgPanel.removeChild(this.svgFig);
            this.refPoints = undefined;
            hideAllOptions();
            currentFigure = null;
        } else if (this.refPoints.length == 3 && this.isClosed()) {
            this.svgFig.points.removeItem(2);
            this.refPoints.splice(2, 1);
        }
        this.svgFig.dispatchEvent(new Event('mouseout'));
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

    createTmpCopy(indOfTaken) {
        this.copy = createSVGElem('polyline', 'none', '#000000', '1', '0.5', '0.5');
        svgPanel.insertBefore(this.copy, this.svgFig);

        const appendAll = (...inds) => {
            inds.forEach(i => this.copy.points.appendItem(this.svgFig.points[i]));
        };

        if (indOfTaken > 0 && indOfTaken < this.refPoints.length - 1) {
            appendAll(indOfTaken - 1, indOfTaken, indOfTaken + 1);
        } else if (this.isClosed()) {
            appendAll(1, 0, this.refPoints.length - 2);
        } else if (indOfTaken == 0) {
            appendAll(0, 1);
        } else {
            appendAll(this.refPoints.length - 1, this.refPoints.length - 2);
        }
    }

    showOptions() {
        hideAllOptions();
        optionsPen.classList.add('show-option');
        const options = optionsPen.getElementsByTagName('input');
        options[0].value = this.svgFig.getAttribute('stroke-width');
    }
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

{
    const inputs = optionsPen.getElementsByTagName('input');
    const selectors = optionsPen.getElementsByTagName('ul');
    Figure.addPanelListener(Polyline, inputs, selectors, 0, () => {
        currentFigure.svgFig.setAttribute('stroke-width', +inputs[0].value);
    });
}
