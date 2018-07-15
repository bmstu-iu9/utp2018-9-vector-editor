'use strict';

class Figure {
    constructor(svgFigure) {
        this.svgFig = svgFigure;
        this.finished = false;
        this.somePointTaken = false;
    }
}

class RefPoint {
    constructor(figure, coords, r) {
        this.figure = figure;
        this.circle = createSVGElem('circle');
        this.circle.setAttribute('r', r);
        this.circle.setAttribute('cx', coords.x);
        this.circle.setAttribute('cy', coords.y);
    }

    static createSVGPoint(coords) {
        const point = svgPanel.createSVGPoint();
        point.x = coords.x;
        point.y = coords.y;
        return point;
    }

    containsToArea(p) {
        return (Math.abs(p.x - this.x) <= this.r && Math.abs(p.y - this.y) <= this.r);
    }

    equals(other) {
        return this.x == other.x && this.y == other.y;
    }
}
