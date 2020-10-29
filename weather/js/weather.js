class Weather {
    constructor(location) {
        if (location === undefined) {
            console.error("Weather Constructor:  No location provided.");
            return;
        }
        this.location = location;
    }

    // Converts a city, state or zip code to latitude and longitude coordinates
    // using Google Maps geocoding
    getLatLong() {
        let location = this.location;
        return new Promise(function (resolve, reject) {
            let geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address: location }, function (results, status) {
                if (
                    status == google.maps.GeocoderStatus.OK &&
                    results.length > 0
                ) {
                    resolve(results);
                } else {
                    reject(status);
                }
            });
        });
    }

    // Gets the weather from the Weather.gov API
    // See:  https://www.weather.gov/documentation/services-web-api
    async getWeather() {
        // Convert location to latitude and longitude using Google Maps geocoder
        const latLong = await this.getLatLong();
        const lat = latLong[0].geometry.location.lat();
        const lng = latLong[0].geometry.location.lng();

        // Get general weather API info for this location, including URLs for forecast, city name, etc.
        const weatherApiInfo = await (
            await fetch(`https://api.weather.gov/points/${lat},${lng}`)
        ).json();
        const forecastCity =
            weatherApiInfo.properties.relativeLocation.properties.city;
        const forecastState =
            weatherApiInfo.properties.relativeLocation.properties.state;

        // Get list of all weather stations in the area.  Use the first station in the list.
        const observationStations = await (
            await fetch(weatherApiInfo.properties.observationStations)
        ).json();
        const weatherStation = observationStations.features[0].properties.name;

        // Get the current conditions
        const currentConditions = await (
            await fetch(
                `https://api.weather.gov/stations/${observationStations.features[0].properties.stationIdentifier}/observations/latest?require_qc=false`
            )
        ).json();

        // Get daily (7-day) forecast
        const dailyForecast = await (
            await fetch(weatherApiInfo.properties.forecast)
        ).json();

        // Get hourly forecast
        const hourlyForecast = await (
            await fetch(weatherApiInfo.properties.forecastHourly)
        ).json();

        // Return all this info and let the other module parse it and convert it
        return {
            forecastCity: forecastCity,
            forecastState: forecastState,
            weatherStationLoc: weatherStation,
            currentConditions: currentConditions.properties,
            dailyForecast: dailyForecast.properties,
            hourlyForecast: hourlyForecast.properties,
        };
    }

    changeLocation(newLocation) {
        this.location = newLocation;
    }
}
