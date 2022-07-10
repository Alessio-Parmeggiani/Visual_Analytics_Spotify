let simil_svg;
let simil_plot;

function updateSimilarityPlot(main_element,simil_data){

    simil_plot=svg.append('g')

    let max_size=50;
    let max_distance=500;
    let simil_scale = d3.scaleLinear()
    .domain([0,max_distance])
    .range([ 1, max_size ]);

    simil_plot
    .selectAll(".dot")
    //.data(data)
    .data(simil_data)
    .enter()
    .append("circle")
    .transition()
    .attrs(base_attr)
    .attr("r",function (d) {
        let distance=100
        return distance
    })
    .styles(base_style)
}
function similarityPlot(){
    simil_svg=d3.select('#simil-graph').append('svg');
    simil_plot=simil_svg.append('g')

    //depends on selected number of similar artists
    let start_data=[0,0,0,0,0]

    simil_plot
    .selectAll(".dot")
    //.data(data)
    .data(start_data)
    .enter()
    .append("circle")
        .attr("cx", function (d,i) { return i*50; } )
        .attr("cy", function (d) { return 50; } )
        .attrs(base_attr)
        .attr("r",1)
        .styles(base_style)
}