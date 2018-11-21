CitiLineGraph = function(_parentElement, _data){
  this.parentElement = _parentElement;
  this.data = _data;

  this.initVis()
}

CitiLineGraph.prototype.initVis = function() {
  this.margin = {left: 50, right: 30, top: 30, bottom: 30};
  this.width = 960 - this.margin.left - this.margin.right;
  this.height = 500 - this.margin.top - this.margin.bottom;

  this.svg = d3.select("#" + this.parentElement).append("svg")
    .attr("width", this.width + this.margin.left + this.margin.right)
    .attr("height", this.height + this.margin.top + this.margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + this.margin.left + "," + this.margin.top + ")");

  this.xScale = d3.scaleTime()
    .range([0, this.width]);
  this.yScale = d3.scaleLinear()
    .range([this.height, 0]);

  this.updateVis();
}

CitiLineGraph.prototype.updateVis = function() {
  this.xScale.domain(d3.extent(this.data, d => d.Date));
  this.yScale.domain(d3.extent(this.data, d => d.TripsToday));

  movingAvg = function (data, neighbors) {
  return data.map((val, idx, arr) => {
    let start = Math.max(0, idx - neighbors), end = idx + neighbors
    let subset = arr.slice(start, end + 1)
    let sum = subset.reduce((a,b) => a + b)
    return sum / subset.length
    })
  }

  var moving_arr = [];
  this.data.forEach(function(d){
    moving_arr.push(d.TripsToday)
  });
  moving_arr = movingAvg(moving_arr, 10);

  this.data.forEach(function (d,i){
    d.TripsAveraged = moving_arr[i]
  });

  this.valueline = d3.line()
    //.interpolate("cartesian")
    .x(d => this.xScale(d.Date))
    .y(d => this.yScale(d.TripsAveraged))
    .curve(d3.curveBasis)

  this.line = this.svg.selectAll(".line")
    .data([this.data])
  this.line.enter().append("path")
    .classed("line", true)
    .merge(this.line)
    .attr("d", this.valueline)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-dasharray", function(d){ return this.getTotalLength() })
    .attr("stroke-dashoffset", function(d){ return this.getTotalLength() });
  var t = d3.transition()
    .duration(5000)
    .ease(d3.easeLinear);
  /*
  this.svg.append("path")
    .data(this.data)
    .attr("class", "line")
    .attr("d", this.valueline(this.data))
    .attr("stroke", "steelblue")
    //.attr("fill", "none")
    .attr("stroke-dasharray", function(d){ return this.getTotalLength() })
    .attr("stroke-dashoffset", function(d){ return this.getTotalLength() })
  */
  this.svg.append("g")
    .attr("transform", "translate(0," + this.height + ")")
    .call(d3.axisBottom(this.xScale));
  this.svg.append("g")
    .call(d3.axisLeft(this.yScale));

  this.svg.selectAll(".line").transition(t)
    .attr("stroke-dashoffset", 0);
}
