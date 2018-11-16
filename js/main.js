// testing github

var path = d3.geo.path();
//Defaults to albersUsa Projection. You might want to set a different one
var width = 960, height = 600;
//Create the svg to render the polygon inside of
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);
//Bind the geoJSON the path elements in the svg
//Use the enter selection (new elements) and draw the paths using the geo path generator
svg.selectAll("path")
    .data(geoJSON.features)
 .enter().append("path")
    .attr("d",path)
    .attr("fill",#999);
//Note that when you bind new data, you will be changing existing path elements
//So you would also need to do a exit and modify existing paths