import * as Papa from "papaparse";

// Constants for html elements
const directFrom = document.getElementById('directfrom');
const directTo = document.getElementById('directto');
const directText = document.getElementById('directionstext');

// Class template for origins

class Origin {
    // Constructor expects a string 'origin' and a Map of 'destination':directions pairs
    constructor(origin, destinationsMap){
        this.origin = origin;
        this.destinationsMap = destinationsMap;
    };

    addDestination(destination, description) {
        this.destinationsMap.set(destination, description);
    };

    returnDestinations(){
        return Array.from(this.destinationsMap.keys());
    };
    
    returnDirections(key){
        return (this.destinationsMap.get(key));
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

    const parsedCSV = readCSV(csvData).data;
    let uniqueOrigins = uniqueArrayOrigins(parsedCSV).sort();
    let originsStructured = new Map();
    uniqueOrigins.forEach((origin) => {
        let indices = returnDestinations(origin, parsedCSV);
        originsStructured.set(origin, createOriginObj(origin, indices, parsedCSV));
        let newOption = document.createElement('option');
        newOption.value = origin;
        newOption.text = origin;
        directFrom.appendChild(newOption);

    });

    directFrom.addEventListener('change', () => setSecondSelector(directFrom.value, originsStructured, directTo));
    
    directTo.addEventListener('change', () => setDirectionsText(directTo.value, directText));
    // What we need to do here is write some functions that
    // 1. Creates a set of origin destination pairs in a data structure - DONE
    // 2. Sets the options in the first dropdown to unique origins - DONE
    // 3. Creates an event listener that listens for a change in the origins dropdown - DONE
    //     then updates the set of options in the destinations dropdown - DONE
    // 4. Creates another event listener that updates the displayed directions based on the above - DONE

});

function uniqueArrayOrigins(data) {
    let originArray = [];
    data.forEach((item) => { originArray.push(item.FROM)});
    return [... new Set(originArray)];
};

function returnDestinations(origin, data){

    let indexArray = [];
    for (let i = 0; i<data.length; i++){
        if (data[i].FROM == origin){
            indexArray.push(i)
        };
    };
    return indexArray;
};

function createOriginObj(origin, indices, data){
    let originObj = new Origin(origin, new Map());
    
    indices.forEach((i) => {
        let indexData = data[i];
        originObj.addDestination(indexData.TO, indexData.DESCRIPTION);
    });

    return originObj;
};

function setSecondSelector(firstSelected, map, destination){
    
    destination.innerHTML = "";
    let originObject = map.get(firstSelected)
    originObject.returnDestinations().forEach((key) => {
        let newOption = document.createElement('option');
        newOption.value = originObject.returnDirections(key);
        newOption.text = key;
        destination.appendChild(newOption);
    });
    setDirectionsText(destination.value, directText)
};

function setDirectionsText(text, directionsElement){
    directionsElement.innerHTML = text;
};

// Everything below this is just for testing html changing
var testDirectionsArray1 = ["point1", "point2", "point3"];
var testDirectionsArray2 = ["point3", "point4", "point5"];



// directFrom.innerHTML = '';


// testDirectionsArray2.forEach( opt => {
//     var newOption = document.createElement('option');
//     newOption.value = opt;
//     newOption.text = opt;
//     directTo.appendChild(newOption);
//     }
// )