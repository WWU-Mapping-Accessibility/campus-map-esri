import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer";

import "./style.css";

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
  zoom: 15,
  center: [-122.48614277687422, 48.732800397930795],
  constraints: {
    snapToZoom: false,
  },
  
});

const pointerCoord = document.getElementById('info');

view.on('pointer-move', (evt) => {
  var pt = view.toMap({x: evt.x, y: evt.y});
  
  pointerCoord.innerHTML = pt.latitude + ' ' + pt.longitude
});

view.on('click', (evt) => {
  console.log(pointerCoord.innerHTML)
});