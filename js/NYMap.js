NYMap = function(_parentElement, _data, _mapPosition, _geojsondata){
  this.parentElement = _parentElement;
  this.data = _data;
  this.mapPosition = _mapPosition;
  this.geo = _geojsondata;
  this.displayData = _data;
  this.datafiltered = _data;

  this.initVis();
}




// set up color scale 
var color = d3.scaleQuantize()
              .range(["rgb(186,228,179)",
               "rgb(116,196,118)", "rgb(49,163,84)", "rgb(0,109,44)"]);
var sizescale = d3.scaleLinear().range([.25, 1]);

// var sizescale2 = d3.scaleOrdinal().range("red", "green", "orange", "brown")


// var spin = new Spinner({color: "#fff", lines: 12}).spin("mapid");
NYMap.prototype.wrangleData = function(){
  var vis = this; 

  var unique_locations = [];
  var unique_array = [];
  var unique_route = [];
  var selectbox = d3.select(".selectbox").property("value");
    selectbox = newdateParser(selectbox);


    vis.nestedData = d3.nest()
        .key(function(d) {
            return d.date;
        })
        .rollup(function(leaves) {
            return {
                data: leaves
            }
        })
        .entries(vis.datafiltered);

    vis.nestedData.sort(function(a, b) {
        return new Date (a.key) - new Date(b.key);
    });

    vis.nestedData.forEach(function(d) {
        d.key = new Date(d.key);

        if (+selectbox == +d.key) {
            vis.displayData = d;
        }
    });
    // console.log(vis.displayData);

  function countInArray(array, what) {
    var count = 0;
    for (var i = 0; i < array.length; i++) {
        if (array[i] === what) {
            count++;
        }
    }
    return count;
  }

vis.displayData.value.data.forEach(function(d){
        unique_route.push(d['start station name'] + " to " + d['end station name']);
        });
      // console.log(unique_route);

  vis.displayData.value.data.forEach(function(d){
    if (!(unique_array.includes(d['start station name'] + " to " + d['end station name']))){
      unique_array.push(d['start station name'] + " to " + d['end station name']);
      
      

      var new_obj = {"name": d['start station name'],
              "latitude": d['start station latitude'],
              "longitude": d['start station longitude'],
              "stationid": d['start station id'],
              "endlat": d['end station latitude'],
              "endlong": d['end station longitude'],
              "endname": d['end station name'],
              "endstationid": d["end station id"],
              "route": (d['start station name'] + "to " + d['end station name']),
              "routecount": countInArray(unique_route, d['start station name'] + " to " + d['end station name'])}

      unique_locations.push(new_obj);
      // console.log(unique_locations);
    }
  });


  vis.unique_locations = unique_locations;
  // console.log(vis.unique_locations);

  

    vis.decending = vis.unique_locations.sort(function(a, b) {
        return b.routecount - a.routecount;
    });

  console.log(vis.decending);

console.log(vis.unique_locations);
var size1 = 10;
var size2 = 25;
vis.top10 = vis.decending.slice(0, size1);
vis.top25 = vis.decending.slice(0, size2);

console.log(vis.top25);
console.log(vis.top10);



  // set color domain
  color.domain([
      d3.min(vis.unique_locations, function(d) { return d["routecount"]; }),
      d3.max(vis.unique_locations, function(d) { return d["routecount"]; })
  ]);

// console.log(d3.min(vis.unique_locations, function(d) { return d["routecount"]; }));
// console.log(d3.max(vis.unique_locations, function(d) { return d["routecount"]; }));

  sizescale.domain([
      d3.min(vis.unique_locations, function(d) { return d["routecount"]; }),
      d3.max(vis.unique_locations, function(d) { return d["routecount"]; })
  ]);
  // sizescale.domain([1,3]);

  vis.updateVis();
}





NYMap.prototype.initVis = function() {
  var vis = this;

  // console.log(vis.geo);

  // If the images are in the directory "/img":
  L.Icon.Default.imagePath = "img/";

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
  vis.mymap = L.map('mapid', {layers: [vis.google]}).setView(vis.mapPosition, 12);
  vis.dir = MQ.routing.directions();
  // vis.mymap.spin(true);
  // add empty layer groups for makers and map objects
  vis.begin = L.layerGroup().addTo(vis.mymap);
  vis.blue = L.layerGroup().addTo(vis.mymap);
  vis.yellow = L.layerGroup().addTo(vis.mymap);
  vis.end = L.layerGroup().addTo(vis.mymap);
  vis.subway = L.geoJSON().addTo(vis.mymap);

  // base layers and overlays objects
  vis.baseMaps = {
    "Detailed": vis.google,
    "Grayscale": vis.grayscale
  };

  vis.overlayMaps = {
    "Starting Station": vis.begin,
    "Ending Station": vis.end,
    "Station Repeat": vis.blue,
    "Top 10": vis.subway, 
    "Route Lines": vis.yellow
  }

  L.control.layers(vis.baseMaps, vis.overlayMaps).addTo(vis.mymap);

 
// add the search bar to the map, search by starting or ending station (i.e. all stations)
  vis.controlSearch = new L.Control.Search({
    position:'topleft',    // search bar location
    layer: L.featureGroup([vis.begin, vis.end]),  // name of the layer
    initial: false,
    zoom: 16,        // set zoom to found location when searched
    marker: false,
    textPlaceholder: 'search...' // placeholder while nothing is searched
  });
 
  vis.mymap.addControl(vis.controlSearch); // add it to the map

  // draw geojson objects on map
  // vis.subway.addData(vis.geo);

  // initialize dynamic markers
  // define an icon class with general options
  var stationIcon = L.Icon.extend({
    options: {
      shadowUrl: "img/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [6, -21]
    }
  });

  // use the class to create individual icons 
  vis.startingstation = new stationIcon({ iconUrl:  "img/marker-red.png" });
  vis.blueMarker = new stationIcon({ iconUrl:  "img/marker-blue.png" });
  vis.repeat = new stationIcon({ iconUrl:  "img/marker-yellow.png" });
  vis.endingstation = new stationIcon({ iconUrl:  "img/marker-green.png" });

// wrangle and update
vis.wrangleData();
vis.updateVis();

}

NYMap.prototype.updateVis = function() {
  var vis = this;

  // clear the layer groups
  vis.begin.clearLayers();
  vis.end.clearLayers();
  vis.yellow.clearLayers();
  vis.blue.clearLayers();

  var zoom = vis.mymap.getZoom();
  var show;

  if(0 < zoom < 13) {
    show = vis.top10;
  }
  else if (15 >= zoom >= 13) {
    show = vis.top25;
  }
  else {
    show = vis.unique_locations;
  }



  // loop through locations and make markers and routes
  // console.log(vis.unique_locations);
  // vis.unique_locations.forEach(function(d){
    // var circle = L.circle([d['latitude'], d['longitude']], {
    //     color: 'red',
    //     fillColor: '#f03',
    //     fillOpacity: 0.5,
    //     radius: 25
    //   }).addTo(vis.mymap);
    // circle.bindPopup(d["name"]);
  show.forEach(function(d){
    // create popup content for each station
    vis.stationContent = "<strong>" + d["name"] + "</strong><br/>";
    vis.stationContent += "Station ID: " + d["stationid"] + "<br/>";

    vis.stationContentend = "<strong>" + d["endname"] + "</strong><br/>";
    vis.stationContentend += "Station ID: " + d["endstationid"] + "<br/>";
    vis.lineContent = "This route was traveled " + vis.count + " time(s)";

    // create easily accesible variables 
    vis.lat = d['latitude'];
    vis.long = d['longitude'];
    vis.title = d["name"];  //value searched
    vis.loc = [vis.long, vis.lat];  //position found
    vis.endname = d['endname'];
    vis.count = d["routecount"];
    // vis.endlat = d['end station latitude']
    // vis.endlong = d['end station longitude']
    // console.log(vis.count);


    var routingControl = null;
    var addRoutingControl = function () { 
        if (routingControl != null)
            removeRoutingControl();

        routingControl = L.Routing.control({
          waypoints: [
          L.latLng(d['latitude'], d['longitude']),
          L.latLng(d['endlat'], d['endlong'])
          ],
          createMarker: function (i, start, n){
                if (vis.title == vis.endname) {
                    vis.stationMarker = L.marker([d['latitude'], d['longitude']], {title: vis.title, icon: vis.repeat} ).bindPopup(vis.stationContent);
                              vis.blue.addLayer(vis.stationMarker);
                }
                else {
                            if (i == 0) {
                              // This is the first marker, indicating start
                              vis.stationMarker = L.marker([d['latitude'], d['longitude']], {title: vis.title, icon: vis.startingstation} ).bindPopup(vis.stationContent);
                              vis.begin.addLayer(vis.stationMarker);
                            } 
                            else if (i == n -1) {
                              //This is the last marker indicating destination
                              vis.endMarker = L.marker([d['endlat'], d['endlong']], {title: vis.endname, icon: vis.endingstation} ).bindPopup(vis.stationContentend);
                              vis.end.addLayer(vis.endMarker);
                            }}},

          show: false,
          fitSelectedRoutes: false,
          routeWhileDragging: false,
          useZoomParameter: false,
          showAlternatives: false,
          routeLine: function(route) {
            // console.log(route);

            line = L.polyline(route.coordinates,
            {
              weight: 4,
              lineCap: 'butt',
              opacity: sizescale(vis.count),
              smoothFactor: 1,
              autoRoute: false,
              color: "red"
              // color: color(vis.count)
            }).bindPopup(vis.lineContent);

            // line.on("click", function() {
            //   console.log("click");
            //   var routingControl = new L.Routing.Control({
            //     waypoints: [
            //       L.latLng(d['latitude'], d['longitude']),
            //       L.latLng(d['endlat'], d['endlong'])
            //     ],
            //     show: true,
            //     createMarker: function() {return false;},
            //     routeLine: function() {return line;}
            //     }).addTo(vis.mymap);
            //     });

            line.on('mouseover', function() {
              this.setText('  🚲 ► 🚲  ', {
                repeat: true,
                attributes: {
                  fill: 'purple'
                }
              });
            });
            line.on('mouseout', function() {
              this.setText(null);
              routingControl = null;
            });

            // line.on('click', function() {
            //     console.log("line clicked");
            //     line.bindPopup(vis.lineContent);
            // });
            // console.log(line);
            vis.yellow.addLayer(line);
            line.options.autoRoute = false;
            return line;}

        })
        // .on('routingstart', showSpinner)
        // .on('routesfound routingerror', hideSpinner)
        .addTo(vis.mymap);}


    var removeRoutingControl = function () {
        if (routingControl != null) {
            vis.mymap.removeControl(routingControl);
            routingControl = null;
        }
    };

      // if (routingControl != null) {
      //   routingControl.on("routingstart", function(error) {
      //   alert("uh oh! Please refresh the page :)")
      // });};

    removeRoutingControl();
    addRoutingControl();


  // make sure markers are positioned correctly
  // vis.mymap.on('popupopen', function(e) {
  //     var px = vis.mymap.project(e.popup._latlng); // find the pixel location on the map where the popup anchor is
  //     px.y -= e.popup._container.clientHeight/2 // find the height of the popup container, divide by 2, subtract from the Y axis of marker location
  //     vis.mymap.panTo(vis.mymap.unproject(px),{animate: true}); // pan to new center
  // });

  // L.Routing.errorControl(routingControl).addTo(vis.mymap);
  vis.mymap.on("zoomstart", function (event) {
    removeRoutingControl();
    console.log("zoooom");
  });

  vis.mymap.on("zoomend", function(event, hour) {
  //   var vis = this;
    console.log(vis.data);
    console.log(vis.datafiltered);
    vis.datafiltered = vis.data; 
    console.log(vis.datafiltered);
    vis.datafiltered = vis.data.filter(function(d) {
        return d.hour == hour;
    });
    console.log("zoooom end");
    console.log(vis.datafiltered);
    console.log(zoom);
    vis.wrangleData();

  // });

// vis.wrangleData();
  console.log("zoom ended");
});
  vis.controlSearch.on('search:collapsed', function(e) {
      vis.mymap.setView([40.733060, -73.971249], 12);
  });
  });
};



NYMap.prototype.onSelectionChange = function(hour) {
    var vis = this;
    console.log(vis.data);
    vis.datafiltered = vis.data; 
    vis.datafiltered = vis.data.filter(function(d) {
        return d.hour == hour;
    });
    console.log(vis.datafiltered);
    // myroute.autoRoute(false);
    vis.wrangleData();
};

NYMap.prototype.onClick = function() {
    var vis = this;
    var alerted = localStorage.getItem('alerted') || '';
    if (alerted != 'yes') {
    alert("Dear 🚲 User, " + "In order to avoid slow map loading, the onClick reset feature has been disabled for the map. The map will only change when you select an hour." + 
      " If you wish to see the full map again, please use the reset button");
     localStorage.setItem('alerted','yes');
    };
}
  // var vis = this;
  // make sure that the old routes don't come back on zoom


NYMap.prototype.reset = function() {
  var vis = this;
  vis.datafiltered = vis.data;
  vis.wrangleData();
};


