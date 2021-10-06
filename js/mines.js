'use strict';

function revealMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine) {
                gBoard[i][j].isShown = true;
                renderCell({ i, j }, MINE_IMG);
            }
        }
    }
}

function isAllMinesMarked() {
    return gGame.markedCount === gLevel.MINES;
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

function setMinesRandomly(ignoreLocation) {
    for (var i = 0; i < gLevel.MINES; i++) {
        var row = getRandomInt(0, gLevel.SIZE);
        var col = getRandomInt(0, gLevel.SIZE);
        if (gBoard[row][col].isMine || (row === ignoreLocation.i && col === ignoreLocation.j)) i--;
        else gBoard[row][col].isMine = true;
    }
}

function setup7BoomMines() {
    var sevenBoomCounter = 0;
    gLevel.MINES = 0;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (sevenBoomCounter !== 0 && (sevenBoomCounter % 7 === 0 || sevenBoomCounter.toString().includes('7'))) {
                gBoard[i][j].isMine = true;
                gLevel.MINES++;
            }
            sevenBoomCounter++;
        }
    }
}

function addMinesManually(cell) {
    if (!cell.isMine) {
        var elPosManualBtn = document.getElementById('manual-pos-btn');
        cell.isMine = true;
        gMinesCounter++;
        elPosManualBtn.innerText = 'place ' + (gLevel.MINES - gMinesCounter) + ' more mines!';
    }
    if (gMinesCounter === gLevel.MINES) {
        setMinesNegsCount();
        gGame.isOn = true;
        gManualMinesActive = false;
        gMinesCounter = 0;
        elPosManualBtn.style.backgroundColor = 'white';
        elPosManualBtn.innerText = 'Position Manually';
        cellCursor(false);
    }
}