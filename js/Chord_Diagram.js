ChordMaker = function(_parentElement, _data){
  this.parentElement = _parentElement;
  this.data = _data;
  //this.colorDf = _colorDf

  this.wrangleData()
}

ChordMaker.prototype.initVis = function(matrix, mmap) {
  this.margin = {left: 40, right: 40, top: 40, bottom: 40};
  this.width = $("#" + this.parentElement).width() - this.margin.left - this.margin.right;
  this.height = this.width; //  - this.margin.top - this.margin.bottom;
  var vis = this;
  var colorDf = this.colorDf;
  //console.log(this.colorDf);
  //console.log(mmap['Astoria']);
  //for (i = 0; i < 43; i++){
  //  mmap[i].coloring = colorDf[i].color
  //}
  //console.log(matrix)
  //console.log(mmap)
  this.r1 = this.height / 2;
  this.r0 = this.r1 - 110;
  // Do not delete this var.
  var r0 = this.r0;
  var r1 = this.r1;
  this.chord = d3.chord()
    .padAngle(0.05)
    .sortSubgroups(d3.descending)
    .sortChords(d3.descending);
  this.arc = d3.arc()
    .innerRadius(this.r0)
    .outerRadius(this.r0 + 20);

  this.svg = d3.select("#" + this.parentElement).append("svg")
    .attr("width", this.width + this.margin.left + this.margin.right)
    .attr("height", this.height + this.margin.top + this.margin.bottom)
  .append("g")
    .attr("id", "circle")
    .attr("transform",
          "translate(" + this.width / 2 + "," + this.height / 2 + ")")
    .datum(this.chord(matrix));
  this.svg.append("circle").attr("r", this.r0 + 20);
  this.ribbon = d3.ribbon().radius(this.r0)
  console.log(mmap);
  var mapReader = chordRdr(matrix, mmap);
  var legendRectSize = 20;
  var legendSpacing = 4;
  var sampleCategoricalData = ["Manhattan", "Brooklyn", "Queens"];
  var color = d3.scaleOrdinal().domain(sampleCategoricalData).range(["#333", "#CC0000", "#0000FF"]);
  var colors = ["#0000ff", '#333', '#CC0000', '#CC0000', '#CC0000', '#CC0000',
       '#333', '#333', '#333', '#333', '#CC0000', '#34DDDD', '#CC0000',
       '#333', '#333', '#333', '#CC0000', '#CC0000', '#333', '#CC0000',
       '#333', '#AAAAAA', '#333', '#333', '#333', '#333', '#333', '#333',
       '#CC0000', "#0000ff", '#CC0000', '#CC0000', "#0000ff", '#333',
       "#0000ff", '#CC0000', '#333', '#333', '#333', '#333', '#333',
       '#CC0000', '#333'];
  var legend = this.svg.selectAll('.legend')
    .data(color.domain())
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform', function(d, i) {
      var height = legendRectSize + legendSpacing;
      var offset =  height * color.domain().length / 2;
      var horz = vis.width - 480;
      console.log(horz);
      var vert = i * height - offset + (vis.height / 3);
      return 'translate(' + horz + ',' + vert + ')';
    });

  legend.append('rect')
    .attr('width', legendRectSize)
    .attr('height', legendRectSize)
    .style('fill', color)
    .style('stroke', color)

  legend.append('text')
    .attr('x', legendRectSize + legendSpacing)
    .attr('y', legendRectSize - legendSpacing)
    .text(function(d) { return d; });
  var g = this.svg.selectAll("g.group")
    .data(function(chords) {
        console.log(chords.groups);
        return chords.groups;
    })
    .enter().append("this.svg:g")
    .attr("class", "group")
    .on("mouseover", mouseover)
    .on("mouseout", function (d){ d3.select("#tooltip").style("visibility", "hidden")});

  g.append("svg:path")
    .style("stroke", "grey")
    .style("fill", function(d,i ) {
        return colors[i]
        //return mapReader(d).gdata;
    })
    .attr("d", this.arc);

  g.append("svg:text")
    .each(function(d) {
        d.angle = (d.startAngle + d.endAngle) / 2;
    })
    .attr("dy", ".35em")
    .style("font-family", "helvetica, arial, sans-serif")
    .style("font-size", "9px")
    .attr("text-anchor", function(d) {
        return d.angle > Math.PI ? "end" : null;
    })
    .attr("transform", function(d) {
      return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
        "translate(" + (r0 + 26) + ")" + (d.angle > Math.PI ? "rotate(180)" : "")
    })
    .text(function(d) {
        return mapReader(d).gname;
    });

  var chordPaths = this.svg.selectAll("path.chord")
    .data(function(chords) {
        return chords;
    })
    .enter().append("svg:path")
    .attr("class", "chord")
    .style("stroke", "grey")
    .style("fill", function(d, i) {
        return colors[d.source.index]
    })
    .attr("d", this.ribbon.radius(r0))
    .on("mouseover", function(d){
      //console.log()
      d3.select("#tooltip")
        .style("visibility", "visible")
        .html(chordTip(mapReader(d)))
        // To fix later if time permitting
        //.style("top", function () { return (d3.mouse(this)[1])+"px"})
        //.style("left", function () { return (d3.mouse(this)[0])+"px";})
    })
    .on("mouseout", function(d) {d3.select("#tooltip").style("visibility", "hidden")});

  function chordTip (d) {
    var p = d3.format(".1%"), q = d3.format(",.2r")
    return "Chord Info:<br/>"
      +  d.sname + " → " + d.tname
      + ": " + p(d.svalue/d.stotal) + "<br/>"
      + d.tname + " → " + d.sname
      + ": " + p(d.tvalue/d.ttotal) + "<br/>";
  }

  function groupTip (d) {
    var p = d3.format(".1%"), q = d3.format(",.2r")
    return "Group Info:<br/>"
        + d.gname + " : " + p(d.gvalue/d.mtotal) + "<br/>";
    }


  function mouseover(d, i) {
    d3.select("#tooltip")
      .style("visibility", "visible")
      .html(groupTip(mapReader(d)))
      // Come back to fix later
      //.style("top", function () { return (d3.event.pageY + 1000)+"px"})
      //.style("left", function () { return (d3.event.pageX - 130)+"px";})

    chordPaths.classed("fade", function(p) {
      return p.source.index != i
          && p.target.index != i;
    });
  }
}

ChordMaker.prototype.wrangleData = function() {
  this.mpr = chordMpr(this.data);
  this.mpr
    .addValuesToMap('root')
    .addValuesToMap('node')
    .setFilter(function(row, a, b){
      return (row.root === a.name && row.node === b.name)
    })
    .setAccessor(function(recs, a, b){
      if (!recs[0]){ return 0};
      return +recs[0].value;
    });

  this.initVis(this.mpr.getMatrix(), this.mpr.getMap());
}
