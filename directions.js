import * as Papa from "papaparse";

// Class template for origins

class Origin {
    // Constructor expects a string 'origin' and a Map of 'destination':directions pairs
    constructor(origin, destinationsMap){
        this.origin = origin;
        this.destinationsMap = destinationsMap;
    }
};

class Destination {
    // Constructor expects a string 'destination' and a string 'directions'
    constructor(destination, directions){
        this.destination = destination;
        this.directions = directions;
    }
};


// Async function that will return the promise of a read CSV file put in the public directory
// Fetch is used to look for and load the file
async function fetchCSV() {
    const response = await fetch("./directions.csv");
    const data = await response.text();
    return data;
};

// This will parse read CSV data into a JS object of arrays array
function readCSV(data) {
    const records = Papa.parse(data, { header: true});
    return records;
};


// Everything is going to have to be put in this `then` block bc it has to run AFTER the CSV data is parsed
fetchCSV().then((csvData) => {
    const parsedCSV = readCSV(csvData);
    console.log(parsedCSV);

    // What we need to do here is write some functions that
    // 1. Creates a set of origin destination pairs in a data structure
    // 2. Sets the options in the first dropdown to unique origins
    // 3. Creates an event listener that listens for a change in the origins dropdown
    //     then updates the set of options in the destinations dropdown
    // 4. Creates another event listener that updates the displayed directions based on the above


});


// Everything below this is just for testing html changing
var testDirectionsArray1 = ["point1", "point2", "point3"];
var testDirectionsArray2 = ["point3", "point4", "point5"];

const directFrom = document.getElementById('directfrom');

const directTo = document.getElementById('directto');

directFrom.innerHTML = '';

testDirectionsArray1.forEach( opt => {
    var newOption = document.createElement('option');
    newOption.value = opt;
    newOption.text = opt;
    directFrom.appendChild(newOption);
    }
)

testDirectionsArray2.forEach( opt => {
    var newOption = document.createElement('option');
    newOption.value = opt;
    newOption.text = opt;
    directTo.appendChild(newOption);
    }
)