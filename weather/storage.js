class Storage {
    constructor(defaultLocation) {
        this.location;
        this.defaultLocation = defaultLocation;
    }

    getLocation() {
        if (localStorage.getItem("location") === null) {
            this.location = this.defaultLocation;
        } else {
            this.location = localStorage.getItem("location");
        }

        return this.location;
    }

    setLocation(location) {
        localStorage.setItem("location", location);
    }
}