
/* main JS file */
var dateFormatter = d3.timeFormat("%m %d %Y");
var dateParser = d3.timeParse("%m/%d/%y %H:%M:%S");
var newdateParser = d3.timeParse("%m %d %Y");

// initialize data variable
var allData = [];
var tripsbyday = [];
var dailydata;
var barchart, histogram, age, gender, subscriber;


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
        // console.log(allData);

        createVis();
    });
}

function createVis() {

    // create context bar chart with total rides per day per hour
    barchart = new TotalVis("totalvis", allData);
    age = new AgeChart("age", allData);
    gender = new GenderChart("gender", allData);
    subscriber = new SubChart("subscriber", allData);
    var greatmap = new NYMap("mapid", allData);

    histogram = new Histogram("tripduration", allData);
}

function selectionChanged() {
    barchart.wrangleData();
    histogram.wrangleData();
    age.wrangleData();
    gender.wrangleData();
    subscriber.wrangleData();
}
