/*Скрипт для работы инструмента "Прямая"*/
'use strict';

class Line extends Figure {
    constructor(svgFigure) {
        super(svgFigure);
        this.center = new LinePoint(this);
        this.center.circle.onmousedown = this.moveLine.bind(this);

        let isErasing = false;
        this.svgFig.addEventListener('mousedown', this.erase.bind(this));
        this.svgFig.addEventListener('mousemove', this.start.bind(this));

        this.refPoints.push(new LinePoint(this));
        this.refPoints.push(new LinePoint(this));
    }

    static create(svgFigure) {
        const obj = new Line(svgFigure);
        const get = attr => svgFigure.getAttribute(attr);
        obj.setAttrs([get('x1'), get('y1'), get('x2'), get('y2')]);
        obj.updateRefPointsCoords();
        obj.hideOrShow();
        svgPanel.appendChild(obj.svgFig);
        obj.isShowing = false;
        obj.finished = true;
        currentFigure = null;
        return obj;
    }

    static draw(event) {
        if (!line.checked) return;

        let click = getMouseCoords(event);
        let moving = false;
        const options = optionsLine.getElementsByTagName('input');
        const obj = new Line(createSVGElem('line',
            'undefined',
            paletteColor,
            options[0].value,
            '1'));
        svgPanel.appendChild(obj.svgFig);

        const moveLine = (event) => {
            moving = true;
            const current = getMouseCoords(event);
            obj.svgFig.setAttribute('stroke-opacity', '0.5');
            obj.moveByAngeles(click, current);
            const dx = current.x - click.x;
            const dy = current.y - click.y;
            options[1].value = Math.sqrt(dx*dx + dy*dy);
        };

        const stopMoving = () => {
            document.removeEventListener('mousemove', moveLine);
            drawPanel.removeEventListener('mouseup', stopMoving);
            if (!moving) {
                svgPanel.removeChild(obj.svgFig);
                return;
            }
            obj.svgFig.setAttribute('stroke-opacity', '1');
            obj.updateRefPointsCoords();
            obj.hideOrShow();
            obj.showRefPoints();
            obj.finished = true;
        };

        document.addEventListener('mousemove', moveLine);
        drawPanel.addEventListener('mouseup', stopMoving);
    }
        
    erase(event) {
        if (!eraser.checked) return;
        isErasing = true;
    }

    start(event) {
        if (!isErasing) return;

        const calcPointToCut = (src, dest, eraserCoord) => {
            const temp = (dest.x - src.x) / (dest.y - src.y);
            const y = (eraserCoord.x - src.x + eraserCoord.y/temp + temp*src.y) / (temp + 1/temp);
            const x = temp * (y - src.y) + src.x;
            return { x: x, y: y };
        }

        const getDist = (src, dest) => {
            const dx = dest.x - src.x;
            const dy = dest.y - src.y;
            return Math.sqrt(dx*dx + dy*dy);
        }
        
        const options = optionsEraser.getElementsByTagName('input');
        const current = getMouseCoords(event);
        const width = options[0].value / 2;
        const eraserCoords = [ { x: current.x - width, y: current.y + width },
                               { x: current.x + width, y: current.y + width },
                               { x: current.x + width, y: current.y - width },
                               { x: current.x - width, y: current.y - width } ];

        let min1 = this.length, min2 = this.length;
        let point1 = { x: 0, y: 0 }, point2 = { x: 0, y: 0 };
        for (let i = 0; i < eraserCoords.length; i++) {
            const point = calcPointToCut({ x: this.x1, y: this.y1 },
                                         { x: this.x2, y: this.y2 },
                                         eraserCoords[i]);
            const dist1 = getDist({ x: this.x1, y: this.y1 }, point);
            if (min1 > dist1) {
                min1 = dist1;
                point1 = point;
            }
            const dist2 = getDist(point, { x: this.x2, y: this.y2 });
            if (min2 > dist2) {
                min2 = dist2;
                point2 = point;
            }
        }

        const maxX = this.x1 > this.x2 ? this.x1 : this.x2;
        const maxY = this.y1 > this.y2 ? this.y1 : this.y2;
        const minX = this.x1 < this.x2 ? this.x1 : this.x2;
        const minY = this.y1 < this.y2 ? this.y1 : this.y2;

        if (minX <= point1.x && point1.x <= maxX && minY <= point1.y && point1.y <= maxY) {
            const obj = Line.create(createSVGElem('line'));
            copySVGStyle(obj.svgFig, this.svgFig);
            obj.x1 = this.x1;    obj.y1 = this.y1;
            obj.x2 = point1.x;   obj.y2 = point1.y;
            svgPanel.appendChild(obj.svgFig);
            obj.updateRefPointsCoords();
        }

        if (minX <= point2.x && point2.x <= maxX && minY <= point2.y && point2.y <= maxY) {
            const obj = Line.create(createSVGElem('line'));
            copySVGStyle(obj.svgFig, this.svgFig);
            obj.x1 = point2.x;   obj.y1 = point2.y;
            obj.x2 = this.x2;    obj.y2 = this.y2;
            svgPanel.appendChild(obj.svgFig);
            obj.updateRefPointsCoords();
        }

        svgPanel.removeChild(this.svgFig);
        this.svgFig = null;
        currentFigure = null;
    }

    takePoint(event) {
        if (!cursor.checked || this.somePointTaken || someFigureTaken) {
            return;
        }

        const oldAttrs = [this.x1, this.y1, this.x2, this.y2];
        const options = optionsLine.getElementsByTagName('input');
        const clicked = getMouseCoords(event);
        let ind = this.findIndexMerged(clicked), newInd = null;
        if (ind === undefined) return;
        const symInd = this.findIndexMerged(this.getSymmetrical(clicked));
        const pushed = {x: this.refPoints[ind].x, y: this.refPoints[ind].y};
        let fixed = {x: this.refPoints[symInd].x, y: this.refPoints[symInd].y};
        const [horizontal, angelPushed] = [pushed.y == fixed.y, !(pushed.y == fixed.y || pushed.x == fixed.x)];

        const movePoint = ((event) => {
            const coords = getMouseCoords(event);

            if (angelPushed) {
                this.moveByAngeles(fixed, coords);
            } else {
                const coord = (horizontal) ? 'y' : 'x';
                coords[coord] = pushed[coord];
                this.moveByMiddles(fixed, coords, horizontal);
            }

            this.updateRefPointsCoords();
            newInd = this.findIndexMerged(this.getSymmetrical(fixed));
            if (newInd != ind) {
                this.refPoints[ind].circle.setAttribute('fill', '#FFFFFF');
                ind = newInd;
                this.refPoints[ind].circle.setAttribute('fill', '#0000FF');
            }
            options[1].value = this.length;
        }).bind(this);

        const stopMoving = (event) => {
            const upped = this.findIndexMerged(getMouseCoords(event), ind);
            if (upped !== undefined) return;
            this.deleteTmpCopy();
            this.somePointTaken = someFigureTaken = false;
            this.refPoints[ind].circle.setAttribute('fill', '#FFFFFF');
            document.removeEventListener('mousemove', movePoint);
            document.removeEventListener('keydown', returnToOld);
            this.refPoints[ind].circle.addEventListener('mousedown', this.takePoint);
            drawPanel.removeEventListener('mouseup', stopMoving);
        };

        const returnToOld = ((event) => {
            if (e.keyCode == 27) {
                this.setAttrs(oldAttrs);
                this.updateRefPointsCoords();
                stopMoving(event);
            }
        }).bind(this);

        this.createTmpCopy();
        this.somePointTaken = someFigureTaken = true;
        this.refPoints[ind].circle.setAttribute('fill', '#0000FF');
        document.addEventListener('mousemove', movePoint);
        document.addEventListener('keydown', returnToOld);
        this.refPoints[ind].circle.removeEventListener('mousedown', this.takePoint);
        drawPanel.addEventListener('mouseup', stopMoving);
    }

    moveLine(event) {
        if (!cursor.checked || this.somePointTaken || someFigureTaken) {
            return;
        }
        const move = (event) => {
            const coords = getMouseCoords(event);
            const dx = coords.x - this.c.x;
            const dy = coords.y - this.c.y;
            this.x1 += dx;
            this.x2 += dx;
            this.y1 += dy;
            this.y2 += dy;
            this.updateRefPointsCoords();
        };

        const stopMoving = (event) => {
            this.deleteTmpCopy();
            this.somePointTaken = someFigureTaken = false;
            this.center.circle.setAttribute('fill', '#FFFFFF');
            this.center.circle.addEventListener('mousedown', this.moveLine);
            document.removeEventListener('mousemove', move);
            document.removeEventListener('keydown', returnToOld);
            drawPanel.removeEventListener('mouseup', stopMoving);
        };

        const returnToOld = (event) => {
            if (event.keyCode == 27) {
                move(event);
                stopMoving();
            }
        };

        this.createTmpCopy();
        this.somePointTaken = someFigureTaken = true;
        this.center.circle.setAttribute('fill', '#0000FF');
        this.center.circle.removeEventListener('mousedown', this.moveLine);
        document.addEventListener('mousemove', move);
        document.addEventListener('keydown', returnToOld);
        drawPanel.addEventListener('mouseup', stopMoving);
    }

    updateRefPointsCoords() {
        const update = (ind, x, y) => this.refPoints[ind].setCoords({x: x, y: y});
        const [x1, y1, x2, y2] = [this.x1, this.y1, this.x2, this.y2];
        update(0, x1, y1);
        update(1, x2, y2);
        this.center.setCoords(this.c);
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

    setAttrs(attrs) {
        [this.x1, this.y1, this.x2, this.y2] = attrs;
    }

    getAttrsByAngeles(a, b) {
        return [a.x, a.y, b.x, b.y];
    }

    getSymmetrical(point) {
        return {
            x: 2*this.c.x - point.x,
            y: 2*this.c.y - point.y
        };
    }

    createTmpCopy() {
        this.copy = createSVGElem('line', 'undefined', '#000000', '1', '0.5');
        this.copy.setAttribute('x1', this.x1);
        this.copy.setAttribute('y1', this.y1);
        this.copy.setAttribute('x2', this.x2);
        this.copy.setAttribute('y2', this.y2);
        svgPanel.insertBefore(this.copy, this.svgFigure);
    }

    showOptions() {
        hideAllOptions();
        optionsLine.classList.add('show-option');
        const options = optionsLine.getElementsByTagName('input');
        options[0].value = this.svgFig.getAttribute('stroke-width');
        options[1].value = this.length;
    }

    set x1(v) { this.svgFig.setAttribute('x1', +v); }
    set y1(v) { this.svgFig.setAttribute('y1', +v); }
    set x2(v) { this.svgFig.setAttribute('x2', +v); }
    set y2(v) { this.svgFig.setAttribute('y2', +v); }

    get x1() { return +this.svgFig.getAttribute('x1'); }
    get y1() { return +this.svgFig.getAttribute('y1'); }
    get x2() { return +this.svgFig.getAttribute('x2'); }
    get y2() { return +this.svgFig.getAttribute('y2'); }
    get  c() { return {x: (this.x1 + this.x2)/2, y: (this.y1 + this.y2)/2}; }
    get length() {
        const dx = this.x2 - this.x1;
        const dy = this.y2 - this.y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

class LinePoint extends RefPoint {
    constructor(obj, coords = {x: 0, y: 0}) {
        super(obj, coords, line);
        this.circle.addEventListener('mousedown', this.figure.takePoint.bind(this.figure));
    }

    setCoords(coords) {
        this.x = coords.x;
        this.y = coords.y;
    }
}

drawPanel.addEventListener('mousedown', Line.draw = Line.draw.bind(Line));

{
    const inputs = optionsLine.getElementsByTagName('input');
    const selectors = optionsLine.getElementsByTagName('ul');
    Figure.addPanelListener(Line, inputs, selectors, 0, () => {
        currentFigure.svgFig.setAttribute('stroke-width', +inputs[0].value);
    });
    Figure.addPanelListener(Line, inputs, selectors, 1, () => {
        if (+inputs[1].value <= 0) {
            inputs[1].value = currentFigure.length;
            return;
        }
        const sin = (currentFigure.y2 - currentFigure.y1) / currentFigure.length;
        const cos = (currentFigure.x2 - currentFigure.x1) / currentFigure.length;
        currentFigure.x2 = currentFigure.x1 + (+inputs[1].value * cos);
        currentFigure.y2 = currentFigure.y1 + (+inputs[1].value * sin);
        currentFigure.updateRefPointsCoords();
    });

    colorPicker.addEventListener("mousedown", (event) => {
        if (currentFigure != null) {
            currentFigure.svgFig.setAttribute('stroke', paletteColor);
        }
    });
}
