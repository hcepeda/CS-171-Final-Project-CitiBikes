
/* main JS file */
var dateFormatter = d3.timeFormat("%m %d %Y");
var hourFormatter = d3.timeFormat("%H");
var dateParser = d3.timeParse("%m/%d/%y %H:%M:%S");
var newdateParser = d3.timeParse("%m %d %Y");
function roundToHour(date) {
    p = 60 * 60 * 1000; // milliseconds in an hour
    return new Date(Math.round(date.getTime() / p ) * p);
}

// initialize data variable
var allData = [];
var tripsbyday = [];
var dailydata;

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

            // create new hour property
            // data[i].hour = hourFormatter(data[i].starttime);
        }

        // get select box value
        var selectbox = d3.select(".selectbox").property("value");

        selectbox = newdateParser(selectbox);
        console.log(selectbox);

        allData = data;
        console.log(allData);

        tripsbyday = d3.nest()
            .key(function(d) {
                return d.date;
            })
            .rollup(function(leaves) {return {
                hours: d3.range(0,24).map(function() {
                    return 0;
                }),
                data: leaves,
                total: leaves.length
            }
            })
            // .key(function(d) {
            //     return d.hour;
            // })
            // .rollup(function(leaves) {
            //     return leaves.length;
            // })
            .entries(allData);

        tripsbyday.sort(function(a, b) {
            return new Date (a.key) - new Date(b.key);
        });

        // Pull daily data based on selectbox value
        // tripsbyday.forEach(function(d) {
        //     d.key = new Date(d.key);
        //     // d.values.forEach(function(data) {
        //     //     data.key = new Date(data.key);
        //     // });
        //
        // });

        tripsbyday.forEach(function(d) {
            d.key = new Date(d.key);
            // for (var i=0; i < d.value.data.length; i++) {
            //     var hour = +hourFormatter(d.value.data[i].starttime);
            //     d.value.hours[hour] ++;
            // }

            if (+selectbox == +d.key) { // can't compare objects, so convert to numbers first
                dailydata = d;
            }
        });

        console.log(tripsbyday);
        console.log(dailydata);

        createVis();
    });
}

function createVis() {

    // create context bar chart with total rides per day per hour
    var barchart = new TotalVis("totalvis", dailydata);
}

