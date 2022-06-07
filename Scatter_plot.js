var cat_limits=[];

function getMaxMin(data, key) {
    let max = d3.max(data, d => d[key]);
    let min = d3.min(data, d => d[key]);
    return [min, max];
}

function ScatterPlotMain(data, margin, width, height, svg) {

    var category_x="year"
    var category_y="tempo"
    var category_y2="valence"

    var xLimits=getMaxMin(data, category_x)
    var yLimits=getMaxMin(data, category_y)

    // Add X axis
    var x = d3.scaleLinear()
    .domain([xLimits[0], xLimits[1]])
    .range([ 0, width ]);

    var xAxis_ = d3.axisBottom(x).ticks(5, ".0f")

    var xAxis=svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .attr('id', "axis--x")
    .call(xAxis_) 

    //label for x axis
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + 45)
        .text(category_x);

    // Add Y axis
    var y = d3.scaleLinear()
    .domain([yLimits[0],yLimits[1]])
    .range([ height, 0]);

    var yAxis_=d3.axisLeft(y)

    var yAxis=svg.append("g")
    .attr('id', "axis--y")
    .call(yAxis_);

    // Y axis label:
    var yLabel = svg.append("text")
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



    /*
    ***************************
    INTERACTIONS
    ***************************
    */



    //CHANGE AXIS
    yLabel.on("click", function() {
        console.log("changing y axis");

        //change axis
        yLabel.text(category_y2)
        yLimits=getMaxMin(data, category_y2)
        y.domain([yLimits[0],yLimits[1]])
        yAxis.transition().duration(200)
        .call(yAxis_);

        //change plot
        scatter
        .selectAll("circle")
        .transition().duration(500).ease(d3.easeBackInOut)
        .attr("cy", function (d) { return y(d[category_y2]); } )
        

        //switch category_y and category_y2
        var temp=category_y
        category_y=category_y2
        category_y2=temp


    });

    //BRUSHING ON BOTH AXIS

    var brush = d3.brush().extent([[0, 0], [width, height]]).on("end", brushended),
    idleTimeout,
    idleDelay = 350;

    scatter.append("g")
    .attr("class", "brush")
    .call(brush);

    function brushended(event) {

        var s = event.selection;
        if (!s) {
            if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
            x.domain(d3.extent(data, function (d) { return d[category_x]; })).nice();
            y.domain(d3.extent(data, function (d) { return d[category_y]; })).nice();
        } else {
            
            x.domain([s[0][0], s[1][0]].map(x.invert, x));
            y.domain([s[1][1], s[0][1]].map(y.invert, y));
            scatter.select(".brush").call(brush.move, null);
        }
        zoom();
    }

    function idled() {
        idleTimeout = null;
    }

    function zoom() {
        xAxis.transition().call(xAxis_);
        yAxis.transition().call(yAxis_);
        scatter.selectAll("circle").transition()
        .attr("cx", function (d) { return x(d[category_x]); })
        .attr("cy", function (d) { return y(d[category_y]); });
    }


    //CREATE SCATTER PLOT and add interaction with mouse
    scatter
    .selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
        .attr("cx", function (d) { return x(d[category_x]); } )
        .attr("cy", function (d) { return y(d[category_y]); } )
        .attr("r", 3)
        .style("opacity", 0.5)
        .style("fill", "#69b3a2")
        .on("click", function(d) {
            //get related data
            console.log("selected element on scatter:",d)
            updateRadialPlot(d.originalTarget.__data__)
        })
        .on('mouseover', function (d, i) {
            d3.select(this).transition()
                  .duration(50)
                  .attr("r", 7)
                  .attr("stroke","black")
                  .attr("stroke-width",3)
                  .style("fill","red")
                  .style("opacity", 1)
        })
        .on('mouseout', function (d, i) {
            d3.select(this).transition()
                 .duration(200)
                 .attr("r", 3)
                 .attr("stroke","none")
                 .style("opacity", 0.5)
                 .style("fill","#69b3a2")
        })

    
}

function main() {
    const div_height = document.getElementById("scatter-plot-1").clientHeight;
    const div_width = document.getElementById("scatter-plot-1").clientWidth;

    // set the dimensions and margins of the graph
    const margin = {top: 10, right: 20, bottom: 60, left: 60},
    width = div_width - margin.left - margin.right,
    height = div_height - margin.top - margin.bottom;
    
    // append the svg object to the body of the page
    const svg = d3.select("#scatter-plot-1")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    //Read the data and plot the plots
    d3.csv("../tracks_small.csv",d3.autoType)
        .then( function(data){ 
            //get max and min for categories of radial plot (to nromalize)
            for(var i=0;i<categories.length;i++){
                limits=getMaxMin(data, categories[i]) //limits[0] is min, limits[1] is max
                cat_limits.push(limits)
            }
            console.log("limits:",cat_limits)
            ScatterPlotMain(data, margin, width, height, svg)
            radialPlotMain()
            
            })
        .catch((error) => console.log(error))
}

main();
