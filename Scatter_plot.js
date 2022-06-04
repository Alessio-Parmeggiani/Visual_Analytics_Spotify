
// set the dimensions and margins of the graph
const margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

//Read the data
d3.csv("/tracks_top1000.csv",d3.autoType).then(function(data){

var category_x="year"
var category_y="tempo"

var max_x=d3.max(data, function(d) { 
  return d[category_x]; })
var max_y=d3.max(data, function(d) { 
    return d[category_y]; })
var min_x=d3.min(data, function(d) { 
      return d[category_x]; })
var min_y=d3.min(data, function(d) { 
        return d[category_y]; })

// Add X axis
const x = d3.scaleLinear()
.domain([min_x, max_x])
.range([ 0, width ]);
svg.append("g")
.attr("transform", `translate(0, ${height})`)
.call(d3.axisBottom(x));

svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", height + margin.top + 20)
      .text(category_x);

// Add Y axis
const y = d3.scaleLinear()
.domain([min_y,max_y])
.range([ height, 0]);
svg.append("g")
.call(d3.axisLeft(y));

// Y axis label:
svg.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left+20)
    .attr("x", -margin.top)
    .text(category_y)

// Add dots
//si può mettere colore in base all'artista ad esempio
//con 1000 artisti un po' un casino
svg.append('g')
.selectAll("dot")
.data(data)
.join("circle")
    .attr("cx", function (d) { return x(d[category_x]); } )
    .attr("cy", function (d) { return y(d[category_y]); } )
    .attr("r", 3)
    
    .style("fill", "#69b3a2")
})