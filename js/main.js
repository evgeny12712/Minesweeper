'use strics';
const FLAG = 'F';
const MINE = 'M';
const EMPTY = '';

const MINE_IMG = '<img src="images/mine.png"></img>'
const FLAG_IMG = '<img src="images/FLAG.png"></img>'
var gBoard;
var gLevel = { SIZE: 4, MINES: 2 };
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
}
var gLives = 3;
var gTimerInterval;
var gIsTimerRunning = false;
var gMineTimeout;
var gEmoji = { normal: '😃', lose: '😒', win: '😎' };
var gNumbersColorsMap = {
    1: '#31A6CC',
    2: '#1ECCCB',
    3: '#FEDA6C',
    4: '#EC4863',
    5: '#A73E5C',
    6: '#5A2748',
    7: '#FFFFFF',
    8: '#FF0000'
}

function initGame() {
    gBoard = buildBoard();
    renderBoard();
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

function cellClicked(elCell) {
    startTimer();
    var cellLocation = getLocationFromElCell(elCell);
    var cell = gBoard[cellLocation.i][cellLocation.j];
    if (!gGame.isOn) {
        gGame.isOn = true;
        setMinesRandomly(cellLocation);
        setMinesNegsCount();
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
    if (cell.minesAroundCount === 0) expandShown(cellLocation);

    toggleIsShown(cell);
    renderCell(cellLocation, cell.minesAroundCount);
    isWin();
}

function markCell(elCell) {
    startTimer();
    var cell = getCellFromEl(elCell);
    if (!cell.isMarked) {
        cell.isMarked = true;
        gGame.markedCount++;
        renderCell(getLocationFromElCell(elCell), FLAG_IMG);
    } else {
        var value = EMPTY;
        if (cell.isShown) value = cell.minesAroundCount;
        renderCell(getLocationFromElCell(elCell), value);
        gGame.markedCount--;
        cell.isMarked = false;
    }
    isWin();
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

function expandShown(cellLocation) {

    expandShown(cellLocation, direction);
}

function expandShown(cellLocation) {
    var nextCellLocation = { i: cellLocation.i + 1, j: cellLocation.j };
    if (isOutOfBoard(nextCellLocation, gLevel.SIZE)) return;
    var cell = gBoard[nextCellLocation.i][nextCellLocation.j];
    if (cell.minesAroundCount !== 0) {
        toggleIsShown(cell);
        renderCell(nextCellLocation, cell.minesAroundCount);
        return;
    }
    toggleIsShown(cell);
    renderCell(nextCellLocation, cell.minesAroundCount);
    expandShown(nextCellLocation);
}

function toggleIsShown(cell) {
    if (!cell.isShown) {
        cell.isShown = true;
        cell.shownCount++;
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

function resetGame() {
    gIsTimerRunning = false;
    gLives = 3;
    toggleCellsPointer(true);
    restoreGGame();
    clearInterval(gTimerInterval);
    updateMessage('Good Luck!');
    updateLives(gLives);
    updateTimer(0);
    updateEmoji('normal');
    initGame();
}

function restoreGGame() {
    gGame.isOn = false;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.secsPassed = 0;
}

function updateLevel(elBtn) {
    var level = elBtn.innerText;
    switch (level) {
        case 'Beginner':
            gLevel.SIZE = 4;
            gLevel.MINES = 2;
            break;
        case 'Medium':
            gLevel.SIZE = 8;
            gLevel.MINES = 12;
            break;
        case 'Expert':
            gLevel.SIZE = 12;
            gLevel.MINES = 30;
            break;
        default:
            gLevel.SIZE = 4;
            gLevel.MINES = 2;
    }
    resetGame();
}


//////////////////////////GAME FINISHED//////////////////////////
function gameOver() {
    gGame.isOn = false;
    clearTimeout(gMineTimeout);
    clearInterval(gTimerInterval);
    revealMines();
    toggleCellsPointer(false);
    updateMessage('YOU LOST!');
    updateEmoji('lose');
}

function isWin() {
    if (isAllMinesMarked() && isAllCellsRevealed()) {
        gGame.isOn = false;
        clearInterval(gTimerInterval);
        toggleCellsPointer(false);
        updateMessage('YOU WON!');
        updateEmoji('win');
    }
}


//////////////////////////UI-UPDATE//////////////////////////
function updateTimer() {
    var elTimer = document.getElementById('timer');
    elTimer.innerText = gGame.secsPassed;
}

function renderCell(location, value) {
    if (gBoard[location.i][location.j].isShown || gBoard[location.i][location.j].isMarked) {
        var elCell = document.querySelector(`#cell-${location.i}-${location.j}`)
        if (isNum(value)) {
            if (value === 0) value = '-';
            elCell.style.pointerEvents = 'none';
            elCell.innerHTML = `<span style="color:${gNumbersColorsMap[value]}">${value}</span>`;
            return;
        }
        elCell.innerHTML = value;
    }
}

function renderBoard() {
    var strHTML = EMPTY;

    for (var i = 0; i < gLevel.SIZE; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = EMPTY;
            var cellId = `cell-${i}-${j}`;
            strHTML += `<td class='cell' id='${cellId}' 
            onclick="cellClicked(this)" 
            oncontextmenu="markCell(this)">${cell}</td>`;
        }
        strHTML += '</tr>';
    }

    var elTable = document.querySelector('tbody');
    elTable.innerHTML = strHTML;
}

function updateLives(numOfLives) {
    var elLives = document.querySelector('#lives');
    var strHTML = 'Lives : ';
    for (var i = 0; i < numOfLives; i++) {
        strHTML += '<img src="images/heart.png"/>'
    }
    elLives.innerHTML = strHTML;
}

function updateEmoji(state) {
    var elEmojiBtn = document.getElementById('reset-game-btn');
    switch (state) {
        case 'win':
            elEmojiBtn.innerText = gEmoji.win;
            break;
        case 'lose':
            elEmojiBtn.innerText = gEmoji.lose;
            break;
        case 'normal':
            elEmojiBtn.innerText = gEmoji.normal;
            break;
    }
}

function updateMessage(message) {
    var elMessage = document.getElementById('messages');
    elMessage.innerText = message;
}


//////////////////////////TIMER//////////////////////////

function startTimer() {
    if (gIsTimerRunning) return;
    gIsTimerRunning = true;
    runTimer();
}

function runTimer() {
    var startTime = Date.now();
    gTimerInterval = setInterval(() => {
        var now = Date.now();
        gGame.secsPassed = ((now - startTime) / 1000).toFixed(0);
        updateTimer();
    }, 1000);
}