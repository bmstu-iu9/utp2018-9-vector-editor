/*
    Скрипт нужен для создания области пользовательского ввода текста.
    Нажатием ЛКМ, на холсте, можно создать только первую область.
    Для дальнейшего же создания требуется сочетание Ctrl + ЛКМ, при этом обасть создается в точке нажатия с размерами по умолчанию(336 : 200)px;
    Также, можно перемещать и менять размеры данной области.
    Используется скрипт прямоугольника.
    Строка автоматически переходит на новую, если она достигла границы области.
    Также, при помощи панели опций можно менять сам шрифт, размер шрифта, цвет.
    По умолчанию параметры:
    шрифт— Arial;
    размер шрифта— 12pt;
    цвет—черный.
    Редактировать текст можно только при выборе опции курсора или текста.
    В дополнение, имеется возможность использовать горячие сочетания клавиш:
    Ctrl + B —полужирный (тег STRONG).
    Ctrl + I —курсив (тег EM).
    Ctrl + U —подчеркнутый (тег U).
    Ctrl + Z —отмена последнего действия.
*/
'use strict';

const text = document.getElementById('text');

const createSVG_Text = (f = 'none', s = '#000000', sw = '3', so = '1', fo = '1') => {
    const textForeignObject = createSVGElem('foreignObject', f, s ,sw, so, fo);
    const textDiv = document.createElement('div');
    textDiv.setAttribute('contenteditable', true);
    textDiv.style.overflow = 'hidden';
    textDiv.style.overflowWrap = 'break-word';
    textDiv.style.wordWrap = 'break-word';
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

    static create(TextObject) {
        const get = attr => TextObject.getAttribute(attr);
        let tbox = new TextBox(TextObject);
        tbox.div=TextObject.getElementsByTagName('div')[0];
        tbox.rect.height=TextObject.getAttribute('height');
        tbox.rect.width=TextObject.getAttribute('width');
        tbox.rect.x=get('x');
        tbox.rect.y=get('y');
        tbox.rect.center.setCoords(tbox.rect.c);
        tbox.rect.center.setCoords(tbox.rect.c);
        tbox.synchronizeWithRect();
        svgPanel.appendChild(tbox.svgFig);
        for (let i = 0; i < tbox.rect.refPoints.length; i++) {
            tbox.rect.refPoints[i].figure = tbox;
        }
        tbox.rect.center.figure = tbox;
        tbox.rect.updateRefPointsCoords();
        tbox.hideOrShow();
        tbox.showRefPoints();
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
        tbox.finished = tbox.rect.finished = true;
        document.addEventListener('click', () =>  {
            if(text.checked || cursor.checked) {
                tbox.div.setAttribute('contenteditable', 'true');
            } else {
                if(svgPanel.compareDocumentPosition(tbox.rect.svgFig) & 16) {
                    svgPanel.removeChild(tbox.rect.svgFig);
                    tbox.rect.hideRefPoints();
                    tbox.hideOrShow();
                }
                tbox.div.setAttribute('contenteditable', 'false');
                tbox.div.style.webkitTouchCallout = 'none';
                tbox.div.style.webkitUserSelect = 'none';
                tbox.div.style.khtmlUserSelect = 'none';
                tbox.div.style.mozUserSelect = 'none';
                tbox.div.style.msUsertSelect = 'none';
                tbox.div.style.userSelect = 'none';
            }
        });
        tbox.div.addEventListener('click', () => {
            if(!cursor.checked) {
                if(svgPanel.compareDocumentPosition(tbox.rect.svgFig) & 16) {
                    svgPanel.removeChild(tbox.rect.svgFig);
                    tbox.rect.hideRefPoints();
                    tbox.hideOrShow();
                }
            }
        });
        return tbox;
    }

    static draw(event) {
        if (!text.checked || (svgPanel.getElementsByTagName('foreignObject')[0] && !event.ctrlKey) ) {
            return;
        }

        let click = getMouseCoords(event);
        const options = optionsText.getElementsByTagName('input');
        const tbox = new TextBox(createSVG_Text('#FFFFFF', '#000000', '1', '1', '1'));

        svgPanel.appendChild(tbox.svgFig);
        ({ x: tbox.rect.x, y: tbox.rect.y } = click);

        tbox.rect.height = 200;
        tbox.rect.width = 336;
        tbox.div.style.fontFamily = options[0].value;
        tbox.div.style.fontSize = '13pt';

        optionsText.getElementsByTagName('input')[1].value = '12';
        tbox.rect.center.setCoords(tbox.rect.c);
        tbox.synchronizeWithRect();
        svgPanel.appendChild(tbox.rect.svgFig);

        for (let i = 0; i < tbox.rect.refPoints.length; i++) {
            tbox.rect.refPoints[i].figure = tbox;
        }
        tbox.rect.center.figure = tbox;

        tbox.rect.updateRefPointsCoords();
        tbox.hideOrShow();
        tbox.showRefPoints();

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
        tbox.finished = tbox.rect.finished = true;

        document.addEventListener('click', () =>  {
            if(text.checked || cursor.checked) {
                tbox.div.setAttribute('contenteditable', 'true');
            } else {
                if(svgPanel.compareDocumentPosition(tbox.rect.svgFig) & 16) {
                    svgPanel.removeChild(tbox.rect.svgFig);
                    tbox.rect.hideRefPoints();
                    tbox.hideOrShow();
                }
                tbox.div.setAttribute('contenteditable', 'false');
                tbox.div.style.webkitTouchCallout = 'none';
                tbox.div.style.webkitUserSelect = 'none';
                tbox.div.style.khtmlUserSelect = 'none';
                tbox.div.style.mozUserSelect = 'none';
                tbox.div.style.msUsertSelect = 'none';
                tbox.div.style.userSelect = 'none';
            }
        });
        tbox.div.addEventListener('click', () => {
            if(!cursor.checked) {
                if(svgPanel.compareDocumentPosition(tbox.rect.svgFig) & 16) {
                    svgPanel.removeChild(tbox.rect.svgFig);
                    tbox.rect.hideRefPoints();
                    tbox.hideOrShow();
                }
            }
        });
    }

    showRefPoints() {
        svgPanel.appendChild(this.rect.svgFig);
        this.rect.showRefPoints();
    }

    hideRefPoints() {
        if(svgPanel.compareDocumentPosition(this.rect.svgFig) & 16){
            svgPanel.removeChild(this.rect.svgFig);
            this.rect.hideRefPoints();
        }
    }

    synchronizeWithRect() {
        ({ x: this.x, y: this.y } = this.rect);
        [this.width, this.height] = [this.rect.width, this.rect.height];
    }

    createTmpCopy() {
        this.copy = createSVG_Text('none', '#000000', '1', '0.5', '0.5');
        this.copy.firstChild.style.opacity = '0.5';
        this.copy.firstChild.innerHTML = this.div.innerHTML;
        this.copy.setAttribute('x', this.x);
        this.copy.setAttribute('y', this.y);
        this.copy.setAttribute('width', this.width);
        this.copy.setAttribute('height', this.height);
        svgPanel.insertBefore(this.copy, this.svgFig);
    }

    showOptions() {
        if(text.checked || cursor.checked) {
            hideAllOptions();
            optionsText.classList.add('show-option');
        }
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

{
    const inputs = optionsText.getElementsByTagName('input');
    const selectors = optionsText.getElementsByTagName('ul');
    const buttons = optionsText.getElementsByTagName('button');

    for (let i = 0; i < inputs.length; i++) {
        inputs[i].setAttribute('readonly', '');
    }

    selectors[0].addEventListener("mousedown", (evt) => {
        inputs[0].value = evt.target.innerHTML;
        evt.preventDefault();
        document.execCommand('fontname', false, inputs[0].value);
    });

    const changeFont = (fontSizeValue) => {
        let browserFontSizeValue = '';
        if(fontSizeValue == 7) {
            browserFontSizeValue += 1;
        } else if(fontSizeValue == 10) {
            browserFontSizeValue += 2;
        } else if(fontSizeValue == 12) {
            browserFontSizeValue += 3;
        } else if(fontSizeValue == 14) {
            browserFontSizeValue += 4;
        } else if(fontSizeValue == 18) {
            browserFontSizeValue += 5;
        } else if(fontSizeValue == 22) {
            browserFontSizeValue += 6;
        } else browserFontSizeValue += 7;
        document.execCommand("fontSize", false, browserFontSizeValue);
    }

    selectors[1].addEventListener("mousedown", (evt) => {
        inputs[1].value = evt.target.innerHTML;
        evt.preventDefault();
        changeFont(inputs[1].value);
    });

    colorPicker.addEventListener("mousedown", (evt) => {
        evt.preventDefault();
        document.execCommand('forecolor', false, paletteColor);
    });
}
