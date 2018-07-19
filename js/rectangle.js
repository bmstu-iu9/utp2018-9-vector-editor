/*
    Скрипт для создания прямоугольника(простого и округленного).
    Для построения прямоугольника необходимо кликнуть ЛКМ и затем, не отжимая ее,
    провести прямоугольник нужного размера. После этого размеры прямоугольника
    можно изменять перемещая его опорные точки. Если при этом зажать Alt, то
    изменение размеров будет совершаться симметрично центру описанной окружности.
*/
'use strict';

var RADIUS = 10; //Временная переменная

const rect = document.getElementById('rect');
const roundedRect = document.getElementById('rounded-rect');

class Rectangle extends Figure {
    constructor(svgFigure, kindOfRect) {
        super(svgFigure);

        this.center = new RectPoint(this, { x: 0, y: 0}, kindOfRect);
        this.center.circle.onclick = null;
        this.center.circle.onmousedown = this.moveRect.bind(this);

        for (let i = 0; i < 8; i++) {
            this.refPoints.push(new RectPoint(this, { x: 0, y: 0}, kindOfRect));
        }

        this.getMergeCoords = this.getMergeCoords.bind(this);
        this.findIndexMerged = this.findIndexMerged.bind(this);
    }

    static draw(event) {
        if (!rect.checked && !roundedRect.checked) {
            return;
        }
        const click = getMouseCoords(event);
        const rectangle = new Rectangle(createSVGElem('rect', 'none'), currentInstrument);
        if (roundedRect.checked) {
            rectangle.r = RADIUS;
        }
        svgPanel.appendChild(rectangle.svgFig);
        const moveRect = (e) => rectangle.moveByAngeles(click, getMouseCoords(e));
        document.addEventListener('mousemove', moveRect);
        const stopMoving = () => {
            document.removeEventListener('mousemove', moveRect);
            drawPanel.removeEventListener('mouseup', stopMoving);
            rectangle.updateRefPointsCoords();
            rectangle.hideOrShow(true, currentInstrument);
            rectangle.showRefPoints();
        };
        drawPanel.addEventListener('mouseup', stopMoving);
    }

    takePoint(event) {
        if (!cursor.checked || this.somePointTaken || someFigureTaken) {
            return;
        }

        const clicked = getMouseCoords(event);
        let ind = this.findIndexMerged(clicked), newInd = null;
        if (ind === undefined) {
            return;
        }
        const symInd = this.findIndexMerged(this.getSymmetrical(clicked));
        const pushed = { x: this.refPoints[ind].x, y: this.refPoints[ind].y };
        let fixed = { x: this.refPoints[symInd].x, y: this.refPoints[symInd].y };
        const [horizontal, angelPushed] = [pushed.y == fixed.y, !(pushed.y == fixed.y || pushed.x == fixed.x)];

        const movePoint = ( (e) => {
            const coords = getMouseCoords(e);
            if (angelPushed) {
                if (e.altKey) {
                    fixed = this.getSymmetrical(coords);
                }
                this.moveByAngeles(fixed, coords);
            } else {
                const coord = (horizontal) ? 'y' : 'x';
                coords[coord] = pushed[coord];
                if (e.altKey) {
                    fixed = this.getSymmetrical(coords);
                }
                this.moveByMiddles(fixed, coords, horizontal);
            }

            this.updateRefPointsCoords();
            newInd = this.findIndexMerged(this.getSymmetrical(fixed));
            if (newInd != ind) {
                this.refPoints[ind].circle.setAttribute('fill', '#FFFFFF');
                ind = newInd;
                this.refPoints[ind].circle.setAttribute('fill', '#0000FF');
            }
        } ).bind(this);

        const stopMoving = (e) => {
            const upped = this.findIndexMerged(getMouseCoords(e), ind);
            if (upped !== undefined) {
                return;
            }
            this.deleteTmpCopy();
            this.somePointTaken = someFigureTaken = false;
            this.refPoints[ind].circle.setAttribute('fill', '#FFFFFF');
            document.removeEventListener('mousemove', movePoint);
            this.refPoints[ind].circle.addEventListener('mousedown', this.takePoint);
            drawPanel.removeEventListener('mouseup', stopMoving);
        };

        this.createTmpCopy();
        this.somePointTaken = someFigureTaken = true;
        this.refPoints[ind].circle.setAttribute('fill', '#0000FF');
        document.addEventListener('mousemove', movePoint);
        this.refPoints[ind].circle.removeEventListener('mousedown', this.takePoint);
        drawPanel.addEventListener('mouseup', stopMoving);
    }

    moveRect(event) {
        if (!cursor.checked || this.somePointTaken || someFigureTaken) {
            return;
        }
        const clicked = getMouseCoords(event);

        const move = (e) => {
            const coords = getMouseCoords(e);
            this.x = coords.x - this.width/2;
            this.y = coords.y - this.height/2;
            this.center.setCoords(coords);
            this.updateRefPointsCoords();
        };

        const stopMoving = (e) => {
            this.deleteTmpCopy();
            this.somePointTaken = someFigureTaken = false;
            this.center.circle.setAttribute('fill', '#FFFFFF');
            this.center.circle.addEventListener('mousedown', this.moveRect);
            document.removeEventListener('mousemove', move);
            drawPanel.removeEventListener('mouseup', stopMoving);
        };

        this.createTmpCopy();
        this.somePointTaken = someFigureTaken = true;
        this.center.circle.setAttribute('fill', '#0000FF');
        this.center.circle.removeEventListener('mousedown', this.moveRect);
        document.addEventListener('mousemove', move);
        drawPanel.addEventListener('mouseup', stopMoving);
    }

    updateRefPointsCoords() {
        const update = (ind, x, y) => this.refPoints[ind].setCoords({ x: x, y: y});
        const [x, y, width, height] = [this.x, this.y, this.width, this.height];
        update(0, x, y);
        update(1, x + width/2, y);
        update(2, x + width, y);
        update(3, x + width, y + height/2);
        update(4, x + width, y + height);
        update(5, x + width/2, y + height);
        update(6, x, y + height);
        update(7, x, y + height/2);
    }

    showRefPoints() {
        this.refPoints.forEach(p => svgPanel.appendChild(p.circle));
        svgPanel.appendChild(this.center.circle);
    }

    hideRefPoints() {
        this.refPoints.forEach(p => svgPanel.removeChild(p.circle));
        svgPanel.removeChild(this.center.circle);
    }

    moveByAngeles(a, c) {
        this.setAttrs(this.getAttrsByAngeles(a, c));
    }

    moveByMiddles(fixed, moving, horizontal) {
        this.setAttrs(this.getAttrsByMiddles(fixed, moving, horizontal));
    }

    setAttrs(attrs) {
        [this.x, this.y, this.width, this.height] = attrs;
        this.center.setCoords(this.c);
    }

    getAttrsByAngeles(a, b) {
        let x, y, width, height;
        let upper, lower, right;
        upper = (a.y > b.y) ? (lower = a, b) : (lower = b, a);
        right = (a.x > b.x) ? a : b;
        if (upper == right) {
            [x, y, width, height] = [lower.x, upper.y, upper.x - lower.x, lower.y - upper.y];
        } else {
            [x, y, width, height] = [upper.x, upper.y, lower.x - upper.x, lower.y - upper.y];
        }
        return [x, y, width, height];
    }

    getAttrsByMiddles(fixed, moving, horizontal) {
        let x, y, width, height;
        if (horizontal) {
            const left = (fixed.x < moving.x) ? fixed : moving;
            [x, y, width, height] = [left.x, fixed.y - this.height/2, Math.abs(fixed.x - moving.x), this.height];
        } else {
            const upper = (fixed.y < moving.y) ? fixed : moving;
            [x, y, width, height] = [fixed.x - this.width/2, upper.y, this.width, Math.abs(fixed.y - moving.y)];
        }
        return [x, y, width, height];
    }

    getSymmetrical(point) {
        return { x: 2*this.c.x - point.x, y: 2*this.c.y - point.y };
    }

    createTmpCopy() {
        this.copy = createSVGElem('rect', 'none', '#000000', '1', '0.5', '0.5');
        this.copy.setAttribute('x', this.x);
        this.copy.setAttribute('y', this.y);
        this.copy.setAttribute('width', this.width);
        this.copy.setAttribute('height', this.height);
        this.copy.setAttribute('rx', this.r);
        this.copy.setAttribute('ry', this.r);
        svgPanel.insertBefore(this.copy, this.svgFig);
    }

    deleteTmpCopy() {
        svgPanel.removeChild(this.copy);
        delete this.copy;
    }

    get x() { return +this.svgFig.getAttribute('x'); }
    get y() { return +this.svgFig.getAttribute('y'); }
    get r() { return +this.svgFig.getAttribute('rx'); }
    get width() { return +this.svgFig.getAttribute('width'); }
    get height() { return +this.svgFig.getAttribute('height'); }
    get c() { return { x: this.x + this.width/2, y: this.y + this.height/2 }; }

    set x(v) { this.svgFig.setAttribute('x', v); }
    set y(v) { this.svgFig.setAttribute('y', v); }
    set width(v) { this.svgFig.setAttribute('width', v); }
    set height(v) { this.svgFig.setAttribute('height', v); }
    set r(v) {
        this.svgFig.setAttribute('rx', v);
        this.svgFig.setAttribute('ry', v);
    }
}

class RectPoint extends RefPoint {
    constructor(rectangle, coords, kindOfRect) {
        super(rectangle, coords, 3, kindOfRect);

        this.circle.addEventListener('mousedown', this.figure.takePoint.bind(this.figure));
    }

    setCoords(coords) {
        this.x = coords.x;
        this.y = coords.y;
    }
}

drawPanel.addEventListener('mousedown', Rectangle.draw = Rectangle.draw.bind(Rectangle));
