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
function update_boxplot(songs_data,simil_data){
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

        //verticalLine.exit().remove()
        
        
        // Show the box
        similBoxes[i]
        .data(current_data)
        .attr("d",current_data)
        .transition()
        .attr("x", d=>  { return x_scale(d.category) - similBoxWidth/2 +offset_x})
        .attr("y", d=> y_scale(d.q3) )
        .attr("height", d=> {
            return Math.max((y_scale(d.q1)-y_scale(d.q3)),5) 
        })
        .attr("width", similBoxWidth )
        .attr("stroke", "black")
        .style("fill", current_color)
        
        // show median, min and max horizontal lines
        similHorizontalLines[i].data(current_data)
        .attr("d",current_data)
        .transition()
        .attr("x1", d=>{return x_scale(d.category)-similBoxWidth/2 +offset_x})
        .attr("x2", d=>{return x_scale(d.category)+similBoxWidth/2 +offset_x})
        .attr("y1", function(d){ return(y_scale(d.median))} )
        .attr("y2", function(d){ return(y_scale(d.median))} )
        .attr("stroke", "black")
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
    
    // Show the box
    
    box.data(songs_data)
    .attr("d",songs_data)
    .transition()
    .attr("x", d=>  { return x_scale(d.category) - boxWidth/2})
    .attr("y", d=> y_scale(d.q3) )
    .attr("height", d=> {
        return Math.max((y_scale(d.q1)-y_scale(d.q3)),5) 
    })
    .attr("width", boxWidth )
    .attr("stroke", "black")
    .style("fill", "#69b3a2")
    
    // show median, min and max horizontal lines
    horizontalLine.data(songs_data)
    .attr("d",songs_data)
    .transition()
    .attr("x1", d=>{return x_scale(d.category)-boxWidth/2})
    .attr("x2", d=>{return x_scale(d.category)+boxWidth/2})
    .attr("y1", function(d){ return(y_scale(d.median))} )
    .attr("y2", function(d){ return(y_scale(d.median))} )
    .attr("stroke", "black")

    
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
    .attr("x", d=> x_scale(d.category) - boxWidth/2)
    .attr("y", d=> y_scale(d.q3) )
    .attr("height", d=> y_scale(d.q1)-y_scale(d.q3) )
    .attr("width", boxWidth )
    .attr("stroke", "black")
    .style("fill", "#69b3a2")

    for(var i=0;i<K_nearest;i++){
        let similBox=boxPlotSvg
        .selectAll("boxes")
        .data(start_data)
        .enter()
        .append("rect")
        .attr("x", d=> x_scale(d.category) - boxWidth/2)
        .attr("y", d=> y_scale(d.q3) )
        .attr("height", d=> y_scale(d.q1)-y_scale(d.q3) )
        .attr("width", boxWidth )
        .attr("stroke", "black")
        .style("fill", "#69b3a2");
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