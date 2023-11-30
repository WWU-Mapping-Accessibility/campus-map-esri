import * as Papa from "papaparse";

// Async function that will return the promise of a read CSV file put in the public directory
// Fetch is used to look for and load the file
async function fetchCSV() {
    const response = await fetch("./directions.csv");
    const data = await response.text();
    return data;
};

// This will parse read CSV data into a JS object of arrays array
function readCSV(data) {
    const records = Papa.parse(data);
    return records;
};


// Everything is going to have to be put in this `then` block bc it has to run AFTER the CSV data is parsed
fetchCSV().then((csvData) => {
    const parsedCSV = readCSV(csvData);
    console.log(parsedCSV);
})



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