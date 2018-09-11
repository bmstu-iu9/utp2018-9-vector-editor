/*
    Скрипт для открытия файла.
*/

'use strict';

const openFile = (evt) => {
    const f = evt.target.files[0];
     
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('svg-panel').outerHTML = e.target.result;
        svgPanel = document.getElementById('svg-panel');
        
        const rects = svgPanel.getElementsByTagName('rect');
        const circles = svgPanel.getElementsByTagName('circle');
        for (let i = 0; i < rects.length; i++) {
            if (rects[i].getAttribute('stroke-opacity') === '0.5') {
                svgPanel.removeChild(rects[i]);
            }    
        }
        while (circles.length > 0) {
            svgPanel.removeChild(circles[0]);
        }
        
        const childs = Array.prototype.slice.call(svgPanel.childNodes);
        for (let i = 1; i < childs.length; i++) {
            switch(childs[i].nodeName) {
                case 'rect':
                    Rectangle.create(childs[i]);
                    break;
                case 'ellipse':
                    Ellipse.create(childs[i]);
                    break;
                case 'polygon':
                    Polyline.create(childs[i]);
                    break;
                case 'path':
                    BrushBox.create(childs[i]);
                    break;    
                case 'foreignObject':
                    TextBox.create(childs[i]);
                    break;
                case 'line':
                    Line.create(childs[i]);
                    break;     
            }
        }
    };
    reader.readAsText(f);
};

document.getElementById('file-input').addEventListener('change', openFile);
