/*
    Скрипт для создания многоугольника.
    Создание аналогично остальным фигурам. При этом, если зажата клавиша shift,
    то нижняя сторона многоугольника будет находиться в горизонтальном положении.
    При помощи стрелок вверх и вниз можно изменять количество углов во время
    создания многоугольника. После создания доступна клавиша alt, позволяющая
    сохранить угол наклона фигуры. При этом остальные клавиши недоступны.
*/
'use strict';

var angles = 6; // Временная переменная

const polygon = document.getElementById('polygon');

class Polygon extends Figure {
    constructor(svgFig) {
        super(svgFig);
        this.n = angles;
        this.r = -1;
        this.center = new PolygonPoint(this, { x: 0, y: 0 }, -1);
        this.center.circle.onmousedown = this.movePolygon.bind(this);

        for (let i = 0; i < this.n; i++) {
            this.refPoints.push(new PolygonPoint(this, { x: 0, y: 0 }, i));
            this.svgFig.points.appendItem(RefPoint.createSVGPoint({ x: 0, y: 0 }));
        }
    }

    static draw(event) {
        if (!polygon.checked) {
            return;
        }

        let click = getMouseCoords(event);
        const pg = new Polygon(createSVGElem('polygon', 'none', undefined, '3'));
        svgPanel.appendChild(pg.svgFig);
        ({ x: pg.center.x, y: pg.center.y } = click);

        const movePolygon = (e) => {
            const coords = getMouseCoords(e);
            if (e.shiftKey) {
                const [dx, dy] = [coords.x - pg.center.x, coords.y - pg.center.y];
                const radius = Math.sqrt(dx*dx + dy*dy);
                pg.moveFixedOnBottom(radius, pg.refPoints[0].ind);
                return;
            }
            pg.moveUnfixed(coords, 0)
        };

        const updateNumOfVerts = (event) => {
            if (event.keyCode == 38) {
                pg.refPoints.push(new PolygonPoint(pg, { x: 0, y: 0 }, pg.n));
                pg.svgFig.points.appendItem(RefPoint.createSVGPoint({ x: 0, y: 0 }));
                pg.n++
            } else if (event.keyCode == 40 && pg.n > 3) {
                pg.n--;
                pg.refPoints.length--;
                pg.svgFig.points.removeItem(pg.n);
            }
            pg.moveFixedOnBottom(pg.r, 0);
        };

        const stopMoving = () => {
            document.removeEventListener('mousemove', movePolygon);
            document.removeEventListener("keydown", updateNumOfVerts);
            drawPanel.removeEventListener('mouseup', stopMoving);
            pg.hideOrShow(true, polygon);
            pg.showRefPoints();
        };

        document.addEventListener('mousemove', movePolygon);
        document.addEventListener("keydown", updateNumOfVerts);
        drawPanel.addEventListener('mouseup', stopMoving);
    }

    takePoint(event) {
        if (!cursor.checked) {
            return;
        }

        const clicked = getMouseCoords(event);
        let ind = this.findIndexMerged(clicked), newInd = null;
        if (ind === undefined) {
            return;
        }

        const movePoint = ( (e) => {
            const coords = getMouseCoords(e);
            const [dx, dy] = [coords.x - this.center.x, coords.y - this.center.y];
            const radius = Math.sqrt(dx*dx + dy*dy);
            if (e.altKey) {
                this.moveWithFixedAngeles(radius);
                return;
            }
            this.moveUnfixed(coords, ind)
        } ).bind(this);

        const stopMoving = ( (e) => {
            this.deleteTmpCopy();
            this.somePointTaken = someFigureTaken = false;
            this.refPoints[ind].circle.setAttribute('fill', '#FFFFFF');
            document.removeEventListener('mousemove', movePoint);
            this.refPoints[ind].circle.addEventListener('mousedown', this.takePoint);
            drawPanel.removeEventListener('mouseup', stopMoving);
        } ).bind(this);

        this.createTmpCopy();
        this.somePointTaken = someFigureTaken = true;
        this.refPoints[ind].circle.setAttribute('fill', '#0000FF');
        document.addEventListener('mousemove', movePoint);
        this.refPoints[ind].circle.removeEventListener('mousedown', this.takePoint);
        drawPanel.addEventListener('mouseup', stopMoving);
    }

    movePolygon(event) {
        if (!cursor.checked || this.somePointTaken || someFigureTaken) {
            return;
        }
        const clicked = getMouseCoords(event);

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
            drawPanel.removeEventListener('mouseup', stopMoving);
        };

        this.createTmpCopy();
        this.somePointTaken = someFigureTaken = true;
        this.center.circle.setAttribute('fill', '#0000FF');
        this.center.circle.removeEventListener('mousedown', this.movePolygon);
        document.addEventListener('mousemove', move);
        drawPanel.addEventListener('mouseup', stopMoving);
    }

    moveFixedOnBottom(r, ind) {
        this.r = r;
        const baseLen = Math.sqrt(2*r*r - 2*r*r*Math.cos((2*Math.PI)/this.n));
        const h = Math.sqrt(r*r - baseLen*baseLen/4);
        const start = { x: baseLen/2, y: h };
        this.changeVertices(start, ind, this.center.x, this.center.y);
    }

    moveUnfixed(vertex, ind) {
        const start = { x: vertex.x - this.center.x, y: vertex.y - this.center.y };
        this.r = Math.sqrt(start.x*start.x + start.y*start.y);
        this.changeVertices(start, ind, this.center.x, this.center.y);
    }

    changeVertices(start, ind, dx, dy) {
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

    showRefPoints() {
        this.refPoints.forEach(p => svgPanel.appendChild(p.circle));
        svgPanel.appendChild(this.center.circle);
    }

    hideRefPoints() {
        this.refPoints.forEach(p => svgPanel.removeChild(p.circle));
        svgPanel.removeChild(this.center.circle);
    }

    createTmpCopy() {
        this.copy = createSVGElem('polygon', 'none', '#000000', '1', '0.5', '0.5');
        this.copy.setAttribute('points', this.svgFig.getAttribute('points'));
        svgPanel.insertBefore(this.copy, this.svgFig);
    }
}

class PolygonPoint extends RefPoint {
    constructor(figure, coords, ind) {
        super(figure, coords, 3, polygon);
        this.ind = ind;

        this.circle.addEventListener('mousedown', this.figure.takePoint.bind(this.figure));
    }

    setCoords(coords) {
        this.figure.svgFig.points[this.ind].x = this.x = coords.x;
        this.figure.svgFig.points[this.ind].y = this.y = coords.y;
    }
}

drawPanel.addEventListener('mousedown', Polygon.draw = Polygon.draw.bind(Polygon));
