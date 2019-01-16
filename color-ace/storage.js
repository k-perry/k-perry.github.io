class Storage {

    getSavedColors() {
        return JSON.parse(localStorage.getItem("savedColors"));
    }

    setSavedColors(colors) {
        localStorage.setItem("savedColors", JSON.stringify(colors));
    }

    getCurrentColor() {
        return JSON.parse(localStorage.getItem("currentColor"));
    }

    setCurrentColor(color) {
        localStorage.setItem("currentColor", JSON.stringify(color));
    }

}