
/* main JS file */
var dateFormatter = d3.timeFormat("%m %d %Y");
var dateParser = d3.timeParse("%m/%d/%y %H:%M:%S");
var newdateParser = d3.timeParse("%m %d %Y");

// initialize data variable
var allData = [];
var tripsbyday = [];

// Load data
loadData();

function loadData() {
    d3.csv("data/citibike-sample.csv", function(data) {
        for (var i = 0; i < data.length; i++) {
            data[i].tripduration = +data[i].tripduration;
            data[i].bikeid = +data[i].bikeid;
            data[i]["birth year"] = +data[i]["birth year"];
            data[i]["end station id"] = +data[i]["end station id"];
            data[i]["end station longitude"] = +data[i]["end station longitude"];
            data[i]["end station latitude"] = +data[i]["end station latitude"];
            data[i]["start station id"] = +data[i]["start station id"];
            data[i]["start station longitude"] = +data[i]["start station longitude"];
            data[i]["start station latitude"] = +data[i]["start station latitude"];
            data[i]["gender"] = +data[i]["gender"];

            data[i].starttime = dateParser(data[i].starttime);
            data[i].stoptime = dateParser(data[i].stoptime);

            // create new date property
            data[i].date = dateFormatter(data[i].starttime);
            data[i].date = newdateParser(data[i].date);

        }

        allData = data;
        console.log(allData);

        tripsbyday = d3.nest()
            .key(function(d) {
                return d.date;
            })
            .rollup(function(leaves) {
                return leaves.length;
            })
            .entries(allData);

        tripsbyday.sort(function(a, b) {
            return new Date (a.key) - new Date(b.key);
        });

        tripsbyday.forEach(function(d) {
            d.key = new Date(d.key);
        });

        console.log(tripsbyday);

        createVis();
    });
}

function createVis() {

    // create context bar chart with total rides per day per hour
    var greatmap = new NYMap("mapid", allData);
    var barchart = new TotalVis("totalvis", dailydata);

    // var histogram = new Histogram("histogram", allData);
}
