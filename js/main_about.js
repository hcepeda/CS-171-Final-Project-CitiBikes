var dateParser = d3.timeParse("%m/%d/%y");
var allData = [];

loadData();
function loadData() {
  d3.csv("data/Compiled.csv", function(data){

    data.forEach(function(d){
      d.Date = dateParser(d.Date)
      d.CumulativeMiles = +d.CumulativeMiles
      d.CumulativeTrips = +d.CumulativeTrips
      d.TripsToday = +d.TripsToday;
      d.MilesToday = +d.MilesToday;
      d.TotalAnnualMembers = +d.TotalAnnualMembers;
    })
    allData = data;
    createVis();
  })
}

function createVis() {
  var LineChart = new CitiLineGraph("line_chart", allData);
}
