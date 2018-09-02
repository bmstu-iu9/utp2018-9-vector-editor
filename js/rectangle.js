/*
    Скрипт для создания прямоугольника(простого и округленного).
    Для построения прямоугольника необходимо кликнуть ЛКМ и затем, не отжимая ее,
    провести прямоугольник нужного размера. После этого размеры прямоугольника
    можно изменять перемещая его опорные точки. Если при этом зажать Alt, то
    изменение размеров будет совершаться симметрично центру описанной окружности.
*/
'use strict';

class Rectangle extends Figure {
    constructor(svgFigure) {
        super(svgFigure);

        this.center = new RectPoint(this, { x: 0, y: 0});
        this.center.circle.onmousedown = this.moveRect.bind(this);

        for (let i = 0; i < 8; i++) {
            this.refPoints.push(new RectPoint(this, { x: 0, y: 0}));
        }

        this.getMergeCoords = this.getMergeCoords.bind(this);
        this.findIndexMerged = this.findIndexMerged.bind(this);
    }

    static create(svgFigure) {
        const rectangle = new Rectangle(svgFigure);
        const get = attr => svgFigure.getAttribute(attr);
        rectangle.setAttrs([get('x'), get('y'), get('width'), get('height')]);
        rectangle.r = get('rx');
        rectangle.updateRefPointsCoords();
        rectangle.hideOrShow();
        svgPanel.appendChild(rectangle.svgFig);
        rectangle.isShowing = false;
        rectangle.finished = true;
        currentFigure = null;
        return rectangle;
    }

    static draw(event) {
        if (!rect.checked) {
            return;
        }

        let click = getMouseCoords(event);
        let moving = false;
        const options = optionsRect.getElementsByTagName('input');
        const rectangle = new Rectangle(createSVGElem('rect', undefined, '#000000', 0));
        ({ x: rectangle.x, y: rectangle.y } = click);
        rectangle.r = +options[0].value;
        svgPanel.appendChild(rectangle.svgFig);

        if (event.ctrlKey) {
            rectangle.height = +options[1].value;
            rectangle.width = +options[2].value;
            rectangle.updateRefPointsCoords();
            rectangle.center.setCoords(rectangle.c);
            rectangle.hideOrShow();
            rectangle.showRefPoints();
            rectangle.finished = true;
            return;
        }

        const moveRect = (e) => {
            moving = true;
            const current = getMouseCoords(e);
            if (e.altKey) {
                click = rectangle.getSymmetrical(current);
            }
            rectangle.moveByAngeles(click, current);
            options[1].value = rectangle.height;
            options[2].value = rectangle.width;
        };

        const stopMoving = () => {
            document.removeEventListener('mousemove', moveRect);
            drawPanel.removeEventListener('mouseup', stopMoving);
            if (!moving) {
                svgPanel.removeChild(rectangle.svgFig);
                return;
            }
            rectangle.updateRefPointsCoords();
            rectangle.hideOrShow();
            rectangle.showRefPoints();
            rectangle.finished = true;
        };

        document.addEventListener('mousemove', moveRect);
        drawPanel.addEventListener('mouseup', stopMoving);
    }

    takePoint(event) {
        if (!cursor.checked || this.somePointTaken || someFigureTaken) {
            return;
        }

        const oldAttrs = [this.x, this.y, this.width, this.height];
        const options = optionsRect.getElementsByTagName('input');
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
            options[1].value = this.height;
            options[2].value = this.width;
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
            document.removeEventListener('keydown', returnToOld);
            this.refPoints[ind].circle.addEventListener('mousedown', this.takePoint);
            drawPanel.removeEventListener('mouseup', stopMoving);
        };

        const returnToOld = ( (e) => {
            if (e.keyCode == 27) {
                this.setAttrs(oldAttrs);
                this.updateRefPointsCoords();
                stopMoving(e);
            }
        } ).bind(this);

        this.createTmpCopy();
        this.somePointTaken = someFigureTaken = true;
        this.refPoints[ind].circle.setAttribute('fill', '#0000FF');
        document.addEventListener('mousemove', movePoint);
        document.addEventListener('keydown', returnToOld);
        this.refPoints[ind].circle.removeEventListener('mousedown', this.takePoint);
        drawPanel.addEventListener('mouseup', stopMoving);
    }

    moveRect(event) {
        if (!cursor.checked || this.somePointTaken || someFigureTaken) {
            return;
        }

        const move = (e) => {
            const coords = getMouseCoords(e);
            this.x = coords.x - this.width/2;
            this.y = coords.y - this.height/2;
            this.updateRefPointsCoords();
        };

        const stopMoving = (e) => {
            this.deleteTmpCopy();
            this.somePointTaken = someFigureTaken = false;
            this.center.circle.setAttribute('fill', '#FFFFFF');
            this.center.circle.addEventListener('mousedown', this.moveRect);
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
        this.center.circle.removeEventListener('mousedown', this.moveRect);
        document.addEventListener('mousemove', move);
        document.addEventListener('keydown', returnToOld);
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
        this.center.setCoords(this.c);
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

    moveByAngeles(a, c) {
        this.setAttrs(this.getAttrsByAngeles(a, c));
    }

    moveByMiddles(fixed, moving, horizontal) {
        this.setAttrs(this.getAttrsByMiddles(fixed, moving, horizontal));
    }

    setAttrs(attrs) {
        [this.x, this.y, this.width, this.height] = attrs;
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
            [x, y, width, height] = [left.x, this.y, Math.abs(fixed.x - moving.x), this.height];
        } else {
            const upper = (fixed.y < moving.y) ? fixed : moving;
            [x, y, width, height] = [this.x, upper.y, this.width, Math.abs(fixed.y - moving.y)];
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
        svgPanel.insertBefore(this.copy, this.svgFig.nextSibling);
    }

    showOptions() {
        hideAllOptions();
        optionsRect.classList.add('show-option');
        const options = optionsRect.getElementsByTagName('input');
        options[0].value = this.r;
        options[1].value = this.height;
        options[2].value = this.width;
    }

    get x() { return +this.svgFig.getAttribute('x'); }
    get y() { return +this.svgFig.getAttribute('y'); }
    get r() { return +this.svgFig.getAttribute('rx'); }
    get width() { return +this.svgFig.getAttribute('width'); }
    get height() { return +this.svgFig.getAttribute('height'); }
    get c() { return { x: this.x + this.width/2, y: this.y + this.height/2 }; }

    set x(v) { this.svgFig.setAttribute('x', +v); }
    set y(v) { this.svgFig.setAttribute('y', +v); }
    set width(v) { this.svgFig.setAttribute('width', +v); }
    set height(v) { this.svgFig.setAttribute('height', +v); }
    set r(v) {
        this.svgFig.setAttribute('rx', +v);
        this.svgFig.setAttribute('ry', +v);
    }
}

class RectPoint extends RefPoint {
    constructor(rectangle, coords) {
        super(rectangle, coords, rect);

        this.circle.addEventListener('mousedown', this.figure.takePoint.bind(this.figure));
    }

    setCoords(coords) {
        this.x = coords.x;
        this.y = coords.y;
    }
}

drawPanel.addEventListener('mousedown', Rectangle.draw = Rectangle.draw.bind(Rectangle));

{
    const inputs = optionsRect.getElementsByTagName('input');
    const selectors = optionsRect.getElementsByTagName('ul');
    Figure.addPanelListener(Rectangle, inputs, selectors, 0, () => {
        currentFigure.r = +inputs[0].value;
    });
    Figure.addPanelListener(Rectangle, inputs, selectors, 1, () => {
        currentFigure.height = +inputs[1].value;
        currentFigure.updateRefPointsCoords();
    });
    Figure.addPanelListener(Rectangle, inputs, selectors, 2, () => {
        currentFigure.width = +inputs[2].value;
        currentFigure.updateRefPointsCoords();
    });
}
