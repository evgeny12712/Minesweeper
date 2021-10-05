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