GenderChart = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];

    this.initVis();
};

/* INITIALIZE VISUALIZATION */
GenderChart.prototype.initVis = function() {
    var vis = this;
    // console.log(vis.data);

    vis.margin = { top: 40, right: 10, bottom: 30, left: 30 };

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
        .domain(["M", "F", "N/A"]);

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x)
        .tickSize(0);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y)
        .tickSizeOuter(0);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    vis.filtereddata = vis.data;

    // Filter, aggregate, modify data
    vis.wrangleData();

};

GenderChart.prototype.wrangleData = function() {
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

    // count people of each gender
    var gendercount = [];
    var male = {
        gender: "M",
        number: 0
    };
    var female = {
        gender: "F",
        number: 0
    };
    var unknown = {
        gender: "N/A",
        number: 0
    }
    gendercount.push(male, female, unknown);

    vis.displayData.value.data.forEach(function(d) {
       if (d.gender == 1) {
            gendercount[0].number++;
       }
       else if (d.gender == 2) {
           gendercount[1].number++;
       }
       else {
           gendercount[2].number++;
       }

    });

    console.log(gendercount);

    vis.displayData = gendercount;

    // Update visualization
    vis.updateVis();
};

GenderChart.prototype.updateVis = function() {
    var vis = this;

    // Update domains
    vis.y.domain([0, d3.max(vis.displayData, function(d) { return d.number})]);

    var bars = vis.svg.selectAll(".detailbar")
        .data(vis.displayData);

    bars.enter().append("rect")
        .attr("class", "detailbar")
        .merge(bars)
        .transition()
        .attr("width", vis.x.bandwidth())
        .attr("height", function (d) {
            return vis.height - vis.y(d.number);
        })
        .attr("x", function (d) {
            return vis.x(d.gender);
        })
        .attr("y", function (d) {
            return vis.y(d.number);
        });

    bars.exit().remove();

    var labels = vis.svg.selectAll(".label")
        .data(vis.displayData);

    labels.enter().append("text")
        .merge(labels)
        .transition()
        .attr("class", "label")
        .attr("x", function(d) {
            return vis.x(d.gender) + vis.x.bandwidth()*0.2;
        })
        .attr("y", function (d) {
            return vis.y(d.number) - 5;
        })
        .text(function(d) {
            if (d.number == 0) {
                return;
            }
            else {
                return d.number;
            }
        });

    labels.exit().remove();

    // Append axes to chart and adjust labels
    vis.svg.select(".x-axis")
        .call(vis.xAxis)
        .selectAll("text")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "translate(10, 10)");

    vis.svg.select(".y-axis")
        .call(vis.yAxis);

    vis.svg.selectAll(".title").remove();
    vis.svg.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", vis.width/2)
        .attr("y", -30)
        .text("Gender");

};

GenderChart.prototype.onSelectionChange = function(hour) {
    var vis = this;

    vis.filtereddata = vis.data.filter(function(d) {
        return d.hour == hour;
    });

    vis.wrangleData();

};

GenderChart.prototype.onClick = function() {
    var vis = this;

    vis.filtereddata = vis.data;

    vis.wrangleData();
}