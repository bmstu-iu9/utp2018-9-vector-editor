/*Скрипт для работы инструмента "Прямая"*/

'use strict';

const line = document.getElementById('line');
const previousState = [];

const mouseDown = (event) => {
    if (!line.checked) return;
	const src = getMouseCoords(event);

    const mouseMove = (event) => {
        clearSvgPanel();
        loadPreviousState();
        const dest = getMouseCoords(event);
        svgPanel.appendChild( createLine(src, dest, '0.5') );
    }

    const mouseUp = (event) => {
        const dest = getMouseCoords(event);
        previousState.push(svgPanel.lastChild);
        svgPanel.appendChild( createLine(src, dest) );

        document.removeEventListener('mousemove', mouseMove);
        drawPanel.removeEventListener('mouseup', mouseUp);
    }

    document.addEventListener('mousemove', mouseMove);
    drawPanel.addEventListener('mouseup', mouseUp);
}
drawPanel.addEventListener('mousedown', mouseDown);

const createLine = (src, dest, opacity = '1') => {
    const options = optionsLine.getElementsByTagName('input');
	const line = createSVGElem('line',
                               'undefined', // stroke
                               '#FF0000',   // stroke color
                               '3',         // stroke-width
                               opacity);
	line.setAttribute('x1', src.x);	line.setAttribute('x2', dest.x);
	line.setAttribute('y1', src.y);	line.setAttribute('y2', dest.y);

	return line;
};

const clearSvgPanel = () => {
    while (svgPanel.firstChild) {
        svgPanel.removeChild(svgPanel.firstChild);
    }
}

const loadPreviousState = () => {
    for (let i = 0; i < previousState.length; i++) {
        svgPanel.appendChild(previousState[i]);
    }
}
