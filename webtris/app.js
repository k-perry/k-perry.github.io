const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

window.addEventListener("resize", resizeCanvas);

let dropCounter = 0;
let dropInterval = 1000;    // Time (ms) between movements of block
let lastTime = 0;

const arena = createMatrix(10, 20);

let paused = false;

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] == 0) {
                continue outer;
            }
        }

        // Clear row at index y
        const row = arena.splice(y, 1)[0].fill(0);
        // Put cleared row at top
        arena.unshift(row);
        ++y;
        player.score += rowCount * 100;     // 100 points for clearing row
        rowCount *= 1.5;                    // Score increases for consecutive rows
    }
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        } 
    }
    return false;
}

const colors = [null,       // 0
                "#FF0D72",  // 1: T
                "#0DC2FF",  // 2: O
                "#0DFF72",  // 3: L
                "#F538FF",  // 4: J
                "#FF8E0D",  // 5: I
                "#FFE138",  // 6: S
                "#3877FF"]; // 7: Z

function createMatrix(width, height) {
    const matrix = [];
    while (height > 0) {
        height--;
        matrix.push(new Array(width).fill(0));
    }
    return matrix;
}


function createPiece(type) {
    // See for piece type descriptions:
    // https://medium.com/@markmliu/the-tetris-proof-60a7a69a8e04
    // Numbers in matrices are mapped to colors.
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

function draw() {
    drawBackground();
    drawMatrix(arena, {x: 0, y: 0});        // Draw static game pieces
    drawMatrix(player.matrix, player.pos);  // Draw player's game piece
}

function drawBackground() {
  
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // const blockSize = getBlockSize();
    // for (let x = 0; x < 10; x++) {
    //     ctx.beginPath();
    //     ctx.setLineDash([5, 5]);
    //     ctx.moveTo(x * blockSize, 0);
    //     ctx.lineTo(x * blockSize, canvas.height);
    //     ctx.strokeStyle = "#2E2E2E";
    //     ctx.stroke();
    // }
    
}

function drawMatrix(matrix, offset) {
    const blockSize = getBlockSize();
    const innerRectOffset = Math.round(blockSize / 8);
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                ctx.beginPath();
                ctx.setLineDash([]);
                ctx.fillStyle = colors[value];
                ctx.fillRect((x + offset.x) * blockSize, (y + offset.y) * blockSize, blockSize, blockSize);
                ctx.strokeStyle = "black";
                ctx.lineWidth = 2;
                ctx.strokeRect((x + offset.x) * blockSize, (y + offset.y) * blockSize, blockSize, blockSize);
                ctx.lineWidth = 1;
                ctx.strokeRect((x + offset.x) * blockSize + innerRectOffset, (y + offset.y) * blockSize + innerRectOffset,
                                blockSize - innerRectOffset * 2, blockSize - innerRectOffset * 2);
                ctx.stroke();

            }
        });
    });

}


function endGame() {
    paused = true;
    document.getElementById("game-over-score").innerText = player.score;
    document.getElementById("game-over-overlay").style.display = "block";  
}

function getBlockSize() {
    return Math.round(canvas.offsetHeight / 20);
}

// Copies all values from player into arena at correct positions
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
};

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        // If moving causing collision, undo it
        player.pos.x -= dir;
    }
}

// Get random piece and start from top
function playerReset() {
    const pieces = "ILJOTSZ";   // List of all available pieces
    player.matrix = createPiece(pieces[Math.floor(pieces.length * Math.random())]);
    player.pos.y = 0;
    player.pos.x = Math.floor((arena[0].length - player.matrix[0].length) / 2);
    
    // If there is a collision immediately after a reset, then game is over.
    if (collide(arena, player)) {
        endGame();
        
    }
}

function playerRotate(dir) {
    const oldPos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    // Check to ensure that rotation won't create collision
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        // If offset is > length of first row, then this didn't work.
        // Must rotate back, reset position, and exit.
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = oldPos;
            return;
        }
    }
}

function resizeCanvas() {
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.height = canvas.offsetHeight;
    canvas.width = Math.round(canvas.height / 2);
}

function restartGame() {
    document.getElementById("game-over-overlay").style.display = "none";
    // Clear arena and start over.
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
    startGame();
}

function rotate(matrix, dir) {
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

function startGame() {
    paused = false;
    playerReset();
    updateScore();
    update();
}

function update(time = 0) {
    if (paused) {
        return;
    }
    const elapsedTime = time - lastTime;
    lastTime = time;
    dropCounter += elapsedTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }
    draw();
    requestAnimationFrame(update);
}

function updateScore() {
    document.getElementById("score").innerText = player.score;
}

document.addEventListener("keydown", event => {
    //console.log(event);
    if (event.key === "ArrowLeft") {
        playerMove(-1);
    } else if (event.key === "ArrowRight") {
        playerMove(1);
    } else if (event.key === "ArrowDown") {
        playerDrop();
    } else if (event.code === "KeyQ") {
        playerRotate(-1);
    } else if (event.code === "KeyW") {
        playerRotate(1);
    }    
});

resizeCanvas();

startGame();