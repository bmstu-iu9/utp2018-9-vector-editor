'use strict'

const text = document.getElementById("text");
const drawPanelInner = drawPanel.innerHTML;
let textEntered = false;

function addText() {
    if(!text.checked) {
        drawPanel.setAttribute('contenteditable', false);
        if(textEntered) drawPanel.innerHTML += drawPanelInner;
        return;
    }
    drawPanel.setAttribute('contenteditable', true);
    if(drawPanel.innerHTML){
         drawPanel.innerHTML = '';
         textEntered = true;
     }
}

drawPanel.addEventListener('click', addText);
