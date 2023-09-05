const gameBoard = document.querySelector("#gameboard");
const playerDisplay = document.querySelector("#player");
const infoDisplay = document.querySelector("#info-display");
const width = 8;
let playerGo = 'black';
playerDisplay.textContent = 'black'

const startPieces = [
    rook, knight, bishop, queen, king, bishop, knight, rook,
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
    '',  '',  '',  '',  '',  '',  '',  '',
    '',  '',  '',  '',  '',  '',  '',  '',
    '',  '',  '',  '',  '',  '',  '',  '',
    '',  '',  '',  '',  '',  '',  '',  '',
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
    rook, knight, bishop, queen, king, bishop, knight, rook
];

function createBoard() {
    startPieces.forEach((startPiece, i) => {
        const square = document.createElement('div');
        square.classList.add('square');
        square.innerHTML = startPiece;
        square.firstChild?.setAttribute('draggable', true);
        square.setAttribute('square-id', i);
        const row = Math.floor((63 - i) / 8) + 1;
        if (row % 2 === 0) {
            square.classList.add(i % 2 === 0 ? "light" : "dark");
        } else {
            square.classList.add(i % 2 === 0 ? "dark" : "light");
        }
        if (i <= 15) {
            square.firstChild.firstChild.classList.add('black');
        }
        if (i >= 48) {
            square.firstChild.firstChild.classList.add('white');
        }
        gameBoard.append(square);
    })
}
createBoard();

const allSquares = document.querySelectorAll(".square");

allSquares.forEach(square => {
    square.addEventListener('dragstart', dragStart);
    square.addEventListener('dragover', dragOver);
    square.addEventListener('drop', dragDrop);
})

let startPositionId; 
let draggedElement;

function dragStart(e) {
    startPositionId= e.target.parentNode.getAttribute('square-id');
    draggedElement = e.target;
}

function dragOver(e) {
    e.preventDefault();
}

function dragDrop(e) {
    e.stopPropagation();
    const correctGo = draggedElement.firstChild.classList.contains(playerGo);
    const taken = e.target.classList.contains('piece');
    const valid = checkIfValid(e.target);
    const opponentGo = playerGo === 'white' ? 'black' : 'white';
    const takenbyOpponent = e.target.firstChild?.classList.contains(opponentGo);

    if (correctGo) {
        if(takenbyOpponent && valid) {
            e.target.parentNode.append(draggedElement);
            e.target.remove();
            checkForWin();
            changePlayer();
            return;
        }
        if (valid) {
            e.target.append(draggedElement);
            checkForWin();
            changePlayer();
            return;
        }
    }
}

function checkIfValid(target) {
    const targetId = Number(target.getAttribute('square-id')) || Number(target.parentNode.getAttribute('square-id'));
    const startId = Number(startPositionId);
    const piece = draggedElement.id;

    switch(piece) {
        case 'pawn' :
            const starterRow = [8,9,10,11,12,13,14,15];
            if (
                (starterRow.includes(startId) && startId + width * 2 === targetId && !document.querySelector(`[square-id="${startId + width}"]`).firstChild) ||
                (startId + width === targetId && !document.querySelector(`[square-id="${targetId}"]`).firstChild) ||
                startId + width - 1 === targetId && document.querySelector(`[square-id="${startId + width - 1}"]`).firstChild ||
                startId + width + 1 === targetId && document.querySelector(`[square-id="${startId + width + 1}"]`).firstChild
                ) {
                return true;
            }
            break;
            case 'knight':
                if (
                    startId + width * 2 - 1 === targetId ||
                    startId + width * 2 + 1 === targetId ||
                    startId + width - 2 === targetId ||
                    startId + width + 2 === targetId ||
                    startId - width * 2 - 1 === targetId ||
                    startId - width * 2 + 1 === targetId ||
                    startId - width - 2 === targetId ||
                    startId - width + 2 === targetId 
                ) {
                    return true;
                }
                break;
            case 'bishop':
                    let resultBishop = false; 
                    const rowDiffBishop = Math.floor(targetId / width) - Math.floor(startId / width);
                    const colDiffBishop = (targetId % width) - (startId % width);
                    if (Math.abs(rowDiffBishop) === Math.abs(colDiffBishop) && rowDiffBishop !== 0 && colDiffBishop !== 0) {
                      const rowStepBishop = rowDiffBishop > 0 ? 1 : -1;
                      const colStepBishop = colDiffBishop > 0 ? 1 : -1;
                      let currentRowBishop = Math.floor(startId / width) + rowStepBishop;
                      let currentColBishop = startId % width + colStepBishop;
                      let currentSquareIdBishop = currentRowBishop * width + currentColBishop;
                      while (currentSquareIdBishop !== targetId) {
                        const squareBishop = document.querySelector(`[square-id="${currentSquareIdBishop}"]`);
                        if (squareBishop.firstChild) {
                          resultBishop = false;
                          break;
                        }
                        currentRowBishop += rowStepBishop;
                        currentColBishop += colStepBishop;
                        currentSquareIdBishop = currentRowBishop * width + currentColBishop;
                      }
                      resultBishop = true; 
                    }
                    return resultBishop;
            case 'rook':
                    let resultRook = false; 
                    const rowDiffRook = Math.floor(targetId / width) - Math.floor(startId / width);
                    const colDiffRook = (targetId % width) - (startId % width);
                    if ((rowDiffRook === 0 || colDiffRook === 0) && (rowDiffRook !== 0 || colDiffRook !== 0)) {
                      let step = 0;
                      if (rowDiffRook === 0) {
                        step = colDiffRook > 0 ? 1 : -1;
                      } else {
                        step = rowDiffRook > 0 ? width : -width;
                      }
                      let currentSquareIdRook = startId + step;
                      while (currentSquareIdRook !== targetId) {
                        const squareRook = document.querySelector(`[square-id="${currentSquareIdRook}"]`);
                        if (squareRook.firstChild) {
                          resultRook = false;
                          break;
                        }
                        currentSquareIdRook += step;
                      }
                      resultRook = true; 
                    }
                    return resultRook;
            case 'king':
                    let resultKing = false;
                    const rowDiffKing = Math.floor(targetId / width) - Math.floor(startId / width);
                    const colDiffKing = (targetId % width) - (startId % width);
                    if (Math.abs(rowDiffKing) <= 1 && Math.abs(colDiffKing) <= 1) {
                    const square = document.querySelector(`[square-id="${targetId}"]`);
                    if (!square.firstChild) {
                        resultKing = true;
                    }
                    }
                    return resultKing;
            case 'queen':
                    let resultQueen = false;
                    const rowDiffQueen = Math.floor(targetId / width) - Math.floor(startId / width);
                    const colDiffQueen = (targetId % width) - (startId % width);
                    if ((Math.abs(rowDiffQueen) === Math.abs(colDiffQueen) && rowDiffQueen !== 0 && colDiffQueen !== 0) ||
                        ((rowDiffQueen === 0 || colDiffQueen === 0) && (rowDiffQueen !== 0 || colDiffQueen !== 0))) {
                          let stepRow = 0;
                          let stepCol = 0
                          if (rowDiffQueen === 0) {
                            stepCol = colDiffQueen > 0 ? 1 : -1;
                          } else if (colDiffQueen === 0) {
                            stepRow = rowDiffQueen > 0 ? 1 : -1;
                          } else {
                            stepRow = rowDiffQueen > 0 ? 1 : -1;
                            stepCol = colDiffQueen > 0 ? 1 : -1;
                          }
                    let currentRow = Math.floor(startId / width) + stepRow;
                    let currentCol = startId % width + stepCol;
                    let currentSquareId = currentRow * width + currentCol;
                    let hasPieceInPath = false;
                    while (currentSquareId !== targetId) {
                        const squareQueen = document.querySelector(`[square-id="${currentSquareId}"]`);
                    if (squareQueen.firstChild) {
                        hasPieceInPath = true;
                        break;
                        }
                    currentRow += stepRow;
                    currentCol += stepCol;
                    currentSquareId = currentRow * width + currentCol;
                    } 
                    if (!hasPieceInPath) {
                        resultQueen = true;
                        } 
                    }
                    return resultQueen;               
    }
}

function changePlayer() {
    if (playerGo === "black") {
        reverseIds();
        playerGo = "white";
        playerDisplay.textContent = 'white';
    } else {
        revertIds();
        playerGo = "black";
        playerDisplay.textContent = 'black';
    }
}

function reverseIds() {
    const allSquares = document.querySelectorAll(".square");
    allSquares.forEach((square, i) => 
        square.setAttribute('square-id', (width * width -1) - i));
}

function revertIds() {
    const allSquares = document.querySelectorAll(".square");
    allSquares.forEach((square, i) => square.setAttribute('square-id', i));
}

function checkForWin() {
    const king =  Array.from(document.querySelectorAll('#king'));
    if (!king.some(king => king.firstChild.classList.contains('white'))) {
        infoDisplay.innerHTML = "Black player wins!";
        const allSquares = document.querySelectorAll('.square')
        allSquares.forEach(square => square.firstChild?.setAttribute('draggable', false))

    } 
    if (!king.some(king => king.firstChild.classList.contains('black'))) {
        infoDisplay.innerHTML = "White player wins!";
        const allSquares = document.querySelectorAll('.square')
        allSquares.forEach(square => square.firstChild?.setAttribute('draggable', false))

    } 
}