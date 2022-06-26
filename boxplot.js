let vertical_line;
let horizontal_line;
let box;
let x_scale;
let y_scale;
//https://d3-graph-gallery.com/graph/boxplot_several_groups.html
function update_boxplot(songs_data){
    vertical_line
    .selectAll("vertLines")
    .data(songs_data)
    .enter()
    .append("line")
    .attr("x1", d=> d.category)
    .attr("x2", d=> d.category)
    .attr("y1", d=> y_scale(d.min) )
    .attr("y2", d=> y_scale(d.max)  )
    .attr("stroke", "black")

    // Show the box
    let boxWidth=10;
    box
    .selectAll("boxes")
    .data(songs_data)
    .enter()
    .append("rect")
    .attr("x", d=>  { x_scale(d.category) - boxWidth/2})
    .attr("y", d=> y_scale(d.q3) )
    .attr("height", d=> {(y_scale(d.q1)-y_scale(d.q3)) })
    .attr("width", boxWidth )
    .attr("stroke", "black")
    .style("fill", "#69b3a2")

    // show median, min and max horizontal lines
    horizontal_lines
    .selectAll("medianLines")
    .data(songs_data)
    .enter()
    .append("line")
    .attr("x1", d=>{x_scale(d.category)-boxWidth/2})
    .attr("x2", d=>{x_scale(d.category)+boxWidth/2})
    .attr("y1", function(d){ return(y_scale(d.median))} )
    .attr("y2", function(d){ return(y_scale(d.median))} )
    .attr("stroke", "black")
}
function boxPlotMain() {

    const svg = d3.select('#other-graph')
    .append('svg');
    

    const height = document.getElementById("other-graph").clientHeight;
    const width = document.getElementById("other-graph").clientWidth;

    x_scale = d3.scaleBand()
    .range([ 0, width ])
    .domain(categories)
    .paddingInner(1)
    .paddingOuter(.5)

    // Show the Y scale
    y_scale = d3.scaleLinear()
    .domain([0,1])
    .range([height, 0]);
    svg.call(d3.axisLeft(y_scale))

    let min=0;max=0;boxPlotCenter=0;q1=0;q3=0;median=0;
    let start_data=[]
    // Show the main vertical line
    vertical_line=svg
    .selectAll("vertLines")
    .data(start_data)
    .enter()
    .append("line")
    .attr("x1", boxPlotCenter)
    .attr("x2", boxPlotCenter)
    .attr("y1", y_scale(min) )
    .attr("y2", y_scale(max) )
    .attr("stroke", "black")

    // Show the box
    box=svg
    .selectAll("boxes")
    .data(start_data)
    .enter()
    .append("rect")
    .attr("x", boxPlotCenter - width/2)
    .attr("y", y_scale(q3) )
    .attr("height", (y_scale(q1)-y_scale(q3)) )
    .attr("width", width )
    .attr("stroke", "black")
    .style("fill", "#69b3a2")

    // show median, min and max horizontal lines
    horizontal_lines=svg
    .selectAll("medianLines")
    .data(start_data)
    .enter()
    .append("line")
    .attr("x1", boxPlotCenter-width/2)
    .attr("x2", boxPlotCenter+width/2)
    .attr("y1", function(d){ return(y_scale(d))} )
    .attr("y2", function(d){ return(y_scale(d))} )
    .attr("stroke", "black")
}