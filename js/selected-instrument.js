/*Функция, изменяющая надпись "Выбранный инструмент"*/
function changeLabelSelected() {
  label = document.getElementById("selected-instrument");
  label.innerText = currentInstrument.alt;
}
