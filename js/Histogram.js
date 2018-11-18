

Histogram = function(_parentElement, _data){
  this.parentElement = _parentElement;
  this.data = _data;
  this.displayData = _data;

  this.initVis()
}

/*
Histogram.prototype.wrangleData = function() {
  var vis = this;

  vis.count
}
*/
Histogram.prototype.initVis = function() {
  var vis = this;

  vis.margin = {top: 30, left: 30, bottom: 30, right: 30};
  vis.width = document.getElementById(vis.parentElement).offsetWidth - vis.margin.left - vis.margin.right;
  vis.height = 250 - this.margin.top - vis.margin.bottom;

  vis.svg = d3.select("#" + vis.parentElement).append("svg")
    .attr("width", vis.width + vis.margin.left + vis.margin.right)
    .attr("height", vis.height + vis.margin.bottom + vis.margin.top)
    .append("g")
    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

  console.log(d3.timeMinute(vis.data[0].starttime));
  vis.xScale = d3.scaleTime()
    .domain(d3.extent(vis.data, d => d.starttime))
    //.domain([0, 1440])
    .range([0, vis.width]);

  vis.yScale = d3.scaleLinear()
    .range([vis.height, 0]);

  vis.updateVis();

}

Histogram.prototype.updateVis = function(){
  var vis = this;

  var histogram = d3.histogram()
    .value(d => d.starttime)
    .domain(vis.xScale.domain())
    .thresholds(this.xScale.ticks(d3.timeMinute));

  var bins = histogram(vis.data);

  var rect = vis.svg.selectAll(".histo")
    .data(bins);

  rect.enter().append("rect")
    .attr("class", "histo")
    .attr("x", 1)
    .attr("transform", d => "translate(" + vis.xScale(d.x0) + "," + vis.yScale(d.length) + ")")
    .attr("width", d => vis.xScale(d.x1) - vis.xScale(d.x0) - 1)
    .attr("height", d => vis.height - vis.yScale(d.length));

  vis.svg.append("g")
      .attr("transform", "translate(0," + vis.height + ")")
      .call(d3.axisBottom(vis.xScale))

  vis.svg.append("g")
      .call(d3.axisLeft(vis.yScale))

}
