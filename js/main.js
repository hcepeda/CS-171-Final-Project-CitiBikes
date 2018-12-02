
/* main JS file */
var dateFormatter = d3.timeFormat("%m %d %Y");
var hourFormatter = d3.timeFormat("%H");
var dateParser = d3.timeParse("%m/%d/%y %H:%M:%S");
var newdateParser = d3.timeParse("%m %d %Y");

// initialize data variable
var allData = [];
var tripsbyday = [];
var dailydata;
var barchart, histogram, age, gender, subscriber, duration;

var geojsondata = []; // add json file for geojson layer





    




document.onreadystatechange = function () {
    // function countDown(secs, elem) {
    // var element = document.getElementById(elem);
    // element.innerHTML = "This should take about "+secs+" more seconds";
    // console.log("working");
    // if(secs < 1) {
    //     clearTimeout(timer);
    //     element.innerHTML = '<h2> CitiBikes coming your way! </h2>'
    // }
    // secs--;
    // var timer = setTimeout('countDown('+secs+',"'+elem+'")', 1000);
    // }
    // countDown(20,"status");
    var state = document.readyState
  if (state == 'interactive') {

       document.getElementById('contents').style.visibility="hidden";


  } else if (state == 'complete') {
      setTimeout(function(){
         document.getElementById('interactive');
         document.getElementById('load').style.visibility="hidden";
         document.getElementById('contents').style.visibility="visible";
      },1000);
  }
}
// $.ajax({
//   url: 'data/Subway-Lines.json',
//   async: false,
//   dataType: 'json',
//   success: function (geo) {
//     // do stuff with response.
//     geojsondata = geo;
//     console.log(geojsondata);
//   }
// });



// Load data

loadData();

function loadData() {

    // d3.queue()
    //     .defer(d3.csv, "data/Compiled.csv")
    //     .defer(d3.csv, "data/citibike-sample.csv")
    //     .defer($.getJSON,"data/Subway-Lines.json" )
    //     .await(createVis);


    d3.csv("data/sample-data.csv", function(data) {
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

            data[i].hour = +hourFormatter(data[i].starttime);

        }

        allData = data;
        // console.log(allData);

        createVis();
    });
}

var myEventHandler = {};
var myEventHandler2 = {};

function createVis() {
    var vis = this;

    // Set information


    // Visualization Objects
    barchart = new TotalVis("totalvis", allData, myEventHandler, myEventHandler2);
    // greatmap = new NYMap("mapid", allData, [40.733060, -73.971249], vis.geojsondata);
    age = new AgeChart("age", allData);
    gender = new GenderChart("gender", allData);
    subscriber = new SubChart("subscriber", allData);
    duration = new DurationChart("tripduration", "longtrip", allData);

    // Click event to filter by hour
    $(myEventHandler).bind("hourChanged", function(event, hour) {
        var time = document.getElementById("time");
        time.innerText = " from " + hour + ":00 - " + (hour+1) + ":00";
        age.onSelectionChange(hour);
        gender.onSelectionChange(hour);
        subscriber.onSelectionChange(hour);
        duration.onSelectionChange(hour);
        // greatmap.onSelectionChange(hour);
    })

    // Click out event to reset hour
    $(myEventHandler2).bind("resetHour", function() {
        var time = document.getElementById("time");
        time.innerText = "";
        barchart.onClick();
        age.onClick();
        gender.onClick();
        subscriber.onClick();
        duration.onClick();
        // greatmap.onClick();

    })

}

function selectionChanged() {
    $(myEventHandler2).trigger("resetHour");

    barchart.wrangleData();
    age.wrangleData();
    gender.wrangleData();
    subscriber.wrangleData();
    // greatmap.wrangleData();
}

function resetmap() {
    greatmap.reset();
}




