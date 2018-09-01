'use strict';

/*
    Скрипт для инструмента кисть.
*/

let dx,dy,shape,x,y,path,pathTaken = false;
let isDrawing=false;
let width,linecap='round',linejoin='round';
const brsh = document.getElementById('brush');
const crsr = document.getElementById('cursor');

  const changeThickness = ()=>{
    width=document.getElementById('brush_width').value;
  };

  class BrushBox extends Figure{
      constructor(svgFigure) {
          super(svgFigure);
          this.rect = new Rectangle(createSVGElem('rect', 'none', '#0000FF', '1', '0.5'), rect);
          const peaks=()=>{
              let dn,de,ds,dw;
              let p=svgFigure.getAttribute('d').split(' ').map(parseFloat).filter(Number);
              let mn,me,ms,mw;
              me=mw=p[0];
              mn=ms=p[1];
              for(let i=0;i<p.length-1;i+=2){
                  if(p[i]<=mw){
                      mw=p[i];
                      dw={x:p[i],y:p[i+1]};
                  }
                  if (p[i]>=me){
                      me=p[i];
                      de={x:p[i],y:p[i+1]};
                  }
                  if (p[i+1]<=mn){
                      mn=p[i+1];
                      dn={x:p[i],y:p[i+1]};
                  }
                  if (p[i+1]>=ms){
                      ms=p[i+1];
                      ds={x:p[i],y:p[i+1]};
                  }
              }

              return {dn,ds,dw,de};
          };
          this.deltas=peaks();
          let c = this.rect.center.circle;
          this.rect.width=this.deltas.de.x-this.deltas.dw.x+20;
          this.rect.height=this.deltas.ds.y-this.deltas.dn.y+20;
          this.rect.x = this.deltas.dw.x;
          this.rect.y = this.deltas.dn.y;
          this.cx=this.rect.c.x;
          this.cy=this.rect.c.y;
          this.rect.showRefPoints=()=>{
              svgPanel.appendChild(this.rect.center.circle);
          };
          this.rect.hideRefPoints=()=>{
              svgPanel.removeChild(this.rect.center.circle);
          }

      }


      static create(svgFigure) {
          const brush = new BrushBox(svgFigure);
          const get = attr => svgFigure.getAttribute(attr);
          brush.svgFig.setAttribute('d',get('d'));
          brush.svgFig.setAttribute('fill',get('fill'));
          brush.svgFig.setAttribute('stroke-width',get('stroke-width'));
          brush.svgFig.setAttribute('stroke',get('stroke'));
          brush.svgFig.setAttribute('stroke-linecap',get('stroke-linecap'));
          brush.svgFig.setAttribute('stroke-linejoin',get('stroke-linejoin'));
          brush.synchronizeWithRect();
          brush.finish();
          svgPanel.appendChild(brush.svgFig);
          brush.isShowing = false;
          brush.finished = true;
          currentFigure = null;
          return brush;
      }


      static draw() {
          if (!brsh.checked) {
              return;
          }
          const brushBox = new BrushBox(currentPath);
          brushBox.finish();
          brushBox.showRefPoints();
      }

      finish() {

          for (let i = 0; i < this.rect.refPoints.length; i++) {
              this.rect.refPoints[i].figure = this;
          }
          this.rect.center.figure = this;

          this.rect.updateRefPointsCoords();

          this.hideOrShow();


          ['click', 'mouseover', 'mouseout'].forEach(e => {
              this.svgFig.addEventListener(e, () => this.rect.svgFig.dispatchEvent(new Event(e)));
          });

          const update = this.rect.updateRefPointsCoords.bind(this.rect);
          this.rect.updateRefPointsCoords = () => {
              update();
              this.synchronizeWithRect();
          };

          this.rect.createTmpCopy = this.createTmpCopy.bind(this);
          this.rect.deleteTmpCopy = this.deleteTmpCopy.bind(this);
          this.finished = this.rect.finished = true;
      }

      createTmpCopy() {
          this.copy = document.createElementNS(svgNS, "path");
          this.copy.setAttribute('d', this.svgFig.getAttribute('d'));
          this.copy.setAttribute('fill', this.svgFig.getAttribute('fill'));
          this.copy.setAttribute('stroke-width', this.svgFig.getAttribute('stroke-width'));
          this.copy.setAttribute('stroke', '#000000');
          this.copy.setAttribute('stroke-linecap', this.svgFig.getAttribute('stroke-linecap'));
          this.copy.setAttribute('stroke-linejoin', this.svgFig.getAttribute('stroke-linejoin'));
          svgPanel.insertBefore(this.copy, this.svgFig);

      }

      showOptions(){}

      showRefPoints() {

          svgPanel.appendChild(this.rect.svgFig);
          this.rect.showRefPoints();
      }

      hideRefPoints() {
          svgPanel.removeChild(this.rect.svgFig);
          this.rect.hideRefPoints();
      }

      synchronizeWithRect() {

          let delta = {x:(this.cx-this.rect.c.x),y:(this.cy-this.rect.c.y)};
          this.cx=this.rect.c.x;
          this.cy=this.rect.c.y;
          const changePath=(delta)=>{
              let p = this.svgFig.getAttribute('d').split(' ').map(parseFloat).filter(Number);
              for(let i=0;i<p.length-1;i+=2){
                  p[i]-=delta.x;
                  p[i+1]-=delta.y;
              }
              let strP = 'M '+ p.slice(0,2).join(' ')+' L '+p.slice(2).join(' ');
              this.svgFig.setAttribute('d',strP);
          };
          changePath(delta);
      }

  }


  const start = (event)=> {
      changeThickness();
    if (!brsh.checked)
      return;
    drawPanel.addEventListener('mouseup',up);
    document.addEventListener('mousemove',move);
    isDrawing = true;
    x = getMouseCoords(event).x;
    y = getMouseCoords(event).y;
    shape = document.createElementNS(svgNS, "path");
    shape.setAttribute('fill', 'none');
    shape.setAttribute('stroke-width', width);
    shape.setAttribute('stroke', paletteColor);
    shape.setAttribute('stroke-linecap', linecap);
    shape.setAttribute('stroke-linejoin', linejoin);

    path = 'M ' + x + ' ' + y + ' L ';
    svgPanel.appendChild(shape);

  };


  const move = (event)=> {
    if(event.target.id==='back-panel')
      up(event);
    if (isDrawing) {
      x = getMouseCoords(event).x;
      y = getMouseCoords(event).y;
      path +=x + ' ' + y + ' ';
      shape.setAttribute('d', path);
    }
  };


  const up = ()=> {
      if(shape.getAttribute('d')===null) {
          svgPanel.removeChild(shape);
          document.removeEventListener('mousemove',move);
          drawPanel.removeEventListener('mouseup',up);
          return;
      }
      currentPath=shape;
      isDrawing = false;
      pathTaken = false;
      document.removeEventListener('mousemove',move);
      drawPanel.removeEventListener('mouseup',up);
      BrushBox.draw();
    };

{
    const inputs = optionsBrush.getElementsByTagName('input');
    const selectors = optionsBrush.getElementsByTagName('ul');
    Figure.addPanelListener(BrushBox, inputs, selectors, 0, () => {
        currentFigure.svgFig.setAttribute('stroke-width', +inputs[0].value);
    });
}


drawPanel.addEventListener('mousedown',start);

changeThickness();
