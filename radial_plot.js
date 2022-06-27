var radialPath;
var cat_radial_scale;
var radial_plot_center;

//this is called when I click a pint in the scatter plot
function updateRadialPlot(targetSong,named=true){
  var song=[]
  //console.log("limits", cat_limits)
  for(var i=0;i<categories.length;i++){
    var value=0
    if (named){
      value=norm_min_max(targetSong[categories[i]], cat_limits[i][0], cat_limits[i][1])
    }
    else {
      value=targetSong[i]
    }
      
    song.push( 
        {category: categories[i],value: value}) 
  }
  console.log("radial plot updated with values:", song)
  song.push(song[0])


  radial=d3.radialLine()
  .radius( function(d,i) { 
    // if is used for closure of plot
    if (i>=cat_radial_scale.length) return cat_radial_scale[0](d.value)
    return cat_radial_scale[i](d.value) } )
  .angle((d, i) => (2*Math.PI / (categories.length)) * i)
  .curve(d3.curveCatmullRom)

  radialPath
  .attr('transform', `translate(${radial_plot_center.x},${radial_plot_center.y})`)
  .transition()
  .attr('d', radial(song))
  .attr('fill', 'none')
  .attr('stroke', 'red')
  .attr('stroke-width', 3)
}
  
/*
  //create random song
  function create_song(categories) {
    var song=[]
    for(var i=0;i<categories.length;i++){
      song.push( 
        {category:categories[i],
        value:Math.random()})
    }
    return song
  }
*/

function radialPlotMain() {
  const svg = d3.select('#radial-graph')
    .append('svg');

  const div_height = document.getElementById("radial-graph").clientHeight;
  const div_width = document.getElementById("radial-graph").clientWidth;

  const radius = Math.min(div_width/2-(div_width*0.1), div_height/2-(div_height*0.15));
  console.log(radius);
  radial_plot_center= {x: div_width/2, y: div_height/2};
  center=radial_plot_center;

  //first song all 0
  var song=[]
    for(var i=0;i<categories.length;i++){
      song.push( 
        {category:categories[i],
        value:0
      })
    }
  song.push(song[0])
  

  //create circle plot
  //secondo me questo non serve a niente per fare i cerchi
  // ne fa sempre 5 indipendentemente da maxValue
  const maxValue = 1;
  const radialScale = d3.scaleLinear()
    .domain([0, maxValue]) 
    .range([0, radius]) 
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


  console.log("cat limits",cat_limits)
  //create a linear scale for each category
  cat_radial_scale=[]
  for (let i=0;i<song.length-1;i++){
    cat_radial_scale.push(d3.scaleLinear()
    //.domain([cat_limits[i][0],cat_limits[i][1]])
    .domain([0,1])
    .range([0,radius])
    )
  }

  
  //create the axis for the plot
  axs=[]
  for (let i=0; i<categories.length; i++){
    n_ticks=0
    if (i==0){
      n_ticks=5 
    }
    
    //create axis for this category
    axis=d3.axisRight()
        .scale(cat_radial_scale[i])
        .ticks(n_ticks)
    axs.push(axis)

    //insert axis, rotate axis and rotate text of ticks
    const angle = 180-(i * 360 / categories.length);

    //to do, move tick label so they are visible
    var tickTranslate=(angle/360)*20
    if (angle%180==0) tickTranslate=0
    tickTranslate=0

    var axisSvg=svg.append('g')
    .attr('transform', ` translate(${center.x},${center.y}) rotate(${angle})`)
    .call(axis)
    .style('fill-opacity', d => d === 0 ? 0.0 : 1.0)
    .selectAll("text")
    .attr("transform", "translate("+ (tickTranslate)+","+(tickTranslate)+") rotate(" + (-angle) + ")") 
    .style("text-anchor", "start");
    
    //axisSvg.call(axis).filter(function (d) { return d === 0;  }).remove()
    svg.selectAll(".tick")
    .each(function (d) {
        if ( d === 0 ) {
            this.remove();
        }
    });

    const angle_rad=i * Math.PI*2  / categories.length;
    const x = center.x + radius*1.2 * Math.sin(angle_rad);
    const y = center.y + radius*1.2 * -Math.cos(angle_rad);
    //console.log("label angle",angle_rad,categories[i])
    //add label
    svg.append('text')
      .text(categories[i])
      .attr('text-anchor', 'middle')
      .attr('x', x)
      .attr('y', y)
  }

  //create the plot
  radial=d3.radialLine()
  .radius( function(d,i) { 
    // if is used for closure of plot
    if (i>=cat_radial_scale.length) return cat_radial_scale[0](d.value)
    return cat_radial_scale[i](d.value) } )
  .angle((d, i) => (2*Math.PI / (categories.length)) * i)
  .curve(d3.curveCatmullRom)

  //add again first value so plot closes
  song.push(song[0])
  
  //add radial plot to page
  radialPath=svg.append('path')
    .datum(song)
    .attr('d', radial)
  
}


 