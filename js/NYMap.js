NYMap = function(_parentElement, _data){
  this.parentElement = _parentElement
  this.data = _data

  this.initVis()
}

NYMap.prototype.initVis = function() {
  var vis = this;

  vis.mymap = L.map('mapid').setView([40.733060, -73.971249], 13);

  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoicGF5YWxhIiwiYSI6ImNqb25ibjQwYjB0OWkzcW81aDk1dTQ1NnAifQ.efDqfmRxK8A4OkuxaDR6jw', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'your.mapbox.access.token'
  }).addTo(vis.mymap);

  vis.updateVis();

}

NYMap.prototype.updateVis = function() {
  var vis = this;

  vis.data.forEach(function(d){
    var circle = L.circle([d['start station latitude'], d['start station longitude']], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 50
      }).addTo(vis.mymap);
    circle.bindPopup(d["start station name"]);
  })

}
