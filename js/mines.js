'use strict';

function revealMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine) {
                gBoard[i][j].isShown = true;
                gGame.shownCount++;
                renderCell({ i, j }, 'M');
            }
        }
    }
}

function isAllMinesMarked() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine && !gBoard[i][j].isMarked) return false;
        }
    }
    return true;
}

function getMinesLocations() {
    var mines = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isMine) mines.push({ i: i, j: j });
        }
    }
    return mines
}

function setMinesRandomly(numOfMines) {
    for (var i = 0; i < numOfMines; i++) {
        var row = getRandomInt(0, gLevel.SIZE);
        var col = getRandomInt(0, gLevel.SIZE);
        if (gBoard[row][col].isMine) i--;
        else gBoard[row][col].isMine = true;
    }
}