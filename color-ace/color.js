class Color {
    
    constructor(val, colorType) {
        if (colorType === "hex") {
            // Initialize new color from hex string
            if (val.substring(0, 1) !== "#") {
                val = "#" + val;
            }
            this._hex = val;
            this._rgb = Color.hexToRGB(this._hex);
            this._hsl = Color.rgbToHSL(this._rgb);
            
        } else if (colorType === "rgb") {
            this._rgb = val;
            this._hsl = Color.rgbToHSL(this._rgb);
            this._hex = Color.rgbToHex(this._rgb);
        } else if (colorType === "hsl") {
            this._hsl = val;
            this._rgb = Color.hslToRGB(this._hsl);
            this._hex = Color.rgbToHex(this._rgb);
        }
    }

    get hex() {
        return this._hex;
    }

    get rgb() {
        return this._rgb;
    }

    get hsl() {
        return this._hsl;
    }

    get name() {
        return this._name;
    }
    
    set name(name) {
        this._name = name;
    }

    get categories() {
        return this._category;
    }

    set categories(category) {
        this._category = category;
    }

    adjustLightness(amt) {
        amt = Number(amt);
        this._hsl[2] += amt;
        if (this._hsl[2] > 100) {
            this._hsl[2] = 100;
        } else if (this._hsl[2] < 0) {
            this._hsl[2] = 0;
        }
        this._rgb = Color.hslToRGB(this._hsl);
        this._hex = Color.rgbToHex(this._rgb);
        
    }

    // Returns a hex string that corresponds to provided red, green, and blue values
    static rgbToHex(rgb) {
        let redHex = rgb[0].toString(16).toUpperCase();
        if (redHex.length == 1) {
            redHex = "0" + redHex;
        }
        let greenHex = rgb[1].toString(16).toUpperCase();
        if (greenHex.length == 1) {
            greenHex = "0" + greenHex;
        }
        let blueHex = rgb[2].toString(16).toUpperCase();
        if (blueHex.length == 1) {
            blueHex = "0" + blueHex;
        }
        return ("#" + redHex + greenHex + blueHex);
    }

    // Returns 3-element array with red, green, and blue values for provided hex string
    static hexToRGB(hexString) {
        let redStr, greenStr, blueStr, redVal, greenVal, blueVal;
        // Remove the leading #, if necessary
        if (hexString[0] === "#") {
            hexString = hexString.substring(1);
        }
        if (hexString.length === 3) {
            // Special handling for shorthand hex values with 3 digits
            redStr = hexString.substring(0, 1);
            redStr += redStr;
            greenStr = hexString.substring(1, 2);
            greenStr += greenStr;
            blueStr = hexString.substring(2, 3);
            blueStr += blueStr;
        } else {
            redStr = hexString.substring(0, 2);
            greenStr = hexString.substring(2, 4);
            blueStr = hexString.substring(4, 6);
        }
        if (redStr === "") {
            redStr = "0";
        }
        if (greenStr === "") {
            greenStr = "0";
        }
        if (blueStr === "") {
            blueStr = "0";
        }        
        redVal = parseInt(redStr, 16);
        greenVal = parseInt(greenStr, 16);
        blueVal = parseInt(blueStr, 16);
        return [redVal, greenVal, blueVal];
    }

    // Converts an RGB color to HSL
    static rgbToHSL(rgb) {
        let r = rgb[0] / 255;
        let g = rgb[1] / 255;
        let b = rgb[2] / 255;
        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);
        let h, s;
        let l = (max + min) / 2;
    
        if (max == min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        // HSL ranges for web:
        // Hue = 0 - 360 (degrees)
        // Saturation = 0 - 100 (percent)
        // Luminance = 0 - 100 (percent)
        return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    }

    // Converts an HSL color value to RGB.
    static hslToRGB(hsl) {
        let h = hsl[0] / 360;
        let s = hsl[1] / 100;
        let l = hsl[2] / 100;
        let r, g, b;
        if(s == 0){
            r = g = b = l; // achromatic
        } else {
            let hue2rgb = function hue2rgb(p, q, t){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }
            let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            let p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    // Given an RGB string in this format "rgb(0, 0, 0)", it extracts
    // the red, green, and blue values and returns them in an array.
    static parseRGB(str) {
        str = str.toLowerCase().trim();
        str = str.replace("rgb", "");
        str = str.replace("(", "");
        str = str.replace(")", "");
        while (str.includes(" ")) {
            str = str.replace(" ", "");
        }
        let result = str.split(",");
        return [Number(result[0]), Number(result[1]), Number(result[2])];
    }

    // Reference:  https://stackoverflow.com/a/8027444
    static isValidHexColor(str) {
        return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(str);
    }

    static isValidRGBColor(str) { 
        return /(^rgb\s*\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)\s*)/i.test(str);
    }

    // Fixes any problems in RGB values.  Values < 0 are set to 0.  Values > 255 are set to 255.
    // Returns an array [red, green, blue]
    static fixRGB(rgb) {
        for (let i = 0; i < rgb.length; i++) {
            if (rgb[i] > 255) {
                rgb[i] = 255;
            } else if (rgb[i] < 0) {
                rgb[i] = 0;
            }
        }
        return rgb;
    }

    static fixHSL(hsl) {
        if (hsl[0] > 360) {
            hsl[0] = 360;
        } else if (hsl[0] < 0) {
            hsl[0] = 0;
        }
        if (hsl[1] > 100) {
            hsl[1] = 100;
        } else if (hsl[1] < 0) {
            hsl[1] = 0;
        }
        if (hsl[2] > 100) {
            hsl[2] = 100;
        } else if (hsl[2] < 0) {
            hsl[2] = 0;
        }
        return hsl;
    }

    static getRandomRGB() {
        return [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)];
    }
}