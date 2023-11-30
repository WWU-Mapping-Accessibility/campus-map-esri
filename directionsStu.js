// Importing the PapaParse library for parsing CSV files
import * as Papa from "papaparse";

// Retrieving HTML elements by their IDs
const directFrom = document.getElementById('directfrom');
const directTo = document.getElementById('directto');
const directText = document.getElementById('directionstext');

// Definition of the Origin class
class Origin {
    // Constructor takes an 'origin' string and a Map of destination-description pairs
    constructor(origin, destinationsMap){
        this.origin = origin;
        this.destinationsMap = destinationsMap;
    }

    // Adds a destination and its description to the map
    addDestination(destination, description) {
        this.destinationsMap.set(destination, description);
    }

    // Returns an array of destination keys (names)
    returnDestinations(){
        return Array.from(this.destinationsMap.keys());
    }

    // Returns the description for a given destination key
    returnDirections(key){
        return this.destinationsMap.get(key);
    }
}

// Asynchronously fetches and returns the content of a CSV file
async function fetchCSV() {
    const response = await fetch("./directions.csv");
    const data = await response.text();
    return data;
}

// Parses the CSV data into a JavaScript object
function readCSV(data) {
    const records = Papa.parse(data, { header: true });
    return records;
}

// Main logic that operates after the CSV data is fetched and parsed
fetchCSV().then((csvData) => {
    const parsedCSV = readCSV(csvData).data;
    let uniqueOrigins = uniqueArrayOrigins(parsedCSV).sort();
    let originsStructured = new Map();

    // Populates the originsStructured map with Origin objects
    uniqueOrigins.forEach((origin) => {
        let indices = returnDestinations(origin, parsedCSV);
        originsStructured.set(origin, createOriginObj(origin, indices, parsedCSV));
        let newOption = document.createElement('option');
        newOption.value = origin;
        newOption.text = origin;
        directFrom.appendChild(newOption);
    });

    // Event listeners for dropdown changes
    directFrom.addEventListener('change', () => setSecondSelector(directFrom.value, originsStructured, directTo));
    directTo.addEventListener('change', () => setDirectionsText(directTo.value, directText));
});

// Extracts unique origins from the CSV data
function uniqueArrayOrigins(data) {
    let originArray = data.map(item => item.FROM);
    return [...new Set(originArray)];
}

// Returns indices of the data array where the origin matches the given origin
function returnDestinations(origin, data){
    let indexArray = [];
    data.forEach((item, index) => {
        if (item.FROM === origin){
            indexArray.push(index);
        }
    });
    return indexArray;
}

// Creates and returns an Origin object from the provided data
function createOriginObj(origin, indices, data){
    let originObj = new Origin(origin, new Map());
    indices.forEach((i) => {
        let indexData = data[i];
        originObj.addDestination(indexData.TO, indexData.DESCRIPTION);
    });
    return originObj;
}

// Sets the options in the second dropdown based on the selected origin
function setSecondSelector(firstSelected, map, destination){
    destination.innerHTML = "";
    let originObject = map.get(firstSelected);
    originObject.returnDestinations().forEach((key) => {
        let newOption = document.createElement('option');
        newOption.value = originObject.returnDirections(key);
        newOption.text = key;
        destination.appendChild(newOption);
    });
    // Has to run once the initial value is set bc it does not trigger a change event
    setDirectionsText(destination.value, directText);
}

// Updates the text to display the selected destination's directions
function setDirectionsText(text, directionsElement){
    directionsElement.innerHTML = text;
};