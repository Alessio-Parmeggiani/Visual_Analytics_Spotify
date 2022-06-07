//what to plot when a song is selected in radial plot
const categories=["speechiness","acousticness","instrumentalness","liveness","valence","tempo"]
var radialPath;
var cat_radial_scale;
var radial_plot_center;

//this is called when I click a pint in the scatter plot
function updateRadialPlot(targetSong){

  var song=[]
  console.log("limits", cat_limits)
  for(var i=0;i<categories.length;i++){
    song.push( 
      {category:categories[i],
      value:  (targetSong[categories[i]] - cat_limits[i][0]) / (cat_limits[i][1] - cat_limits[i][0]) ,
      })
  }
  console.log("selected song is ", song)
  song.push(song[0])


  radial=d3.radialLine()
  .radius( function(d,i) { 
    // if is used for closure of plot
    if (i>=cat_radial_scale.length) return cat_radial_scale[0](d.value)
    return cat_radial_scale[i](d.value) } )
  .angle((d, i) => (2*Math.PI / (categories.length)) * i)
  .curve(d3.curveCatmullRom)

  radialPath
  .attr('transform', `translate(${center.x},${center.y})`)
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
    //create axis for this category
    axs.push(d3.axisRight()
    .scale(cat_radial_scale[i])
    .ticks(5)
    )

    //insert axis, rotate axis and rotate text of ticks
    const angle = i * 360 / categories.length;
    svg.append('g')
    .attr('transform', ` translate(${center.x},${center.y}) rotate(${angle})`)
    .call(axs[i])
    .selectAll("text")
    .attr("transform", "rotate(" + (-angle) + ")")
    .style("text-anchor", "start");

    const angle_rad=i * Math.PI*2  / categories.length;
    const x = center.x + radius*1.2 * Math.sin(angle_rad);
    const y = center.y + radius*1.2 * -Math.cos(angle_rad);

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
    .attr('fill', 'none')
    .attr('stroke', 'red')
    .attr('stroke-width', 3)
    .attr('transform', `translate(${center.x},${center.y})`)
  

    
}


 