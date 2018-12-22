const gameCanvas = document.getElementById("game-canvas");
const gameCtx = gameCanvas.getContext("2d");
const nextPieceCanvas = document.getElementById("next-piece");
const nextPieceCtx = nextPieceCanvas.getContext("2d");
const scoreDiv = document.getElementById("score");
const levelDiv = document.getElementById("level");
const linesClearedDiv = document.getElementById("lines-cleared");
const gameOverScore = document.getElementById("game-over-score");
const gameOverOverlay = document.getElementById("game-over-overlay");

const gameInitData = {
    gameCanvas: gameCanvas,
    gameCtx: gameCtx,
    nextPieceCanvas: nextPieceCanvas,
    nextPieceCtx: nextPieceCtx,
    scoreDiv: scoreDiv,
    levelDiv: levelDiv,
    linesClearedDiv: linesClearedDiv,
    gameOverScore: gameOverScore,
    gameOverOverlay: gameOverOverlay,
    pieceColors: [null, "#800080", "#FFFF00", "#FFA500", "#4169E1", "#00FFFF", "#008000", "#FF0000"],
    pieceColorsDark: [null, "#620062", "#E1E100", "#E18700", "#234BC3", "#00E1E1", "#006200", "#E10000"]
};

const game = new Game(gameInitData);

function restartGame() {
    document.getElementById("game-over-overlay").style.display = "none";
    game.start();
}

function resizeCanvases() {
    gameInitData.gameCanvas.style.height = "100%";
    gameInitData.gameCanvas.style.width = "100%";
    gameInitData.gameCanvas.height = gameInitData.gameCanvas.clientHeight;
    gameInitData.gameCanvas.width = Math.round(gameInitData.gameCanvas.height / 2);
    gameInitData.nextPieceCanvas.height = gameInitData.nextPieceCanvas.clientHeight;
    gameInitData.nextPieceCanvas.width = gameInitData.nextPieceCanvas.clientWidth;
}

function moveLeft() {
    game.moveLeft();
}

function moveRight() {
    game.moveRight();
}

function rotate() {
    game.rotateRight();
}

document.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") {
        game.moveLeft();
    } else if (event.key === "ArrowRight") {
        game.moveRight();
    } else if (event.key === "ArrowDown") {
        game.moveDown();
    } else if (event.code === "KeyQ") {
        game.rotateLeft();
    } else if (event.code === "KeyW") {
        game.rotateRight();
    }    
});

document.addEventListener("resize", resizeCanvases);

document.getElementById("info").addEventListener("click", (e) => {
    window.alert("Webtris v1.0 by Kevin Perry\n\nKEYBOARD SHORTCUTS\n---------------------------\nMove Left:  Left Arrow\nMove Right:  Right Arrow\nMove Down:  Down Arrow\nRotate Counterclockwise:  Q\nRotate Clockwise:  W");
});

document.addEventListener("DOMContentLoaded", function() {
    resizeCanvases();
    game.start();
});

