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