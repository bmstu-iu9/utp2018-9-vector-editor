/*
    Скрипт для создания эллипса. Полностью основан на скрипте для прямоугольника.
*/
'use strict';

class Ellipse extends Figure {
    constructor(svgFig) {
        super(svgFig);
        this.rect = new Rectangle(createSVGElem('rect', 'none', '#0000FF', '1', '0.5'), rect);
    }

    static draw(event) {
        if (!ellipse.checked) {
            return;
        }

        let click = getMouseCoords(event);
        let moving = false;
        const options = optionsEllipse.getElementsByTagName('input');
        const ell = new Ellipse(createSVGElem('ellipse', 'none', undefined, +options[0].value));
        svgPanel.appendChild(ell.svgFig);
        ({ x: ell.rect.x, y: ell.rect.y } = click);

        const finish = () => {
            svgPanel.appendChild(ell.rect.svgFig);

            for (let i = 0; i < ell.rect.refPoints.length; i++) {
                ell.rect.refPoints[i].figure = ell;
            }
            ell.rect.center.figure = ell;

            ell.rect.updateRefPointsCoords();
            ell.hideOrShow();
            ell.showRefPoints();

            ['click', 'mouseover', 'mouseout'].forEach(e => {
                ell.svgFig.addEventListener(e, () => ell.rect.svgFig.dispatchEvent(new Event(e)));
            });

            const update = ell.rect.updateRefPointsCoords.bind(ell.rect);
            ell.rect.updateRefPointsCoords = () => {
                update();
                ell.synchronizeWithRect();
                options[1].value = ell.rect.height;
                options[2].value = ell.rect.width;
            };

            ell.rect.createTmpCopy = ell.createTmpCopy.bind(ell);
            ell.rect.deleteTmpCopy = ell.deleteTmpCopy.bind(ell);
            ell.finished = ell.rect.finished = true;
        };

        if (event.ctrlKey) {
            ell.rect.height = options[1].value;
            ell.rect.width = options[2].value;
            ell.rect.center.setCoords(ell.rect.c);
            ell.synchronizeWithRect();
            finish();
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
            options[1].value = ell.rect.height;
            options[2].value = ell.rect.width;
        };

        const stopMoving = () => {
            document.removeEventListener('mousemove', moveEllipse);
            drawPanel.removeEventListener('mouseup', stopMoving);
            if (!moving) {
                svgPanel.removeChild(ell.svgFig);
                return;
            }
            finish();
        };

        document.addEventListener('mousemove', moveEllipse);
        drawPanel.addEventListener('mouseup', stopMoving);
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
        svgPanel.insertBefore(this.copy, this.svgFig);
    }

    showOptions() {
        hideAllOptions();
        optionsEllipse.classList.add('show-option');
        const options = optionsEllipse.getElementsByTagName('input');
        options[0].value = this.svgFig.getAttribute('stroke-width');
        options[1].value = 2*this.ry;
        options[2].value = 2*this.rx;
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
        currentFigure.svgFig.setAttribute('stroke-width', +inputs[0].value);
    });
    Figure.addPanelListener(Ellipse, inputs, selectors, 1, () => {
        currentFigure.rect.height = +inputs[1].value;
        currentFigure.rect.updateRefPointsCoords();
        currentFigure.synchronizeWithRect();
    });
    Figure.addPanelListener(Ellipse, inputs, selectors, 2, () => {
        currentFigure.rect.width = +inputs[2].value;
        currentFigure.rect.updateRefPointsCoords();
        currentFigure.synchronizeWithRect();
    });
}
