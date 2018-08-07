/*Панели опций*/
let optionsPen = document.getElementById('options-pen');
let optionsText = document.getElementById('options-text');
let optionsLine = document.getElementById('options-line');
let optionsRect = document.getElementById('options-rect');
let optionsRoundedRect = document.getElementById('options-rounded-rect');
let optionsEllipse = document.getElementById('options-ellipse');
let optionsPolygon = document.getElementById('options-polygon');
let optionsBrush = document.getElementById('options-brush');
let optionsEraser = document.getElementById('options-eraser');
let optionsZoom = document.getElementById('options-zoom');

/*Механика работы селектора*/
let allSelectors = document.querySelectorAll('.selector');
for (let i = 0; i < allSelectors.length; i++) {
    let input = allSelectors[i].querySelectorAll('.selector-field');
    let allOptions = allSelectors[i].querySelectorAll('.selector-li');
    input[0].value = allOptions[0].innerHTML;
    for (let j = 0; j < allOptions.length; j++) {
        allOptions[j].addEventListener('click', function() { input[0].value = allOptions[j].innerHTML; });
    }
}

/*Функция, скрывающая всю панель опций*/
const hideAllOptions = () => {
    optionsPen.classList.remove('show-option');
    optionsText.classList.remove('show-option');
    optionsLine.classList.remove('show-option');
    optionsRect.classList.remove('show-option');
    optionsBrush.classList.remove('show-option');
    optionsRoundedRect.classList.remove('show-option');
    optionsEllipse.classList.remove('show-option');
    optionsPolygon.classList.remove('show-option');
    optionsEraser.classList.remove('show-option');
    optionsZoom.classList.remove('show-option');
};

/*Функция, включающая конкретную панель*/
const showOptions = () => {
    hideAllOptions();

    if (currentInstrument.alt == 'Перо') {
        optionsPen.classList.add('show-option');
    } else if (currentInstrument.alt == 'Текст') {
        optionsText.classList.add('show-option');
    } else if (currentInstrument.alt == 'Прямая') {
        optionsLine.classList.add('show-option');
    } else if (currentInstrument.alt == 'Прямоугольник') {
        optionsRect.classList.add('show-option');
    } else if (currentInstrument.alt == 'Округленный прямоугольник') {
        optionsRoundedRect.classList.add('show-option');
    } else if (currentInstrument.alt == 'Эллипс') {
        optionsEllipse.classList.add('show-option');
    } else if (currentInstrument.alt == 'Многоугольник') {
        optionsPolygon.classList.add('show-option');
    } else if (currentInstrument.alt == 'Кисть') {
        optionsBrush.classList.add('show-option');
    } else if (currentInstrument.alt == 'Ластик') {
        optionsEraser.classList.add('show-option');
    } else if (currentInstrument.alt == 'Лупа') {
        optionsZoom.classList.add('show-option');
    }
};
