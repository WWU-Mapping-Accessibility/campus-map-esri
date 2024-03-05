// Import PapaParse for CSV file parsing
import * as Papa from "papaparse";

const directFrom = document.getElementById('directfrom');
const directFromSub = document.getElementById('directfromsub');
const directTo = document.getElementById('directto');
const directToSub = document.getElementById('directtosub');
const directText = document.getElementById('directionstext');

var origins = new Map(); // Initialize a map to hold Origin objects, keyed by their names

// Class definition for Origin, which represents a starting point in a directional graph
class Origin {
    // Constructor initializes the Origin object with a name and an empty structure for holding nested destination information
    constructor(originName){
        this.name = originName; // The name of the origin
        this.structure = {} // Object to hold the nested destination hierarchy
    };

    // Method to add a complete path (sub-origin, destination, sub-destination) and its description to the structure
    addAll(subOrigin, destination, subDestination, description){
        
        const path = [subOrigin, destination, subDestination]; // Array representing the path from sub-origin to sub-destination

        // Initialize the starting point for navigating/constructing the structure
        let currentLevel = this.structure;

        // Iterate through the path array, excluding the last element (since it's handled as the description)
        for (let i = 0; i < path.length - 1; i++) {
            // If the current segment in the path does not exist or is not an object, initialize it as an object
            if (typeof currentLevel[path[i]] !== 'object') {
                currentLevel[path[i]] = {};
            }
            // Move down one level in the structure to continue building the path
            currentLevel = currentLevel[path[i]];
        };

        // Set the description for the final segment in the path
        currentLevel[path[path.length - 1]] = description;
    }

};

// Asynchronously fetches CSV data from a file
async function fetchCSV() {
    const response = await fetch("./directions.csv"); // Fetch CSV file
    const data = await response.text(); // Convert response to text
    return data; // Return CSV data as text
};

// Parses the CSV data using PapaParse and returns the parsed object
function readCSV(data) {
    const records = Papa.parse(data, { header: true }); // Parse CSV with headers
    return records; // Return parsed CSV data
};

function setFromSelector(originKeys) {
    originKeys.forEach((origin) => {
        let newOption = document.createElement('option');
        newOption.text = origin;
        newOption.value = origin;
        directFrom.appendChild(newOption);
        }
    );

};

function setFromSubSelector(origin, directFromSub) {
    Object.keys(origins.get(origin).structure).forEach((subOrigin) =>{
        let newOption = document.createElement('option');
        newOption.text = subOrigin;
        newOption.value = subOrigin;
        directFromSub.appendChild(newOption);
        }
    );

};


function setDestSelector(origin, subOrigin, directTo) {
    Object.keys((origins.get(origin).structure)[subOrigin]).forEach((dest) =>{
        let newOption = document.createElement('option');
        newOption.text = dest;
        newOption.value = dest;
        directTo.appendChild(newOption);
        }
    );

};
function setSubDestSelector(origin, subOrigin, dest, directToSub) {
    Object.keys((origins.get(origin).structure)[subOrigin][dest]).forEach((destSub) =>{
        let newOption = document.createElement('option');
        newOption.text = destSub;
        newOption.value = destSub;
        directToSub.appendChild(newOption);
        }
    );

};


// Fetch CSV data, then process it
fetchCSV().then((csvData) => {
    // Parse the fetched CSV data into JSON objects
    const parsedCSV = readCSV(csvData).data;

    // Iterate over each record in the parsed CSV data
    parsedCSV.forEach((data) => {
            let currentOrigin = data.FROMA; // Extract the origin name from the current record

            // Check if the origin already exists in the map
            if(origins.has(currentOrigin)){
                var oldOrigin = origins.get(currentOrigin); // Retrieve the existing Origin object
                // Add the new path and description to the existing Origin object
                oldOrigin.addAll(data.FROMB, data.TOA, data.TOB, data.description);
            }
            else{
                // If the origin does not exist, create a new Origin object and add it to the map
                let newOrigin = new Origin(data.FROMA);
                newOrigin.addAll(data.FROMB, data.TOA, data.TOB, data.description);
                origins.set(currentOrigin, newOrigin);
            }
        }
    );
    setFromSelector(Array.from(origins.keys()).sort());
    setFromSubSelector(directFrom.value, directFromSub)
    setDestSelector(directFrom.value, directFromSub.value, directTo)
    setSubDestSelector(directFrom.value, directFromSub.value, directTo.value, directToSub)
    directText.innerHTML = directFrom.value[directFromSub.value][directTo.value][directToSub.value]
});

// Event Handlers for dropdowns:
directFrom.addEventListener('change', () => setFromSubSelector(directFrom.value, directFromSub));
directFromSub.addEventListener('change', () => setDestSelector(directFrom.value, directFromSub.value, directTo));
directTo.addEventListener('change', () => setSubDestSelector(directFrom.value, directFromSub.value, directTo.value, directToSub));
directToSub.addEventListener('change', () => directText.innerHTML = directFrom.value[directFromSub.value][directTo.value][directToSub.value])

