

const zoom=document.getElementById('zoom');

startLupa=()=>{
    if(!zoom.checked)
        return
    drawPanel.style.zoom='120%';
    console.log(drawPanel.style.zoom);
};

drawPanel.addEventListener('mousedown', startLupa);