import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer";
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Graphic from '@arcgis/core/Graphic';
/* Import Widgets */
import Legend from '@arcgis/core/widgets/Legend';
import Expand from '@arcgis/core/widgets/Expand';
import Locate from '@arcgis/core/widgets/Locate';
import Search from '@arcgis/core/widgets/Search'
import esriConfig from'@arcgis/core/config';
import "./style.css";

/* DEFAULTS & CONFIGS */
let zoom = 15;
let center = [-122.48614277687422, 48.732800397930795];

const windowHash = window.location.hash.replace('#', '').toLowerCase();

/* Create Layers */
const tileBaseLayer = new VectorTileLayer({
  url: 'https://tiles.arcgis.com/tiles/qboYD3ru0louQq4F/arcgis/rest/services/WWUbasemap/VectorTileServer',
});

const buildingAccInfo100k = new FeatureLayer({
  url: 'https://services.arcgis.com/qboYD3ru0louQq4F/arcgis/rest/services/Acc_Building_Info_5_100k/FeatureServer',
});

const buildingInfo5k = new FeatureLayer({
  url: 'https://services.arcgis.com/qboYD3ru0louQq4F/arcgis/rest/services/Building_Info__5k/FeatureServer/2',
});

const searchPoints = new FeatureLayer({
  url: 'https://services.arcgis.com/qboYD3ru0louQq4F/arcgis/rest/services/search_pts/FeatureServer',
});


const dummyBasemap = new FeatureLayer({
  url: 'https://services.arcgis.com/qboYD3ru0louQq4F/arcgis/rest/services/DummyBasemapForLegend/FeatureServer',
  title: '',
});

const defaultLayers = [dummyBasemap, tileBaseLayer, buildingAccInfo100k, buildingInfo5k];

// Format: "ABV": [Lon, Lat]
const customPlaces = {

}

/* Processes the hash and runs the correct functions based on hash length */

const hashActions = function(hash=windowHash) {

  const hashSplit = hash.split('&');

  hashSplit.forEach(param => {
    if (param.includes('wwu=')){
      view.watch('ready', () => setLocationFromHash(view, param.replace('wwu=', '')))
    };

    if (param.includes('layers=')){
      const enabledLayersString = param.replace('layers=','').split('/');
      map.removeAll();
      // eval will use strings as variables
      map.addMany(enabledLayersString.map(i => eval(i)));
    };
  });

};

/* Gets the location definined in the hash*/
const getLocationFromHash = function(places, loc) {
 
  if (loc in Object.assign({}, places, customPlaces)){
    return({
      zoom: 18.5,
      center: [places[loc][0], places[loc][1]]
    });
  };
};

/* Queries the search info layer and places every location into the places dictionary*/
const getPlaces = function(layer){
  // Creates a new Promise that will resolve with dictionary
  return new Promise((resolve, reject) => {
    layer.queryFeatures().then(result => {
      // Reduces query to just the abv and coordinates
      const featuresProc = (result.features).reduce((acc, feature) => {
        acc[feature.attributes.Abv] = [feature.geometry.longitude,feature.geometry.latitude];
        return acc;
          }, {});
            resolve(featuresProc);
      }).catch(error => {reject(error);})
    }
  );
};

// Uses the getPlaces, getLocation functions to set the center based on the map
const setLocationFromHash = function(view, loc){
  if (window.location.hash !== ''){
    try{
      // This will execute async to the map loading, so it may take a sec to snap to the new location.
      // Query speed dependent
      getPlaces(searchPoints).then(result => 
        getLocationFromHash(result, loc)).then(result => 
          view.goTo(result));
    } catch(error) {
      console.error(error);
    };
  };
};


/* Creates the Map and View */
const map = new Map({
  basemap: "streets-vector",
  layers: defaultLayers,

});

const view = new MapView({
  container: "map",
  map: map,
  zoom: zoom,
  center: center,
  constraints: {
    snapToZoom: false,
    minZoom: 15,
  },
});

hashActions();

/* Widgets!! */

/* Locate widget using a simple marker as the symbol (Prob change) */
const locate = new Locate({
  view: view,
  graphic: new Graphic({
    symbol: {type: 'simple-marker'}
  }),
  container: locateWidget
});

/* Legend Widget */
const legend = new Legend({
  view: view,
  basemapLegendVisible: true,
});


/* Expand Widget */
const expand = new Expand({
  content: legend,
});

const search = new Search({
  view: view,
  locationEnabled: false,
  includeDefaultSources: false,
  sources: [{
    layer: searchPoints,
    searchFields: ['Name', 'Abv', 
      'Keyword1','Keyword2', 'Keyword3', 'Keyword4', 'Keyword5',
      'Keyword6', 'Keyword7', 'Keyword8',],
    name: 'WWU Search Points',
    zoomScale: 1000
  }]
});



view.ui.add(locate, 'top-left');
view.ui.add(search, 'top-right');
view.ui.add(expand, 'top-right');



/* This part is for extras */
const pointerCoord = document.getElementById('info');

view.on('pointer-move', (evt) => {
  var pt = view.toMap({x: evt.x, y: evt.y});
  
  pointerCoord.innerHTML = pt.latitude + ' ' + pt.longitude;
});

view.on('click', (evt) => {
});