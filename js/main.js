/* main JS file */
var dateFormatter = d3.timeFormat("%Y-%m-%d");
var dateParser = d3.timeParse("%m/%d/%y %H:%M:%S");

// initialize data variable
var allData = [];

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

        }
        allData = data;
        console.log(allData);
        createVis();
    });
}

function createVis() {

    // create context bar chart with total rides per day per hour
    var barchart = new TotalVis("totalvis", allData);
}
