CitiLineGraph = function(_parentElement, _data){
  this.parentElement = _parentElement;
  this.data = _data;

  this.initVis()
}

CitiLineGraph.prototype.initVis = function() {
  this.margin = {left: 50, right: 30, top: 30, bottom: 30};
  this.width = $("#" + this.parentElement).width() - this.margin.left - this.margin.right;
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
  var vis = this;
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
  /*
  this.valueline_stations = d3.line()
    .x(d => this.xScale(d.Date))
    .y(d => this.yScale(d.num_bikes))
    .curve(d3.curveBasis)
  */
  this.line = this.svg.selectAll(".line")
    .data([this.data])
  this.line.enter().append("path")
    .classed("line", true)
    .merge(this.line)
    .attr("d", this.valueline)
    .attr("fill", "none")
    .attr("stroke", "#3fa3de")
    .attr("stroke-dasharray", function(d){ return this.getTotalLength() })
    .attr("stroke-dashoffset", function(d){ return this.getTotalLength() });

  this.svg.append("text")
    .attr("class", "axis_label")
    .attr("x", this.width)
    .attr("y", this.height - 5)
    .style("text-anchor", "end")
    .text("Date")

  this.svg.append("text")
    .attr("class", "axis_label")
    .attr("transform", 'rotate(-90)')
    .attr("x", 0)
    .attr("y", 15)
    .style("text-anchor", "end")
    .text("Number of Trips Taken (Daily)")

  var t = d3.transition()
    .duration(5000)
    .ease(d3.easeLinear);
  vis.svg.append("rect")
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .attr("width", vis.width)
    .attr("height", vis.height)
    .on("mouseover", function() { focus.style("display", null); })
    .on("mouseout", function() { focus.style("display", "none"); })
    .on("mousemove", mousemove);

  var focus = vis.svg.append("g")
    .attr("class", "focus")
    .style("display", "none");
  focus.append("circle")
    .attr("r", 4.5)
    .attr("class", "dot");
  focus.append('line')
    .classed('x', true);
  focus.append("text")
    .data(vis.data)
    .attr("x", 0)
    .attr("font-size", 14)
    .attr("text-anchor", "middle")
    .attr("y", -15);
  var bisectDate = d3.bisector(function (d) {return d.Date}).left;
  function mousemove() {
     var x0 = vis.xScale.invert(d3.mouse(this)[0]),
         i = bisectDate(vis.data, x0, 1),
         d0 = vis.data[i - 1],
         d1 = vis.data[i],
         d = x0 - d0.Date > d1.Date - x0 ? d1 : d0;
     focus.select('line.x')
         .attr('x1', 0)
         .attr('x2', 0)
         .attr('y1', 0)
         .attr('y2', vis.height - vis.yScale(d.TripsAveraged))
         .style("stroke-width", 2)
         .style("stroke", "steelblue");
     focus.attr("transform", "translate(" + vis.xScale(d.Date) + "," + vis.yScale(d.TripsAveraged) +")");
     focus.select("text").html("Trips: " + Math.round(d.TripsAveraged));
  }
  this.svg.append("g")
    .attr("transform", "translate(0," + this.height + ")")
    .call(d3.axisBottom(this.xScale));
  this.svg.append("g")
    .call(d3.axisLeft(this.yScale));

  this.svg.selectAll(".line").transition(t)
    .attr("stroke-dashoffset", 0);
}
