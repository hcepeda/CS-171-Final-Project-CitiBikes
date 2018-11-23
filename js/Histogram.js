

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
  vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
  vis.height = 250 - this.margin.top - vis.margin.bottom;

  vis.svg = d3.select("#" + vis.parentElement).append("svg")
    .attr("width", vis.width + vis.margin.left + vis.margin.right)
    .attr("height", vis.height + vis.margin.bottom + vis.margin.top)
    .append("g")
    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

  console.log(d3.timeMinute(vis.data[0].starttime));

  /*
  vis.xScale = d3.scaleTime()
    .domain(d3.extent(vis.data, d => d.starttime))
    //.domain([0, 1440])
    .range([0, vis.width]);
  */

  vis.xScale = d3.scaleLinear()
    // .domain(d3.extent(vis.data, d => d.tripduration))
    // .domain([0, 4000])
    .range([0, vis.width]);

  vis.yScale = d3.scaleLinear()
    .range([vis.height, 0]);

  vis.xAxis = d3.axisBottom()
      .scale(vis.xScale);

  vis.yAxis = d3.axisLeft()
      .scale(vis.yScale);

  vis.svg.append("g")
      .attr("transform", "translate(0," + vis.height + ")")
      .attr("class", "x-axis");

  vis.svg.append("g")
      .attr("class", "y-axis");

  vis.wrangleData();
};

Histogram.prototype.wrangleData = function() {
  var vis = this;

    var selectbox = d3.select(".selectbox").property("value");
    selectbox = newdateParser(selectbox);
    console.log(selectbox);

    vis.nestedData = d3.nest()
        .key(function(d) {
            return d.date;
        })
        .rollup(function(leaves) {
            return {
                data: leaves
            }
        })
        .entries(vis.data);

    vis.nestedData.sort(function(a, b) {
        return new Date (a.key) - new Date(b.key);
    });

    vis.nestedData.forEach(function(d) {
        d.key = new Date(d.key);

        if (+selectbox == +d.key) {
            vis.displayData = d;
        }
    });
    console.log(vis.displayData);

  vis.updateVis();
};

Histogram.prototype.updateVis = function(){
  var vis = this;

    vis.xScale.domain([0, d3.max(vis.displayData.value.data, d => d.tripduration) + 1]);


  var histogram = d3.histogram()
    .value(d => d.tripduration)
    .domain(vis.xScale.domain())
    .thresholds(vis.xScale.ticks(10));
  /*
  var histogram = d3.histogram()
    .value(d => d.starttime)
    .domain(vis.xScale.domain())
    .thresholds(this.xScale.ticks(d3.timeMinute));
    */
  var bins = histogram(vis.displayData.value.data);
    vis.yScale.domain([0, d3.max(bins, d => d.length)]);



  var rect = vis.svg.selectAll(".histo")
    .data(bins);

  rect.exit().remove();

  rect.enter().append("rect")
      .merge(rect)
      .transition()
      .attr("class", "histo")
      .attr("x", 1)
      .attr("transform", d => "translate(" + vis.xScale(d.x0) + "," + vis.yScale(d.length) + ")")
      .attr("width", d => vis.xScale(d.x1) - vis.xScale(d.x0) - 1)
      .attr("height", d => vis.height - vis.yScale(d.length))
      .style("fill", "steelblue");


  vis.svg.select(".x-axis").transition().call(vis.xAxis);
    vis.svg.select(".y-axis").transition().call(vis.yAxis);
};
