'use strics';
const FLAG = 'F';
const MINE = 'M';
const EMPTY = '';
const MINE_IMG = '<img src="images/mine.png"></img>'
const FLAG_IMG = '<img src="images/FLAG.png"></img>'

//GAME
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
var gIsSafeCell = false;

//DESIGN MAPS
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

//HINTS
var gHints = 3;
var gHintMode = false;
var gHintRevealedCells = [];

var gSafeClicksCount = 3;

var gSevenBoomActive = false;




function initGame() {
    gBoard = buildBoard();
    renderBoard();
    if (gSevenBoomActive) setup7BoomMines();
    updateBestScore();
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
        hintsBtnDisabled(true);
        hintCellCursor(true);
    }
}

function revealCells(cellLocation) {
    var cell = gBoard[cellLocation.i][cellLocation.j];
    revealneighborsCells(cellLocation);
    toggleCellsPointer(false);
    renderCell(cellLocation, (cell.isMine) ? MINE_IMG : cell.minesAroundCount);
    setTimeout(() => {
        hideRevealedCells()
        toggleCellsPointer(true);
        gHintMode = false;
        hintsBtnDisabled(false);
        hintCellCursor(false);
    }, 1000);

}

function hintCellCursor(isOn) {
    var elCells = document.querySelectorAll('.cell');
    var cellCursor = (isOn) ? 'cell' : 'pointer';
    for (var i = 0; i < elCells.length; i++) {
        elCells[i].style.cursor = cellCursor;
    }
}

function hintsBtnDisabled(isDisabled) {
    var elBtn = document.getElementById('hints-btn');
    if (isDisabled) elBtn.style.pointerEvents = 'none';
    else elBtn.style.pointerEvents = 'auto';

}

//////////////////////////GAME_FINISHED//////////////////////////

function gameOver() {
    gGame.isOn = false;
    gSevenBoomActive = false;
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
        gSevenBoomActive = false;
        clearInterval(gTimerInterval);
        toggleCellsPointer(false);
        updateMessage('YOU WON!');
        updateEmoji('win');
        checkBestScore();
    }
}


//////////////////////////GAME RESET//////////////////////////

function resetGame() {
    gIsTimerRunning = false;
    gLives = 3;
    gHints = 3;
    gSafeClicksCount = 3;
    gHintMode = false;
    hintsBtnDisabled(false);
    toggleCellsPointer(true);
    restoreGGame();
    clearInterval(gTimerInterval);
    updateMessage('Good Luck!');
    updateLives(gLives);
    updateHints(gHints);
    updateSafeClicksCount
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
    var cell = gBoard[location.i][location.j];
    if (cell.isShown || cell.isMarked || gHintMode || gIsSafeCell) {
        var elCell = document.querySelector(`#cell-${location.i}-${location.j}`)
        if (isNum(value)) {
            if (cell.isMarked) resetMarkedCell;
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

function resetMarkedCell(cell) {
    cell.isMarked = false;

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



//////////////////////////BEST_SCORE//////////////////////////
function updateBestScore() {
    switch (gLevel.SIZE) {
        case 4:
            updateLevelScore(localStorage.bestBegginerScore);
            break;
        case 8:
            updateLevelScore(localStorage.bestMediumScore);
            break;
        case 12:
            updateLevelScore(localStorage.bestExpertScore);
            break;
    }

}

function updateLevelScore(storage) {
    var elH4BestScore = document.querySelector('#best-score-h4');
    if (storage) {
        var bestScore = document.querySelector('#best-score-h4 span');
        bestScore.innerText = storage;
        elH4BestScore.style.display = 'block';
    } else {
        elH4BestScore.style.display = 'none';
    }

}

function checkBestScore() {
    var elTimer = document.getElementById('timer');
    var score = elTimer.innerText;

    switch (gLevel.SIZE) {
        case 4:
            if (!localStorage.bestBegginerScore || +score < +localStorage.bestBegginerScore) {
                localStorage.bestBegginerScore = score;
            }
            break;
        case 8:
            if (!localStorage.bestMediumScore || +score < +localStorage.bestMediumScore) {
                localStorage.bestMediumScore = score;
            }
            break;
        case 12:
            if (!localStorage.bestExpertScore || +score < +localStorage.bestExpertScore) {
                localStorage.bestExpertScore = score;
            }
            break;
    }
    updateBestScore();
}


//////////////////////////SAFE_CLICK//////////////////////////
function safeClick() {
    if (gSafeClicksCount === 0 || !gGame.isOn) return;
    var safeCells = getSafeCellsLocations();
    var location = safeCells[getRandomInt(0, safeCells.length)];
    var elCell = document.querySelector(`#cell-${location.i}-${location.j}`)
    elCell.style.backgroundColor = 'lightgreen'
    elCell.style.border = '1px solid white'
    gSafeClicksCount--;
    updateSafeClicksCount();
    setTimeout(() => {
        elCell.style.backgroundColor = ''
        elCell.style.border = '1px solid white'
    }, 1000);

}

function getSafeCellsLocations() {
    var safeCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) safeCells.push({ i: i, j: j });
        }
    }
    return safeCells;
}

function updateSafeClicksCount() {
    var elSafeClicks = document.querySelector('small span');
    elSafeClicks.innerText = gSafeClicksCount + ' ';
}


//////////////////////////SEVEN_BOOM//////////////////////////
function sevenBoomClicked() {
    gSevenBoomActive = true;
    resetGame();
}