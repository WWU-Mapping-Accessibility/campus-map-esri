import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer";
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import esriConfig from'@arcgis/core/config';
import "./style.css";

/* DEFAULTS */
let zoom = 15;
let center = [-122.48614277687422, 48.732800397930795];


/* Places Bookmark Dictionary in form Place : [zoom, lon, lat] */
const places = {
  "AH" : {
    name: 'Arntzen Hall',
    location: [-122.48556385637906,48.73383634321389]},
  "AI" : {
    name: 'Academic Instructional Center',
    location: [-122.48548611151818, 48.733395850845554]},
  "AW" : {
    name: 'Academic Instructional Center (West)',
    location: [-122.48658015134504, 48.73196340056818]},
  "CF" : {
    name: 'Communications Facility',
    location: [-122.48556385637906,48.73383634321389]},
  "AI" : {
    name: 'Academic Instructional Center',
    location: [-122.48548611151818, 48.733395850845554]},
  "AI" : {
    name: 'Academic Instructional Center',
    location: [-122.48548611151818, 48.733395850845554]},
  "AH" : {
    name: 'Arntzen Hall',
    location: [-122.48556385637906,48.73383634321389]},
  "AI" : {
    name: 'Academic Instructional Center',
    location: [-122.48548611151818, 48.733395850845554]},
  "AI" : {
    name: 'Academic Instructional Center',
    location: [-122.48548611151818, 48.733395850845554]},
};

/* Get location from hash */
if (window.location.hash !== ''){
    // try to restore center, zoom-level and rotation from the URL
    const hash = window.location.hash.replace('#wwu=', '');
    const parts = hash.split('&');
    
    // Parse URL Hash
    if (parts.length === 1) {
      // Accesses location's info
      const location = places[parts[0]].location;

      // Checks to see if shorthand identifier is in dictionary
      if (parts[0] in places){
        zoom = 18.5;
        center = [ location[0], location[1] ]
        
      };
    };
};
  



/* Add Layers */
const tileBaseLayer = new VectorTileLayer({
  url: 'https://tiles.arcgis.com/tiles/qboYD3ru0louQq4F/arcgis/rest/services/WWUbasemap/VectorTileServer'
});

const buildingAcc100k = new FeatureLayer({
  url: 'https://services.arcgis.com/qboYD3ru0louQq4F/arcgis/rest/services/Acc_Building_Info_5_100k/FeatureServer',
});

const layers = [tileBaseLayer, buildingAcc100k];
const map = new Map({
  basemap: "streets-vector",
  layers: layers

});

const view = new MapView({
  container: "map",
  map: map,
  zoom: zoom,
  center: center,
  constraints: {
    snapToZoom: false,

  },
  
});

/*  Set location hash */
// const updateURLHash = () => {

//   const center = [view.center.longitude, view.center.latitude];
//   const zoom = view.zoom;

//   // Sets the map hash string
//   const hash = 
//   '#map=' +
//   zoom +
//   '/' +
//   center[0]
//   + 
//   '/' +
//   center[1]

//   const state = {
//     zoom: zoom,
//     center: center,
//   };

//   // pushes the map string onto the history stack (the url)
//   window.history.pushState(state,'map', hash)
// }

// /* Must use this debounce function to limit the number of times the updateURLHash function gets called */
// const debounce = (func, delay) => {
//   let debounceTimer
//   return function() {
//       const context = this
//       const args = arguments
//           clearTimeout(debounceTimer)
//               debounceTimer
//           = setTimeout(() => func.apply(context, args), delay)
//   }
// }

// view.watch('extent', debounce(updateURLHash, 100));





const pointerCoord = document.getElementById('info');

view.on('pointer-move', (evt) => {
  var pt = view.toMap({x: evt.x, y: evt.y});
  
  pointerCoord.innerHTML = pt.latitude + ' ' + pt.longitude
});

view.on('click', (evt) => {
  console.log([view.center.longitude, view.center.latitude])
});