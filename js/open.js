'use strict';

/*
    Скрипт для открытия файла.
*/

const openFile=(evt)=> {
    let f = evt.target.files[0];
    let reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('svg-panel').outerHTML=e.target.result;
        svgPanel = document.getElementById('svg-panel');
        let recs = svgPanel.getElementsByTagName('rect');
        let ells = svgPanel.getElementsByTagName('ellipse');
        let pols = svgPanel.getElementsByTagName('polygon');
        let circles = svgPanel.getElementsByTagName('circle');
        let text = svgPanel.getElementsByTagName('foreignObject');
        let brush = svgPanel.getElementsByTagName('path');
        let lines = svgPanel.getElementsByTagName('line');
        while (circles.length>0){
            svgPanel.removeChild(circles[0]);
        }
        for (let i=recs.length-1;i>=0;i--)
            Rectangle.create(recs[i]);
        for (let i=ells.length-1;i>=0;i--)
            Ellipse.create(ells[i]);
        for (let i=pols.length-1;i>=0;i--)
            Polyline.create(pols[i]);
        for (let i=brush.length-1;i>=0;i--)
            BrushBox.create(brush[i]);
        for (let i=text.length-1;i>=0;i--)
            TextBox.create(text[i]);
        for (let i=lines.length-1;i>=0;i--)
            Line.create(lines[i]);

    };
    reader.readAsText(f);
};

document.getElementById('file-input').addEventListener('change', openFile);