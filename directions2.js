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
    directFromSub.innerHTML = '';
    originKeys.forEach((origin) => {
        let newOption = document.createElement('option');
        newOption.text = origin;
        newOption.value = origin;
        directFrom.appendChild(newOption);
    });
    if (originKeys.length === 1) {
        directFrom.dispatchEvent(new Event('change'));
    }
};

// Function to update Sub-Origin Selector (directFromSub)
function updateSubOrigins() {
    let selectedOriginStructure = origins.get(directFrom.value)?.structure;
    if (selectedOriginStructure) {
        let subOrigins = Object.keys(selectedOriginStructure).sort();
        directFromSub.innerHTML = '';
        directTo.innerHTML = '';
        directToSub.innerHTML = '';
        directText.innerHTML = '';
        subOrigins.forEach(subOrigin => {
            let newOption = document.createElement('option');
            newOption.text = subOrigin;
            newOption.value = subOrigin;
            directFromSub.appendChild(newOption);
        });

        directFromSub.dispatchEvent(new Event('change'));
    }
}

// Function to update Destination Selector (directTo)
function updateDestinations() {
    let selectedOriginStructure = origins.get(directFrom.value)?.structure[directFromSub.value];
    if (selectedOriginStructure) {
        let destinations = Object.keys(selectedOriginStructure).sort();
        directTo.innerHTML = '';
        directToSub.innerHTML = '';
        directText.innerHTML = '';
        destinations.forEach(destination => {
            let newOption = document.createElement('option');
            newOption.text = destination;
            newOption.value = destination;
            directTo.appendChild(newOption);
        });
        directTo.dispatchEvent(new Event('change'));
    }
}

// Function to update Sub-Destination Selector (directToSub)
function updateSubDestinations() {
    let selectedDestinationStructure = origins.get(directFrom.value)?.structure[directFromSub.value][directTo.value];
    if (selectedDestinationStructure) {
        let subDestinations = Object.keys(selectedDestinationStructure).sort();
        directToSub.innerHTML = '';
        directText.innerHTML = '';
        subDestinations.forEach(subDestination => {
            let newOption = document.createElement('option');
            newOption.text = subDestination;
            newOption.value = subDestination;
            directToSub.appendChild(newOption);
        });
        directToSub.dispatchEvent(new Event('change'));
    }
}

// Event Handlers for dropdowns with calls to update functions
directFrom.addEventListener('change', updateSubOrigins);
directFromSub.addEventListener('change', updateDestinations);
directTo.addEventListener('change', updateSubDestinations);

// Optional: Event handler for final selection, displaying the path description
directToSub.addEventListener('change', function() {
    let description = origins.get(directFrom.value)?.structure[directFromSub.value][directTo.value][this.value];
    directText.textContent = description || "No description available.";
});


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
                oldOrigin.addAll(data.FROMB, data.TOA, data.TOB, data.DESCRIPTION);
            }
            else{
                // If the origin does not exist, create a new Origin object and add it to the map
                let newOrigin = new Origin(data.FROMA);
                newOrigin.addAll(data.FROMB, data.TOA, data.TOB, data.DESCRIPTION);
                origins.set(currentOrigin, newOrigin);
            }
        }
    );
    setFromSelector(Array.from(origins.keys()).sort());
});
