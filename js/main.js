'use strics';
var gBoard;
var gLevel = { SIZE: 4, MINES: 2 };
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}
var gTimerInterval;
var gIsTimerRunning = false;

function initGame() {
    gBoard = buildBoard();
    setMinesRandomly();
    setMinesNegsCount();
    renderBoard(gBoard, 'table');
}

function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            };
        }
    }
    return board;
}

function setMinesRandomly() {
    for (var i = 0; i < gLevel.MINES; i++) {
        var row = getRandomInt(0, gLevel.SIZE);
        var col = getRandomInt(0, gLevel.SIZE);
        gBoard[row][col].isMine = true;
    }
}

function renderBoard() {
    var strHTML = '';
    for (var i = 0; i < gLevel.SIZE; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < gLevel.SIZE; j++) {
            //var cell = (gBoard[i][j].isMine) ? 'M' : '';
            var cell = '';
            var cellId = `cell-${i}-${j}`;
            strHTML += `<td class='cell' id='${cellId}' 
            onclick="cellClicked(this)" 
            oncontextmenu="markCell(this)">${cell}</td>`;
        }
        strHTML += '</tr>';
    }

    var elTable = document.querySelector('tbody');
    elTable.innerHTML += strHTML;
}

function markCell(elCell) {
    startTimer();
    var cell = getCellFromEl(elCell);
    if (!cell.isMarked) {
        cell.isMarked = true;
        renderCell(getLocationFromElCell(elCell), 'F');
    } else {
        var value = '';
        if (cell.isShown) value = cell.minesAroundCount;
        renderCell(getLocationFromElCell(elCell), value);
        cell.isMarked = false;
    }
}

function renderCell(location, value) {
    if (gBoard[location.i][location.j].isShown || gBoard[location.i][location.j].isMarked) {
        console.log('location', location);
        var elCell = document.querySelector(`#cell-${location.i}-${location.j}`)
        elCell.innerHTML = value;
    }
}

function setMinesNegsCount() {
    var minesLocations = getMinesLocations();
    for (var i = 0; i < minesLocations.length; i++) {
        setCellsMinesCounter(minesLocations[i]);
    }
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

function expandShown(cellLocation) {
    for (var i = cellLocation.i - 1; i <= cellLocation.i + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue;
        for (var j = cellLocation.j - 1; j <= cellLocation.j + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) continue;
            if (i === cellLocation.i && j === cellLocation.j) continue;
            gBoard[i][j].isShown = true;
            renderCell({ i, j }, gBoard[i][j].minesAroundCount);
        }
    }
}

function cellClicked(elCell) {
    startTimer();
    var cellLocation = getLocationFromElCell(elCell);
    var cell = gBoard[cellLocation.i][cellLocation.j];
    if (cell.isMine) {
        cell.isShown = true;
        gameOver();
        return;
    }
    if (cell.minesAroundCount === 0) {
        expandShown(cellLocation);
    }
    cell.isShown = true;
    if (cell.isMine) renderCell(cellLocation, 'M');
    else {
        renderCell(cellLocation, cell.minesAroundCount);
    }
}

function gameOver() {
    gGame.isOn = false;
    clearInterval(gTimerInterval);
    revealMines();
    toggleCellsPointer();
}

function revealMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine) {
                gBoard[i][j].isShown = true;
                renderCell({ i, j }, 'M');
            }
        }
    }
}

function toggleCellsPointer() {
    var disable = (gGame.isOn) ? 'auto' : 'none';
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

function runTimer() {
    var startTime = Date.now();
    gTimerInterval = setInterval(() => {
        var now = Date.now();
        gGame.secsPassed = ((now - startTime) / 1000).toFixed(0);
        var elTimer = document.getElementById('timer');
        elTimer.innerText = gGame.secsPassed;
    }, 1000);
}

function startTimer() {
    if (gIsTimerRunning) return;
    gIsTimerRunning = true;
    runTimer();
}