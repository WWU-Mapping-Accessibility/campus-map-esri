import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer";
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Locate from '@arcgis/core/widgets/Locate';
import Graphic from '@arcgis/core/Graphic';
import esriConfig from'@arcgis/core/config';
import "./style.css";

/* DEFAULTS */
let zoom = 15;
let center = [-122.48614277687422, 48.732800397930795];



/* Set location from hash function*/
const setLocationFromHash = function(extPlaces, view) {
  // try to restore center, zoom-level and rotation from the URL
  const hash = window.location.hash.replace('#wwu=', '');
  const parts = hash.split('&');
  // Parse URL Hash
  const places = extPlaces;
  if (parts.length === 1) {
    const ident = parts[0]
    if (parts[0] in places){
      view.goTo({
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
      const featuresProc = (result.features).reduce((acc, feature) => {
        acc[feature.attributes.abv] = [feature.geometry.longitude,feature.geometry.latitude];
        return acc;
          }, {});
            resolve(featuresProc);
      }).catch(error => {reject(error);})
    }
  );
};




/* Add Layers */
const tileBaseLayer = new VectorTileLayer({
  url: 'https://tiles.arcgis.com/tiles/qboYD3ru0louQq4F/arcgis/rest/services/WWUbasemap/VectorTileServer'
});

const buildingInfo100k = new FeatureLayer({
  url: 'https://services.arcgis.com/qboYD3ru0louQq4F/arcgis/rest/services/Acc_Building_Info_5_100k/FeatureServer',
});

const buildingInfo5k = new FeatureLayer({
  url: 'https://services.arcgis.com/qboYD3ru0louQq4F/arcgis/rest/services/Building_Info__5k/FeatureServer/2'
})




const layers = [tileBaseLayer, buildingInfo100k, buildingInfo5k];
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

const locate = new Locate({
  view: view,
  graphic: new Graphic({
    symbol: {type: 'simple-marker'}
  })
})

view.ui.add(locate, 'top-right');
if (window.location.hash !== ''){
  try{
    getPlaces(buildingInfo5k).then(result => 
      {setLocationFromHash(result, view); 
        console.log(result);})
  } catch(error) {
    console.error(error);
  };
};



const pointerCoord = document.getElementById('info');

view.on('pointer-move', (evt) => {
  var pt = view.toMap({x: evt.x, y: evt.y});
  
  pointerCoord.innerHTML = pt.latitude + ' ' + pt.longitude
});

view.on('click', (evt) => {
  console.log()
});