/*Массив инструментов*/
let instruments = [];

/*ID'шники инструментов*/
let ids = ["cursor", "hand", "plus", "text",
    "line", "triangle", "ellipse", "rect",
    "polygon", "brush", "eraser", "pipette", "zoom", "color"];

/*Текущий выбранный инструмент*/
let currentInstrument;

/*Добавление всех инструментов в массив и присваивание обработчиков*/
for (let i = 0; i < ids.length; i++) {
    instruments[i] = document.getElementById(ids[i]);
    instruments[i].addEventListener("click", function() { currentInstrument = this; });
    instruments[i].addEventListener("click", changeLabelSelected);
}
