'use strict';

/*Массив инструментов*/
const instruments = [];

/*ID'шники инструментов*/
const ids = ['cursor', 'hand', 'pen', 'text',
    'line', 'ellipse', 'rect', 'polygon',
    'brush', 'eraser', 'pipette', 'zoom'];

/*Текущий выбранный инструмент*/
let currentInstrument = null;

/*Текущая выделенная фигура*/
let currentFigure = null;

/*Захвачена ли опорная точка некоторой фигуры*/
let someFigureTaken = false;

const drawPanel = document.getElementById('draw-panel');
const leftPanel = document.getElementById('left-panel');
let svgPanel = document.getElementById('svg-panel');
const svgNS = 'http://www.w3.org/2000/svg';

/*Добавление всех инструментов в массив и присваивание обработчиков*/
for (let i = 0; i < ids.length; i++) {
    instruments[i] = document.getElementById(ids[i]);
    instruments[i].addEventListener('click', function() { currentInstrument = this; });
    instruments[i].addEventListener('click', changeLabelSelected);
    instruments[i].addEventListener('click', showOptions);
}

let buttonColor = document.getElementById('button-color');
let colorPicker = document.getElementById('color-picker');
buttonColor.addEventListener('click', function() { colorPicker.classList.toggle('show-option'); });

let paletteColor = '#000000';
