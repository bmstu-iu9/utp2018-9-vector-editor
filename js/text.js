/*
    Скрипт для создания области для пользовательского ввода текста. Создать область можно двумя способами:
    1) Нажатием ЛКМ на холст, при этом обасть создается в точке нажатия и размерами по умолчание(336 : 200);
    2) Нажатием ЛКМ и не отжимая провести диагональ четырехугольника нужного размера.
    Также можно перемещать и менять размеры нашей области.
    Как только пользователь создал область, текущий инструмент меняется на Курсор.
    Используется скрипт прямоугольника.
    Также если текст выходит больше чем заданные границы области, то в область добавляется опция прокручивания.
*/
'use strict';

const text = document.getElementById('text');


const createSVG_Text = (f = 'none', s = '#000000', sw = '3', so = '1', fo = '1') => {
    const textForeignObject = createSVGElem('foreignObject', f, s ,sw, so, fo);
    const textDiv = document.createElement('div');
    textDiv.setAttribute('contenteditable', true);
    textDiv.style.cssText = "overflow: auto;";
    textDiv.textContent = 'Enter your text';
    textForeignObject.appendChild(textDiv);
    return textForeignObject;
};

class TextBox extends Figure {
    constructor(svgFig) {
        super(svgFig);
        this.div = svgFig.getElementsByTagName('div')[0];
        this.rect = new Rectangle(createSVGElem('rect', 'none', '#0000FF', '1', '0.5'), rect);
    }

    static draw(event) {
        if (!text.checked) {
            return;
        }

        let click = getMouseCoords(event);
        const tbox = new TextBox(createSVG_Text());


        svgPanel.appendChild(tbox.svgFig);
        ({ x: tbox.rect.x, y: tbox.rect.y } = click);
        tbox.rect.moveByAngeles(click, {x:click.x + 336, y: click.y + 200 });
        tbox.synchronizeWithRect();
        cursor.checked = true;
        currentInstrument = document.getElementById('cursor');
        changeLabelSelected();

        const moveTextBox = (e) => {
            const current = getMouseCoords(e);
            if (e.altKey) {
                click = tbox.rect.getSymmetrical(current);
            }
            tbox.rect.moveByAngeles(click, current);
            tbox.synchronizeWithRect();
        };

        const stopMoving = () => {
            document.removeEventListener('mousemove', moveTextBox);
            drawPanel.removeEventListener('mouseup', stopMoving);
            svgPanel.appendChild(tbox.rect.svgFig);

            tbox.rect.updateRefPointsCoords();
            tbox.rect.hideOrShow(true, rect, () => svgPanel.removeChild(tbox.rect.svgFig),
                                            () => svgPanel.appendChild(tbox.rect.svgFig));
            tbox.rect.showRefPoints();

            ['click', 'mouseover', 'mouseout'].forEach(e => {
                tbox.svgFig.addEventListener(e, () => tbox.rect.svgFig.dispatchEvent(new Event(e)));
            });

            const update = tbox.rect.updateRefPointsCoords.bind(tbox.rect);
            tbox.rect.updateRefPointsCoords = () => {
                update();
                tbox.synchronizeWithRect();
            };

            tbox.rect.createTmpCopy = tbox.createTmpCopy.bind(tbox);
            tbox.rect.deleteTmpCopy = tbox.deleteTmpCopy.bind(tbox);
        };

        /*const changeToSvg = () => {
            if(text.checked) {
                return;
            }
            const svgText = createSVGElem('text');
            svgText.textContent = tbox.div.textContent;
            svgText.setAttribute('x', tbox.x);
            svgText.setAttribute('y', tbox.y);
            svgPanel.insertBefore(svgText, this.svgFig);
        }*/

        document.addEventListener('mousemove', moveTextBox);
        drawPanel.addEventListener('mouseup', stopMoving);
        //drawPanel.addEventListener('click', changeToSvg);

    }

    synchronizeWithRect() {
        ({ x: this.x, y: this.y } = this.rect);
        [this.width, this.height] = [this.rect.width, this.rect.height];
    }

    createTmpCopy() {
        this.copy = createSVG_Text('none', '#000000', '1', '0.5', '0.5');
        this.copy.firstChild.style.opacity = '0.5';
        this.copy.firstChild.textContent = this.div.textContent;
        this.copy.setAttribute('x', this.x);
        this.copy.setAttribute('y', this.y);
        this.copy.setAttribute('width', this.width);
        this.copy.setAttribute('height', this.height);
        svgPanel.insertBefore(this.copy, this.svgFig);
    }

    set x(v) {
        this.svgFig.setAttribute('x', v);
        this.div.setAttribute('x', v);
    }
    set y(v) {
        this.svgFig.setAttribute('y', v);
        this.div.setAttribute('y', v);
    }
    set width(v) {
        this.svgFig.setAttribute('width', v);
        this.div.style.width = v + 'px';
    }
    set height(v) {
        this.svgFig.setAttribute('height', v);
        this.div.style.height = v + 'px';
    }

    get x() { return +this.svgFig.getAttribute('x'); }
    get y() { return +this.svgFig.getAttribute('y'); }
    get width() { return +this.svgFig.getAttribute('width'); }
    get height() { return +this.svgFig.getAttribute('height'); }
}

drawPanel.addEventListener('mousedown', TextBox.draw = TextBox.draw.bind(TextBox));
