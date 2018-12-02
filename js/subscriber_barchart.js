SubscriberBar = function(_parentElement, _data){
  this.parentElement = _parentElement;
  this.data = _data;

  this.wrangleData()
}

SubscriberBar.prototype.initVis = function() {
  var vis = this;
  this.margin = {left: 50, right: 30, top: 50, bottom: 100};
  this.width = $("#" + this.parentElement).width() - this.margin.left - this.margin.right;
  this.height = 500 - this.margin.top - this.margin.bottom;
  this.timelineBrush = { top: 430, right: this.margin.right, bottom: 20,  left: this.margin.left }
  this.heightTimeline = 500 - this.timelineBrush.top - this.timelineBrush.bottom,
  this.padding = 50

  this.svg = d3.select("#" + this.parentElement).append("svg")
    .attr("width", this.width + this.margin.left + this.margin.right)
    .attr("height", this.height + this.margin.top + this.margin.bottom);
  this.main_chart = this.svg.append("g")
      .attr("transform",
            "translate(" + this.margin.left + "," + this.margin.top + ")");
  this.timeline_bottom = this.svg.append("g")
      .attr("class", "overview")
      .attr("transform", "translate(" + this.timelineBrush.left + "," + this.timelineBrush.top +")")

  this.xScale = d3.scaleTime()
    .range([0, this.width])
    .domain([new Date(2013,12,1), new Date(2018, 9, 1)]);
  this.yScale = d3.scaleLinear()
    .range([this.height, 0]);
  this.brushOverview = d3.scaleTime()
    .range([0, this.width]);
  this.brushYScale = d3.scaleLinear()
    .range([this.heightTimeline, 0]);
  this.brushXScale = d3.scaleTime()
    .domain([new Date(2013, 12, 1), new Date(2018, 9, 1)])
    .range([0,57])

  this.xAxis = d3.axisBottom(this.xScale)
  this.yAxis = d3.axisLeft(this.yScale)
  this.timexAxis = d3.axisBottom(this.brushOverview)

  this.updateVis();
}

SubscriberBar.prototype.updateVis = function() {
  console.log(this.data)
  var vis = this;
  this.brush = d3.brushX()
    .extent([[0,0], [this.width, this.heightTimeline]])
    .on("brush end", brushed);
  this.colors = d3.scaleOrdinal()
    .domain(d3.keys(this.data[0]))
    .range(["#CC0000","#333", "#082D6A"]);
  //var parseDate = d3.timeFormat("%m/%d/%Y");
  //var display_format = d3.timeFormat("%d-%b-%Y");

  vis.yScale.domain([0, d3.max(this.data, d => d.total)]);
  vis.brushOverview.domain(vis.xScale.domain())
  vis.brushYScale.domain(vis.yScale.domain())

  this.main_chart.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + this.height + ")")
    .call(this.xAxis);
  this.main_chart.append("g")
    .attr("class", "y axis")
    //.attr("transform", "translate(0," + this.height")")
    .call(this.yAxis);
  this.timeline_bottom.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + this.heightTimeline + ")")
    .call(this.timexAxis);

  this.main_chart.append("g")
    .attr("class", "bars")
    .selectAll(".bar.stack")
    .data(this.data)
    .enter()
    .append("g")
    .attr("class", "bar stack")
    .attr("transform", d => "translate(" + (this.xScale(d.Date) + 5) + ",0)")
    .selectAll("rect")
    .data(d => d.counts)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("width", (vis.width / 65))
    .attr("y", d => this.yScale(d.y1))
    .attr("height", d => (vis.yScale(d.y0) - vis.yScale(d.y1)))
    .style("fill", d => this.colors(d.name));
  this.timeline_bottom.append("g")
    .attr("class", "bars")
    .selectAll(".bar")
    .data(this.data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return vis.brushOverview(d.Date) - 3; })
    .attr("width", 6)
    .attr("y", function(d) { return vis.brushYScale(d.total); })
    .attr("height", function(d) { return vis.heightTimeline - vis.brushYScale(d.total); });
  this.timeline_bottom.append("g")
    .attr("class", "x brush")
    .call(brush)
    .selectAll("rect")
    .attr("y", -6)
    .attr("height", vis.heightTimeline + 7);

  function brushed() {
    // update the main chart's x axis data range
    vis.xScale.domain(brush.empty() ? vis.brushOverview.domain() : brush.extent());
    // redraw the bars on the main chart
    main.selectAll(".bar.stack")
            .attr("transform", function(d) { return "translate(" + vis.xScale(d.Date) + ",0)"; })
    // redraw the x axis of the main chart
    main.select(".x.axis").call(vis.xAxis);
  }
}

SubscriberBar.prototype.wrangleData = function() {
  this.data.forEach(function(d){
    var y0 = 0;
    d.counts = ['Annual Members', "OneDay", "ThreeSeven"].map(function(name){
      return {name: name,
      y0: y0,
      y1: y0 += +d[name]};
    });
    d.total = d.counts[d.counts.length - 1].y1;
  })
  this.initVis();

}
