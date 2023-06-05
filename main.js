import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer";
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Locate from '@arcgis/core/widgets/Locate';
import Graphic from '@arcgis/core/Graphic';
import Legend from '@arcgis/core/widgets/Legend';
import Expand from '@arcgis/core/widgets/Expand';
import esriConfig from'@arcgis/core/config';
import "./style.css";

/* DEFAULTS & CONFIGS */
let zoom = 15;
let center = [-122.48614277687422, 48.732800397930795];

// Format: "ABV": [Lon, Lat]
const customPlaces = {

}

/* Set location from hash function*/
const getLocationFromHash = function(places) {
  // try to restore center, zoom-level and rotation from the URL
  const hash = window.location.hash.replace('#wwu=', '');
  const parts = hash.split('&');
  // Parse URL Hash
  if (parts.length === 1) {
    const ident = parts[0]
    if (parts[0] in Object.assign({},places,customPlaces)){
      return({
        zoom: 18.5,
        center: [places[ident][0], places[ident][1]]
      });
    };
  };
};


/* Queries the building info layer and places every location into the places dictionary*/
const getPlaces = function(buildings){
  // Creates a new Promise that will resolve with dictionary
  return new Promise((resolve, reject) => {
    buildings.queryFeatures().then(result => {
      // Reduces query to just the abv and coordinates
      const featuresProc = (result.features).reduce((acc, feature) => {
        acc[feature.attributes.abv] = [feature.geometry.longitude,feature.geometry.latitude];
        return acc;
          }, {});
            resolve(featuresProc);
      }).catch(error => {reject(error);})
    }
  );
};

// Calls the getPlaces, getLocation functions to set the center based on the map
const setLocationFromHash = function(view){
  if (window.location.hash !== ''){
    try{
      // This will execute async to the map loading, so it may take a sec to snap to the new location.
      // Query speed dependent
      getPlaces(buildingInfo5k).then(result => 
        getLocationFromHash(result)).then(result => 
          view.goTo(result));
    } catch(error) {
      console.error(error);
    };
  };
};



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

const dummyBasemap = new FeatureLayer({
  url: 'https://services.arcgis.com/qboYD3ru0louQq4F/arcgis/rest/services/DummyBasemapForLegend/FeatureServer',
  title: '',
});

/* Layers to Add */
const layers = [dummyBasemap, tileBaseLayer, buildingAccInfo100k, buildingInfo5k];

/* Creates the Map and View */
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
    minZoom: 15,
  },
});


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


/* Only triggers the setLocation function once the view is ready -- otherwise view may reset the center to defaults */
view.watch('ready', () => setLocationFromHash(view));

view.ui.add(locate, 'top-left');
view.ui.add(expand, 'top-right');



/* This part is for extras */
const pointerCoord = document.getElementById('info');

view.on('pointer-move', (evt) => {
  var pt = view.toMap({x: evt.x, y: evt.y});
  
  pointerCoord.innerHTML = pt.latitude + ' ' + pt.longitude;
});

view.on('click', (evt) => {
});