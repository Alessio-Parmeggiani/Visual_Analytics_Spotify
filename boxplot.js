let vertical_line;
let horizontal_line;
let box;
let x_scale;
let y_scale;
let boxPlotSvg;
//https://d3-graph-gallery.com/graph/boxplot_several_groups.html
function update_boxplot(songs_data){
    console.log("update_boxplot",songs_data);
    
    /*
    altor tentaivo
    vertical_line=
    boxPlotSvg
    .selectAll("vertLines")
    .data(songs_data)
    .enter()
    .append("line")
    .attr("d",songs_data)
    */
    vertical_line
    .data(songs_data)
    .attr("d",songs_data)
    .transition()
    .attr("x1", d=> x_scale(d.category))
    .attr("x2", d=> x_scale(d.category))
    .attr("y1", d=> y_scale(d.min) )
    .attr("y2", d=> y_scale(d.max)  )
    .attr("stroke", "black")

    //vertical_line.exit().remove()
    let boxWidth=10;
    
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
    horizontal_line.data(songs_data)
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
    const margin_bottom=40;

    x_scale = d3.scaleBand()
    .range([ margin_left, width-margin_right ])
    .domain(categories)
    .paddingInner(1)
    .paddingOuter(.5);

    boxPlotSvg.append("g")
    .attr("transform", "translate(0," + (height-margin_bottom) + ")")
    .call(d3.axisBottom(x_scale))

    // Show the Y scale
    y_scale = d3.scaleLinear()
    .domain([0,1])
    .range([height-margin_bottom, margin_top]);
    
    //svg.call(d3.axisLeft(y_scale))
    boxPlotSvg.append("g")
    .attr("transform", "translate("+(margin_left) + ",0)")
    .call(d3.axisLeft(y_scale))

    let min=0;max=0;boxPlotCenter=0;q1=0;q3=0;median=0;
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
    vertical_line=boxPlotSvg
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
    box=boxPlotSvg
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
    horizontal_line=boxPlotSvg
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