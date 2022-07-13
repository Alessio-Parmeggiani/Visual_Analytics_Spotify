let simil_svg;
let simil_plot;

function isSame(elem1,elem2,artist){
    if (artist) {
        return elem1["artists"]==elem2["artists"]
    }
    else{
        return elem1["id"]==elem2["id"]
    }
}

function updateSimilarityPlot(simil_data,artist_plot){

    console.log("simil:",simil_data)
    //simil_plot=simil_svg.append('g')

    let max_size=40;
    let max_distance;
    if (artist_plot) 
        max_distance=get_distance(xLimitsArtists[0],xLimitsArtists[1],yLimitsArtists[0],yLimitsArtists[1]);
    else 
        max_distance=get_distance(xLimitsSongs[0],xLimitsSongs[1],yLimitsSongs[0],yLimitsSongs[1]);
    console.log("max_distance:",max_distance)

    let simil_scale = d3.scaleLinear()
    .domain([0,max_distance/5])
    .range([ max_size, 1 ])
    .clamp(true);

    simil_plot
    .selectAll("circle")
    .data(simil_data)
    //.attr("d",simil_data)
    .attr("r",function(d){
        console.log("distance:",d["distance"],"became: ", simil_scale(d["distance"]))
        return simil_scale(d["distance"])})
    .styles(simil_plot_style)
    //.style("fill", "red")


}
function similarityPlot(){
    simil_svg=d3.select('#simil-graph').append('svg');
    simil_plot=simil_svg.append('g')

    //depends on selected number of similar artists
    let start_data=[];
    for (let i=0;i<K_nearest;i++){
        start_data.push({
            "data":null,
            "distance": 0,
        })
    }

    simil_plot
    .selectAll("circle")
    .data(start_data)
    .enter()
    .append("circle")
    //qui la x andrebbe decisa in base alla larghezza del box - margini
    //la y è fissa e dovrebbe stare a metà del box
        .attr("cx", function (d,i) { return 50+(i+1)*100; } )
        .attr("cy", function (d) { return 75; } )
        .attrs(base_attr)
        .attr("r",30)
        .styles(inactive_style)
        //highlight if mouse passing over
        .on("mouseover", function(d) {
            if (selected_artist) {
                d=d.originalTarget.__data__["data"][2]
                d3.select(this).transition(50).style("fill", "red");
                
                let selecting_scatter;
                if (selected_song) selecting_scatter=scatter_songs;
                else selecting_scatter=scatter_artists;

                selecting_scatter.selectAll(".similar")
                    .each(function(scatter_elem){
                        
                        console.log("comparing:",scatter_elem,"with",d)
                        
                        if (isSame(d,scatter_elem[2],!selected_song)){
                            d3.select(this)
                            .transition()
                            .duration(50)
                            .attrs(over_attr)
                            .styles(over_style)
                        }
                    });
            }
        })
        .on("mouseout", function(d) {
            if (selected_artist) {
                d=d.originalTarget.__data__["data"][2]
                d3.select(this).transition(50).styles(simil_plot_style);
                
                let selecting_scatter;
                if (selected_song) selecting_scatter=scatter_songs;
                else selecting_scatter=scatter_artists;

                selecting_scatter.selectAll(".similar")
                    .each(function(scatter_elem){                      
                        console.log("comparing:",scatter_elem,"with",d)
                        if (!isSame(d,scatter_elem[2],!selected_song)){
                            d3.select(this)
                            .transition()
                            .duration(50)
                            .attrs(simil_attr)
                            .styles(simil_style)
                        }
                    });
            }
        })
        .on('click', function(d) {
            console.log("clicked:",d)
            d=d.originalTarget.__data__["data"][2]
            console.log("clicked:",d)

            if (selected_song) {
                scatter_songs.selectAll(".similar")
                .each(function(current_song){
                    song=current_song[2]
                    
                    if (song["id"]==d["id"]) {
                        d3.select(this).transition()
                        .attrs(highlight_attr)
                        .styles(highlight_style);
                        return
                    }
                    d3.select(this)
                    .transition()
                    .duration(50)
                    .attrs(simil_attr)
                    .styles(simil_style)
                });
            }
            else{
                scatter_artists.selectAll(".similar")
                .each(function(current_artist){
                    console.log("current_artist:",current_artist)
                    artist=current_artist[2]
                    console.log("comparing:",artist["artists"],"with:",d["artists"])
                    if (artist["artists"]==d["artists"]) {
                        d3.select(this).transition()
                        .attrs(highlight_attr)
                        .styles(highlight_style);
                        return
                    }
                    d3.select(this)
                    .transition()
                    .duration(50)
                    .attrs(simil_attr)
                    .styles(simil_style)
                });
            }

        })
}