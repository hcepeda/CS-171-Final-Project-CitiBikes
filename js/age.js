AgeChart = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];

    this.initVis();
};

/* INITIALIZE VISUALIZATION */
AgeChart.prototype.initVis = function() {
    var vis = this;
    // console.log(vis.data);

    vis.margin = { top: 20, right: 0, bottom: 20, left: 20 };

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
        .domain(d3.range(0, 9));

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x)
        .tickSizeOuter(0);

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
        .offset([-8, 0]);
        // .html(function(d, i) {
        //     return "Time: " + i + ":00 - " + i + ":59" +
        //         "<br>Total Rides: " + d;
        // });

    vis.svg.call(vis.tooltip);

    // Filter, aggregate, modify data
    vis.wrangleData();

};

AgeChart.prototype.wrangleData = function() {
    var vis = this;
    var hourFormatter = d3.timeFormat("%H");
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

    // create hours property and initialize array to 0
    var ages = d3.range(0, 9).map(function() {
        return 0;
    });

    for (var i=0; i < vis.displayData.value.data.length; i++) {
        var age = 2018 - vis.displayData.value.data[i]["birth year"];
        if (age < 10) {
            ages[0]++;
        }
        else if (age >= 10 && age < 20) {
            ages[1]++;
        }
        else if (age >= 20 && age < 30) {
            ages[2]++;
        }
        else if (age >= 30 && age < 40) {
            ages[3]++;
        }
        else if (age >= 40 && age < 50) {
            ages[4]++;
        }
        else if (age >= 50 && age < 60) {
            ages[5]++;
        }
        else if (age >= 60 && age < 70) {
            ages[6]++;
        }
        else if (age >= 70 && age < 80) {
            ages[7]++;
        }
        else {
            ages[8]++;
        }
    }

    vis.displayData = ages;

    // Update visualization
    vis.updateVis();
};

AgeChart.prototype.updateVis = function() {
    var vis = this;

    // Update domains
    vis.y.domain([0, d3.max(vis.displayData)]);

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
            return vis.height - vis.y(d);
        })
        .attr("x", function (d, i) {
            return vis.x(i);
        })
        .attr("y", function (d) {
            return vis.y(d);
        });

    bars.exit().remove();

    // Append axes to chart and adjust labels
    vis.svg.select(".x-axis")
        .call(vis.xAxis)
        .selectAll("text")
        .text(function(d, i) {
            return i*10 + "-" + ((i+1)*10 -1);
        });

    vis.svg.select(".y-axis")
        .call(vis.yAxis);

};
