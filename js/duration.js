DurationChart = function(_parentElement, _parentElement2, _data) {
    this.parentElement = _parentElement;
    this.parentElement2 = _parentElement2;
    this.data = _data;
    this.displayData = [];
    this.displayLong = [];
    this.filtereddata = _data;

    this.initVis();
};

/* INITIALIZE VISUALIZATION */
DurationChart.prototype.initVis = function() {
    var vis = this;
    console.log(vis.data);

    vis.margin = { top: 40, right: 0, bottom: 40, left: 30 };

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 250 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.svglong = d3.select("#" + vis.parentElement2).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    vis.max = d3.max(vis.data, function(d) {
        return d.tripduration;
    });

    console.log(vis.max);

    // Scales and axes
    vis.x = d3.scaleBand()
        .rangeRound([0, vis.width])
        .paddingInner(0.1)
        .domain(d3.range(0, 7));

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.y2 = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x)
        .tickSize(0);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y)
        .tickSizeOuter(0);

    vis.yAxis2 = d3.axisLeft()
        .scale(vis.y2)
        .tickSizeOuter(0);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    vis.svglong.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svglong.append("g")
        .attr("class", "y-axis axis");

    vis.filtereddata = vis.data;

    // Filter, aggregate, modify data
    vis.wrangleData();

};

DurationChart.prototype.wrangleData = function() {
    var vis = this;
    var newdateParser = d3.timeParse("%m %d %Y");

    var selectbox = d3.select(".selectbox").property("value");
    selectbox = newdateParser(selectbox);
    console.log(selectbox);
    console.log(vis.data);

    vis.nestedData = d3.nest()
        .key(function(d) {
            return d.date;
        })
        .rollup(function(leaves) {
            return {
                data: leaves
            }
        })
        .entries(vis.filtereddata);

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
    var buckets = d3.range(0, 7).map(function() {
        return 0;
    });

    var longbuckets = d3.range(0, 7).map(function() {
        return 0;
    });

    var total = 0;
    var array = [];

    for (var i=0; i < vis.displayData.value.data.length; i++) {
        var duration = vis.displayData.value.data[i]["tripduration"]/60;
        array.push(duration);
        total += duration;

        if (duration < 10) {
            buckets[0]++;
        }
        else if (duration >= 10 && duration < 20) {
            buckets[1]++;
        }
        else if (duration >= 20 && duration < 30) {
            buckets[2]++;
        }
        else if (duration >= 30 && duration < 40) {
            buckets[3]++;
        }
        else if (duration >= 40 && duration < 50) {
            buckets[4]++;
        }
        else if (duration >= 50 && duration < 60) {
            buckets[5]++;
        }
        else if (duration >= 60) {
            buckets[6]++;
        }
    }

    document.getElementById("avg-trip").innerHTML = Math.round(total/vis.displayData.value.data.length) + " min";
    document.getElementById("long-trip").innerHTML = Math.round(d3.max(array)) + " min";
    document.getElementById("short-trip").innerHTML = Math.round(d3.min(array)) + " min";

    for (var i=0; i < vis.displayData.value.data.length; i++) {
        var duration = vis.displayData.value.data[i]["tripduration"]/60;
        if (duration >=60 && duration < 90) {
            longbuckets[0]++;
        }
        else if (duration >= 90 && duration < 120) {
            longbuckets[1]++;
        }
        else if (duration >= 120 && duration < 150) {
            longbuckets[2]++;
        }
        else if (duration >= 150 && duration < 180) {
            longbuckets[3]++;
        }
        else if (duration >= 180 && duration < 210) {
            longbuckets[4]++;
        }
        else if (duration >= 210 && duration < 240) {
            longbuckets[5]++;
        }
        else if (duration >= 240) {
            longbuckets[6]++;
        }
    }

    vis.displayData = buckets;
    vis.displayLong = longbuckets;

    console.log(vis.displayData);

    // Update visualization
    vis.updateVis();
};

DurationChart.prototype.updateVis = function() {
    var vis = this;

    // Update domains
    vis.y.domain([0, d3.max(vis.displayData)]);
    vis.y2.domain([0, d3.max(vis.displayLong)]);

    var bars = vis.svg.selectAll(".detailbar")
        .data(vis.displayData);

    bars.enter().append("rect")
        .attr("class", "detailbar")
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

    var bars2 = vis.svglong.selectAll(".detailbar")
        .data(vis.displayLong);

    bars2.enter().append("rect")
        .attr("class", "detailbar")
        .merge(bars2)
        .transition()
        .attr("width", vis.x.bandwidth())
        .attr("height", function (d) {
            return vis.height - vis.y2(d);
        })
        .attr("x", function (d, i) {
            return vis.x(i);
        })
        .attr("y", function (d) {
            return vis.y2(d);
        });

    bars2.exit().remove();

    var labels = vis.svg.selectAll(".info")
        .data(vis.displayData);

    labels.enter().append("text")
        .merge(labels)
        .transition()
        .attr("class", "info")
        .attr("x", function(d, i) {
            return vis.x(i) + vis.x.bandwidth()*0.2;
        })
        .attr("y", function (d) {
            return vis.y(d) - 5;
        })
        .text(function(d) {
            if (d == 0) {
                return;
            }
            else {
                return d;
            }
        });

    labels.exit().remove();

    // Append axes to chart and adjust labels
    vis.svg.select(".x-axis")
        .call(vis.xAxis)
        .selectAll("text")
        .text(function(d, i) {
            if (i == 6) {
                return "60+"
            }
            else {
                return i * 10 + "-" + ((i + 1) * 10 - 1);
            }
        })
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "translate(10, 0) rotate(-45)");

    vis.svg.select(".y-axis")
        .call(vis.yAxis);

    vis.svg.selectAll(".label").remove();
    vis.svg.append("text")
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .attr("x", vis.width/2)
        .attr("y", vis.height + 40)
        .text("Duration (min)");

    vis.svg.selectAll(".title").remove();
    vis.svg.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", vis.width/2)
        .attr("y", -30)
        .text("Short Trips (<1 hour)");

    var labels2 = vis.svglong.selectAll(".info")
        .data(vis.displayLong);

    labels2.enter().append("text")
        .merge(labels2)
        .transition()
        .attr("class", "info")
        .attr("x", function(d, i) {
            return vis.x(i) + vis.x.bandwidth()*0.2;
        })
        .attr("y", function (d) {
            return vis.y2(d) - 5;
        })
        .text(function(d) {
            if (d == 0) {
                return;
            }
            else {
                return d;
            }
        });

    labels2.exit().remove();

    // Append axes to chart and adjust labels
    vis.svglong.select(".x-axis")
        .call(vis.xAxis)
        .selectAll("text")
        .text(function(d, i) {
            if (i == 6) {
                return "4+";
            }
            else {
                return i*0.5+1 + "-" + ((i*0.5)+1.5);
            }
        })
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "translate(10, 0) rotate(-45)");

    vis.svglong.selectAll(".label").remove();
    vis.svglong.append("text")
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .attr("x", vis.width/2)
        .attr("y", vis.height + 40)
        .text("Duration (hours)");

    vis.svglong.select(".y-axis")
        .call(vis.yAxis2);

    vis.svglong.selectAll(".title").remove();
    vis.svglong.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", vis.width/2)
        .attr("y", -30)
        .text("Long Trips (>1 hour)");


};

DurationChart.prototype.onSelectionChange = function(hour) {
    var vis = this;

    vis.filtereddata = vis.data.filter(function(d) {
        return d.hour == hour;
    });

    vis.wrangleData();

};

DurationChart.prototype.onClick = function() {
    var vis = this;

    vis.filtereddata = vis.data;
    vis.wrangleData();
};

