'use strict';

/*Функция, изменяющая надпись "Выбранный инструмент"*/
function changeLabelSelected() {
  label = document.getElementById("selected-instrument");
  label.innerText = currentInstrument.alt;
}

/*Функция, возвращающая координаты объемливающего элемента*/
const getBoxCoords = (elem) => {
    let box = elem.getBoundingClientRect();
    return { top: box.top + pageYOffset, left: box.left + pageXOffset };
};

/*Фукнция, возвращающая координы мыши*/
const getMouseCoords = (event) => {
    const coords = getBoxCoords(drawPanel);
    return { x: event.pageX - coords.left, y: event.pageY - coords.top };
};

/*Функция, создающая SVG элемент. При желании добавить новые аргументы по 
умолчанию, добавлять их в конец. При этом обычные аргументы добавлять нельзя.*/
const createSVGElem = (type, f = '#FFFFFF', s = '#000000', sw = '1', so = '1', fo = '1') => {
    const elem = document.createElementNS(svgNS, type);
    elem.setAttribute('fill', f);
    elem.setAttribute('stroke', s);
    elem.setAttribute('stroke-width', sw);
    elem.setAttribute('stroke-opacity', so);
    elem.setAttribute('fill-opacity', fo);
    return elem;
};
