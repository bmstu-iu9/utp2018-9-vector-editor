/* Созддание нового пространства рисования, файла */

function deleteChild( node, parent ) {
	for (var i = 0; i < node.childNodes.length;)
		deleteChild(node.childNodes[i], node);

	if (node.childNodes.length == 0) {
		parent.removeChild(node);
		return;
	}
}

function deleteAllChildren( node ) {
	for (var i = 0; i < node.childNodes.length;)
	  deleteChild(node.childNodes[i], node);
}

function createSVGPanel() {
	var
	  width = prompt('Введите ширину нового поля', 900),
	  height = prompt('Введите высоту нового поля', 500);

	if (width < 1 || height < 1){
		alert("Пожалуйста, введите корректные данные!")
		return;
	}

	deleteAllChildren(svgPanel);

	svgPanel.setAttribute('width', width);
	svgPanel.setAttribute('height', height);
}
