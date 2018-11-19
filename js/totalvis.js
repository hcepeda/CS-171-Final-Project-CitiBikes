
TotalVis = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];

    this.initVis();
};

/* INITIALIZE VISUALIZATION */
TotalVis.prototype.initVis = function() {
    var vis = this;
    console.log(vis.data);

    vis.margin = { top: 20, right: 70, bottom: 20, left: 70 };

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 150 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Scales and axes
    vis.x = d3.scaleBand()
        .rangeRound([0, vis.width])
        .paddingInner(0.2)
        .domain(d3.range(0,24));

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    // Filter, aggregate, modify data
    vis.wrangleData();

};

TotalVis.prototype.wrangleData = function() {
    var vis = this;
    var hourFormatter = d3.timeFormat("%H");

    // create hours property and initialize array to 0
    vis.data.value.hours = d3.range(0, 24).map(function() {
        return 0;
    })

    for (var i=0; i < vis.data.value.data.length; i++) {
        var hour = +hourFormatter(vis.data.value.data[i].starttime);
        vis.data.value.hours[hour] ++;
    }

    console.log(vis.data);

    vis.displayData = vis.data.value.hours;

    // Update visualization
    vis.updateVis();
};

TotalVis.prototype.updateVis = function() {
    var vis = this;

    // Update domains
    vis.y.domain([0, d3.max(vis.displayData)]);

    var bars = vis.svg.selectAll(".bar")
        .data(vis.displayData);

    bars.enter().append("rect")
        .attr("class", "bar")
        .merge(bars)
        .transition()
        .attr("width", vis.x.bandwidth())
        .attr("height", function(d) {
            return vis.height - vis.y(d);
        })
        .attr("x", function(d, i) {
            return vis.x(i);
        })
        .attr("y", function(d) {
            return vis.y(d);
        });

    bars.exit().remove();

    // Append axes to chart
    vis.svg.select(".x-axis")
        .call(vis.xAxis);
};