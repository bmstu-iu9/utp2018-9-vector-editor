/*
    Скрипт для создания многоугольника.
    Создание аналогично остальным фигурам. При этом, если зажата клавиша shift,
    то нижняя сторона многоугольника будет находиться в горизонтальном положении.
    При помощи стрелок вверх и вниз можно изменять количество углов во время и после
    создания многоугольника. Также после создания доступна клавиша alt, позволяющая
    сохранить угол наклона фигуры, и ctrl, сохраняющая радиус неизменным.
*/
'use strict';

class Polygon extends Figure {
    constructor(svgFigure, angles) {
        super(svgFigure);
        this.n = +angles;
        this.r = -1;
        this.center = new PolygonPoint(this, { x: 0, y: 0 }, -1);
        this.center.circle.onmousedown = this.movePolygon.bind(this);

        for (let i = 0; i < this.n; i++) {
            this.svgFig.points.appendItem(RefPoint.createSVGPoint({ x: 0, y: 0 }));
            this.refPoints.push(new PolygonPoint(this, { x: 0, y: 0 }, i));
        }

        this.updateNumOfVerts = this.updateNumOfVerts.bind(this);
        this.decreaseNumOfVerts = this.decreaseNumOfVerts.bind(this);
        this.increaseNumOfVerts = this.increaseNumOfVerts.bind(this);
    }

    static draw(event) {
        if (!polygon.checked) {
            return;
        }

        let click = getMouseCoords(event);
        let moving = false;
        const options = optionsPolygon.getElementsByTagName('input');
        const pg = new Polygon(createSVGElem('polygon', undefined, '#000000', 0), +options[0].value);
        svgPanel.appendChild(pg.svgFig);
        ({ x: pg.center.x, y: pg.center.y } = click);

        if (event.ctrlKey) {
            pg.moveFixedOnBottom(options[1].value, 0);
            pg.hideOrShow();
            pg.showRefPoints();
            pg.finished = true;
            return;
        }

        const movePolygon = (e) => {
            moving = true;
            const coords = getMouseCoords(e);
            if (e.shiftKey) {
                const [dx, dy] = [coords.x - pg.center.x, coords.y - pg.center.y];
                const radius = Math.sqrt(dx*dx + dy*dy);
                pg.moveFixedOnBottom(radius, 0);
                options[1].value = pg.r;
                return;
            }
            pg.moveUnfixed(coords, 0);
            options[1].value = pg.r;
        };

        const stopMoving = () => {
            document.removeEventListener('mousemove', movePolygon);
            document.removeEventListener("keydown", pg.updateNumOfVerts);
            drawPanel.removeEventListener('mouseup', stopMoving);
            if (!moving) {
                svgPanel.removeChild(pg.svgFig);
                return;
            }
            pg.hideOrShow();
            pg.showRefPoints();
            pg.finished = true;
        };

        document.addEventListener('mousemove', movePolygon);
        document.addEventListener("keydown", pg.updateNumOfVerts);
        drawPanel.addEventListener('mouseup', stopMoving);
    }

    takePoint(event) {
        if (!cursor.checked || this.somePointTaken || someFigureTaken) {
            return;
        }

        const oldNumOfAngles = this.n;
        const options = optionsPolygon.getElementsByTagName('input');
        const clicked = getMouseCoords(event);
        let ind = this.findIndexMerged(clicked), newInd = null;
        if (ind === undefined) {
            return;
        }

        this.refPoints[ind].circle.setAttribute('fill', '#FFFFFF');
        for (let i = 0; i < ind; i++) {
            this.svgFig.points.appendItem(this.svgFig.points.removeItem(0));
            this.refPoints.push(this.refPoints.shift());
        }
        ind = 0;

        const movePoint = ( (e) => {
            const coords = getMouseCoords(e);
            if (e.altKey) {
                const [dx, dy] = [coords.x - this.center.x, coords.y - this.center.y];
                const radius = Math.sqrt(dx*dx + dy*dy);
                this.moveWithFixedAngeles(radius);
                options[0].value = this.n;
                options[1].value = this.r;
                return;
            } else if (e.ctrlKey) {
                this.moveWithFixedRadius(coords, ind);
                options[0].value = this.n;
                options[1].value = this.r;
                return;
            }
            this.moveUnfixed(coords, ind);
            options[0].value = this.n;
            options[1].value = this.r;
        } ).bind(this);

        const stopMoving = ( (e) => {
            this.deleteTmpCopy();
            this.somePointTaken = someFigureTaken = false;
            this.refPoints[ind].circle.setAttribute('fill', '#FFFFFF');
            document.removeEventListener('mousemove', movePoint);
            document.removeEventListener('keydown', returnToOld);
            document.removeEventListener("keydown", this.updateNumOfVerts);
            this.refPoints[ind].circle.addEventListener('mousedown', this.takePoint);
            drawPanel.removeEventListener('mouseup', stopMoving);
        } ).bind(this);

        const returnToOld = ( (e) => {
            if (e.keyCode == 27) {
                if (this.n != oldNumOfAngles) {
                    const update = (this.n < oldNumOfAngles) ? this.increaseNumOfVerts : this.decreaseNumOfVerts;
                    while (this.n != oldNumOfAngles) {
                        update();
                    }
                }
                movePoint(event);
                stopMoving(e);
            }
        } ).bind(this);

        this.createTmpCopy();
        this.somePointTaken = someFigureTaken = true;
        this.refPoints[ind].circle.setAttribute('fill', '#0000FF');
        document.addEventListener('mousemove', movePoint);
        document.addEventListener('keydown', returnToOld);
        document.addEventListener("keydown", this.updateNumOfVerts);
        this.refPoints[ind].circle.removeEventListener('mousedown', this.takePoint);
        drawPanel.addEventListener('mouseup', stopMoving);
    }

    movePolygon(event) {
        if (!cursor.checked || this.somePointTaken || someFigureTaken) {
            return;
        }

        const move = (e) => {
            const coords = getMouseCoords(e);
            const dx = coords.x - this.center.x, dy = coords.y - this.center.y;
            for (let i = 0; i < this.n; i++) {
                const point = { x: this.refPoints[i].x + dx, y: this.refPoints[i].y + dy };
                this.refPoints[i].setCoords(point);
            }
            this.center.x = coords.x;
            this.center.y = coords.y;
        };

        const stopMoving = (e) => {
            this.deleteTmpCopy();
            this.somePointTaken = someFigureTaken = false;
            this.center.circle.setAttribute('fill', '#FFFFFF');
            this.center.circle.addEventListener('mousedown', this.movePolygon);
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
        this.center.circle.setAttribute('fill', '#0000FF');
        this.center.circle.removeEventListener('mousedown', this.movePolygon);
        document.addEventListener('mousemove', move);
        document.addEventListener('keydown', returnToOld);
        drawPanel.addEventListener('mouseup', stopMoving);
    }

    moveFixedOnBottom(r, ind) {
        this.r = r;
        const baseLen = Math.sqrt(2*r*r - 2*r*r*Math.cos((2*Math.PI)/this.n));
        const h = Math.sqrt(r*r - baseLen*baseLen/4);
        const start = { x: baseLen/2, y: h };
        this.changeVertices(start, ind);
    }

    moveWithFixedRadius(vertex, ind) {
        const start = { x: vertex.x - this.center.x, y: vertex.y - this.center.y };
        const len = Math.sqrt(start.x*start.x + start.y*start.y);
        [start.x, start.y] =  [(this.r/len)*start.x, (this.r/len)*start.y];
        this.changeVertices(start, ind);
    }

    moveUnfixed(vertex, ind) {
        const start = { x: vertex.x - this.center.x, y: vertex.y - this.center.y };
        this.r = Math.sqrt(start.x*start.x + start.y*start.y);
        this.changeVertices(start, ind);
    }

    changeVertices(start, ind) {
        const [dx, dy] = [this.center.x, this.center.y];
        const deg = (2*Math.PI)/this.n;
        for (let i = 0; i < this.n; i++) {
            const x = start.x*Math.cos(i*deg) - start.y*Math.sin(i*deg);
            const y = start.x*Math.sin(i*deg) + start.y*Math.cos(i*deg);
            this.refPoints[(ind + i) % this.n].setCoords({ x: x + dx, y: y + dy });
        }
    }

    moveWithFixedAngeles(newRadius) {
        for (let i = 0; i < this.n; i++) {
            const point = { x: this.refPoints[i].x, y: this.refPoints[i].y };
            point.x = (newRadius/this.r)*(point.x - this.center.x) + this.center.x;
            point.y = (newRadius/this.r)*(point.y - this.center.y) + this.center.y;
            this.refPoints[i].setCoords(point);
        }
        this.r = newRadius;
    }

    updateNumOfVerts(event) {
        const options = optionsPolygon.getElementsByTagName('input');
        if (event.keyCode == 38) {
            options[0].value++;
            this.increaseNumOfVerts();
        } else if (event.keyCode == 40 && this.n > 3) {
            options[0].value--;
            this.decreaseNumOfVerts();
        }
    }

    increaseNumOfVerts() {
        this.svgFig.points.appendItem(RefPoint.createSVGPoint({ x: 0, y: 0 }));
        this.refPoints.push(new PolygonPoint(this, { x: 0, y: 0 }, this.n));
        if (this.finished) {
            svgPanel.appendChild(this.refPoints[this.refPoints.length - 1].circle);
        }
        this.n++
        this.moveUnfixed(this.refPoints[0], 0);
    }

    decreaseNumOfVerts() {
        this.n--;
        if (this.finished) {
            svgPanel.removeChild(this.refPoints[this.refPoints.length - 1].circle);
        }
        this.refPoints.length--;
        this.svgFig.points.removeItem(this.n);
        this.moveUnfixed(this.refPoints[0], 0);
    }

    showRefPoints() {
        this.refPoints.forEach(p => svgPanel.appendChild(p.circle));
        svgPanel.appendChild(this.center.circle);
        this.svgFig.setAttribute('stroke-width', 1);
    }

    hideRefPoints() {
        this.refPoints.forEach(p => svgPanel.removeChild(p.circle));
        svgPanel.removeChild(this.center.circle);
        this.svgFig.setAttribute('stroke-width', 0);
    }

    createTmpCopy() {
        this.copy = createSVGElem('polygon', 'none', '#000000', '1', '0.5', '0.5');
        this.copy.setAttribute('points', this.svgFig.getAttribute('points'));
        svgPanel.insertBefore(this.copy, this.svgFig.nextSibling);
    }

    showOptions() {
        hideAllOptions();
        optionsPolygon.classList.add('show-option');
        const options = optionsPolygon.getElementsByTagName('input');
        options[0].value = this.n;
        options[1].value = this.r;
    }
}

class PolygonPoint extends RefPoint {
    constructor(figure, coords, ind) {
        super(figure, coords,polygon);
        this.svgPoint = figure.svgFig.points[ind];

        this.circle.addEventListener('mousedown', this.figure.takePoint.bind(this.figure));
    }

    setCoords(coords) {
        this.svgPoint.x = this.x = coords.x;
        this.svgPoint.y = this.y = coords.y;
    }
}

drawPanel.addEventListener('mousedown', Polygon.draw = Polygon.draw.bind(Polygon));

{
    const inputs = optionsPolygon.getElementsByTagName('input');
    const selectors = optionsPolygon.getElementsByTagName('ul');
    Figure.addPanelListener(Polygon, inputs, selectors, 0, () => {
        let n = +inputs[0].value;
        if (n < 3) {
            n = 3;
        }
        if (currentFigure.n != n) {
            const update = (currentFigure.n < n) ? currentFigure.increaseNumOfVerts
                                            : currentFigure.decreaseNumOfVerts;
            while (currentFigure.n != n) {
                update();
            }
        }
    });
    Figure.addPanelListener(Polygon, inputs, selectors, 1, () => {
        currentFigure.moveWithFixedAngeles(+inputs[1].value);
    });
}
