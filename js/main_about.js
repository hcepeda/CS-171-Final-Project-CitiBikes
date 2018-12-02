var dateParser = d3.timeParse("%m/%d/%y");
var allData = [];


  d3.queue()
    .defer(d3.csv, "data/Compiled_V2.csv")
    .defer(d3.csv, "data/sample-data.csv")
    .defer(d3.csv, "data/chord_data_3.csv")
    .defer(d3.csv, "data/monthly_members.csv")
    .await(createVis);


function createVis(error, aggregatedData, sampleData, chord_data, monthly_members) {


  aggregatedData.forEach(function(d){
    d.Date = dateParser(d.Date);
    d.CumulativeMiles = +d.CumulativeMiles;
    d.CumulativeTrips = +d.CumulativeTrips;
    d.TripsToday = +d.TripsToday;
    d.MilesToday = +d.MilesToday;
    d.TotalAnnualMembers = +d.TotalAnnualMembers;
    d.num_stations = +d.num_stations;
    d.num_bikes = +d.num_bikes;
  });

  monthly_members.forEach(function(d){
    d.Date = dateParser(d.Date);
    d.OneDay = +d.OneDay;
    d.ThreeSeven = +d.ThreeSeven;
    d['Annual Members'] = +d['Annual Members']
  })

  var LineChart = new CitiLineGraph("line_chart", aggregatedData);
  var LineChart_new = new GeneralLine("station_bike_line", aggregatedData, "num_stations");
  var Chord_Dia = new ChordMaker("chord_product", chord_data);
  var Stacked_bar = new SubscriberBar("subscribers_customers", monthly_members);

}
