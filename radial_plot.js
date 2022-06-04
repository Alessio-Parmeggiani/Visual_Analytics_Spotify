
const svg = d3.select('svg');

const radius = 150;
const center = {x: 250, y: 200};

//song data
const categories=["speechiness","acousticness","instrumentalness","liveness","valence","tempo"]
var max_values=[1,2,3,4,5,6]
var song_values=[0.1,0.5,1.3,2.4,3.5,4]

//create song
var song=[]
for(var i=0;i<categories.length;i++){
  song.push( 
    {category:categories[i],
    value:song_values[i],
    max_value:max_values[i] })
}

const maxValue = d3.max(song_values);
const radialScale = d3.scaleLinear()
  .domain([0, maxValue]) 
  .range([0, radius]) 

//create circle plot
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

//create a linear scale for each category
var cat_scales=[]
for (let i=0;i<song.length;i++){
  cat_scales.push(d3.scaleLinear()
  .domain([0,song[i].max_value])
  .range([0,radius])
  )
}


//create the axis for the plot
axs=[]
for (let i=0; i<categories.length; i++){
  //create axis for this category
  axs.push(d3.axisRight()
  .scale(cat_scales[i])
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
  if (i>=cat_scales.length) return cat_scales[0](d.value)
  return cat_scales[i](d.value) } )
.angle((d, i) => (2*Math.PI / (categories.length)) * i)
.curve(d3.curveCatmullRom)

//add again first value so plot closes
song.push(song[0])

//add radial plot to page
svg.append('path')
  .datum(song)
  .attr('d', radial)
  .attr('fill', 'none')
  .attr('stroke', 'red')
  .attr('stroke-width', 3)
  .attr('transform', `translate(${center.x},${center.y})`)
  


  //other implementation
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