var dateParser = d3.timeParse("%m/%d/%y");
var allData = [];


  d3.queue()
    .defer(d3.csv, "data/Compiled.csv")
    .defer(d3.csv, "data/citibike-sample.csv")
    .await(createVis);


function createVis(error, aggregatedData, sampleData) {


  aggregatedData.forEach(function(d){
    d.Date = dateParser(d.Date)
    d.CumulativeMiles = +d.CumulativeMiles
    d.CumulativeTrips = +d.CumulativeTrips
    d.TripsToday = +d.TripsToday;
    d.MilesToday = +d.MilesToday;
    d.TotalAnnualMembers = +d.TotalAnnualMembers;
  })

  var LineChart = new CitiLineGraph("line_chart", aggregatedData);
}
