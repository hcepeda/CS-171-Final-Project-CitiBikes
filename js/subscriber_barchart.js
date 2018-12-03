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
  /*
  this.timeline_bottom = this.svg.append("g")
      .attr("class", "overview")
      .attr("transform", "translate(" + this.timelineBrush.left + "," + this.timelineBrush.top +")")
      */
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

  vis.svg.append("text")
    .attr("class", "label_hover")
    .attr("x", vis.margin.left + 10)
    .attr("y", vis.margin.top);
    vis.svg.append("text")
      .attr("class", "label_hover_2")
      .attr("x", vis.margin.left + 10)
      .attr("y", vis.margin.top + 15);

  this.updateVis();
}

SubscriberBar.prototype.updateVis = function() {
  var vis = this;
  formatDate = d3.timeFormat("%b-%Y")
  /*
  this.brush = d3.brushX()
    .extent([[0,0], [this.width, this.heightTimeline]])
    .on("brush end", brushed);*/
  this.colors = d3.scaleOrdinal()
    .domain(d3.keys(this.data[0]))
    .range(["#CC0000","#FF7F50", "#082D6A"]);
  //var parseDate = d3.timeFormat("%m/%d/%Y");
  //var display_format = d3.timeFormat("%d-%b-%Y");

  vis.yScale.domain([0, d3.max(this.data, d => d.total)]);
  /*
  vis.brushOverview.domain(vis.xScale.domain())
  vis.brushYScale.domain(vis.yScale.domain())
  */
  this.main_chart.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + this.height + ")")
    .call(this.xAxis);
  this.main_chart.append("g")
    .attr("class", "y axis")
    .call(this.yAxis);
  /*
  this.timeline_bottom.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + this.heightTimeline + ")")
    .call(this.timexAxis);
    */
  this.main_chart.append("g")
    .attr("class", "bars")
    .selectAll(".bar.stack")
    .data(this.data)
    .enter()
    .append("g")
    .attr("class", "bar stack")
    .attr("transform", d => "translate(" + (this.xScale(d.Date) + 5) + ",0)")
    .on("mouseover", function(d){
      vis.svg.select(".label_hover_2").text("Date: " + formatDate(d.Date))
    })
    .selectAll("rect")
    .data(d => d.counts)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("width", (vis.width / 65))
    .attr("y", d => this.yScale(d.y1))
    .attr("height", d => (vis.yScale(d.y0) - vis.yScale(d.y1)))
    .style("fill", d => this.colors(d.name))
    .on("mouseover", function(d){
      if (d.name === "OneDay"){
        vis.svg.select(".label_hover").text("One Day Passes Sold: " + (d.y1 - d.y0))
      }
      else if (d.name === "ThreeSeven"){
        vis.svg.select(".label_hover").text("Three or Seven Day Passes Sold: " + (d.y1 - d.y0))
      }
      else{
        vis.svg.select(".label_hover").text(d.name + ": " + (d.y1 - d.y0))
      }
    });
    /*
  this.timeline_bottom.append("g")
    .attr("class", "bars")
    .selectAll(".bar")
    .data(this.data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return vis.brushOverview(d.Date); })
    .attr("width", 6)
    .attr("y", function(d) { return vis.brushYScale(d.total); })
    .attr("height", function(d) { return vis.heightTimeline - vis.brushYScale(d.total); });
  this.timeline_bottom.append("g")
    .attr("class", "x brush")
    .call(vis.brush)
    .selectAll("rect")
    .attr("y", -6)
    .attr("height", vis.heightTimeline + 7);
  var focus = this.svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");
  var zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [vis.width, vis.height]])
    .extent([[0, 0], [vis.width, vis.height]])
    .on("zoom", zoomed);
  vis.svg.append("rect")
    .attr("class", "zoom")
    .attr("width", vis.width)
    .attr("height", vis.height)
    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
    .call(zoom);
    /*
  focus.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(vis.xAxis);

  focus.append("g")
      .attr("class", "axis axis--y")
      .call(vis.yAxis);

  function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || vis.brushOverview.range();
    vis.xScale.domain(s.map(vis.brushOverview.invert, vis.brushOverview));
    focus.select(".bar")
      .attr("y", d => this.yScale(d.y1))
      .attr("height", d => (vis.yScale(d.y0) - vis.yScale(d.y1)));
    focus.select(".axis--x").call(vis.xAxis);
    vis.svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
        .scale(vis.width / (s[1] - s[0]))
        .translate(-s[0], 0));
  }

  function zoomed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    var t = d3.event.transform;
    vis.xScale.domain(t.rescaleX(vis.brushOverview).domain());
    focus.select(".bar")
      .attr("y", d => this.yScale(d.y1))
      .attr("height", d => (vis.yScale(d.y0) - vis.yScale(d.y1)));
    focus.select(".axis--x").call(vis.xAxis);
    vis.timeline_bottom.select(".brush").call(vis.brush.move, vis.xScale.range().map(t.invertX, t));
  }
  */
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
