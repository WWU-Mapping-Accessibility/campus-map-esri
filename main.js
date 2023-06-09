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
import Bookmarks from '@arcgis/core/widgets/Bookmarks'
import Bookmark from "@arcgis/core/webmap/Bookmark.js";

import TextSymbol from "@arcgis/core/symbols/TextSymbol.js";
import esriConfig from'@arcgis/core/config';
import "./style.css";

/* DEFAULTS & CONFIGS */
let zoom = 15;
let center = [-122.48614277687422, 48.732800397930795];

const windowHash = window.location.hash.replace('#', '');

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

const genderNeutralRestrooms = new FeatureLayer({
  url: 'https://services.arcgis.com/qboYD3ru0louQq4F/arcgis/rest/services/Gender_Neutral_Restrooms/FeatureServer'
});

const sustainableBuildings = new FeatureLayer({
  url: 'https://services.arcgis.com/qboYD3ru0louQq4F/arcgis/rest/services/Sustainable_Features_Buildings/FeatureServer'
});

const computerLabBuildings = new FeatureLayer({
  url: 'https://services.arcgis.com/qboYD3ru0louQq4F/arcgis/rest/services/Computer_Labs_ATUS_ResTek/FeatureServer'
});

const searchPoints = new FeatureLayer({
  url: 'https://services.arcgis.com/qboYD3ru0louQq4F/arcgis/rest/services/search_pts/FeatureServer',
});

const parkingLots = new FeatureLayer({
  url: 'https://services.arcgis.com/qboYD3ru0louQq4F/arcgis/rest/services/Permit_Parking_Lots_Academic_Year/FeatureServer'
});

const dummyBasemap = new FeatureLayer({
  url: 'https://services.arcgis.com/qboYD3ru0louQq4F/arcgis/rest/services/DummyBasemapForLegend/FeatureServer',
  title: '',
});



const defaultLayers = [dummyBasemap, tileBaseLayer, buildingAccInfo100k, buildingInfo5k, parkingLots, computerLabBuildings, sustainableBuildings, genderNeutralRestrooms];

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
  
  const locUpper = loc.toUpperCase();
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
const legendExpand = new Expand({
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


const buildingBookmarks = new Bookmarks({
  view: view,
  bookmarks: [
// condensed line format, from google spreadsheet formater...
  new Bookmark({name: "Academic Instructional Center", viewpoint: {targetGeometry: {type: "extent",xmin:-122.487316, ymin:48.73133517, xmax:-122.484224, ymax:48.7327802 }  }  }),
  new Bookmark({name: "Academic Instructional West", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4881142, ymin:48.73128564, xmax:-122.4850222, ymax:48.73273067 }  }  }),
  new Bookmark({name: "Admin Services Center", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4752071, ymin:48.73031057, xmax:-122.4721151, ymax:48.73175563 }  }  }),
  new Bookmark({name: "Alma Clark Glass Hall", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4898971, ymin:48.73536805, xmax:-122.486805, ymax:48.73681297 }  }  }),
  new Bookmark({name: "Alumni House", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4842795, ymin:48.74004371, xmax:-122.4811874, ymax:48.74148848 }  }  }),
  new Bookmark({name: "Archives Building (Wa. State)", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4872448, ymin:48.72534432, xmax:-122.4841528, ymax:48.72678952 }  }  }),
  new Bookmark({name: "Arntzen Hall", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4871312, ymin:48.73312002, xmax:-122.4840391, ymax:48.734565 }  }  }),
  new Bookmark({name: "Arts Annex", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4867384, ymin:48.73507307, xmax:-122.4836464, ymax:48.73651799 }  }  }),
  new Bookmark({name: "Biology Bldg.", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4885165, ymin:48.73321226, xmax:-122.4854245, ymax:48.73465723 }  }  }),
  new Bookmark({name: "Birnam Wood (Residences)", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4815013, ymin:48.72974653, xmax:-122.4750125, ymax:48.73263664 }  }  }),
  new Bookmark({name: "Bond Hall", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4874994, ymin:48.73587291, xmax:-122.4844074, ymax:48.73731781 }  }  }),
  new Bookmark({name: "Bookstore (Viking Union)", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4876661, ymin:48.7379062, xmax:-122.4844218, ymax:48.73935104 }  }  }),
  new Bookmark({name: "Buchanan Towers", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4883247, ymin:48.72612309, xmax:-122.4852326, ymax:48.72756826 }  }  }),
  new Bookmark({name: "Campus Services", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4914188, ymin:48.72676146, xmax:-122.4883268, ymax:48.72820662 }  }  }),
  new Bookmark({name: "Canada House", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4895245, ymin:48.73718852, xmax:-122.4864325, ymax:48.73863338 }  }  }),
  new Bookmark({name: "Carver", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4881961, ymin:48.73531926, xmax:-122.4849518, ymax:48.73676417 }  }  }),
  new Bookmark({name: "Chemistry Bldg. (Morse Hall)", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4882102, ymin:48.73397016, xmax:-122.4851181, ymax:48.73541511 }  }  }),
  new Bookmark({name: "College Hall", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4885771, ymin:48.7364015, xmax:-122.4854851, ymax:48.73784639 }  }  }),
  new Bookmark({name: "Commissary", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4860323, ymin:48.72656925, xmax:-122.4829402, ymax:48.72801442 }  }  }),
  new Bookmark({name: "Communications Facility", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4867747, ymin:48.73201848, xmax:-122.4836826, ymax:48.73346349 }  }  }),
  new Bookmark({name: "Edens Hall", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4849894, ymin:48.7383615, xmax:-122.4818973, ymax:48.73980633 }  }  }),
  new Bookmark({name: "Edens Hall North", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4844894, ymin:48.73878604, xmax:-122.4813974, ymax:48.74023085 }  }  }),
  new Bookmark({name: "(Ross) Engineering Technology", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4870793, ymin:48.73396025, xmax:-122.4839873, ymax:48.73540521 }  }  }),
  new Bookmark({name: "Environmental Studies Bldg.", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4870022, ymin:48.73268226, xmax:-122.4839101, ymax:48.73412725 }  }  }),
  new Bookmark({name: "Fairhaven College (Admin Bldg.)", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4874022, ymin:48.72941124, xmax:-122.4841578, ymax:48.73118862 }  }  }),
  new Bookmark({name: "Fairhaven Stacks (Resicences)", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4875288, ymin:48.72849973, xmax:-122.4842844, ymax:48.73027714 }  }  }),
  new Bookmark({name: "Fine Arts Bldg.", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4867446, ymin:48.73471741, xmax:-122.4836526, ymax:48.73616234 }  }  }),
  new Bookmark({name: "Fraser Hall", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4860859, ymin:48.7364015, xmax:-122.4829938, ymax:48.73784639 }  }  }),
  new Bookmark({name: "Haggard Hall", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4878326, ymin:48.73664775, xmax:-122.4847405, ymax:48.73809263 }  }  }),
  new Bookmark({name: "Higginson Hall", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4848864, ymin:48.73909737, xmax:-122.4817944, ymax:48.74054217 }  }  }),
  new Bookmark({name: "High Street Hall", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4896779, ymin:48.7366152, xmax:-122.4865859, ymax:48.73806008 }  }  }),
  new Bookmark({name: "Humanities Bldg.", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4866215, ymin:48.73665526, xmax:-122.4833771, ymax:48.73810014 }  }  }),
  new Bookmark({name: "Interdisciplinary Science Bldg.", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4892311, ymin:48.73290855, xmax:-122.4859866, ymax:48.73435353 }  }  }),
  new Bookmark({name: "LIBRARY", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4874494, ymin:48.73710098, xmax:-122.484205, ymax:48.73854585 }  }  }),
  new Bookmark({name: "Mathes Hall", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4863085, ymin:48.73917928, xmax:-122.4830641, ymax:48.74062408 }  }  }),
  new Bookmark({name: "Miller Hall", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4864115, ymin:48.73571097, xmax:-122.4831671, ymax:48.73715588 }  }  }),
  new Bookmark({name: "Morse Hall Chemistry Bldg.", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4882864, ymin:48.73397016, xmax:-122.4850419, ymax:48.73541511 }  }  }),
  new Bookmark({name: "Nash Hall", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4854304, ymin:48.73946104, xmax:-122.4821859, ymax:48.74090584 }  }  }),
  new Bookmark({name: "OLD MAIN", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4856985, ymin:48.73721523, xmax:-122.4824542, ymax:48.73866009 }  }  }),
  new Bookmark({name: "Parks Hall", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4881978, ymin:48.73278938, xmax:-122.4849534, ymax:48.73423437 }  }  }),
  new Bookmark({name: "Performing Arts Center (PAC)", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4888652, ymin:48.73727847, xmax:-122.4856207, ymax:48.73872333 }  }  }),
  new Bookmark({name: "Physical Plant", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4847951, ymin:48.72388683, xmax:-122.4815507, ymax:48.72533207 }  }  }),
  new Bookmark({name: "Recreation Center", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4907699, ymin:48.73083945, xmax:-122.4875255, ymax:48.73228449 }  }  }),
  new Bookmark({name: "Ridgeway (Residences)", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4928181, ymin:48.73210621, xmax:-122.4863293, ymax:48.73566072 }  }  }),
  new Bookmark({name: "Ross Engineering Technology", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4872144, ymin:48.73393895, xmax:-122.48397, ymax:48.73538391 }  }  }),
  new Bookmark({name: "SMATE (Sci. Math Tech. Ed.)", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4888065, ymin:48.73450081, xmax:-122.4855622, ymax:48.73594575 }  }  }),
  new Bookmark({name: "Steam Plant", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4864913, ymin:48.73425031, xmax:-122.4832469, ymax:48.73569526 }  }  }),
  new Bookmark({name: "Viking Commons", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4868925, ymin:48.73848313, xmax:-122.4836481, ymax:48.73992796 }  }  }),
  new Bookmark({name: "VIKING UNION", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4877315, ymin:48.73798218, xmax:-122.4844871, ymax:48.73942702 }  }  }),
  new Bookmark({name: "Viqueen Lodge (Sinclair Island)", viewpoint: {targetGeometry: {type: "extent",xmin:-122.7009019, ymin:48.61598908, xmax:-122.6906451, ymax:48.6216205 }  }  }),
  new Bookmark({name: "Wilson Library", viewpoint: {targetGeometry: {type: "extent",xmin:-122.4874494, ymin:48.73710098, xmax:-122.484205, ymax:48.73854585 }  }  }),
  ]
});

const bookmarkExpand = new Expand({
  content: buildingBookmarks,
  expandIconClass: 'esri-icon-urban-model',
  group: 'top right'
});



/* Add UI elements */

view.ui.add(locate, 'top-left');
view.ui.add(search, 'top-right');
view.ui.add(legendExpand, 'top-right');
view.ui.add(bookmarkExpand, 'top-right');




/* This part is for extras */
const pointerCoord = document.getElementById('info');

view.on('pointer-move', (evt) => {
  var pt = view.toMap({x: evt.x, y: evt.y});
  
  pointerCoord.innerHTML = pt.latitude + ' ' + pt.longitude;
});

view.on('click', (evt) => {
});