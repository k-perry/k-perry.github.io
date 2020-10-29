const tools = ["brush", "pencil", "eraser", "fill", "line", "rect", "circle"];

let _activeTool;
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Tool buttons
const brushBtn = document.getElementById("brush");
const pencilBtn = document.getElementById("pencil");
const eraserBtn = document.getElementById("eraser");
const fillBtn = document.getElementById("fill");
const lineBtn = document.getElementById("line");
const rectBtn = document.getElementById("rect");
const circleBtn = document.getElementById("circle");

// Options
const colorOpt = document.getElementById("color");
const sizeOpt = document.getElementById("size");

// File menu
const fileBtn = document.getElementById("topbar-file-btn");
const newBtn = document.getElementById("new");
const saveBtn = document.getElementById("save");

window.addEventListener("resize", resizeHandler);
window.addEventListener("click", clickHandler);
canvas.addEventListener("mousedown", canvasMouseDownHandler);
canvas.addEventListener("mouseup", canvasMouseUpHandler);
canvas.addEventListener("mousemove", canvasMouseMoveHandler);

let drag = false;
let oldImg;
let startPos = { x: 0, y: 0 };

resizeHandler(); // Force canvas resize when first loading
clearCanvas();
setActiveTool(tools[0]); // Set regular brush as default tool
canvas.style.cursor = "crosshair";
hideFileMenu(); // Ensure file menu is hidden when pages is first loaded

brushBtn.onclick = function () {
    setActiveTool("brush");
    colorOpt.hidden = false;
    sizeOpt.hidden = false;
    return false;
};

pencilBtn.onclick = function () {
    setActiveTool("pencil");
    colorOpt.hidden = false;
    sizeOpt.hidden = false;
    return false;
};

eraserBtn.onclick = function () {
    setActiveTool("eraser");
    colorOpt.hidden = true;
    sizeOpt.hidden = false;
    return false;
};

fillBtn.onclick = function () {
    setActiveTool("fill");
    colorOpt.hidden = false;
    sizeOpt.hidden = true;
    return false;
};

lineBtn.onclick = function () {
    setActiveTool("line");
    colorOpt.hidden = false;
    sizeOpt.hidden = false;
    return false;
};

rectBtn.onclick = function () {
    setActiveTool("rect");
    colorOpt.hidden = false;
    sizeOpt.hidden = true;
    return false;
};

circleBtn.onclick = function () {
    setActiveTool("circle");
    colorOpt.hidden = false;
    sizeOpt.hidden = true;
    return false;
};

newBtn.onclick = function () {
    clearCanvas();
    hideFileMenu();
    ctx.beginPath();
    return false;
};

saveBtn.onclick = function () {
    hideFileMenu();

    // See:  https://stackoverflow.com/a/44487883
    var downloadLink = document.getElementById("download_link");
    downloadLink.setAttribute("download", "image.png");
    downloadLink.setAttribute(
        "href",
        canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")
    );
    downloadLink.click();

    return false;
};

function clearCanvas() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Resize canvas when browser window is resized
function resizeHandler() {
    // By default, HTML canvas erases everything when it resizes.  See: https://stackoverflow.com/a/5420117
    // Save old image data before resizing, because it will be lost otherwise.
    oldImg = ctx.getImageData(0, 0, canvas.width, canvas.height);

    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Restore the previous image data.
    ctx.putImageData(oldImg, 0, 0);
}

function clickHandler(e) {
    if (e.target.id !== "topbar-file-btn") hideFileMenu();
}

function hideFileMenu() {
    document.getElementById("topbar-file-btn").checked = false;
}

function isFileMenuVisible() {
    return document.getElementById("topbar-file-btn").checked;
}

function setActiveTool(tool) {
    // hideFileMenu();
    let curr_tool;
    for (let i = 0; i < tools.length; i++) {
        curr_tool = document.getElementById(tools[i]);
        if (tools[i] === tool) {
            curr_tool.classList.add("active");
            // console.log("Set active: " + tool);
        } else {
            curr_tool.classList.remove("active");
        }
    }
    _activeTool = tool;
}

function getActiveTool() {
    return _activeTool;
}

// Gets the current mouse position
function getMousePos(e) {
    const canvasRect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - canvasRect.left,
        y: e.clientY - canvasRect.top,
    };
}

// Converts a hex color string to RGBA array.
// Ex:  "#805858" is converted to [128, 88, 88, 255]
// Alpha value is always set to 255
function hexColorToRGBA(hexString) {
    // Valid string will have length 6 is "#" is not included
    // or length 7 if "#" is included.
    if (hexString.length < 6 || hexString.length > 7)
        // Invalid hex color string
        return;

    // Remove the preceding "#", if necessary
    if (hexString.charAt(0) === "#") hexString = hexString.substring(1, 7);

    // String format = RRGGBB
    const r = parseInt(hexString.substring(0, 2), 16);
    const g = parseInt(hexString.substring(2, 4), 16);
    const b = parseInt(hexString.substring(4, 6), 16);

    return [r, g, b, 255];
}

// Compares each item in two arrays to test for equality.
function isArrayEqual(arr1, arr2) {
    if (!arr1 || !arr2) return false;
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}

// Given image data from context.getImageData(), it gets the color of pixel at (x, y) and returns
// it as an RGBA array.  canvasWidth is needed to compute the array index.
function getPixelColor(img, canvasWidth, x, y) {
    // Image data is stored in a 1D array with 4 elements for each pixel (R, G, B, A).
    // To convert x and y coordinates to array indices:
    //      redIndex = (y * canvas.width + x) * 4;
    //      greenIndex = redIndex + 1;
    //      blueIndex = redIndex + 2;
    //      alphaIndex = redIndex + 3;
    const pixelRedIndex = (y * canvasWidth + x) * 4;
    return [
        img.data[pixelRedIndex],
        img.data[pixelRedIndex + 1],
        img.data[pixelRedIndex + 2],
        img.data[pixelRedIndex + 3],
    ];
}

// Sets pixel color based on the (x, y) position.  color should be an RGBA array.
function setPixelColor(img, canvasWidth, x, y, color) {
    const pixelRedIndex = (y * canvasWidth + x) * 4;
    img.data[pixelRedIndex] = color[0]; // Red
    img.data[pixelRedIndex + 1] = color[1]; // Green
    img.data[pixelRedIndex + 2] = color[2]; // Blue
    img.data[pixelRedIndex + 3] = color[3]; // Alpha.  Set to 255 for full opacity.
}

function fill(img, startX, startY, newColor) {
    const startColor = getPixelColor(img, canvas.width, startX, startY);

    // No work to be done if the start pixel is already same color as the new color
    if (isArrayEqual(startColor, newColor)) return;

    setPixelColor(img, canvas.width, startX, startY, newColor);

    let pixelStack = [[startX, startY]]; // Push initial pixel coords onto stack

    // Added extra condition to prevent infinite looping and crashing the browser in case
    // something crazy happens.  This needs more testing.  15 million pixels is more than
    // a 5k monitor has.
    while (pixelStack.length > 0 && pixelStack.length < 15000000) {
        currPixelPos = pixelStack.pop();
        currX = currPixelPos[0];
        currY = currPixelPos[1];

        // Check pixel to the north.
        if (currY > 0) {
            const oldColorNorth = getPixelColor(
                img,
                canvas.width,
                currX,
                currY - 1
            );
            if (isArrayEqual(oldColorNorth, startColor)) {
                // Only recolor the pixels that are the same color as the starting pixel
                setPixelColor(img, canvas.width, currX, currY - 1, newColor);
                pixelStack.push([currX, currY - 1]);
            }
        }

        // Check pixel to the east.
        if (currX < canvas.width - 1) {
            const oldColorEast = getPixelColor(
                img,
                canvas.width,
                currX + 1,
                currY
            );
            if (isArrayEqual(oldColorEast, startColor)) {
                setPixelColor(img, canvas.width, currX + 1, currY, newColor);
                pixelStack.push([currX + 1, currY]);
            }
        }

        // Check pixel to the south.
        if (currY < canvas.height - 1) {
            const oldColorSouth = getPixelColor(
                img,
                canvas.width,
                currX,
                currY + 1
            );
            if (isArrayEqual(oldColorSouth, startColor)) {
                setPixelColor(img, canvas.width, currX, currY + 1, newColor);
                pixelStack.push([currX, currY + 1]);
            }
        }

        // Check pixel to the west.
        if (currX > 0) {
            const oldColorWest = getPixelColor(
                img,
                canvas.width,
                currX - 1,
                currY
            );
            if (isArrayEqual(oldColorWest, startColor)) {
                setPixelColor(img, canvas.width, currX - 1, currY, newColor);
                pixelStack.push([currX - 1, currY]);
            }
        }
    }
}

function canvasMouseDownHandler(e) {
    hideFileMenu();
    if (e.buttons !== 1) return; // Only draw if LEFT mouse button is pressed
    drag = true;
    const tool = getActiveTool();
    const size = document.getElementById("size_val").value;
    ctx.beginPath();
    startPos = getMousePos(e);
    ctx.moveTo(startPos.x, startPos.y);

    if (tool === "brush") {
        ctx.lineWidth = size;
        ctx.lineCap = "round";
        ctx.strokeStyle = colorOpt.value;
    } else if (tool === "pencil") {
        ctx.lineWidth = size;
        ctx.lineCap = "square";
        ctx.strokeStyle = colorOpt.value;
    } else if (tool === "eraser") {
        ctx.lineWidth = size;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#FFFFFF"; // Eraser is always white
    } else if (tool === "fill") {
        img = ctx.getImageData(0, 0, canvas.width, canvas.height);

        console.log(startPos);
        // The color picker form returns the color as a hex string (e.g. "#2D3F44").  Convert this to an array of integers.
        const newColor = hexColorToRGBA(colorOpt.value);

        // Modifies the pixel colors in img
        fill(img, startPos.x, startPos.y, newColor);

        // Draw updated colors to screen
        ctx.putImageData(img, 0, 0);
    } else if (tool === "rect") {
        ctx.fillStyle = colorOpt.value;
        // Save old image so that we can have live preview of rectangle as it is drawn
        oldImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } else if (tool === "line") {
        ctx.lineWidth = size;
        ctx.lineCap = "butt";
        ctx.strokeStyle = colorOpt.value;
        // Save old image so that we can have live preview of line as it is drawn
        oldImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } else if (tool === "circle") {
        ctx.fillStyle = colorOpt.value;
        // Save old image so that we can have live preview of rectangle as it is drawn
        oldImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
}

function canvasMouseMoveHandler(e) {
    if (!drag) return;
    const tool = getActiveTool();
    const currPos = getMousePos(e);

    if (tool === "brush" || tool === "pencil" || tool === "eraser") {
        ctx.lineTo(currPos.x, currPos.y);
        ctx.stroke();
    } else if (tool === "rect") {
        // Restore old image (before drawing started) before displaying live preview of rectangle.
        ctx.putImageData(oldImg, 0, 0);
        ctx.beginPath();
        const rectWidth = currPos.x - startPos.x;
        const rectHeight = currPos.y - startPos.y;
        ctx.fillRect(startPos.x, startPos.y, rectWidth, rectHeight);
    } else if (tool === "line") {
        ctx.putImageData(oldImg, 0, 0);
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(currPos.x, currPos.y);
        ctx.stroke();
    } else if (tool === "circle") {
        ctx.putImageData(oldImg, 0, 0);
        ctx.beginPath();
        // Distance = sqrt[ (x2-x1)^2 + (y2-y1)^2) ]
        const distance = Math.sqrt(
            Math.pow(currPos.x - startPos.x, 2) +
                Math.pow(currPos.y - startPos.y, 2)
        );
        const radius = distance / 2;
        const centerX = (startPos.x + currPos.x) / 2;
        const centerY = (startPos.y + currPos.y) / 2;
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
        // ctx.stroke();
    }
}

function canvasMouseUpHandler() {
    drag = false;
}
