var cat_limits=[];


//PCA FROM https://www.npmjs.com/package/pca-js

function ScatterPlotMain(data, margin, width, height, svg) {
    //create a new matrix that contain all the needed data to represent each song
    songsData=[];
    for(var i=0;i<data.length;i++){
        songData=[]
        for(var j=0;j<categories.length;j++){
            value=norm_min_max(data[i][categories[j]], cat_limits[j][0], cat_limits[j][1])
            songData.push(value)
        }
        songsData.push(songData)
    }
    console.log("songsData:",songsData)

    var PCAvectors = PCA.getEigenVectors(songsData);
    console.log("PCAvectors:",PCAvectors)
    var songsPCA_=PCA.computeAdjustedData(songsData,PCAvectors[0],PCAvectors[1])
    var songsPCA_=songsPCA_["adjustedData"]

    var songsPCA=[]
    for(var i=0;i<songsPCA_[0].length;i++){
        songsPCA.push([songsPCA_[0][i],songsPCA_[1][i],data[i]])
    }
    console.log("songsPCA:",songsPCA)

    console.log("analize PCA:")
    var firstV = PCA.computePercentageExplained(PCAvectors,PCAvectors[0])
    console.log("first:",firstV)
    var topTwoV = PCA.computePercentageExplained(PCAvectors,PCAvectors[0],PCAvectors[1])
    console.log("topTwo:",topTwoV)

    var xLimits=getMaxMin(songsPCA, 0)
    var yLimits=getMaxMin(songsPCA, 1)

    var category_x=0
    var category_y=1

    /*
    var category_x="year"
    var category_y="tempo"
    var category_y2="valence"

    var xLimits=getMaxMin(data, category_x)
    var yLimits=getMaxMin(data, category_y)
    */

    // Add X and Y axis
    var x = d3.scaleLinear()
    .domain([xLimits[0], xLimits[1]])
    .range([ 0, width ]);

    var y = d3.scaleLinear()
    .domain([yLimits[0],yLimits[1]])
    .range([ height, 0]);

    //ticks don't indicate anything
    var xAxis_ = d3.axisBottom(x).ticks(0, ".0f")
    var yAxis_=d3.axisLeft(y).ticks(0, ".0f")

    var xAxis=svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .attr('id', "axis--x")
    .call(xAxis_) 

    var yAxis=svg.append("g")
    .attr('id', "axis--y")
    .call(yAxis_);

    //label for x axis
    /*
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + 45)
        .text(category_x);
    */
    // Y axis label:
    /*
    var yLabel = svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left+20)
        .attr("x", -margin.top)
        .text(category_y)
    */

    


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
    /*
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
    */
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
            x.domain(d3.extent(songsPCA, function (d) { return d[category_x]; })).nice();
            y.domain(d3.extent(songsPCA, function (d) { return d[category_y]; })).nice();
            
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
    //.data(data)
    .data(songsPCA)
    .enter()
    .append("circle")
        //.attr("cx", function (d) { return x(d[category_x]); } )
        //.attr("cy", function (d) { return y(d[category_y]); } )
        //PCA
        .attr("cx", function (d) { return x(d[category_x]); } )
        .attr("cy", function (d) { return y(d[category_y]); } )
        .attr("r", 3)
        .style("opacity", 0.5)
        .style("fill", "#69b3a2")
        
        .on("click", function(d) {
            //get related data
            console.log("selected element on scatter:",d)
            updateRadialPlot(d.originalTarget.__data__)
            showStats(d.originalTarget.__data__)
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
