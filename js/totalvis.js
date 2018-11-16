
TotalVis = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];

    this.initVis();
};

/* INITIALIZE VISUALIZATION */
TotalVis.prototype.initVis = function() {
    var vis = this;

    vis.margin = { top: 20, right: 20, bottom: 20, left: 20 };

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 300 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Scales and axes
    vis.x = d3.scaleTime()
        .range([0, vis.width]);

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    // Set domains
    var minMaxY = [0, d3.max(vis.data.map(function(d) {
        return d.value;
    }))];
    vis.y.domain(minMaxY);

    var minMaxX = d3.extent(vis.data.map(function(d) {
        return d.key;
    }));
    vis.x.domain(minMaxX);

    console.log(minMaxX);

    // Append path for area function
    vis.path = vis.svg.append("path")
        .attr("class", "area area-time");

    // Define the D3 path generator
    vis.area = d3.area()
        .curve(d3.curveStep)
        .x(function(d) {
            return vis.x(d.key);
        })
        .y0(vis.height)
        .y1(function(d) {
            return vis.y(d.value);
        });


    // Filter, aggregate, modify data
    vis.wrangleData();

};

TotalVis.prototype.wrangleData = function() {
    var vis = this;

    vis.displayData = vis.data;

    // Update visualization
    vis.updateVis();
};

TotalVis.prototype.updateVis = function() {
    var vis = this;

    // Create area chart
    vis.path
        .datum(vis.displayData)
        .attr("d", vis.area);

    // Append axes to chart
    vis.svg.select(".x-axis")
        .call(vis.xAxis);
};