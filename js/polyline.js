/*
        Скрипт для работы инструмента "Перо" и расширения возможностей "Курсора."
        Принцип работы "Пера":
    При первом клике ЛКМ на холсте устанавливается начальная точка.
    Далее, при перемещении мыши рисуется полупрозрачный отрезок от последней
    установленной точки до той, на которую в данный момент указывает курсор.
        Процесс построения фигуры оканчивается в одном из трех случаев:
    1) В качестве следующей опорной точки была выбрана начальная;
    2) При фиксировании опорной точки была зажата клавиша Ctrl;
    3) Смена инструмента.
        В панеле опций для фигуры можно выбрать толщину ребер, цвет ребер, наличие
    заливки, ее цвет(если она есть), прозрачность.
    Добавленные возможности "Курсора":
        Возможность перемещать и удалять опорные точки:
    Для перемещения точки необходимо захватить ее одним кликом ЛКМ, затем
    переместить и снова кликнуть ЛКМ. Для удаления нужно нажать на опорную точку ПКМ.
    Если при захвате опорной точки был изменен инструмент, то она вернется на
    свою исходную позицию.

        Примечание:
    В настоящий момент взаимодействие с панелью опций не реализовано.
*/
'use strict';

(function() {

    const pen = document.getElementById('pen');
    const cursor = document.getElementById('cursor');
    const leftPanel = document.getElementById('left-panel');
    let someFigureTaken = false;

    const containsToRefPoint = (p, rp) => {
        return (Math.abs(p.x - rp.x) <= 3 && Math.abs(p.y - rp.y) <= 3);
    };

    const newSVGPoint = (coords) => {
        const point = svgPanel.createSVGPoint();
        point.x = coords.x;
        point.y = coords.y;
        return point;
    };

    const indexOfSVGPoint = (polyline, point, miss = -1) => {
        for (let i = 0; i < polyline.points.numberOfItems; i++) {
            if (i != miss && polyline.points[i].x == point.x &&
                polyline.points[i].y == point.y) {
                    return i;
            }
        }
    };

    const replaceSVGPoint = (polyline, newp, ind) => {
        polyline.points.replaceItem(newSVGPoint(newp), ind);
    };

    const createTmpLine = (start) => {
        const tmpLine = createSVGElem('line', undefined, undefined, undefined, '0.5');
        tmpLine.setAttribute('x1', start.x);
        tmpLine.setAttribute('y1', start.y);
        tmpLine.setAttribute('x2', start.x);
        tmpLine.setAttribute('y2', start.y);
        return tmpLine;
    };

    const moveEndOfTmpLine = (tmpLine, end) => {
        tmpLine.setAttribute('x2', end.x);
        tmpLine.setAttribute('y2', end.y);
    };

    const moveStartOfTmpLine = (tmpLine) => {
        tmpLine.setAttribute('x1', tmpLine.getAttribute('x2'));
        tmpLine.setAttribute('y1', tmpLine.getAttribute('y2'));
    };

    const drawPolyline = (event) => {
        if (!pen.checked) {
            return;
        }

        const clickCoord = getMouseCoords(event);
        const polyline = createSVGElem('polyline', 'none');
        const tmpLine = createTmpLine(clickCoord);
        svgPanel.appendChild(polyline);
        svgPanel.appendChild(tmpLine);
        const refPoints = [];
        let finished = false;
        let pointTaken = false;
        someFigureTaken = true;

        const getMergeCoords = (e) => {
            const click = getMouseCoords(e);
            for (let i = 0; i < polyline.points.numberOfItems; i++) {
                const rp = polyline.points[i];
                if (containsToRefPoint(click, rp)) {
                    return { x: rp.x, y: rp.y };
                }
            }
            return click;
        };

        const isClosed = () => {
            return (polyline.points[0].x == polyline.points[polyline.points.numberOfItems - 1].x &&
                    polyline.points[0].y == polyline.points[polyline.points.numberOfItems - 1].y);
        };

        const newRefPoint = (point) => {
            const setCoord = (rp, newp) => {
                rp.setAttribute('cx', newp.x);
                rp.setAttribute('cy', newp.y);
            };

            const isStartCornerPushed = (ind) => {
                return (ind == 0 || ind == polyline.points.numberOfItems - 1) && isClosed();
            };

            const deletePoint = (e) => {
                if (!cursor.checked || pointTaken || someFigureTaken) {
                    return;
                }
                e.preventDefault();
                const ind = indexOfSVGPoint(polyline, getMergeCoords(e));
                if (isStartCornerPushed(ind)) {
                    polyline.points.removeItem(0);
                    replaceSVGPoint(polyline, polyline.points[0], polyline.points.numberOfItems - 1);
                    svgPanel.removeChild(refPoints[0]);
                    refPoints.splice(0, 1);
                } else {
                    polyline.points.removeItem(ind);
                    svgPanel.removeChild(refPoints[ind]);
                    refPoints.splice(ind, 1);
                }
                if (polyline.points.numberOfItems == 1) {
                    svgPanel.removeChild(refPoints.pop());
                    polyline.points.removeItem(0);
                    svgPanel.removeChild(polyline);
                } else if (isClosed() && polyline.points.numberOfItems == 3) {
                    polyline.points.removeItem(2);
                }
            };

            const takePoint = (e) => {
                if (!cursor.checked || pointTaken || someFigureTaken) {
                    return;
                }
                const ind = indexOfSVGPoint(polyline, getMergeCoords(e));
                const movePoint = (e) => {
                    const coords = getMouseCoords(e);
                    refPoint.setAttribute('fill', '#0000FF');
                    if (isStartCornerPushed(ind)) {
                        setCoord(refPoints[0], coords);
                        replaceSVGPoint(polyline, coords, 0);
                        replaceSVGPoint(polyline, coords, polyline.points.numberOfItems - 1);
                    } else {
                        setCoord(refPoint, coords);
                        replaceSVGPoint(polyline, coords, ind);
                    }
                };

                const fixPoint = (e) => {
                    const current = refPoints.findIndex((x) => x == refPoint);
                    const clicked = indexOfSVGPoint(polyline, getMergeCoords(e), current);
                    if (clicked !== undefined && !isStartCornerPushed(current)) {
                        return;
                    }
                    pointTaken = someFigureTaken = false;
                    document.removeEventListener('mousemove', movePoint);
                    refPoint.addEventListener('click', takePoint);
                    refPoint.addEventListener('contextmenu', deletePoint);
                    refPoint.removeEventListener('click', fixPoint);
                    leftPanel.removeEventListener('click', stopMovingByLeftPanel);
                };

                const stopMovingByLeftPanel = () => {
                    if (cursor.checked && pointTaken) {
                        movePoint(e);
                        refPoint.dispatchEvent(e);
                        refPoint.dispatchEvent(new Event('mouseout'));
                    }
                };

                pointTaken = someFigureTaken = true;
                document.addEventListener('mousemove', movePoint);
                refPoint.removeEventListener('click', takePoint);
                refPoint.removeEventListener('contextmenu', deletePoint);
                refPoint.addEventListener('click', fixPoint);
                leftPanel.addEventListener('click', stopMovingByLeftPanel);
            };

            const dispatchAndColor = (e, color) => {
                if ( (pen.checked && (!someFigureTaken || !finished)) ||
                    (cursor.checked && !someFigureTaken) ) {
                    polyline.dispatchEvent(new Event(e));
                    refPoint.setAttribute('fill', color);
                }
            };

            const refPoint = createSVGElem('circle');
            refPoint.setAttribute('r', 3);
            setCoord(refPoint, point);
            refPoint.addEventListener('mouseover', () => { dispatchAndColor('mouseover', '#0000FF'); });
            refPoint.addEventListener('mouseout', () => { dispatchAndColor('mouseout', '#FFFFFF'); });
            refPoint.addEventListener('click', takePoint);
            refPoint.addEventListener('contextmenu', deletePoint);
            return refPoint;
        };

        const addPoint = (e) => {
            if (!pen.checked) {
                finishPolyline();
                return;
            }
            const point = getMergeCoords(e);
            polyline.points.appendItem(newSVGPoint(point));
            moveStartOfTmpLine(tmpLine);
            if (refPoints.length > 1 &&
                    point.x == polyline.points[0].x && point.y == polyline.points[0].y) {
                finishPolyline();
            } else {
                const refp = newRefPoint(point);
                refPoints.push(refp);
                svgPanel.appendChild(refp);
                if (e.ctrlKey) {
                    finishPolyline();
                }
            }
        };

        const moveTmpLine = (e) => {
            moveEndOfTmpLine(tmpLine, getMouseCoords(e));
        };

        const stopDrowingByLeftPanel = () => {
            if (pen.checked && !finished) {
                finishPolyline();
            }
        };

        const hideRefPoints = () => {
            for (let i = 0; i < refPoints.length; i++) {
                svgPanel.removeChild(refPoints[i]);
            }
            refPoints.length = 0;
        };

        const showRefPoints = () => {
            const ppn = polyline.points.numberOfItems;
            const end = isClosed() ? (ppn - 1) : ppn;
            for (let i = 0; i < end; i++) {
                const rp = newRefPoint(polyline.points[i]);
                refPoints.push(rp);
                svgPanel.appendChild(rp);
            }
        };

        const finishPolyline = () => {
            drawPanel.removeEventListener('click', addPoint);
            drawPanel.addEventListener('click', drawPolyline);
            document.removeEventListener('mousemove', moveTmpLine);
            leftPanel.removeEventListener('click', stopDrowingByLeftPanel);
            svgPanel.removeChild(tmpLine);
            finished = true;
            someFigureTaken = false;

            let isShowing = true;
            const check = () => { return cursor.checked && !pointTaken && !someFigureTaken; };
            const del = () => {
                if ((check() || pen.checked) && isShowing) {
                    hideRefPoints();
                    isShowing = false;
                }
            };
            drawPanel.addEventListener('click', del);
            polyline.addEventListener('click', () => {
                if ((check() || pen.checked) && !isShowing) {
                    showRefPoints();
                    isShowing = true;
                }
            });
            polyline.addEventListener('mouseover', () => {
                if (check() || pen.checked) {
                    drawPanel.removeEventListener('click', del);
                }
            });
            polyline.addEventListener('mouseout', () => {
                if (check() || pen.checked) {
                    drawPanel.addEventListener('click', del);
                }
            });
        };

        addPoint(event);
        drawPanel.addEventListener('click', addPoint);
        drawPanel.removeEventListener('click', drawPolyline);
        document.addEventListener('mousemove', moveTmpLine);
        leftPanel.addEventListener('click', stopDrowingByLeftPanel);
    };

    drawPanel.addEventListener('click', drawPolyline);

}());
