"use strict";

function cssColorFilter(e) {
    ui.colorFilterChanged(e, cssColors);
}

function hexChanged() {
    const hex = ui.getHex();
    if (Color.isValidHexColor(hex)) {
        currentColor = new Color(hex, "hex");
        setColor(currentColor);
        ui.setHexValid(true);
    } else {
        ui.setHexValid(false);
    }
}

function rgbChanged() {
    const rgb = Color.fixRGB(ui.getRGB());
    currentColor = new Color(rgb, "rgb");
    setColor(currentColor);
}

function hslChanged() {
    const hsl = Color.fixHSL(ui.getHSL());
    currentColor = new Color(hsl, "hsl");
    setColor(currentColor);
}

function loadColors(fileName) {
    let colors = [];
    let colorsObjArr;
    const xhr = new XMLHttpRequest();
    xhr.open("GET", fileName, false);
    xhr.send();
    if (xhr.status === 200) {
        colorsObjArr = JSON.parse(xhr.responseText);
    }
    for (let i = 0; i < colorsObjArr.length; i++) {
        const color = new Color(colorsObjArr[i].hex, "hex");
        color.name = colorsObjArr[i].name;
        color.categories = colorsObjArr[i].categories;
        colors.push(color);
    }
    return colors;
}

function randomColor() {
    currentColor = new Color(Color.getRandomRGB(), "rgb");
    setColor(currentColor);
}

// SOURCE:  https://stackoverflow.com/a/33928558
// Copies a string to the clipboard
function copyToClipboard(text) {
    if (window.clipboardData && window.clipboardData.setData) {
        // IE specific code path to prevent textarea being shown while dialog is visible.
        return clipboardData.setData("Text", text); 

    } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");  // Security exception may be thrown by some browsers.
        } catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }
}

function adjustLightness(amt) {
    currentColor.adjustLightness(amt);
    setColor(currentColor);
}

function cssColorsTableClicked(e) {
    if (ui.isCopyBtnClicked(e)) {
        // Clicked a copy button.
        const copyText = ui.getTextToCopyFromTableRow(e.path[2]);
        copyToClipboard(copyText);
    } else {
        // Clicked somewhere else in a row.  Set the current color to this row's color value.
        const newColor = ui.getHexFromTableRow(e.path[1]);   // Pass the table row object
        if (newColor !== null) {
            currentColor = new Color(newColor, "hex");
            setColor(currentColor);
        }
    }
}

function savedColorsTableClicked(e) {
    if (ui.isDeleteBtnClicked(e)) {
        const rowIndex = e.path[3].rowIndex - 1;
        ui.deleteSavedColor(rowIndex);
        savedColors.splice(rowIndex, 1);
        storage.setSavedColors(savedColors);
    } else {
        const newColor = ui.getHexFromTableRow(e.path[1]);  // Pass the table row object
        if (newColor !== null) {
            currentColor = new Color(newColor, "hex");
            setColor(currentColor);
        }
    }

}


function loadSavedColors() {
    const colorsObjArr = storage.getSavedColors();
    if (colorsObjArr !== null) {
        colorsObjArr.forEach(color => {
            const newColor = new Color(color._rgb, "rgb");
            savedColors.push(newColor);
            ui.addSavedColor(newColor);
        });
    }
}

function loadCurrentColor() {
    const currColor = storage.getCurrentColor();
    if (currColor !== null) {
        currentColor = new Color(currColor._rgb, "rgb");
    } else {
        // Initialize to a random color
        currentColor = new Color(Color.getRandomRGB(), "rgb");
        storage.setCurrentColor(currentColor);
    }
}


function initialize() {
    loadSavedColors();
    loadCurrentColor();
    ui.setTab(0);
    ui.setColor(currentColor);
    ui.setHexValid(true);
    ui.populateColorsTable(cssColors);
}

function tabClicked(tabIdx) {
    ui.setTab(tabIdx);
}

function saveColor() {
    savedColors.push(currentColor);
    storage.setSavedColors(savedColors);
    ui.addSavedColor(currentColor);
}

function sortTable(col) {
    if (col === 0 || col === 2 || col === 3) {
        ui.sortCSSColorsTable(col);
    }
}

function previewPaletteColor(e) {
    ui.previewPaletteColor(e);
}

function mouseMovePalette(e) {
    ui.previewPaletteColor(e);
    if (draggingMouse) {
        const rgb = ui.getPaletteColorRGB(e);
        currentColor = new Color(rgb, "rgb");
        setColor(currentColor);
    }
}

function mouseLeavePalette(e) {
    ui.clearPalettePreview();
}

function mouseDownPalette(e) {
    if (e.which === 1) {
        // Left mouse button
        draggingMouse = true;
        const rgb = ui.getPaletteColorRGB(e);
        currentColor = new Color(rgb, "rgb");
        setColor(currentColor);
    }
}

function mouseUpPalette(e) {
    if (e.which === 1) {
        draggingMouse = false;
    }
}

function setColor(color) {
    storage.setCurrentColor(color);
    ui.setColor(color);
}


function clipboardMonitor() {
    if (navigator.clipboard) {
        navigator.clipboard.readText()
        .then(clipText => {
            if (Color.isValidHexColor(clipText)) {
                ui.enablePaste(clipText);
                
            } else {
                ui.disablePaste();
            }
        })
        .catch(err => {
            // Unable to read clipboard when browser doesn't have focus
            ui.disablePaste();
        });
    }
}

function copyHex() {
    copyToClipboard(ui.getHex());
}

function copyRGB() {
    const rgb = ui.getRGB();
    copyToClipboard(`rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`);
}

function copyHSL() {
    const hsl = ui.getHSL();
    copyToClipboard(`hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`);
}

function pasteHex() {
    navigator.clipboard.readText().then(clipText => {
        if (Color.isValidHexColor(clipText)) {
            currentColor = new Color(clipText, "hex");
            setColor(currentColor);
        }
    });
}


let currentColor;
let draggingMouse = false;
const savedColors = [];
const ui = new UI();
const storage = new Storage();
const cssColors = loadColors("css-colors.json");
document.addEventListener("DOMContentLoaded", initialize);
setInterval(clipboardMonitor, 300);
