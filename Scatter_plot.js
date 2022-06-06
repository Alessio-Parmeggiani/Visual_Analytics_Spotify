
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
d3.csv("/tracks_small.csv",d3.autoType).then(function(data){

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
var x = d3.scaleLinear()
.domain([min_x, max_x])
.range([ 0, width ]);

var xAxis=svg.append("g")
.attr("transform", `translate(0, ${height})`)
.call(d3.axisBottom(x));

//label for x axis
svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", height + margin.top + 20)
      .text(category_x);

// Add Y axis
var y = d3.scaleLinear()
.domain([min_y,max_y])
.range([ height, 0]);
var yAxis=svg.append("g")
.call(d3.axisLeft(y));

// Y axis label:
svg.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left+20)
    .attr("x", -margin.top)
    .text(category_y)


// Add a clipPath: everything out of this area won't be drawn.
var clip = svg.append("defs").append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("width", width )
    .attr("height", height )
    .attr("x", 0)
    .attr("y", 0);

// Create the scatter variable: where both the circles and the brush take place
var scatter = svg.append('g')
.attr("clip-path", "url(#clip)")


scatter
.selectAll("circle")
.data(data)
.enter()
.append("circle")
    .attr("cx", function (d) { return x(d[category_x]); } )
    .attr("cy", function (d) { return y(d[category_y]); } )
    .attr("r", 3)
    .style("opacity", 0.5)
    .style("fill", "#69b3a2")


/*
// Alternative: Set the zoom and Pan features: how much you can zoom, on which part, and what to do when there is a zoom
var zoom = d3.zoom()
    .scaleExtent([.5, 20])  // This control how much you can unzoom (x0.5) and zoom (x20)
    .extent([[0, 0], [width, height]])
    .on("zoom", updateChartZoom);

// This add an invisible rect on top of the chart area. This rect can recover pointer events: necessary to understand when the user zoom
svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .call(zoom);
// now the user can zoom and it will trigger the function called updateChart

// A function that updates the chart when the user zoom and thus new boundaries are available
function updateChartZoom(event) {

    // recover the new scale
    var newX = event.transform.rescaleX(x);
    var newY = event.transform.rescaleY(y);

    // update axes with these new boundaries
    xAxis.call(d3.axisBottom(newX))
    yAxis.call(d3.axisLeft(newY))

    // update circle position
    scatter
        .selectAll("circle")
        .attr('cx', function(d) {return newX(d[category_x]) })
        .attr('cy', function(d) {return newY(d[category_y])});
}
*/


//BRUSHING

// Add brushing
var brush = d3.brushX()                 // Add the brush feature using the d3.brush function
.extent( [ [0,0], [width,height] ] ) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
.on("end", updateChartBrush) // Each time the brush selection changes, trigger the 'updateChart' function

scatter
.append("g")
    .attr("class", "brush")
    .call(brush);

// A function that set idleTimeOut to null
var idleTimeout
function idled() { idleTimeout = null; }

// A function that update the chart for given boundaries
function updateChartBrush(event) {

    extent = event.selection

    // If no selection, back to initial coordinate. Otherwise, update X axis domain
    if(!extent){
      if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
      x.domain([min_x, max_x])
    }else{
      x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
      scatter.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
    }

    // Update axis and circle position
    xAxis.transition().duration(1000).call(d3.axisBottom(x))
    scatter
      .selectAll("circle")
      .transition().duration(1000)
      .attr("cx", function (d) { return x(d[category_x]); } )
      .attr("cy", function (d) { return y(d[category_y]); } )

}


})