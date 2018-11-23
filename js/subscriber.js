SubChart = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];

    this.initVis();
};

/* INITIALIZE VISUALIZATION */
SubChart.prototype.initVis = function() {
    var vis = this;
    // console.log(vis.data);

    vis.margin = { top: 20, right: 20, bottom: 20, left: 20 };

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 250 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Scales and axes
    vis.x = d3.scaleBand()
        .rangeRound([0, vis.width])
        .paddingInner(0.1)
        .paddingOuter(0.1)
        .domain(["Subscriber", "Customer"]);

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x)
        .tickSize(0);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    // Create tooltip
    vis.tooltip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function(d) {
            return "Total: " + d.number;
        });

    vis.svg.call(vis.tooltip);

    // Filter, aggregate, modify data
    vis.wrangleData();

};

SubChart.prototype.wrangleData = function() {
    var vis = this;
    var newdateParser = d3.timeParse("%m %d %Y");

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

    // count people of each gender
    var subcount = [];
    var customer = {
        type: "Customer",
        number: 0
    };
    var subscriber = {
        type: "Subscriber",
        number: 0
    };
    subcount.push(customer, subscriber);

    vis.displayData.value.data.forEach(function(d) {
       if (d.usertype == "Customer") {
            subcount[0].number++;
       }
       else if (d.usertype == "Subscriber") {
           subcount[1].number++;
       }
    });

    console.log(subcount);

    vis.displayData = subcount;

    // Update visualization
    vis.updateVis();
};

SubChart.prototype.updateVis = function() {
    var vis = this;

    // Update domains
    vis.y.domain([0, d3.max(vis.displayData, function(d) {return d.number;})]);

    var bars = vis.svg.selectAll(".detailbar")
        .data(vis.displayData);

    bars.enter().append("rect")
        .attr("class", "detailbar")
        .on("mouseover", vis.tooltip.show)
        .on("mouseout", vis.tooltip.hide)
        .merge(bars)
        .transition()
        .attr("width", vis.x.bandwidth())
        .attr("height", function (d) {
            return vis.height - vis.y(d.number);
        })
        .attr("x", function (d) {
            return vis.x(d.type);
        })
        .attr("y", function (d) {
            return vis.y(d.number);
        });

    bars.exit().remove();

    // Append axes to chart and adjust labels
    vis.svg.select(".x-axis")
        .call(vis.xAxis)
        .selectAll("text");

    vis.svg.select(".y-axis")
        .call(vis.yAxis);

};
