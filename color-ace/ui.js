/*jslint es6*/
"use strict";

class UI {
    constructor() {
        this.pasteBtn = document.getElementById("paste-btn");
        this.hexInput = document.getElementById("hex");
        this.redInput = document.getElementById("red");
        this.greenInput = document.getElementById("green");
        this.blueInput = document.getElementById("blue");
        this.hueInput = document.getElementById("hue");
        this.saturationInput = document.getElementById("saturation");
        this.luminanceInput = document.getElementById("luminance");
        this.colorPreview = document.getElementById("color-preview");
        this.cssColorsTable = document.getElementById("css-colors-table");
        this.validHexIcon = document.getElementById("valid-icon");
        this.cssColorFilter = document.getElementById("color-filter");
        this.colorPaletteCanvas = document.getElementById("color-palette");
        this.colorPaletteCtx = this.colorPaletteCanvas.getContext("2d");
        this.savedColorsTable = document.getElementById("saved-colors-table").getElementsByTagName("tbody")[0];
        this.resizeColorPalette(this.colorPaletteCanvas);
        this.drawColorPalette();        this.sortDirection = [-1, null, -1, -1];        // Current sort direction for the 3 sortable columns in table
        this.paletteColor = document.getElementById("palette-color");
        this.paletteHex = document.getElementById("palette-hex");
        this.paletteRGB = document.getElementById("palette-rgb");
        
    }

    resizeColorPalette(canvas) {
        // Resize the canvas to fill its parent
        canvas.width = canvas.parentNode.offsetWidth;
        canvas.height = canvas.parentNode.offsetHeight;
    }

    previewPaletteColor(event) {
        const rgb = UI.getRGBFromImageData(this.colorPaletteCtx, event.layerX, event.layerY);
        const rgbText = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
        this.paletteRGB.innerText = rgbText;
        this.paletteHex.innerText = Color.rgbToHex(rgb);
        this.paletteColor.style.backgroundColor = rgbText;
    }

    clearPalettePreview() {
        this.paletteColor.style.backgroundColor = "";
        this.paletteHex.innerText = "";
        this.paletteRGB.innerText = "";
    }

    getPaletteColorRGB(event) {
        return UI.getRGBFromImageData(this.colorPaletteCtx, event.layerX, event.layerY);
    }

    static getRGBFromImageData(ctx, x, y) {
        const pixelData = ctx.getImageData(x, y, 1, 1).data;
        return [pixelData[0], pixelData[1], pixelData[2]];
    }

    isCopyBtnClicked(event) {
        return event.path[0].classList.contains("fa-copy")
    }

    isDeleteBtnClicked(event) {
        return event.path[0].classList.contains("fa-trash");
    }

    setColor(color) {
        this.setHex(color.hex);
        this.setRGB(color.rgb);
        this.setHSL(color.hsl);
        this.previewColor(color);
    }

    setHex(hex) {
        this.hexInput.value = hex;
    }

    getHex() {
        return this.hexInput.value;
    }

    setRGB(rgb) {
        this.redInput.value = rgb[0];
        this.greenInput.value = rgb[1];
        this.blueInput.value = rgb[2];
    }

    getRGB() {
        return [Number(this.redInput.value), Number(this.greenInput.value), Number(this.blueInput.value)];
    }

    setHSL(hsl) {
        this.hueInput.value = hsl[0];
        this.saturationInput.value = hsl[1];
        this.luminanceInput.value = hsl[2];
    }

    getHexFromTableRow(path) {
        let color = null;
        const row = path.querySelector(".color-row-hex");
        if (row !== null) {
            color = row.innerText.trim();
        }
        return color;
    }

    getHSL() {
        return [Number(this.hueInput.value), Number(this.saturationInput.value), Number(this.luminanceInput.value)];
    }

    getTextToCopyFromTableRow(path) {
        let copyText = null;
        if (path.classList.contains("color-row-name")) {
            copyText = path.innerText.trim();
        } else if (path.classList.contains("color-row-hex")) {
            copyText = path.innerText.trim();
        } else if (path.classList.contains("color-row-rgb")) {
            copyText = path.innerText.trim();
        }
        return copyText;
    }

    getHexFromSavedColorRow(path) {
        let color = null;
        const row = path.querySelector("")
    }

    setHexValid(isValid) {
        if (isValid) {
            this.hexInput.style.backgroundColor = "white";
            this.validHexIcon.classList.replace("fa-times-circle", "fa-check-circle");
            this.validHexIcon.style.color = "limegreen";
        } else {
            this.hexInput.style.backgroundColor = "#FFC8B3";
            this.validHexIcon.classList.replace("fa-check-circle", "fa-times-circle");
            this.validHexIcon.style.color = "red";   
        }
    }

    previewColor(color) {
        this.colorPreview.style.backgroundColor = color.hex;
    }

    populateColorsTable(colors) {
        let rowsHTML = "";
        colors.forEach(color => {
            rowsHTML += `
                <tr class="color-row" id="${color.name}">
                    <td class="color-row-name">
                        ${color.name}<button class="small-btn copy-name"><i class="fas fa-copy"></i></button>
                    </td>
                    <td class="color-row-preview" style="background-color: ${color.hex};"></td>
                    <td class="color-row-hex">
                        ${color.hex}<button class="small-btn copy-hex"><i class="fas fa-copy"></i></button>
                    </td>
                    <td class="color-row-rgb">
                        rgb(${color.rgb})<button class="small-btn copy-rgb"><i class="fas fa-copy"></i></button>
                    </td>
                </tr>
            `;
        });
        this.cssColorsTable.innerHTML += "<tbody class=\"monospace\">" + rowsHTML + "</tbody>";
    }

    addSavedColor(color) {
        const newRow = this.savedColorsTable.insertRow(-1);
        newRow.className = "color-row";
        const preview = newRow.insertCell(0);
        preview.style.backgroundColor = color.hex;
        const hex = newRow.insertCell(1);
        hex.className = "color-row-hex";
        hex.innerHTML = color.hex;
        const rgb = newRow.insertCell(2);
        rgb.className = "color-row-rgb";
        rgb.innerHTML = `rgb(${color.rgb[0]},${color.rgb[1]},${color.rgb[2]})`;
        const del = newRow.insertCell(3);
        del.style.textAlign = "center";
        del.innerHTML = "<button class=\"small-btn\"><i class=\"fas fa-trash\"></i></button>";
    }

    drawColorPalette() {
        let gradient = this.colorPaletteCtx.createLinearGradient(0, 0, this.colorPaletteCanvas.width, 0);
        
        // Create color gradient
        gradient.addColorStop(0, "rgb(255, 0, 0)");
        gradient.addColorStop(0.167, "rgb(255, 0, 255)");
        gradient.addColorStop(0.333, "rgb(0, 0, 255)");
        gradient.addColorStop(0.5, "rgb(0, 255, 255)");
        gradient.addColorStop(0.667, "rgb(0, 255, 0)");
        gradient.addColorStop(0.833, "rgb(255, 255, 0)");
        gradient.addColorStop(1, "rgb(255, 0, 0)");
        
        // Apply gradient to canvas
        this.colorPaletteCtx.fillStyle = gradient;
        this.colorPaletteCtx.fillRect(0, 0, this.colorPaletteCanvas.width, this.colorPaletteCanvas.height);
        
        // Create semi transparent gradient (white -> trans. -> black)
        gradient = this.colorPaletteCtx.createLinearGradient(0, 0, 0, this.colorPaletteCanvas.height);
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.5, "rgba(255, 255, 255, 0)");
        gradient.addColorStop(0.5, "rgba(0, 0, 0, 0)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 1)");
        
        // Apply gradient to canvas
        this.colorPaletteCtx.fillStyle = gradient;
        this.colorPaletteCtx.fillRect(0, 0, this.colorPaletteCanvas.width, this.colorPaletteCanvas.height);   
    }

    setTab(tabIdx) {
        // Add the "active-tab" class to this tab.  Remove this class from all other tabs.
        const activeTabBtnClass = "active-tab-btn";
        const tabBtns = document.getElementsByClassName("tab-btn");
        for (let i = 0; i < tabBtns.length; i++) {
            if (i === tabIdx) {
                tabBtns[i].classList.add(activeTabBtnClass);
            } else {
                tabBtns[i].classList.remove(activeTabBtnClass);
            }
        }

        // Display the active tab and hide all the others
        const tabs = document.getElementsByClassName("tab");
        for (let i = 0; i < tabs.length; i++) {
            if (i == tabIdx) {
                tabs[i].style.display = "block";
            } else {
                tabs[i].style.display = "none";
            }
        }
    }

    sortCSSColorsTable(col) {
        const tb = this.cssColorsTable.tBodies[0];
        let tr = Array.prototype.slice.call(tb.rows, 0);    // Convert rows to an array
        this.sortDirection[col] = -this.sortDirection[col];
        const sortDir = this.sortDirection[col];
        tr = tr.sort(function (a, b) {
            let comparator = a.cells[col].textContent.trim().localeCompare(b.cells[col].textContent.trim());
            if (sortDir === 1) {
                comparator = -comparator;
            }
            return comparator;
        });
        for (let i = 0; i < tr.length; ++i) {
            tb.appendChild(tr[i]);      // Append each row in order
        }
    }

    colorFilterChanged(e, cssColors) {
        const rows = this.cssColorsTable.getElementsByClassName("color-row");
        if (this.cssColorFilter.value === "all") {
            for (let i = 0; i < rows.length; i++) {
                rows[i].style.display = "";
            }        
        } else {
            for (let i = 0; i < rows.length; i++) {
                const colorNameCell = rows[i].querySelector(".color-row-name")
                if (colorNameCell !== null) {
                    const colorName = colorNameCell.innerText.trim();
                    // Searches "colors" array and gets the color object with the specified name
                    const colorObj = cssColors.find(c => c.name === colorName);
                    if (colorObj.categories.findIndex(cat => cat == this.cssColorFilter.value) >= 0) {
                        // Found the category
                        rows[i].style.display = "";
                    } else {
                        rows[i].style.display = "none";
                    }
    
                }
                
            }        
        }
    }

    deleteSavedColor(index) {
        this.savedColorsTable.deleteRow(index);
    }

    enablePaste(btnText) {
        this.pasteBtn.disabled = false;
        this.pasteBtn.innerHTML = `<i class="fas fa-file-import"></i>&nbsp;<span class="monospace">${btnText}</span>`;
        this.pasteBtn.style.padding = "0.4rem";
    }

    disablePaste() {
        if (!this.pasteBtn.disabled) {
            this.pasteBtn.disabled = true;
            this.pasteBtn.innerHTML = "<i class=\"fas fa-file-import\"></i>";
            this.pasteBtn.style.padding = "0.5rem";
        }
    }
}