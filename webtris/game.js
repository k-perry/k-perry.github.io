class Game {
    constructor(gameInitData) {
        this.gameCanvas = gameInitData.gameCanvas;
        this.gameCtx = gameInitData.gameCtx;
        this.nextPieceCanvas = gameInitData.nextPieceCanvas;
        this.nextPieceCtx = gameInitData.nextPieceCtx;
        this.pieceColors = gameInitData.pieceColors;
        this.pieceColorsDark = gameInitData.pieceColorsDark;
        this.scoreDiv = gameInitData.scoreDiv;
        this.levelDiv = gameInitData.levelDiv;
        this.linesClearedDiv = gameInitData.linesClearedDiv;
        this.gameOverScore = gameInitData.gameOverScore;
        this.gameOverOverlay = gameInitData.gameOverOverlay;
        this.arena = null;
        this.arenaHeight = 20;
        this.arenaWidth = 10;
        this.currPiece = null;
        this.currPiecePos = {x: 0, y: 0};
        this.nextPiece = null;
        this.score = 0;
        this.level = 0;
        this.linesCleared = 0;
        this.fallingDelay = 500;
        this.timeSinceDrop = 0;
        this.lastTime = 0;
        this.paused = false;
    }

    checkForClearedLines() {
        let scoreMultiplier = 40;
        outer: for (let y = this.arena.length - 1; y > 0; y--) {
            for (let x = 0; x < this.arena[y].length; x++) {
                if (this.arena[y][x] == 0) {
                    continue outer;
                }
            }
    
            // Clear row at index y
            const row = this.arena.splice(y, 1)[0].fill(0);
            // Put cleared row at top
            this.arena.unshift(row);
            y++;
    
            // See:  http://tetris.wikia.com/wiki/Scoring
            this.score += scoreMultiplier * (this.level + 1)
            
            if (scoreMultiplier === 40)
                scoreMultiplier = 100;
            else if (scoreMultiplier === 100)
                scoreMultiplier = 300;
            else if (scoreMultiplier === 300)
                scoreMultiplier = 1200;
            
            this.linesCleared++;
            this.updateStats();

            // Check if player advances to next level
            this.level = this.getLevel(this.linesCleared);
            this.fallingDelay = this.getFallingDelay(this.level);
        }
    }
    
    checkForCollision(arena, currPiece, currPiecePos) {
        for (let y = 0; y < currPiece.length; y++) {
            for (let x = 0; x < currPiece[y].length; x++) {
                if (currPiece[y][x] !== 0 && (arena[y + currPiecePos.y] && 
                    arena[y + currPiecePos.y][x + currPiecePos.x]) !== 0) {
                    return true;
                }
            } 
        }
        return false;
    }
    
    createMatrix(width, height) {
        const matrix = [];
        while (height > 0) {
            height--;
            matrix.push(new Array(width).fill(0));
        }
        return matrix;
    }
    
    createPiece(type) {
        if (type === "T") {
            return [[0, 0, 0],
                    [1, 1, 1],
                    [0, 1, 0]];
        } else if (type === "O") {
            return [[2, 2],
                    [2, 2]];
        } else if (type === "L") {
            return [[0, 3, 0],
                    [0, 3, 0],
                    [0, 3, 3]];
        } else if (type === "J") {
            return [[0, 4, 0],
                    [0, 4, 0],
                    [4, 4, 0]];
        } else if (type === "I") {
            return [[0, 5, 0, 0],
                    [0, 5, 0, 0],
                    [0, 5, 0, 0],
                    [0, 5, 0, 0]];
        } else if (type === "S") {
            return [[0, 6, 6],
                    [0, 6, 0],
                    [6, 6, 0]];
        } else if (type === "Z") {
            return [[7, 7, 0],
                    [0, 7, 0],
                    [0, 7, 7]];
        }
    
    }
    
    draw() {
        const blockSize = this.getBlockSize(this.arenaHeight);
        this.drawBackground(this.arenaWidth, this.arenaHeight);
        this.drawGamePieces(this.gameCtx, this.arena, {x: 0, y: 0}, blockSize);  // Draw static game pieces
        this.drawGamePieces(this.gameCtx, this.currPiece, this.currPiecePos, blockSize);  // Draw player's game piece
    }
    
    drawBackground() {
        this.gameCtx.fillStyle = "black";
        const gridColor = "#1e1e1e";
        this.gameCtx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        const blockSize = this.getBlockSize();
      
        // Draw vertical background grid
        for (let x = 0; x < this.arenaWidth; x++) {
            this.gameCtx.beginPath();
            this.gameCtx.moveTo(x * blockSize, 0);
            this.gameCtx.lineTo(x * blockSize, this.gameCanvas.height);
            this.gameCtx.strokeStyle = gridColor;
            this.gameCtx.stroke();
        }
    
        // Draw horizontal background grid
        for (let y = 0; y < this.arenaHeight; y++) {
            this.gameCtx.beginPath();
            this.gameCtx.moveTo(0, y * blockSize);
            this.gameCtx.lineTo(this.gameCanvas.width, y * blockSize);
            this.gameCtx.strokeStyle = gridColor;
            this.gameCtx.stroke();
        }
    }
    
    drawGamePieces(context, matrix, offset, blockSize) {
        const innerRectOffset = Math.round(blockSize / 8);
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    context.beginPath();
                   
                    // Draw bottom part in darker color
                    context.fillStyle = this.pieceColorsDark[value];
                    context.fillRect((x + offset.x) * blockSize, (y + offset.y) * blockSize, blockSize, blockSize);
    
                    // Draw top part in lighter color
                    context.fillStyle = this.pieceColors[value];
                    context.fillRect((x + offset.x) * blockSize + innerRectOffset, (y + offset.y) * blockSize + innerRectOffset,
                                    blockSize - innerRectOffset * 2, blockSize - innerRectOffset * 2);
    
                    // Draw black outline around outside
                    context.strokeStyle = "black";
                    context.strokeRect((x + offset.x) * blockSize, (y + offset.y) * blockSize, blockSize, blockSize);
    
                    context.stroke();
                }
            });
        });
    
    }
    
    drawNextPiecePreview() {
        this.nextPieceCtx.fillStyle = "black";
        this.nextPieceCtx.fillRect(0, 0, this.nextPieceCanvas.width, this.nextPieceCanvas.height);
        const blockSize = this.nextPieceCanvas.clientHeight / 4;
        this.drawGamePieces(this.nextPieceCtx, this.nextPiece, {x: 0, y: 0}, blockSize);
    }

    dropPiece() {
        this.currPiecePos.y++;
        if (this.checkForCollision(this.arena, this.currPiece, this.currPiecePos)) {
            this.currPiecePos.y--;
            this.mergeMatrices(this.arena, this.currPiece, this.currPiecePos);
            this.checkForClearedLines();     // Check for cleared lines
            this.resetPiece();
            
        }
        this.timeSinceDrop = 0;
    }

    endGame() {
        this.paused = true;
        this.gameOverScore.innerText = this.score;
        this.gameOverOverlay.style.display = "block";  
    }
    
    getBlockSize(arenaHeight) {
        return this.gameCanvas.clientHeight / this.arenaHeight;
    }
    
    getFallingDelay(level) {
        return ((11 - level) * 50);
    }
    
    // See:  https://www.colinfahey.com/tetris/tetris.html
    getLevel(linesCleared) {
        let result = 0;
        if (linesCleared <= 0) {
            result = 1;
        }
        else if ((linesCleared > 0) && (linesCleared <= 90)) {
            result = Math.floor(1 + ((linesCleared - 1) / 10));
        }
        else {
            result = 10;
        }
        return result;
    }
      
   
    // Get random piece and start from top
    getNewPiece() {
        const pieces = "ILJOTSZ";   // List of all available pieces
        return this.createPiece(pieces[Math.floor(pieces.length * Math.random())]);
    }
    
        // Copies all values from player into arena at correct positions
    mergeMatrices(arena, currPiece, currPiecePos) {
        currPiece.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    arena[y + currPiecePos.y][x + currPiecePos.x] = value;
                }
            });
        });
    }

    moveLeft() {
        this.movePiece(-1);
    }

    moveRight() {
        this.movePiece(1);
    }

    moveDown() {
        this.dropPiece();
    }

    movePiece(dir) {
        this.currPiecePos.x += dir;
        if (this.checkForCollision(this.arena, this.currPiece, this.currPiecePos)) {
            // If moving causing collision, undo it
            this.currPiecePos.x -= dir;
        }
    }
    
    resetPiece() {
        if (this.nextPiece === null || this.nextPiece.length === 0)
            this.nextPiece = this.getNewPiece();
        this.currPiece = this.nextPiece;
        this.currPiecePos.x = Math.floor((this.arena[0].length - this.currPiece[0].length) / 2);
        this.currPiecePos.y = 0;
        this.nextPiece = this.getNewPiece();
        if (this.checkForCollision(this.arena, this.currPiece, this.currPiecePos)) {
            this.endGame();
        }
    }
   
    rotateLeft() {
        this.rotatePiece(-1);
    }

    rotateRight() {
        this.rotatePiece(1);
    }
    
    rotateMatrix(matrix, dir) {
        // Transpose matrix (convert rows to cols) and reverse rows to rotate
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                // Use tuple to easily swap values (no temp variable needed)
                [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
            }
        }
        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    }

    rotatePiece(dir) {
        const oldPos = this.currPiecePos.x;
        let offset = 1;
        this.rotateMatrix(this.currPiece, dir);
        // Check to ensure that rotation won't create collision
        while (this.checkForCollision(this.arena, this.currPiece, this.currPiecePos)) {
            this.currPiecePos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            // If offset is > length of first row, then this didn't work.
            // Must rotate back, reset position, and exit.
            if (offset > this.currPiece[0].length) {
                this.rotateMatrix(this.currPiece, -dir);
                this.currPiecePos.x = oldPos;
                return;
            }
        }
    }
    
    start() {
        this.paused = false;
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        this.arena = this.createMatrix(this.arenaWidth, this.arenaHeight);
        this.fallingDelay = this.getFallingDelay(this.level);      
        this.resetPiece();
        this.update();
        this.updateStats();
    }
    
    update() {
        const time = performance.now();
        if (this.paused) {
            return;
        }
        const elapsedTime = time - this.lastTime;
        this.lastTime = time;
        this.timeSinceDrop += elapsedTime;
        if (this.timeSinceDrop > this.fallingDelay) {
            this.dropPiece();
            this.updateStats();
        }
        this.draw();
        this.drawNextPiecePreview();
        requestAnimationFrame(() => this.update());
    }
    
    updateStats() {
        this.scoreDiv.innerText = this.score;
        this.levelDiv.innerText = this.level;
        this.linesClearedDiv.innerText = this.linesCleared;
    }

}
