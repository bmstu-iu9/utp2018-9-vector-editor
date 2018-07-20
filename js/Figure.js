'use strict';

class Figure {
    constructor(svgFigure) {
        this.svgFig = svgFigure;
        this.refPoints = [];
        this.finished = false;
        this.somePointTaken = false;
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

    findIndexMerged(point, miss = -1) {
        for (let i = 0; i < this.refPoints.length; i++) {
            if (i != miss && this.refPoints[i].containsToArea(point)) {
                return i;
            }
        }
    }

    hideOrShow(isShowing, instrument, hideHelper = () => {}, showHelper = () => {}) {
        let count = instrument == pen ? 1 : 0;
        const check = ( () => this !== undefined && !this.somePointTaken && !someFigureTaken ).bind(this);
        const hide = ( () => {
            if (count > 0 && isShowing && this.refPoints !== undefined) {
                hideHelper();
                this.hideRefPoints();
                isShowing = false;
            }
            count++;
        } ).bind(this);
        drawPanel.addEventListener('click', hide);
        this.svgFig.addEventListener('click', ( () => {
            if (check() && !isShowing) {
                showHelper();
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
}

class RefPoint {
    constructor(figure, coords, r, instrument) {
        this.figure = figure;
        this.circle = createSVGElem('circle');
        this.circle.setAttribute('r', r);
        this.circle.setAttribute('cx', coords.x);
        this.circle.setAttribute('cy', coords.y);

        this.circle.addEventListener('mouseover', this.dispatchAndColor.bind(this, 'mouseover', '#0000FF', instrument));
        this.circle.addEventListener('mouseout', this.dispatchAndColor.bind(this, 'mouseout', '#FFFFFF', instrument));
    }

    static createSVGPoint(coords) {
        const point = svgPanel.createSVGPoint();
        point.x = coords.x;
        point.y = coords.y;
        return point;
    }

    dispatchAndColor(event, color, instrument) {
        if ( (instrument.checked && (!this.figure.someFigureTaken || !this.figure.finished) ) ||
            (cursor.checked && !someFigureTaken) ) {
            this.figure.svgFig.dispatchEvent(new Event(event));
            this.circle.setAttribute('fill', color);
        }
    }

    containsToArea(p) {
        return (Math.abs(p.x - this.x) <= this.r && Math.abs(p.y - this.y) <= this.r);
    }

    equals(other) {
        return this.x == other.x && this.y == other.y;
    }

    set x(v) { this.circle.setAttribute('cx', v); }
    set y(v) { this.circle.setAttribute('cy', v); }
    set r(v) { this.circle.setAttribute('r', v); }
    get x() { return +this.circle.getAttribute('cx'); }
    get y() { return +this.circle.getAttribute('cy'); }
    get r() { return +this.circle.getAttribute('r'); }
}
