/* Сохранение файла в нужное пространство */

function saveSVG() {
    var svgData = drawPanel.innerHTML.toString();

    var fileName = prompt('Введите, пожалуйста, имя файла без расширения:');

	  if (fileName == null)
		  return;

    var a = document.createElement("a");
	  document.body.appendChild(a);
	  a.style = "display: none";

	  var blob = new Blob([svgData], {type: "octet/stream"}),
	      url = window.URL.createObjectURL(blob);

    a.href = url;
    a.download = fileName + ".svg";
    a.click();

    window.URL.revokeObjectURL(url);
}
