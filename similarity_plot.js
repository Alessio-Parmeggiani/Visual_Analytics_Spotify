let simil_svg;
let simil_plot;

function updateSimilarityPlot(main_element,simil_data,simil_artist_plot=true){

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
    .on('click', function(d) {
        if (simil_artist_plot) {
            scatter_artists.selectAll("circle")
            .each(function(current_artist){
                artist=current_artist[2]
                if (artist["artists"]==d["artists"]) {
                    d3.select(this).transition()
                    .attrs(select_attr)
                    .styles(select_style);
                    return
                }
            });
        }
        else{
            scatter_songs.selectAll("circle")
            .each(function(current_song){
                song=current_song[2]
                if (song["id"]==d["id"]) {
                    d3.select(this).transition()
                    .attrs(select_attr)
                    .styles(select_style);
                    return
                }
            });
        }
    })



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