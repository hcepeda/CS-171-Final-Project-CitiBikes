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
var sizescale = d3.scaleLinear().range([.5, 1]);

// var sizescale2 = d3.scaleOrdinal().range("red", "green", "orange", "brown")



NYMap.prototype.wrangleData = function(){
  var vis = this; 

  var unique_locations = [];
  var unique_array = [];
  var unique_route = [];
  var selectbox = d3.select(".selectbox").property("value");
    selectbox = newdateParser(selectbox);
    // console.log(selectbox);

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
  //this.unique_locations = [...new Set(this.data.map(item => item['start station name']))];

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

  // vis.wrangleData();

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
    "Route Lines": vis.yellow,
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


vis.wrangleData();
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
  vis.yellow.clearLayers();
  vis.blue.clearLayers();





  console.log(vis.unique_locations);
  // vis.myroute = L.Routing.control();
  // vis.myroute.clearLayers();
  // vis.mymap.removeControl(vis.myroute);
// var myroute
// var myroute;
// vis.myroute.removeControl();
// myroute = L.Routing.control({
//           waypoints: null});
//   vis.red.removeLayer(myroute);
  // vis.myroute = null;
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
    // vis.stationContent = "<strong>" + d["name"] + "</strong><br/>";

    vis.stationContentend = "<strong>" + d["endname"] + "</strong><br/>";
    vis.stationContentend += "Station ID: " + d["endstationid"] + "<br/>";

    vis.lat = d['latitude'];
    vis.long = d['longitude'];
    vis.title = d["name"],  //value searched
    vis.loc = [vis.long, vis.lat];  //position found
    // vis.endlat = d['end station latitude']
    // vis.endlong = d['end station longitude']
    vis.endname = d['endname']
    vis.count = d["routecount"];
    // console.log(vis.count);


      // start station (red)
        // vis.endMarker = L.marker([d['endlat'], d['endlong']], {title: vis.endname, icon: vis.greenMarker} ).bindPopup(vis.stationContentend);;
        // vis.green.addLayer(vis.endMarker);
        // create marker for each station
        // vis.stationMarker = L.marker([vis.lat, vis.long], { icon: vis.redMarker }).bindPopup(vis.stationContent);
        // vis.stationMarker = L.marker([d['latitude'], d['longitude']], {title: vis.title, icon: vis.redMarker} ).bindPopup(vis.stationContent);;
        //set property searched above 
        // add markers to layer group
        // vis.red.addLayer(vis.stationMarker);



        // vis.dir.route({
        //   locations: [
        //     { latLng: { lat: d['latitude'], lng: d['longitude'] } },
        //     { latLng: { lat: d['endlat'], lng: d['endlong'] } }
        //   ]
        // });

        // vis.mymap.addLayer(MQ.routing.routeLayer({
        //   directions: vis.dir,
        //   fitBounds: true
        // }));
        // console.log(vis.dir);

        // Creating multi polyline options
        // vis.multiPolyLineOptions = {color:'red', weight: 5,};

        // // Creating multi polylines
        // var multipolyline = L.multiPolyline(latlang , multiPolyLineOptions);
        // vis.my.route = null;
        // markers.clearLayers();



    var routingControl = null;
    var addRoutingControl = function () { 
        if (routingControl != null)
            removeRoutingControl();

        routingControl = L.Routing.control({
          waypoints: [
          L.latLng(d['latitude'], d['longitude']),
          L.latLng(d['endlat'], d['endlong'])
          ],
          // createMarker: function() {return vis.red.addLayer(vis.stationMarker);},
          createMarker: function (i, start, n){
                          // var marker_icon = null
                                      // routingControl.spliceWaypoints(0, (n*2))
                            if (i == 0) {
                              // This is the first marker, indicating start
                              vis.stationMarker = L.marker([d['latitude'], d['longitude']], {title: vis.title, icon: vis.redMarker} ).bindPopup(vis.stationContent);
                              vis.red.addLayer(vis.stationMarker);
                              // marker_icon = vis.stationMarker
                            } 
                            else if (i == n -1) {
                              //This is the last marker indicating destination
                              // marker_icon = vis.endMarker
                              vis.endMarker = L.marker([d['endlat'], d['endlong']], {title: vis.endname, icon: vis.greenMarker} ).bindPopup(vis.stationContentend);;
                              vis.green.addLayer(vis.endMarker);
                            }},
          //                   // console.log(start.latLng);
          //                   var marker = L.marker (start.latLng, {
          //                     draggable: false,
          //                     bounceOnAdd: false,
          //                     bounceOnAddOptions: {
          //                     duration: 1000,
          //                     height: 800, 
          //                   function(){
          //                     (bindPopup(vis.stationContent).openOn(vis.mymap))
          //                   }
          //                   },
          //                   icon: marker_icon
          //                   })
          //                   return marker}, 
          show: false,
          fitSelectedRoutes: false,
          // autoRoute: false,
          routeWhileDragging: false,
          useZoomParameter: false,
          showAlternatives: false,
          routeLine: function(route) {
            // console.log(route);

            line = L.polyline(route.coordinates,
            {
            //   multiOptions:
            //   { optionIdxFn: function(latLng) {}
            //   // options: thresholdRoute.colors
            // },
              weight: 4,
              lineCap: 'butt',
              opacity: sizescale(vis.count),
              smoothFactor: 1,
              autoRoute: false,
              color: "red"
              // color: color(vis.count)
            });

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
            // console.log(line);
            vis.yellow.addLayer(line);
            line.options.autoRoute = false;
            return line;}

        }).addTo(vis.mymap);
    }


    var removeRoutingControl = function () {
        if (routingControl != null) {
            vis.mymap.removeControl(routingControl);
            routingControl = null;
        }
    };
    
if (routingControl != null) {
  routingControl.on("routingstart", function(error) {
    alert("uh oh! Please refresh the page :)")
  });};

    removeRoutingControl();
    addRoutingControl();

        // myroute = L.Routing.control({
        //   waypoints: [
        //   L.latLng(d['latitude'], d['longitude']),
        //   L.latLng(d['endlat'], d['endlong'])
        //   ],
        //   // createMarker: function() {return vis.red.addLayer(vis.stationMarker);},
        //   createMarker: function (i, start, n){
        //                   // var marker_icon = null
        //                     if (i == 0) {
        //                       // This is the first marker, indicating start
        //                       vis.stationMarker = L.marker([d['latitude'], d['longitude']], {title: vis.title, icon: vis.redMarker} ).bindPopup(vis.stationContent);
        //                       vis.red.addLayer(vis.stationMarker);
        //                       // marker_icon = vis.stationMarker
        //                     } 
        //                     else if (i == n -1) {
        //                       //This is the last marker indicating destination
        //                       // marker_icon = vis.endMarker
        //                       vis.endMarker = L.marker([d['endlat'], d['endlong']], {title: vis.endname, icon: vis.greenMarker} ).bindPopup(vis.stationContentend);;
        //                       vis.green.addLayer(vis.endMarker);
        //                     }},
        //   //                   // console.log(start.latLng);
        //   //                   var marker = L.marker (start.latLng, {
        //   //                     draggable: false,
        //   //                     bounceOnAdd: false,
        //   //                     bounceOnAddOptions: {
        //   //                     duration: 1000,
        //   //                     height: 800, 
        //   //                   function(){
        //   //                     (bindPopup(vis.stationContent).openOn(vis.mymap))
        //   //                   }
        //   //                   },
        //   //                   icon: marker_icon
        //   //                   })
        //   //                   return marker}, 
        //   show: false,
        //   fitSelectedRoutes: false,
        //   // autoRoute: false,
        //   routeWhileDragging: false,
        //   useZoomParameter: false,
        //   showAlternatives: false,
        //   routeLine: function(route) {
        //     console.log(route);

        //     line = L.polyline(route.coordinates,
        //     {
        //     //   multiOptions:
        //     //   { optionIdxFn: function(latLng) {}
        //     //   // options: thresholdRoute.colors
        //     // },
        //       weight: 4,
        //       lineCap: 'butt',
        //       opacity: sizescale(vis.count),
        //       smoothFactor: 1,
        //       autoRoute: false,
        //       // color: color(vis.count)
        //       color: color(vis.count)
        //     });

        //     // line.on("click", function() {
        //     //   console.log("click");
        //     //   var routingControl = new L.Routing.Control({
        //     //     waypoints: [
        //     //       L.latLng(d['latitude'], d['longitude']),
        //     //       L.latLng(d['endlat'], d['endlong'])
        //     //     ],
        //     //     show: true,
        //     //     createMarker: function() {return false;},
        //     //     routeLine: function() {return line;}
        //     //     }).addTo(vis.mymap);
        //     //     });

        //     line.on('mouseover', function() {
        //       this.setText('  ►  ', {
        //         repeat: true,
        //         attributes: {
        //           fill: 'purple'
        //         }
        //       });
        //     });
        //     line.on('mouseout', function() {
        //       this.setText(null);
        //       routingControl = null;
        //     });
        //     // console.log(line);
        //     vis.yellow.addLayer(line);
        //     line.options.autoRoute = false;
        //     return line;}


        // }).addTo(vis.mymap);
      
      // // end station (green)
      // else if(d['latitude'] === 0) {
      //   // create marker for each station
      //   vis.stationMarker = L.marker([d['latitude'], d['longitude']], { icon: vis.greenMarker }).bindPopup(vis.stationContent);

      //   // add markers to layer group
      //   vis.green.addLayer(vis.stationMarker);
      // }
      // // empty slot (yellow)
      // else if(d['latitude'] === 1) {
      //   // create marker for each station
      //   vis.stationMarker = L.marker([d['latitude'], d['longitude']], { icon: vis.yellowMarker }).bindPopup(vis.stationContent);

      //   // add markers to layer group
      //   vis.yellow.addLayer(vis.stationMarker);
      // }
      // empty slot (blue)
      // else {
      //   // create marker for each station
      //   vis.stationMarker = L.marker([d['latitude'], d['longitude']], { icon: vis.blueMarker }).bindPopup(vis.stationContent);

      //   // add markers to layer group
      //   vis.blue.addLayer(vis.stationMarker);
      // }
      // vis.controlSearch = new L.Control.Search({layer: vis.red, initial: false});
      // vis.mymap.addControl(vis.controlSearch);



    L.Routing.errorControl(routingControl).addTo(vis.mymap);

  vis.controlSearch.on('search:collapsed', function(e) {
      vis.mymap.setView([40.733060, -73.971249], 12);
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
};



NYMap.prototype.onSelectionChange = function(hour) {
    var vis = this;
      // vis.yellow.removeLayer(line);
    vis.datafiltered = vis.data; 
    vis.datafiltered = vis.data.filter(function(d) {
        return d.hour == hour;
    });
    // myroute.autoRoute(false);
    vis.wrangleData();

};

NYMap.prototype.onClick = function() {
    var vis = this;

    // vis.datafiltered = vis.data;
    alert("Dear 🚲 User, " + "In order to avoid slow map loading, the onClick reset feature has been disabled for the map. The map will only change when you select an hour." + 
      " If you wish to see the full map again, please refresh your page");

    // vis.wrangleData();
}

vis.mymap.on("zoomstart", function (event) {
      removeRoutingControl();
      // routingControl = null; 
      console.log("zoooom");
      // routingControl.hide()
      // tipp_marker = L.marker(event.latlng).addTo(map);
    });

    vis.mymap.on("zoomend", function(event, hour) {
      // routingControl.setWaypoints([
      //     L.latLng(d['latitude'], d['longitude']),
      //     L.latLng(d['endlat'], d['endlong'])
      //     ]);
      // addRoutingControl();
            // routingControl.show();
        // greatmap.onSelectionChange(hour);
            var vis = this;
      // vis.yellow.removeLayer(line);
    vis.datafiltered = vis.data; 
    vis.datafiltered = vis.data.filter(function(d) {
        return d.hour == hour;
    });
    // myroute.autoRoute(false);
    console.log("zoooom end");
    vis.wrangleData();
    });


