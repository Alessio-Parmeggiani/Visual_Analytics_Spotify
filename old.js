//OLD BRUSHING
/*
    
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
            x.domain([xLimits[0], xLimits[1]])
        }else{
            x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
            scatter.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
        }

        // Update axis and circle position
        xAxis.transition().duration(1000)
        .call(d3.axisBottom(x))
            .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");
        scatter
        .selectAll("circle")
        .transition().duration(1000)
        .attr("cx", function (d) { return x(d[category_x]); } )
        .attr("cy", function (d) { return y(d[category_y]); } )

    }



    // Update axis and circle position
    xAxis.transition().duration(1000)
    .call(xAxis_)    
        .selectAll("text")  
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");
    scatter
        .selectAll("circle")
        .transition().duration(1000)
        .attr("cx", function (d) { return x(d[category_x]); } )
        .attr("cy", function (d) { return y(d[category_y]); } )

    */
    

//zoom by SCROLLING
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

//other radial plot implementation
  /*

  const data = [
  {color: 'orange', values: [500, 400, 900]},
  {color: 'blue', values: [800, 200, 400]},
  {color: 'green', values: [300, 1000, 600]},
];

const svg = d3.select('svg');

const maxValue = 1000;
const radius = 150;
const center = {x: 250, y: 200};

const radialScale = d3.scaleLinear()
  .domain([0, maxValue]) 
  .range([radius, 0]) 
  
const axis = d3.axisRight()
  .scale(radialScale)
  .ticks(5)

svg.append('g')
  .attr('transform', `translate(${center.x},${center.y  - radius})`)
  .call(axis);

let val, angle;
for (val = 0; val <= maxValue; val += maxValue / 5) {
  const r = radialScale(val);
  svg.append('circle')
    .attr('cx', center.x)
    .attr('cy', center.y)
    .attr('r', r)
    .style('stroke', '#aaa')
    .style('fill', 'none');
}

const labels = ['Base Attack', 'Base Stamina', 'Base Defence'];
const anchors = ['middle', 'start', 'end'];
const shifts = [{x: 0, y: -15}, {x: 10, y: 15}, {x: -10, y: 15}];

for (let index = 0; index < labels.length; index++) {
  const angle = index * Math.PI * 2 / labels.length;
  const x = center.x + radius * Math.sin(angle);
  const y = center.y + radius * -Math.cos(angle);
  if (angle > 0) {
    svg.append('line')
        .attr('x1', center.x)
        .attr('y1', center.y)
        .attr('x2', x)
        .attr('y2', y)
        .style('stroke', '#000');
  }
  svg.append('text')
    .text(labels[index])
    .attr('text-anchor', anchors[index])
    .attr('dx', shifts[index].x)
    .attr('dy', shifts[index].y)
    .attr('x', x)
    .attr('y', y)
}

data.forEach(({color, values}, index) => {
    let path = '';
  for (let i = 0; i < values.length; i++) {
    const r = radius - radialScale(values[i]);
    console.log('V: ', values[i]);
    console.log('R: ', r);
    const angle = i * Math.PI * 2 / values.length;
    const x = center.x + r * Math.sin(angle);
    const y = center.y + r * -Math.cos(angle);
    path += `${i > 0 ? 'L' : 'M'} ${x},${y} `;
  }
  path += 'Z';
  svg.append('path')
    .attr('d', path)
    .style('stroke', color)
    .style('stroke-width', 3)
    .style('stroke-opacity', 0.6)
    .style('fill', color)
    .style('fill-opacity', 0.3)
  
});

  */