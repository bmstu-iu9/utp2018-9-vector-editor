/*
    Скрипт для создания эллипса. Полностью основан на скрипте для прямоугольника.
*/
'use strict';

class Ellipse extends Figure {
    constructor(svgFigure) {
        super(svgFigure);
        this.rect = new Rectangle(createSVGElem('rect', 'none', '#0000FF', '1', '0.5'), rect);
    }

    static create(svgFigure) {
        const get = attr => svgFigure.getAttribute(attr);
        let fig = svgFigure, cx, cy, width, height;
        [cx, cy] = [+get('cx'), +get('cy')];
        if (svgFigure.tagName == 'circle') {
            fig = createSVGElem('ellipse');
            copySVGStyle(fig, svgFigure);
            width = height = 2*get('r');
        } else {
            [width, height] = [2*get('rx'), 2*get('ry')];
        }

        const ell = new Ellipse(fig);
        ell.rect.setAttrs([cx - width/2, cy - height/2, width, height]);
        ell.synchronizeWithRect();
        ell.finish();
        svgPanel.appendChild(ell.svgFig);
        ell.isShowing = ell.rect.isShowing = false;
        currentFigure = null;
        return ell;
    }

    static draw(event) {
        if (!ellipse.checked) {
            return;
        }

        let click = getMouseCoords(event);
        let moving = false;
        const options = optionsEllipse.getElementsByTagName('input');
        const ell = new Ellipse(createSVGElem('ellipse', undefined, '#000000', 0));
        svgPanel.appendChild(ell.svgFig);
        ({ x: ell.rect.x, y: ell.rect.y } = click);

        if (event.ctrlKey) {
            ell.rect.height = options[0].value;
            ell.rect.width = options[1].value;
            ell.rect.center.setCoords(ell.rect.c);
            ell.synchronizeWithRect();
            ell.finish();
            ell.showRefPoints();
            return;
        }

        const moveEllipse = (e) => {
            moving = true;
            const current = getMouseCoords(e);
            if (e.altKey) {
                click = ell.rect.getSymmetrical(current);
            }
            ell.rect.moveByAngeles(click, current);
            ell.synchronizeWithRect();
            options[0].value = ell.rect.height;
            options[1].value = ell.rect.width;
        };

        const stopMoving = () => {
            document.removeEventListener('mousemove', moveEllipse);
            drawPanel.removeEventListener('mouseup', stopMoving);
            if (!moving) {
                svgPanel.removeChild(ell.svgFig);
                return;
            }
            ell.finish();
            ell.showRefPoints();
        };

        document.addEventListener('mousemove', moveEllipse);
        drawPanel.addEventListener('mouseup', stopMoving);
    }

    finish() {
        const options = optionsEllipse.getElementsByTagName('input');

        for (let i = 0; i < this.rect.refPoints.length; i++) {
            this.rect.refPoints[i].figure = this;
        }
        this.rect.center.figure = this;

        this.rect.updateRefPointsCoords();
        this.hideOrShow();

        ['click', 'mouseover', 'mouseout'].forEach(e => {
            this.svgFig.addEventListener(e, () => this.rect.svgFig.dispatchEvent(new Event(e)));
        });

        const update = this.rect.updateRefPointsCoords.bind(this.rect);
        this.rect.updateRefPointsCoords = () => {
            update();
            this.synchronizeWithRect();
            options[0].value = this.rect.height;
            options[1].value = this.rect.width;
        };

        this.rect.createTmpCopy = this.createTmpCopy.bind(this);
        this.rect.deleteTmpCopy = this.deleteTmpCopy.bind(this);
        this.finished = this.rect.finished = true;
    }

    showRefPoints() {
        svgPanel.appendChild(this.rect.svgFig);
        this.rect.showRefPoints();
    }

    hideRefPoints() {
        svgPanel.removeChild(this.rect.svgFig);
        this.rect.hideRefPoints();
    }

    synchronizeWithRect() {
        ({ x: this.x, y: this.y } = this.rect.c);
        [this.rx, this.ry] = [this.rect.width/2, this.rect.height/2];
    }

    createTmpCopy() {
        this.copy = createSVGElem('ellipse', 'none', '#000000', '1', '0.5', '0.5');
        this.copy.setAttribute('cx', this.x);
        this.copy.setAttribute('cy', this.y);
        this.copy.setAttribute('rx', this.rx);
        this.copy.setAttribute('ry', this.ry);
        svgPanel.insertBefore(this.copy, this.svgFig.nextSibling);
    }

    showOptions() {
        hideAllOptions();
        optionsEllipse.classList.add('show-option');
        const options = optionsEllipse.getElementsByTagName('input');
        options[0].value = 2*this.ry;
        options[1].value = 2*this.rx;
    }

    set x(v) { this.svgFig.setAttribute('cx', v); }
    set y(v) { this.svgFig.setAttribute('cy', v); }
    set rx(v) { this.svgFig.setAttribute('rx', v); }
    set ry(v) { this.svgFig.setAttribute('ry', v); }

    get x() { return +this.svgFig.getAttribute('cx'); }
    get y() { return +this.svgFig.getAttribute('cy'); }
    get rx() { return +this.svgFig.getAttribute('rx'); }
    get ry() { return +this.svgFig.getAttribute('ry'); }
}

drawPanel.addEventListener('mousedown', Ellipse.draw = Ellipse.draw.bind(Ellipse));

{
    const inputs = optionsEllipse.getElementsByTagName('input');
    const selectors = optionsEllipse.getElementsByTagName('ul');
    Figure.addPanelListener(Ellipse, inputs, selectors, 0, () => {
        currentFigure.rect.height = +inputs[0].value;
        currentFigure.rect.updateRefPointsCoords();
        currentFigure.synchronizeWithRect();
    });
    Figure.addPanelListener(Ellipse, inputs, selectors, 1, () => {
        currentFigure.rect.width = +inputs[1].value;
        currentFigure.rect.updateRefPointsCoords();
        currentFigure.synchronizeWithRect();
    });
}
