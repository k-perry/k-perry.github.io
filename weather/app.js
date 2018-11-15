// Initialize
const defaultLocation = "Atlanta, GA";
const storage = new Storage(defaultLocation);     // Set default location
const storageLocation = storage.getLocation();
const weather = new Weather(storageLocation);

const ui = new UI();

document.addEventListener('DOMContentLoaded', function() {
    loadWeather(0);
    const modals = document.querySelectorAll('.modal');
    const tabs = document.querySelectorAll('.tabs');
    const modalInstances = M.Modal.init(modals);
    const tabInstances = M.Tabs.init(tabs);
});

// "Save" button in modal
document.getElementById("save-loc").addEventListener("click", (e) => {
    changeLocation();
});

// Pressing enter key in modal
document.getElementById("new-loc").addEventListener("keydown", (e) => {
    if (e.which === 13) {
        // If user presses enter key, send a click to the "Save" button
        document.getElementById("save-loc").click();
    }
});

// Load the weather
function loadWeather(errorCount) {
    ui.showLoading()
    weather.getWeather()
    .then(results => {
        ui.paint(results);
        ui.hideLoading();
    })
    .catch(err => {
        // Error loading the weather for requested location
        console.error("loadWeather():", err);
        const errorModal = M.Modal.getInstance(document.getElementById("error-modal"));
        errorModal.open();
        errorCount += 1;
        if (errorCount < 2)
        {
            ui.hideLoading();
            storage.setLocation(defaultLocation);
            weather.changeLocation(defaultLocation);
            loadWeather(errorCount);
        }
    });
}

function changeLocation() {
    const newLoc = document.getElementById("new-loc");
    if (newLoc.value !== "") {
        storage.setLocation(newLoc.value);
        weather.changeLocation(newLoc.value);
        loadWeather(0);
    }
    newLoc.value = "";
}
