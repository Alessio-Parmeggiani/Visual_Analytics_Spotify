var radialPath;
var similRadialPaths=[];
var cat_radial_scale;
var radial_plot_center;

//this is called when I click a pint in the scatter plot
function updateRadialPlot(targetSong,simil,this_artist,named=true){
  //console.log("UPDATE RADIAL PLOT\n\n")
  var song={"original":targetSong,"radial_data":[]}
  //console.log("limits", cat_limits)
  var targetSongNoCoords=targetSong[2];
  for(var i=0;i<categories.length;i++){
    var value=0
    if (named){
      value=norm_min_max(targetSongNoCoords[categories[i]], cat_limits[i][0], cat_limits[i][1])
    }
    else {
      value=targetSongNoCoords[i]
    }
      
    song.radial_data.push( 
        {category: categories[i],value: value}) 
  }
  //console.log("radial plot updated with values:", song)
  song.radial_data.push(song.radial_data[0])

  let simil_songs=[]
  for (var j=0;j<simil.length;j++){
    let simil_song={"original":simil[j]["data"],"radial_data":[]}

    let processed_song=simil[j]["data"][2]
    for(var i=0;i<categories.length;i++){
      var value=0
      if (named){
        value=norm_min_max(processed_song[categories[i]], cat_limits[i][0], cat_limits[i][1])
      }
      else {
        value=processed_song[i]
      }
        
      simil_song.radial_data.push( 
          {category: categories[i], value: value}) 
    }
    simil_song.radial_data.push(simil_song.radial_data[0])
    simil_songs.push(simil_song)
  }
  console.log("simil songs",simil_songs)



  radial=d3.radialLine()
  .radius( function(d,i) { 
    // if is used for closure of plot
    if (i>=cat_radial_scale.length) return cat_radial_scale[0](d.value)
    return cat_radial_scale[i](d.value) } )
  .angle((d, i) => (2*Math.PI / (categories.length)) * i)
  .curve(d3.curveCatmullRom)
  
  

  

  for (var simil_idx=0;simil_idx<simil.length;simil_idx++){
    similRadialPaths[simil_idx]
    .attr('transform', `translate(${radial_plot_center.x},${radial_plot_center.y})`)
    .datum(simil_songs[simil_idx].original)
    .transition()
    .attr('d', radial(simil_songs[simil_idx].radial_data))
    .attr('fill', 'none')
    .attr('stroke', simil_colors[simil_idx])
    .attr('stroke-width', 3)
    
  }
  
  radialPath
  .attr('transform', `translate(${radial_plot_center.x},${radial_plot_center.y})`)
  .datum(song.original)
  .transition()
  .attr('d', radial(song.radial_data))
  .attr('fill', 'none')
  .attr('stroke', 'red')
  .attr('stroke-width', 4)


  d3.selectAll(".radialPath").on("click", function(d) {
    radialClick(d,this_artist)
  })
  .on("mouseover", function(d) {
    d3.select(this).attr('stroke-width', 5)
   })
   .on("mouseout", function(d) {
    d3.select(this).attr('stroke-width', 4)
   });
  
   d3.selectAll(".similRadialPath").on("click", function(d) {
    radialClick(d,this_artist)
  })
  .on("mouseover", function(d) {
    d3.select(this).attr('stroke-width', 4)
   })
   .on("mouseout", function(d) {
    d3.select(this).attr('stroke-width', 3)
   });


}
  
function radialClick(d,this_artist){
  //console.log("radial click",d)
  console.log("radial click",d)
  onClick(this_artist,d.originalTarget.__data__)
}

function radialPlotMain() {
  const svg = d3.select('#radial-graph')
    .append('svg');

  const div_height = document.getElementById("radial-graph").clientHeight;
  const div_width = document.getElementById("radial-graph").clientWidth;

  const radius = Math.min(div_width/2-(div_width*0.1), div_height/2-(div_height*0.15));
  //console.log(radius);
  radial_plot_center= {x: div_width/2, y: div_height/2};
  center=radial_plot_center;

  //initialize plot with empty data
  var song=[]
    for(var i=0;i<categories.length;i++){
      song.push( 
        {category:categories[i],
        value:0
      })
    }
  song.push(song[0])

  let simil_songs=[]
  for (var j=0;j<K_nearest;j++){
    let simil_song=[]
    for(var i=0;i<categories.length;i++){
      simil_song.push({category: categories[i], value: 0}) 
    }
    simil_song.push(simil_song[0])
    simil_songs.push(simil_song)
  }


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
  


  //console.log("cat limits",cat_limits)
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
    const x = center.x + radius*1.3 * Math.sin(angle_rad);
    const y = center.y + radius*1.3 * -Math.cos(angle_rad);
    //console.log("label angle",angle_rad,categories[i])
    let text_rotate=10
    //if (i%2!=0) text_rotate=10
    console.log("text ",categories[i],"rotate",text_rotate)
    //add label
    svg.append('text')
      .text(categories[i])
      .style('text-anchor', 'middle')
      .style("font-size", "10px")
      //.attr('transform', `translate(${x},${y})`)
      .attr('x', x)
      .attr('y', y)
      .attr("class", "radial-category-label")
      
    svg.selectAll(".radial-category-label")
    //.style("text-anchor", "end")
    .attr('transform', (d,i)=>{
      return 'rotate(0)';})

  }

  //create the plot
  radial=d3.radialLine()
  .radius( function(d,i) { 
    // if is used for closure of plot
    if (i>=cat_radial_scale.length) return cat_radial_scale[0](d.value)
    return cat_radial_scale[i](d.value) } )
  .angle((d, i) => (2*Math.PI / (categories.length)) * i)
  .curve(d3.curveCatmullRom)

    //add similar songs to plot
  for (let i=0; i<K_nearest; i++){
    let similRadialPath=svg.append('path')
    .datum(simil_songs[i])
    .attr('d', radial)
    .attr("class", "similRadialPath")


    similRadialPaths.push(similRadialPath)
  }

  //add radial plot to page
  radialPath=svg.append('path')
    .datum(song)
    .attr('d', radial)
    .attr("class", "radialPath")

    
  d3.selectAll(".radialPath").on("click", function(d) {
    radialClick(d)
  });
}


 