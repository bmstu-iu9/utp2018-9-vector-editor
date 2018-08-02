/*
    Скрипт для создания эллипса. Полностью основан на скрипте для прямоугольника.
*/
'use strict';

const ellipse = document.getElementById('ellipse');

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
        const ell = new Ellipse(createSVGElem('ellipse', 'none', undefined, '3'));
        svgPanel.appendChild(ell.svgFig);
        ({ x: ell.rect.x, y: ell.rect.y } = click);

        const moveEllipse = (e) => {
            const current = getMouseCoords(e);
            if (e.altKey) {
                click = ell.rect.getSymmetrical(current);
            }
            ell.rect.moveByAngeles(click, current);
            ell.synchronizeWithRect();
        };

        const stopMoving = () => {
            document.removeEventListener('mousemove', moveEllipse);
            drawPanel.removeEventListener('mouseup', stopMoving);
            svgPanel.appendChild(ell.rect.svgFig);

            ell.rect.updateRefPointsCoords();
            ell.rect.hideOrShow(true, rect, () => svgPanel.removeChild(ell.rect.svgFig),
                                            () => svgPanel.appendChild(ell.rect.svgFig));
            ell.rect.showRefPoints();

            ['click', 'mouseover', 'mouseout'].forEach(e => {
                ell.svgFig.addEventListener(e, () => ell.rect.svgFig.dispatchEvent(new Event(e)));
            });

            const update = ell.rect.updateRefPointsCoords.bind(ell.rect);
            ell.rect.updateRefPointsCoords = () => {
                update();
                ell.synchronizeWithRect();
            };

            ell.rect.createTmpCopy = ell.createTmpCopy.bind(ell);
            ell.rect.deleteTmpCopy = ell.deleteTmpCopy.bind(ell);
        };

        document.addEventListener('mousemove', moveEllipse);
        drawPanel.addEventListener('mouseup', stopMoving);
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
