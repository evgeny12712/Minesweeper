'use strict';

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function isNum(val) {
    return !isNaN(val) && val !== '';
}

function isOutOfBoard(pos, size) {
    return (pos.i < 0 || pos.i > size - 1 || pos.j < 0 || pos.j > size - 1);
}


function cellCursor(isOn) {
    var elCells = document.querySelectorAll('.cell');
    var cellCursor = (isOn) ? 'cell' : 'pointer';
    for (var i = 0; i < elCells.length; i++) {
        elCells[i].style.cursor = cellCursor;
    }
}