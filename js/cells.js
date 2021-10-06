'use strict';

function cellClicked(elCell) {
    startTimer();
    var cellLocation = getLocationFromElCell(elCell);
    var cell = gBoard[cellLocation.i][cellLocation.j];
    if (gSevenBoomActive) {
        setMinesNegsCount();
        gGame.isOn = true;
        gSevenBoomActive = false;
    }
    if (!gGame.isOn) {
        gGame.isOn = true;
        setMinesRandomly(cellLocation);
        setMinesNegsCount();
    } else if (gHintMode) {
        revealCells(cellLocation);
        return;
    } else if (cell.isMine) {
        updateLives(--gLives);
        if (!gLives) {
            cell.isShown = true;
            gameOver();
            return;
        }
        cell.isShown = true;
        renderCell(cellLocation, MINE_IMG);
        elCell.style.pointerEvents = 'none';
        gMineTimeout = setTimeout(() => {
            renderCell(cellLocation, EMPTY);
            cell.isShown = false;
            elCell.style.pointerEvents = 'auto';
        }, 2000);
        return;
    }
    if (cell.minesAroundCount === 0) {
        expandShown(cellLocation);
    }
    toggleIsShown(cell);
    renderCell(cellLocation, cell.minesAroundCount);
    isWin();
}

function revealneighborsCells(cellLocation) {
    for (var i = cellLocation.i - 1; i <= cellLocation.i + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue;
        for (var j = cellLocation.j - 1; j <= cellLocation.j + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) continue;
            if (i === cellLocation.i && j === cellLocation.j) continue;
            if (gBoard[i][j].isShown || gBoard[i][j].isMarked) continue;
            gHintRevealedCells.push({ cell: gBoard[i][j], location: { i: i, j: j } });
            gBoard[i][j].isShown = true;
            if (gBoard[i][j].isMine) renderCell({ i, j }, MINE_IMG);
            else renderCell({ i, j }, gBoard[i][j].minesAroundCount);

        }
    }
    gHintRevealedCells.push({ cell: gBoard[cellLocation.i][cellLocation.j], location: cellLocation });
}

function hideRevealedCells() {
    for (var i = 0; i < gHintRevealedCells.length; i++) {
        var cell = gHintRevealedCells[i].cell;
        var location = gHintRevealedCells[i].location;
        cell.isShown = false;
        if (cell.isMarked) renderCell(location, FLAG_IMG);
        else {
            renderCell(location, '');
        }
    }
    gHintRevealedCells = [];
}


function markCell(elCell) {
    startTimer();
    var cell = getCellFromEl(elCell);
    if (!cell.isMarked) {
        cell.isMarked = true;
        if (cell.isMine) gGame.markedCount++;
        renderCell(getLocationFromElCell(elCell), FLAG_IMG);
    } else {
        var value = EMPTY;
        if (cell.isShown) value = cell.minesAroundCount;
        renderCell(getLocationFromElCell(elCell), value);
        if (cell.isMine) gGame.markedCount--;
        cell.isMarked = false;
    }
    isWin();
}

function getEmptyCells() {
    var emptyCells = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].minesAroundCount === 0 && !gBoard[i][j].isMine) emptyCells.push({ i: i, j: j });
        }
    }
    return emptyCells;
}

function toggleIsShown(cell) {
    if (!cell.isShown) {
        cell.isShown = true;
        gGame.shownCount++;
    }
}

function isAllCellsRevealed() {
    return gGame.shownCount === (gLevel.SIZE * gLevel.SIZE) - gLevel.MINES;
}

function toggleCellsPointer(toggle) {
    var disable = (toggle) ? 'auto' : 'none';
    var elTable = document.querySelector('table');
    elTable.style.pointerEvents = disable;
}

function getLocationFromElCell(cell) {
    var splitted = cell.id.split('-');
    var i = +splitted[1];
    var j = +splitted[2];
    return { i: i, j: j };
}

function getCellFromEl(elCell) {
    var location = getLocationFromElCell(elCell);
    return gBoard[location.i][location.j];
}

function setMinesNegsCount() {
    var minesLocations = getMinesLocations();
    for (var i = 0; i < minesLocations.length; i++) {
        setCellsMinesCounter(minesLocations[i]);
    }
}

function setCellsMinesCounter(minesLocations) {
    for (var i = minesLocations.i - 1; i <= minesLocations.i + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue;
        for (var j = minesLocations.j - 1; j <= minesLocations.j + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) continue;
            if (i === minesLocations.i && j === minesLocations.j) continue;
            if (gBoard[i][j].isMine) continue;
            gBoard[i][j].minesAroundCount++;
            renderCell({ i, j }, gBoard[i][j].minesAroundCount);
        }
    }
}