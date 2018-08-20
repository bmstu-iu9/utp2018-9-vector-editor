function handleFileSelect(evt) {
    let f = evt.target.files[0];
    let reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('svg-panel').outerHTML=e.target.result;
        svgPanel = document.getElementById('svg-panel');
        let recs = svgPanel.getElementsByTagName('rect');
        let ells = svgPanel.getElementsByTagName('ellipse');
        let pols = svgPanel.getElementsByTagName('polyline');
        let circles = svgPanel.getElementsByTagName('circle');
        while (circles.length>0){
            svgPanel.removeChild(circles[0]);
        }
        for (let i=0;i<recs.length;i++)
            Rectangle.create(recs[i]);
        for (let i=0;i<ells.length;i++)
            Ellipse.create(recs[i]);
        for (let i=0;i<pols.length;i++)
            Polyline.create(recs[i]);
    };
    reader.readAsText(f);
}
document.getElementById('file-input').addEventListener('change', handleFileSelect);