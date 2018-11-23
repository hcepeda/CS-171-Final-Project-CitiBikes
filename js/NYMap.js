NYMap = function(_parentElement, _data, _mapPosition, _geojsondata){
  this.parentElement = _parentElement;
  this.data = _data;
  this.mapPosition = _mapPosition;
  this.geo = _geojsondata;

  this.initVis();
}

NYMap.prototype.wrangleData = function(){
  var vis = this; 


  var unique_locations = [];
  var unique_array = [];

  vis.data.forEach(function(d){
    if (!(unique_array.includes(d['start station name']))){
      unique_array.push(d['start station name']);
      var new_obj = {"name": d['start station name'],
              "latitude": d['start station latitude'],
              "longitude": d['start station longitude'],
              "stationid": d['start station id']};

      unique_locations.push(new_obj);
    }
  });

  vis.unique_locations = unique_locations;
  //this.unique_locations = [...new Set(this.data.map(item => item['start station name']))];
}

NYMap.prototype.initVis = function() {
  var vis = this;
    console.log(vis.geo);
  // If the images are in the directory "/img":
  L.Icon.Default.imagePath = "img/";

  vis.wrangleData();

  // set up dual layers 
  vis.google = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoicGF5YWxhIiwiYSI6ImNqb25ibjQwYjB0OWkzcW81aDk1dTQ1NnAifQ.efDqfmRxK8A4OkuxaDR6jw', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'your.mapbox.access.token'
  });

  vis.grayscale = L.tileLayer('https://korona.geog.uni-heidelberg.de/tiles/roadsg/x={x}&y={y}&z={z}', {
  maxZoom: 19,
  attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });

  // set up leaflet map
  vis.mymap = L.map('mapid', {layers: [vis.google]}).setView(vis.mapPosition, 13);

  // add empty layer groups for makers and map objects
  vis.red = L.layerGroup().addTo(vis.mymap);
  vis.blue = L.layerGroup().addTo(vis.mymap);
  vis.yellow = L.layerGroup().addTo(vis.mymap);
  vis.green = L.layerGroup().addTo(vis.mymap);
  vis.subway = L.geoJSON().addTo(vis.mymap);

  // base layers and overlays objects
  vis.baseMaps = {
    "Detailed": vis.google,
    "Grayscale": vis.grayscale
  };

  vis.overlayMaps = {
    "Starting Station": vis.red,
    "Ending Station": vis.green,
    "Subway Lines": vis.subway, 
    "Empty Slot": vis.yellow,
    "Empty Slot 2": vis.blue
  }

  L.control.layers(vis.baseMaps, vis.overlayMaps).addTo(vis.mymap);

 
// add the search bar to the map
  vis.controlSearch = new L.Control.Search({
    position:'topleft',    // search bar location
    layer: vis.red,  // name of the layer
    initial: false,
    zoom: 16,        // set zoom to found location when searched
    marker: false,
    textPlaceholder: 'search...' // placeholder while nothing is searched
  });
 
  vis.mymap.addControl(vis.controlSearch); // add it to the map





  // draw geojson objects on map
  // L.geoJson(vis.geo).addTo(vis.mymap);
  //   weight: 7,
  //   opacity: 0.9
  //   // style: function(geo) {
  //   //   var line = geo.properties.name;
  //   //     return {
  //   //       color: line
  //   //     }
  //   // }
  // }).addTo(vis.mymap);


  vis.subway.addData(vis.geo);


  // vis.yellow.addLayer(vis.subway);

  // initialize dynamic markers
  // define an icon class with general options
  var stationIcon = L.Icon.extend({
    options: {
      shadowUrl: "img/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [0, -28]
    }
  });

  // use the class to create individual icons 
  vis.redMarker = new stationIcon({ iconUrl:  "img/marker-red.png" });
  vis.blueMarker = new stationIcon({ iconUrl:  "img/marker-blue.png" });
  vis.yellowMarker = new stationIcon({ iconUrl:  "img/marker-yellow.png" });
  vis.greenMarker = new stationIcon({ iconUrl:  "img/marker-green.png" });



  vis.updateVis();

}

NYMap.prototype.updateVis = function() {
  var vis = this;

  /*
  vis.data.forEach(function(d){
    var circle = L.circle([d['start station latitude'], d['start station longitude']], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 50
      }).addTo(vis.mymap);
    circle.bindPopup(d["start station name"]);
  })
  */

  // clear the layer groups
  vis.red.clearLayers();
  vis.green.clearLayers();
  // vis.yellow.clearLayers();
  vis.blue.clearLayers();

  vis.unique_locations.forEach(function(d){
    // var circle = L.circle([d['latitude'], d['longitude']], {
    //     color: 'red',
    //     fillColor: '#f03',
    //     fillOpacity: 0.5,
    //     radius: 25
    //   }).addTo(vis.mymap);
    // circle.bindPopup(d["name"]);

    // create popup content for each station
    vis.stationContent = "<strong>" + d["name"] + "</strong><br/>";
    vis.stationContent += "Station ID: " + d["stationid"] + "<br/>";

    vis.lat = d['latitude'];
    vis.long = d['longitude'];
    vis.title = d["name"],  //value searched
    vis.loc = [vis.long, vis.lat];  //position found


      // start station (red)
      if(vis.long) {
        // create marker for each station
        // vis.stationMarker = L.marker([vis.lat, vis.long], { icon: vis.redMarker }).bindPopup(vis.stationContent);
        vis.stationMarker = L.marker([d['latitude'], d['longitude']], {title: vis.title, icon: vis.redMarker} ).bindPopup(vis.stationContent);;
        //set property searched above 
        // add markers to layer group
        vis.red.addLayer(vis.stationMarker);
      }
      // end station (green)
      else if(d['latitude'] === 0) {
        // create marker for each station
        vis.stationMarker = L.marker([d['latitude'], d['longitude']], { icon: vis.greenMarker }).bindPopup(vis.stationContent);

        // add markers to layer group
        vis.green.addLayer(vis.stationMarker);
      }
      // empty slot (yellow)
      else if(d['latitude'] === 1) {
        // create marker for each station
        vis.stationMarker = L.marker([d['latitude'], d['longitude']], { icon: vis.yellowMarker }).bindPopup(vis.stationContent);

        // add markers to layer group
        vis.yellow.addLayer(vis.stationMarker);
      }
      // empty slot (blue)
      else {
        // create marker for each station
        vis.stationMarker = L.marker([d['latitude'], d['longitude']], { icon: vis.blueMarker }).bindPopup(vis.stationContent);

        // add markers to layer group
        vis.blue.addLayer(vis.stationMarker);
      }
      // vis.controlSearch = new L.Control.Search({layer: vis.red, initial: false});
      // vis.mymap.addControl(vis.controlSearch);

  vis.controlSearch.on('search:collapsed', function(e) {
      vis.mymap.setView([40.733060, -73.971249], 13);
  })
  
  });

  /*
  vis.data.forEach(function(d){
    L.Routing.control({
      waypoints: [
        L.latLng(d['start station latitude'], d['start station longitude']),
        L.latLng(d['end station latitude'], d['end station longitude'])
      ]
    }).addTo(vis.mymap);
  });
  */
}
