class UI {
    constructor() {
        this.location = document.getElementById("location");
        this.currentDesc = document.getElementById("curr-desc");
        this.currentTemp = document.getElementById("curr-temp");
        this.currentHumidity = document.getElementById("curr-humidity");
        this.currentFeelsLike = document.getElementById("curr-feels-like");
        this.currentDewpoint= document.getElementById("curr-dewpoint");
        this.currentWind = document.getElementById("curr-wind");
        this.currIcon = document.getElementById("curr-icon");
    }
  
    // Fill in all the UI fields with weather information from the API JSONs
    paint(weather) {
        document.title = `Weather for ${weather.forecastCity}, ${weather.forecastState}`;
        this.location.textContent = `${weather.forecastCity}, ${weather.forecastState}`;
        this.currentDesc.textContent = weather.currentConditions.textDescription;
        this.currentTemp.textContent = toFahr(weather.currentConditions.temperature.value);
        this.currentHumidity.textContent = Math.round(weather.currentConditions.relativeHumidity.value) + "%";
        let feelsLike = weather.currentConditions.windChill.value;
        if (feelsLike === null) {
            feelsLike = weather.currentConditions.heatIndex.value;
        }
        this.currentFeelsLike.textContent = toFahr(feelsLike);
        const windDir = toWindDir(weather.currentConditions.windDirection.value);
        const windSpeed = toMPH(weather.currentConditions.windSpeed.value);
        this.currentWind.textContent = `${windDir} at ${windSpeed} mph`;
        this.currentDewpoint.textContent = toFahr(weather.currentConditions.dewpoint.value) + "\u00B0";
        this.currIcon.setAttribute("src", weather.currentConditions.icon);
        this.currIcon.setAttribute("alt", weather.currentConditions.textDescription);
        this.insertDailyForecastRows(weather.dailyForecast);
        this.insertHourlyForecastrows(weather.hourlyForecast);
    }

    // Populate the daily forecast table
    insertDailyForecastRows(dailyForecast) {
        const table = document.getElementById("daily-forecast");
        table.innerHTML = "";       // Clear any old rows
        dailyForecast.periods.forEach(function(period) {
            const newRow = table.insertRow(table.rows.length);
            
            const periodCell = newRow.insertCell(0);
            const periodText = document.createTextNode(period.name);
            periodCell.appendChild(periodText);

            const condCell = newRow.insertCell(1);
            const condText = document.createTextNode(period.shortForecast);
            condCell.appendChild(condText);

            const tempCell = newRow.insertCell(2);
            const tempText = document.createTextNode(period.temperature + "\u00B0");
            tempCell.appendChild(tempText);

            const windCell = newRow.insertCell(3);
            const windText = document.createTextNode(`${period.windDirection} at ${period.windSpeed}`);
            windCell.appendChild(windText);

            const detailedCell = newRow.insertCell(4);
            const detailedText = document.createTextNode(period.detailedForecast);
            detailedCell.appendChild(detailedText);
        });
        
    }

    // Populate the hourly forecast table
    insertHourlyForecastrows(hourlyForecast) {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const table = document.getElementById("hourly-forecast");
        table.innerHTML = "";       // Clear any old rows
        hourlyForecast.periods.forEach(function(period) {
            const date = new Date(period.startTime);
            const newRow = table.insertRow(table.rows.length);    
            
            const dayCell = newRow.insertCell(0);
            const dayText = document.createTextNode(days[date.getDay()]);
            dayCell.appendChild(dayText);

            let dateOptions = { hour: "numeric", minute: "numeric", hour12: true };

            const timeCell = newRow.insertCell(1);
            const timeText = document.createTextNode(date.toLocaleString("en-US", dateOptions));
            timeCell.appendChild(timeText);

            const tempCell = newRow.insertCell(2);
            const tempText = document.createTextNode(period.temperature + "\u00B0");
            tempCell.appendChild(tempText);

            const forecastCell = newRow.insertCell(3);
            const forecastText = document.createTextNode(period.shortForecast);
            forecastCell.appendChild(forecastText);

            const precipcell = newRow.insertCell(4);
            const precipText = document.createTextNode(extractPrecip(period.icon) + "%");
            precipcell.appendChild(precipText);

            const windCell = newRow.insertCell(5);
            const windText = document.createTextNode(`${period.windDirection} at ${period.windSpeed}`);
            windCell.appendChild(windText);
        });
    }

    showLoading() {
        document.querySelector(".preloader-background").style.display = "flex";
    }

    hideLoading() {
        document.querySelector(".preloader-background").style.display = "none";
    }

  }

// --------------------------------------------------------------------------------
// Conversion and untility functions
// --------------------------------------------------------------------------------

// Converts a Celsius temperature to Fahrenheit
function toFahr(celsiusTemp) {
    return Math.round((celsiusTemp * 1.8 + 32));
}

// Convert meters/second to miles/hour
function toMPH(speed) {
    return Math.round((speed * 2.236936));  // 1 m/s = 2.236936 mph
}

// Convert wind angle in degrees to a direction
// Ex:  0 degrees = North, 180 degrees = South
function toWindDir(windAngle) {
    let idx = Math.floor((windAngle / 22.5) + 0.5);
    let directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return directions[(idx % 16)];
}

// The icon URL contains the chance of precipitation
// Ex:  https://api.weather.gov/icons/land/night/rain,100?size=small        <-- 100% chance of rain
function extractPrecip(iconUrl) {
    // Delete all the non-digit characters from URL, leaving just the number
    let precip = iconUrl.replace(/[^0-9]/g, '');
    if (precip === "") {
        precip = "0";
    }
    return precip;
}