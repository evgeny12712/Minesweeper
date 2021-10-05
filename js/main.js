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
var gHints = 3;
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
var gHintMode = false;
var gHintRevealedCells = [];


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
                isMarked: false,
            };
        }
    }
    return board;
}

function expandShown(cellLocation) {
    if (isOutOfBoard(cellLocation, gLevel.SIZE)) return;
    var cell = gBoard[cellLocation.i][cellLocation.j];
    if (cell.mine) return;
    else if (!cell.minesAroundCount && !cell.isShown) {
        toggleIsShown(cell);
        renderCell(cellLocation, cell.minesAroundCount);
        expandShown({ i: cellLocation.i - 1, j: cellLocation.j });
        expandShown({ i: cellLocation.i - 1, j: cellLocation.j + 1 });
        expandShown({ i: cellLocation.i, j: cellLocation.j + 1 });
        expandShown({ i: cellLocation.i + 1, j: cellLocation.j + 1 });
        expandShown({ i: cellLocation.i + 1, j: cellLocation.j });
        expandShown({ i: cellLocation.i + 1, j: cellLocation.j - 1 });
        expandShown({ i: cellLocation.i, j: cellLocation.j - 1 });
        expandShown({ i: cellLocation.i + 1, j: cellLocation.j - 1 });
    } else {
        toggleIsShown(cell);
        renderCell(cellLocation, cell.minesAroundCount);
    }
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

//////////////////////////HINT_MODE//////////////////////////

function hintMode() {
    if (gGame.isOn && gHints > 0) {
        gHintMode = true;
        updateHints(--gHints);
    }
}

function revealMode(cellLocation) {
    revealneighborsCells(cellLocation);
    toggleCellsPointer(false);
    setTimeout(() => {
        hideRevealedCells()
        toggleCellsPointer(true);
        gHintMode = false;
    }, 1000);

}

//////////////////////////GAME_FINISHED//////////////////////////

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


//////////////////////////GAME RESET//////////////////////////

function resetGame() {
    gIsTimerRunning = false;
    gLives = 3;
    gHints = 3;
    gHintMode = false;
    toggleCellsPointer(true);
    restoreGGame();
    clearInterval(gTimerInterval);
    updateMessage('Good Luck!');
    updateLives(gLives);
    updateHints(gHints);
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


//////////////////////////UI-UPDATE//////////////////////////

function renderCell(location, value) {
    if (gBoard[location.i][location.j].isShown || gBoard[location.i][location.j].isMarked || gHintMode) {
        var elCell = document.querySelector(`#cell-${location.i}-${location.j}`)
        if (isNum(value)) {
            if (value === 0) {
                value = '';
                if (!gHintMode) elCell.classList.add('empty-cell');
            }
            if (!gHintMode) elCell.style.pointerEvents = 'none';
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

function updateHints(numOfHints) {
    var elHints = document.querySelector('#hints');
    var strHTML = 'Hints : ';
    for (var i = 0; i < numOfHints; i++) {
        strHTML += '<img src="images/hint.png"/>'
    }
    elHints.innerHTML = strHTML;
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

function updateTimer() {
    var elTimer = document.getElementById('timer');
    elTimer.innerText = gGame.secsPassed;
}