
TotalVis = function(_parentElement, _data, _eventHandler, _eventHandler2) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.eventHandler = _eventHandler;
    this.secondHandler = _eventHandler2;
    this.displayData = [];

    this.initVis();
};

/* INITIALIZE VISUALIZATION */
TotalVis.prototype.initVis = function() {
    var vis = this;
    // console.log(vis.data);

    vis.margin = { top: 30, right: 150, bottom: 50, left: 150 };

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 200 - vis.margin.top - vis.margin.bottom;

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
        .domain(d3.range(0,24));

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x)
        .tickSize(0);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    // Create tooltip
    vis.tooltip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function(d, i) {
            return "Time: " + i + ":00 - " + i + ":59 EST" +
                "<br>Number of Rides: " + d;
        });

    vis.svg.call(vis.tooltip);

    // Filter, aggregate, modify data
    vis.wrangleData();

};

TotalVis.prototype.wrangleData = function() {
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
    vis.displayData.value.hours = d3.range(0, 24).map(function() {
        return 0;
    });

    for (var i=0; i < vis.displayData.value.data.length; i++) {
        var hour = +hourFormatter(vis.displayData.value.data[i].starttime);
        vis.displayData.value.hours[hour] ++;
    }

    vis.displayData = vis.displayData.value.hours;

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
        .on("mouseover", vis.tooltip.show)
        .on("mouseout", vis.tooltip.hide)
        .on("click", function(d, i) {
            // change other bars to grey
            $(".bar").addClass("grey");

            // highlight currently selected bar
            $(this).addClass("detailbar");

            // attach bicycle image
            vis.svg.selectAll("image").remove();
            vis.svg.append("image")
                .attr("xlink:href", "images/bicycle-solid.svg")
                .attr("x", vis.x(i))
                .attr("y", vis.y(d) - vis.x.bandwidth())
                .attr("width", vis.x.bandwidth())
                .attr("height", vis.x.bandwidth());

            // append informational labels
            $(".info").remove();
            vis.svg.append("text")
                .attr("class", "info")
                .attr("x", 5)
                .attr("y", 0)
                .text("Time Range: "+ i + ":00 - " + i + ":59 EST   ||  Number of Rides: " + d);


            // append invisible rectangle to click out
            vis.svg.append("rect")
                .attr("id", "clickout")
                .on("click", function() {
                    $(vis.secondHandler).trigger("resetHour");
                })
                .attr("width", vis.width)
                .attr("height", vis.height)
                .attr("opacity", 0);

            vis.currentHour = i;
            $(vis.eventHandler).trigger("hourChanged", vis.currentHour);

        })
        .merge(bars)
        .transition(3000)
        .styleTween("opacity", function() { return d3.interpolate(0, 1); });

    d3.selectAll(".bar")
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

    bars.exit().transition().remove();

    $(".title").remove();
    // Append x-axis label
    vis.svg.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", vis.width/2)
        .attr("y", vis.height + 40)
        .text("Time (24 hours)");

    $(".info").remove();
    // Append info label
    vis.svg.append("text")
        .attr("class", "info")
        .attr("x", 5)
        .attr("y", 0)
        .text("Click on a bar to learn more!");


    // Append axes to chart
    vis.svg.select(".x-axis")
        .call(vis.xAxis);
};

TotalVis.prototype.onClick = function() {
    var vis = this;

    vis.svg.selectAll("image").remove();


    $(".bar").remove();
    $(".info").remove();
    $("#clickout").remove();
    vis.updateVis();
};