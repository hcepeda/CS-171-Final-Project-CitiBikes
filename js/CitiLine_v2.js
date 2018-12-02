GeneralLine = function(_parentElement, _data, _column_item){
  this.parentElement = _parentElement;
  this.data = _data;
  this.column_item = _column_item;

  this.initVis()
}

GeneralLine.prototype.initVis = function() {
  this.margin = {left: 50, right: 50, top: 30, bottom: 30};
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
  this.yScale_R = d3.scaleLinear()
    .range([this.height, 0]);

  this.updateVis();
}

GeneralLine.prototype.updateVis = function() {
  this.xScale.domain(d3.extent(this.data, d => d.Date));
  this.yScale.domain([0, d3.max(this.data, d => d[this.column_item])])
  this.yScale_R.domain([0, d3.max(this.data, d => d.num_bikes)]); // d3.extent(this.data, d => d[this.column_item]));

  /*
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
  */
  this.valueline = d3.line()
    .x(d => this.xScale(d.Date))
    .y(d => this.yScale(d[this.column_item]))
    .curve(d3.curveBasis)
  this.valueline_bikes = d3.line()
    .x(d => this.xScale(d.Date))
    .y(d => this.yScale_R(d.num_bikes))
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
  this.line.enter().append("path")
    .classed("line", true)
    .merge(this.line)
    .attr("d", this.valueline_bikes)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-dasharray", function(d){ return this.getTotalLength() })
    .attr("stroke-dashoffset", function(d){ return this.getTotalLength() });

  this.svg.append("text")
    .attr("class", "axis_label")
    .attr("x", (this.width/2))
    .attr("y", this.height+30)
    .style("text-anchor", "middle")
    .text("Date")

  this.svg.append("text")
    .attr("class", "axis_label")
    .attr("transform", 'rotate(-90)')
    .attr("x", -(this.height / 2))
    .attr("y", -35)
    .style("text-anchor", "middle")
    .text("Number of Stations")

  this.svg.append("text")
    .attr("class", "axis_label")
    .attr("transform", 'rotate(90)')
    .attr("x", (this.height / 2))
    .attr("y", -(this.width) - 40)
    .style("text-anchor", "middle")
    .text("Number of Bikes")
  var t = d3.transition()
    .duration(5000)
    .ease(d3.easeLinear);
  /*
  this.svg.append("rect")
    .attr("class", "overlay")
    .attr("width", this.width)
    .attr("height", this.height)
    .on("mouseover", function() { focus.style("display", null); })
    .on("mouseout", function() { focus.style("display", "none"); })
    .on("mousemove", mousemove);

  function mousemove() {
    var x0 = this.xScale.invert(d3.mouse(this)[0]),
      i = bisectDate(this.data, x0, 1),
      d0 = this.data[i - 1],
      d1 = this.data[i],
      d = x0 - d0.Date > d1.Date - x0 ? d1 : d0;
    focus.select('line.x')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 0)
      .attr('y2', this.height - this.yScale(d.TripsToday))
      .style("stroke-width", 2)
      .style("stroke", "steelblue");
    focus.attr("transform", "translate(" + this.xScale(d.Date) + "," + this.yScale(d.TripsToday) +")");
    focus.select("text").text(d.TripsToday);
  }
  */
  this.svg.append("g")
    .attr("transform", "translate(0," + this.height + ")")
    .call(d3.axisBottom(this.xScale));
  this.svg.append("g")
    .call(d3.axisLeft(this.yScale));
  this.svg.append("g")
    .attr("transform", "translate(" + this.width + ",0)")
    .attr("class", "axisRed")
    .call(d3.axisRight(this.yScale_R));

  this.svg.selectAll(".line").transition(t)
    .attr("stroke-dashoffset", 0);
}
