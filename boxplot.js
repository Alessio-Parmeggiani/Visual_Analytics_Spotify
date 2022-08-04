let verticalLine;
let horizontalLine;
let box;

//box, verticalLine, horizontalLine for similar elements
let similVerticalLines=[];
let similHorizontalLines=[];
let similBoxes=[];


let x_scale;
let y_scale;
let boxPlotSvg;
//https://d3-graph-gallery.com/graph/boxplot_several_groups.html
function update_boxplot(songs_data,simil_data,original_data,original_similar_data,this_artist){
    console.log("update_boxplot",songs_data);
    let boxWidth=15;
    let similBoxWidth=5;

    for (var i=0;i<K_nearest;i++){
        
        let offset_x=i*(boxWidth+similBoxWidth)+1;
        offset_x=boxWidth/2+ i*5 +5
        let current_data=simil_data[i];
        let current_color=simil_colors[i];

       

        similVerticalLines[i]
        .data(current_data)
        .attr("d",current_data)
        .transition()
        .attr("x1", d=> x_scale(d.category)+offset_x)
        .attr("x2", d=> x_scale(d.category)+offset_x)
        .attr("y1", d=> y_scale(d.min) )
        .attr("y2", d=> y_scale(d.max)  )
        .attr("stroke", "black")
        .attr("stroke-width", 0.5)

        //verticalLine.exit().remove()
        //qui occhio a come vede gli array, per ogni d devo passare un elmento non tutti
        let custom_data={"data":current_data,"original":original_similar_data[i]};
        /*let custom_data=[];
        for (var j=0;j<current_data.length;j++){
            custom_data.push({"data":current_data[j],"original":original_similar_data[i]});
        }*/
        
        // Show the box
        similBoxes[i]
        .datum(custom_data)
        .transition()
        .attr("x", function(d,i)  {
            return x_scale(d.data[i].category) - similBoxWidth/2 +offset_x})
        .attr("y", function(d,i){return y_scale(d.data[i].q3) })
        .attr("height", function(d,i){ 
            return Math.max((y_scale(d.data[i].q1)-y_scale(d.data[i].q3)),5) 
        })
        .attr("width", similBoxWidth )
        .attr("stroke", "black")
        .style("fill", current_color)
        .attr("stroke-width", 0.5)
        
        
        // show median, min and max horizontal lines
        similHorizontalLines[i]
        .data(current_data)
        .attr("d",current_data)
        .transition()
        .attr("x1", d=>{return x_scale(d.category)-similBoxWidth/2 +offset_x})
        .attr("x2", d=>{return x_scale(d.category)+similBoxWidth/2 +offset_x})
        .attr("y1", function(d){ return(y_scale(d.median))} )
        .attr("y2", function(d){ return(y_scale(d.median))} )
        .attr("stroke", "black")
        .attr("stroke-width", 0.5)
    }

    verticalLine
    .data(songs_data)
    .attr("d",songs_data)
    .transition()
    .attr("x1", d=> x_scale(d.category))
    .attr("x2", d=> x_scale(d.category))
    .attr("y1", d=> y_scale(d.min) )
    .attr("y2", d=> y_scale(d.max)  )
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    
    // Show the box
    let custom_data={"data":songs_data,"original":original_data};
    box.datum(custom_data)
    .transition()
    .attr("x", function(d,i)  {return x_scale(d.data[i].category) - boxWidth/2})
    .attr("y", function(d,i){return y_scale(d.data[i].q3) })
    .attr("height", function(d,i){ 
        return Math.max((y_scale(d.data[i].q1)-y_scale(d.data[i].q3)),5) 
    })
    .attr("width", boxWidth )
    .attr("stroke", "black")
    .style("fill", highlight_color)
    
    // show median, min and max horizontal lines
    horizontalLine.data(songs_data)
    .attr("d",songs_data)
    .transition()
    .attr("x1", d=>{return x_scale(d.category)-boxWidth/2})
    .attr("x2", d=>{return x_scale(d.category)+boxWidth/2})
    .attr("y1", function(d){ return(y_scale(d.median))} )
    .attr("y2", function(d){ return(y_scale(d.median))} )
    .attr("stroke", "black")
    .attr("stroke-width", 2)

    
  d3.selectAll(".boxPlot")
  /*.on("click", function(d) {
    //console.log("clicked",d);
    onClick(this_artist,d.originalTarget.__data__.original)
  })
  */
  .on("mouseover", function(d) {
    d3.select(this).attr('stroke-width', 5)
   })
   .on("mouseout", function(d) {
    d3.select(this).attr('stroke-width', 1)
   });

   d3.selectAll(".boxPlotSimil").on("click", function(d) {
    //.log("clicked",d);
    onClick(this_artist,d.originalTarget.__data__.original.data)
  })
  .on("mouseover", function(d) {
    d3.select(this)
    .transition(50)
    .attr('stroke-width', 3)
    .attr("width", similBoxWidth*1.5 )
    //onMouseOver(this_artist,d.originalTarget.__data__.original.data)
   })
   .on("mouseout", function(d) {
    d3.select(this)
    .transition(50)
    .attr('stroke-width', 0.5)
    .attr("width", similBoxWidth )
   });
}

function boxPlotMain() {

    boxPlotSvg = d3.select('#other-graph')
    .append('svg');
    

    const height = document.getElementById("other-graph").clientHeight;
    const width = document.getElementById("other-graph").clientWidth;
    const margin_left=50;
    const margin_right=20;
    const margin_top=10;
    const margin_bottom=80;

    x_scale = d3.scaleBand()
    .range([ margin_left, width-margin_right ])
    .domain(categories)
    .paddingInner(1)
    .paddingOuter(.5);

    boxPlotSvg.append("g")
    .attr("transform", "translate(0," + (height-margin_bottom) + ")")
    .call(d3.axisBottom(x_scale))
    .selectAll("text")  
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-45)");

    // Show the Y scale
    y_scale = d3.scaleLinear()
    .domain([0,1])
    .range([height-margin_bottom, margin_top]);
    
    //svg.call(d3.axisLeft(y_scale))
    boxPlotSvg.append("g")
    .attr("transform", "translate("+(margin_left) + ",0)")
    .call(d3.axisLeft(y_scale))


    let start_data=[]
    for(var i=0;i<categories.length;i++){
        sample_data={}
        sample_data.category=categories[i];
        sample_data.min=0;
        sample_data.max=0;
        sample_data.q1=0;
        sample_data.q3=0;
        sample_data.median=0;
        sample_data.iqr=0;
        sample_data.upper=0;
        sample_data.lower=0;
        start_data.push(sample_data)
    }
    // Show the main vertical line
    verticalLine=boxPlotSvg
    .selectAll("vertLines")
    .data(start_data)
    .enter()
    .append("line")
    .attr("x1", d=> x_scale(d.category))
    .attr("x2", d=> x_scale(d.category))
    .attr("y1", d=> y_scale(d.min) )
    .attr("y2", d=> y_scale(d.max)  )
    .attr("stroke", "black")

    for (var i = 0; i < K_nearest; i++) {
        let similVerticalLine=boxPlotSvg
        .selectAll("vertLines")
        .data(start_data)
        .enter()
        .append("line")
        .attr("x1", d=> x_scale(d.category))
        .attr("x2", d=> x_scale(d.category))
        .attr("y1", d=> y_scale(d.min) )
        .attr("y2", d=> y_scale(d.max)  )
        .attr("stroke", "black")
        similVerticalLines.push(similVerticalLine)
    }

    let boxWidth=10;
    // Show the box
    box=boxPlotSvg
    .selectAll("boxes")
    .data(start_data)
    .enter()
    .append("rect")
    .attr("rx", 1)
    .attr("ry", 1)
    .attr("x", d=> x_scale(d.category) - boxWidth/2)
    .attr("y", d=> y_scale(d.q3) )
    .attr("height", d=> y_scale(d.q1)-y_scale(d.q3) )
    .attr("width", boxWidth )
    .attr("stroke", "black")
    .style("fill", highlight_color)
    .attr("class", "boxPlot")

    for(var i=0;i<K_nearest;i++){
        let similBox=boxPlotSvg
        .selectAll("boxes")
        .data(start_data)
        .enter()
        .append("rect")
        .attr("rx", 1)
        .attr("ry", 1)
        .attr("x", d=> x_scale(d.category) - boxWidth/2)
        .attr("y", d=> y_scale(d.q3) )
        .attr("height", d=> y_scale(d.q1)-y_scale(d.q3) )
        .attr("width", boxWidth )
        .attr("stroke", "black")
        .style("fill", "#69b3a2")
        .attr("class", "boxPlotSimil");

        similBoxes.push(similBox)
    }


    // show median, min and max horizontal lines
    horizontalLine=boxPlotSvg
    .selectAll("medianLines")
    .data(start_data)
    .enter()
    .append("line")
    .attr("x1", d=> x_scale(d.category)-boxWidth/2)
    .attr("x2", d=> x_scale(d.category)+boxWidth/2)
    .attr("y1", function(d){ return(y_scale(d.median))} )
    .attr("y2", function(d){ return(y_scale(d.median))} )
    .attr("stroke", "black")

    for(var i=0;i<K_nearest;i++){
        let similHorizontalLine=boxPlotSvg
        .selectAll("medianLines")
        .data(start_data)
        .enter()
        .append("line")
        .attr("x1", d=> x_scale(d.category)-boxWidth/2)
        .attr("x2", d=> x_scale(d.category)+boxWidth/2)
        .attr("y1", function(d){ return(y_scale(d.median))} )
        .attr("y2", function(d){ return(y_scale(d.median))} )
        .attr("stroke", "black");
        similHorizontalLines.push(similHorizontalLine)
    }
}