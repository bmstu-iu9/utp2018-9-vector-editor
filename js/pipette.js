//Пипетка работает на doubleclick

'use strict';

const pipette = document.getElementById('pipette');

let arr = [];
const backPanel = document.getElementById('back-panel');

backPanel.onmousemove = (event) => {
	if (!pipette.checked) return;
	let s = '';
	for (let i = 0; i < svgPanel.attributes.length; i++) {
		s += svgPanel.attributes[i].name + '\n';
	}

	const coord = getBoxCoords(drawPanel);

	if (coord.left >= event.pageX || coord.top >= event.pageY ||
		svgPanel.getAttribute('width')  + coord.left <= event.pageX ||
		svgPanel.getAttribute('height') + coord.top  <= event.pageY) {
			clear();
			return;
	}
	clear();
	const rect = createSVGElem('rect', getColor(), invertColor( getColor() ));
	rect.setAttribute('x', event.offsetX + 20);
	rect.setAttribute('y', event.offsetY);
	rect.setAttribute('width', 20);
	rect.setAttribute('height', 20);
	arr.push(rect);
	svgPanel.appendChild(rect);
}

const clear = () => {
	if (arr.length != 0) {
		for (let i = 0; i < arr.length; i++) {
			svgPanel.removeChild(arr[i]);
		}
		arr = [];
	}
}

const invertColor = (color) => {
	color = color.match(/^#?([\dabcdef]{2})([\dabcdef]{2})([\dabcdef]{2})$/i);
    if (!color) return false;
    for (var i = 1, s = "#"; i <= 3; i++) {
		s += (255 - parseInt(color[i], 16)).toString(16).toUpperCase().replace(/^(.)$/, "0$1");
	}	
    return s
}

const check = () => {
	if (!pipette.checked) return;

	cp.setHex( getColor() );
}

const getColor = () => {
	const canvas = document.createElement("canvas");
    const svg_xml = (new XMLSerializer()).serializeToString(svgPanel);
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = "data:image/svg+xml;base64," + btoa(svg_xml);

	canvas.width = img.width;
	canvas.height = img.height;
	ctx.drawImage(img, 0, 0, img.width, img.height);

    const data = ctx.getImageData(event.offsetX, event.offsetY, 1, 1).data;

	return rgb2hex(data[0], data[1], data[2], data[3]);
}

function rgb2hex(r, g, b, a) {
	if (r == 0 && g == 0 && b == 0 && a == 0) return '#FFFFFF';
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

drawPanel.addEventListener('click', check, true);
