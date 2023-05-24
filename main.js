import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer";

import "./style.css";

//// DEFAULTS

let zoom = 15;
let center = [-122.48614277687422, 48.732800397930795];


/// Get location from hash

if (window.location.hash !== ''){
    // try to restore center, zoom-level and rotation from the URL
    const hash = window.location.hash.replace('#map=', '');
    const parts = hash.split('/');
    if (parts.length === 3) {
      zoom = parseFloat(parts[0]);
      center = [parseFloat(parts[1]), parseFloat(parts[2])];
    }
}
  




const tileBaseLayer = new VectorTileLayer({
  url: 'https://tiles.arcgis.com/tiles/qboYD3ru0louQq4F/arcgis/rest/services/WWUbasemap/VectorTileServer'
})

const map = new Map({
  basemap: "streets-vector",
  layers: tileBaseLayer

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


/// Set location hash

const updateURLHash = function(){
  const center = view.get(center);
  const hash = 
  '#map=' +
  view.get(zoom) +
  '/' +
  center[0]
  + 
  '/' +
  center[1]

  return hash;
}




const pointerCoord = document.getElementById('info');

view.on('pointer-move', (evt) => {
  var pt = view.toMap({x: evt.x, y: evt.y});
  
  pointerCoord.innerHTML = pt.latitude + ' ' + pt.longitude
});

view.on('click', (evt) => {
  console.log()
});