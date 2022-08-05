var cat_limits=[];
const categories = ["tempo","danceability","liveness","energy","valence","loudness",
"acousticness","instrumentalness","speechiness"]
let filterLimits = {};

let scatter_artists;
let scatter_songs;
let selected_artist;
let selected_song;
let artistsPCA;
let songsPCA;

let tooltip_div;

let highlighted_element;

let xLimitsSongs;
let yLimitsSongs;

let xLimitArtists;
let yLimitArtists;

let xLimits;
let yLimits;

let x;
let y;

let K_nearest=5;
let nearest_elements;

let searchArray = [];

let displayedArtists = [];
let displayedSongs = [];
let artistsNonDuplicates = [];
//PCA FROM https://www.npmjs.com/package/pca-js

//https://observablehq.com/@d3/color-schemes
let simil_colors=["#7fc97f","#beaed4","#fdc086","#ffff99","#386cb0","#f0027f","#bf5b17","#666666"]

function get_distance(x1,x2,y1,y2){
    return Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2))
}

function get_k_nearest_elements(this_artist,selected_elem){
    console.log("selecting similar to:",selected_elem)
    let nearest_scatter=null;
    if (this_artist) { nearest_scatter=scatter_artists }
    else { nearest_scatter=scatter_songs }
    let nearest_elements=[]
    nearest_scatter.selectAll("circle")
    .each(function(d){
        if (nearest_elements.length>=2){
            nearest_elements.sort(function(a, b) {return a["distance"] - b["distance"];});
        }
        distance=get_distance(d[0],selected_elem[0],d[1],selected_elem[1])
        //ignore selected element
        if (this_artist && d[2]["artists"]==selected_elem[2]["artists"]){ return }
        if (!this_artist && d[2]["id"]==selected_elem[2]["id"]){ return }
        //select K nearest elements of selected artist
        if (nearest_elements.length<K_nearest){
            nearest_elements.push({"data":d,"distance":distance})
            return
        }
        //compare with nearest elements
        for (let i=0;i<K_nearest;i++){
            if (distance<nearest_elements[i]["distance"]){
                //add this element to the list
                nearest_elements.splice(i,0,{"data":d,"distance":distance})
                //delete last element of array
                if (nearest_elements.length>K_nearest){
                    nearest_elements.pop()
                }
                break
            }
        }
    })
    console.log("nearest elements:",nearest_elements)
    return nearest_elements
}


function onClick(this_artist,d) {
    // I use this structure in order use the this_artist variable defined in scatterPlotMain

    //get related data
    
    //an artist is selected both if click on songs and artists
    selected_artist=d[2]
    console.log("SELECTED ELEMENT",d)
    
    //some debug info
    if (this_artist) {
        console.log("selected artist:",d[2])    // QUI ORIGINALTARGET È DA CAMBIARE, NON È COMPATIBILE CON NESSUN BROWSER CHE NON SIA FIREFOX
    }
    else  console.log("selected song:",d[2])

    //reset all songs style
    scatter_songs.selectAll("circle").transition().duration(100)
    .attrs(base_attr)
    .styles(base_style)
    
    //get K nearest elements 
    nearest_elements=get_k_nearest_elements(this_artist,d)
    console.log("I nearest elements sono:")
    console.log(nearest_elements)
    
    updateRadialPlot(d,nearest_elements,this_artist)
    // Show stats for the selected song and for the 5 closest ones
    showStats(d[2], 0, this_artist)
    showStats(nearest_elements[0]["data"][2], 1, this_artist)
    showStats(nearest_elements[1]["data"][2], 2, this_artist)
    showStats(nearest_elements[2]["data"][2], 3, this_artist)
    showStats(nearest_elements[3]["data"][2], 4, this_artist)
    showStats(nearest_elements[4]["data"][2], 5, this_artist)

    //get songs of this artist 
    //needed for boxplot
    let current_artist_songs=[]
    //initialize array of K_nearest empty arrays
    let similar_artists_songs= new Array(K_nearest).fill([]).map(() => new Array(1).fill([]));

    scatter_songs.selectAll("circle")
    .each(function(d){
        song=d[2]
        if (song["artists"]==selected_artist["artists"]) {
            current_artist_songs.push(song)
            //song selected by clicking on artist
            if (this_artist) {
                d3.select(this).transition()
                .attrs(select_attr)
                .styles(select_style);

                d3.select(this).moveToFront()
            }
        }
        else {
        //if song artist is in the nearest elements add to corresponding array
            for (let k=0;k<K_nearest;k++){
                if (song["artists"]==nearest_elements[k]["data"][2]["artists"]){
                    similar_artists_songs[k].push(song)
                }
            }
        }
    });
    //update boxplot
    console.log("current artist songs:",current_artist_songs)
    console.log("similar artists songs:",similar_artists_songs)
    let similar_boxplot_songs_data=[]
    for (let i=0;i<K_nearest;i++){
        let similar_boxplot_song_data=compute_boxplot_data(similar_artists_songs[i])
        similar_boxplot_songs_data.push(similar_boxplot_song_data)
    }
    let boxplot_songs_data=compute_boxplot_data(current_artist_songs)

    update_boxplot(boxplot_songs_data,similar_boxplot_songs_data,d,nearest_elements,this_artist)

    //CLICK ON ARTIST SCATTERPLOT
    if (this_artist) {
        //now an artist is selected, not a song
        selected_song=null

        //all other artists return to base style
        scatter_artists.selectAll("circle")
            .each(function(d){
                let artist=d[2]
                d3.select(this).attr("class","circle");
                if (selected_artist){
                    if (artist["artists"]!=selected_artist["artists"]){

                        let is_simil=false
                        for(var simil_idx=0;simil_idx<K_nearest;simil_idx++){
                            if( artist["artists"]==nearest_elements[simil_idx]["data"][2]["artists"]){
                                is_simil=true
                                d3.select(this).transition()
                                .attrs(simil_attr)
                                .styles(simil_style)
                                .style("fill",simil_colors[simil_idx])
                                .attr("class","similar")

                                d3.select(this).moveToFront()
                            }
                        }
                        if(!is_simil){
                        d3.select(this).transition()
                        .attrs(base_attr)
                        .styles(base_style)
                        }
                    }
                    else {
                        d3.select(this).transition()
                        .attrs(highlight_attr)
                        .styles(highlight_style)

                        highlighted_element=d3.select(this)
                    }
                }

            })
    }

    //CLICK ON SONG SCATTERPLOT
    else{

        selected_song=d[2]

        //highlight artist of selected song
        scatter_artists.selectAll("circle")
            .each(function(d){
                d3.select(this).attr("class","circle");

                const artist=d[2]
                //if non selected artist stay normal
                if (artist["artists"]!=selected_song["artists"]) {
                    d3.select(this)
                        .transition()
                        .duration(50)
                        .attrs(base_attr)
                        .styles(base_style)
                }
                //if selected artist then change color
                else if (artist["artists"]==selected_song["artists"]) {
                    d3.select(this)
                        .transition()
                        .duration(50)
                        .attrs(select_attr)
                        .styles(select_style)
                }
            
            })
        
        

        //highlight song of same artist of the selected song
        scatter_songs.selectAll("circle")
            .each(function(d){
                let song_style=base_style
                let song_attr=base_attr
                d3.select(this).attr("class","circle")
                const song=d[2]
                //similar song
                /*
                if (nearest_elements.some(e=> e["data"][2]["id"]==song["id"])){
                    song_style=simil_style
                    song_attr=simil_attr
                    d3.select(this).attr("class","similar")
                }*/
                let is_simil=false
                for(var simil_idx=0;simil_idx<K_nearest;simil_idx++){
                    if( song["id"]==nearest_elements[simil_idx]["data"][2]["id"]){
                        is_simil=true
                        
                        d3.select(this).moveToFront()

                        d3.select(this).attr("class","similar");

                        song_style=simil_style
                        song_style.fill=simil_colors[simil_idx];
                        console.log("song style",song_style)
                        song_attr=simil_attr
                    }
                }
                if(!is_simil){
                    //song of same artist
                    //clicked - same artist
                    if (song["artists"]==selected_song["artists"]) {
                        //clicked
                        if (song["id"]==selected_song["id"]) {
                            song_style=highlight_style
                            song_attr=highlight_attr
                            highlighted_element=d3.select(this)
                            
                        }
                        //same artist but not selected song
                        else{
                            song_style=same_artist_style
                            song_attr=same_artist_attr
                        }
                    }
                }
                d3.select(this)
                .transition()
                .duration(200)
                .attrs(song_attr)
                .styles(song_style);
            })
                
    }
         
    highlighted_element.moveToFront()
}

function onMouseOver(this_artist) {
    return function(d, i) {
        //on song scatter plot dot is highlighted only fif it not belng to selected artist  
        d3.select(this)
            .transition()
            .duration(50)
            .attrs(over_attr)
            .styles(over_style)  
    
        const sel=d.originalTarget.__data__[2]
        let text_artist=formatArtists(sel["artists"])

        //Tooltip
        if (this_artist) {
            function checkPosX(X){
                
                const bodyWidth=document.getElementsByTagName("body")[0].clientWidth
                if (X+150>bodyWidth) return X-150
                else return X+5
            }

            const artist=sel
            tooltip_div.transition()		
                .duration(200)		
                .style("opacity", .8);		
            tooltip_div.html(`<span style="font-weight: bold">Artist:</span> ${text_artist}`)	
                .style("left", (checkPosX(d.pageX)) + "px")		
                .style("top", (d.pageY+5) + "px")
                .style("width", 150 + "px")
        }
        else{
            const song=sel
            //shorten song name if too long
            song_text=song["name"]
            /*
            if(song_text.length>50){
                song_text=song_text.substring(0,50)
                song_text=song_text+"..."
            }*/
            //compute height bases on how many lines of text
            tooltip_div.transition()		
                .duration(200)		
                .style("opacity", .8);		
            tooltip_div.html(`<span style="font-weight: bold">Song:</span> ${song_text} <br/><span style="font-weight: bold">Artist:</span> ${text_artist}`)	
                .style("left", (d.pageX+5) + "px")		
                .style("top", (d.pageY+5) + "px")        
                .style("width", 150 + "px")     
        }
    }
}

function onMouseOut(this_artist) {
    return function (d, i) {
        //events on mouse out from scatter dot
        let target_attr=base_attr
        let target_style=base_style

        //tooltip disappear
        tooltip_div.transition()		
            .duration(500)		
            .style("opacity", 0);	
    
        const element=d.originalTarget.__data__[2]

        if (!selected_artist) {
            //if no artist is selected, element return to normal
            d3.select(this)
                .transition()
                .duration(50)
                .attrs(base_attr)
                .styles(base_style)
            return
        }
        
        //if song/artist is similar to selected artist, then it is highlighted in correct color
        /*if (
            (this_artist && nearest_elements.some(e=> e["data"][2]["artists"]==element["artists"]))
         || (!this_artist && nearest_elements.some(e=> e["data"][2]["id"]==element["id"]))
        ){  
            if ((selected_song && !this_artist) || (!selected_song && this_artist)) {
          
                d3.select(this)
                .transition()
                .duration(50)
                .attrs(simil_attr)
                .styles(simil_style)
                return
            }
        }*/
        for(var simil_idx=0; simil_idx<K_nearest; simil_idx++){
            if( (this_artist && element["artists"]==nearest_elements[simil_idx]["data"][2]["artists"])
            || (!this_artist && element["id"]==nearest_elements[simil_idx]["data"][2]["id"])){
                if ((selected_song && !this_artist) || (!selected_song && this_artist)) {
        
                    d3.select(this)
                    .transition()
                    .duration(50)
                    .attrs(simil_attr)
                    .styles(simil_style)
                    .style("fill",simil_colors[simil_idx])
                    return
                }
            }
        }
        

        
        //if an artist is selected, distinguish between
        //highlighted: element clicked or cursor is passing over
        //selected: song of clicked artist or artist of clicked song
        //same_artist: song made by the same artist of the clicked song

        //song selected remain selected
        //difference between song selected by clicking on artist or 
        //selection by clicking on other song of same artist
        if (element["artists"]==selected_artist["artists"]) {
            if (selected_song){
                //selection by clicking on song
                if (this_artist){
                    target_attr=select_attr
                    target_style=select_style
                }
                else{
                    target_attr=same_artist_attr
                    target_style=same_artist_style
                }
            }
            else{
                //selection by clicking on artist
                if(this_artist){
                    target_attr=highlight_attr
                    target_style=highlight_style
                }
                else{
                    target_attr=select_attr
                    target_style=select_style
                }
            }

            //this is the song I selected, highlight in different color
            if (selected_song && element["id"]==selected_song["id"]) {
                target_attr=highlight_attr
                target_style=highlight_style
            }
        }

        //apply target style
        d3.select(this)
        .transition()
        .duration(50)
        .attrs(target_attr)
        .styles(target_style)
    }
}

function ScatterPlotMain(data, margin, width, height, svg, this_artist) {
    
    let scatter_data;

    if (this_artist) {
        //group song by artist
        //artists or artist_ids
        songByArtists_=d3.groups(data, d=>d["artists"])
        console.log("Grouped songs",songByArtists_)

        //create new matrix with for each artist 6 values that are the mean of the 
        //caetgories for each song

        //two elements: matrix_data and artist info
        songByArtists={
            "matrix_data":[],
            "info":[],
        }
        //for each artist create a new array that contains
        //the means of the categories for their songs
        for(var i=0;i<songByArtists_.length;i++){
            artist_data=[]  
            additional_data={}
            additional_data["artists"]=songByArtists_[i][0]
            for(var j=0;j<categories.length;j++){
                value_not_norm=d3.mean(songByArtists_[i][1], 
                    d=>d[categories[j]])
                value=d3.mean(songByArtists_[i][1], 
                    d=>norm_min_max(d[categories[j]], cat_limits[j][0], cat_limits[j][1]))
                artist_data.push(value)
                additional_data[categories[j]]=value_not_norm
            }
            songByArtists["matrix_data"].push(artist_data)
            //add average_categories to artist info
            songByArtists["info"].push(additional_data)

        }
        console.log("songByArtists:",songByArtists)


        //Compute new data using PCA
        artistsPCA=getPCA(songByArtists["matrix_data"])

        //add some information to each element
        for (var i = 0; i < artistsPCA.length; i++) {
            //mean of each category
            //artistsPCA[i].push(songByArtists["matrix_data"][i])
            //artist name
            artistsPCA[i].push(songByArtists["info"][i])
        }

        scatter_data=artistsPCA
        xLimitsArtists=getMaxMin(scatter_data, 0)
        yLimitsArtists=getMaxMin(scatter_data, 1)
        console.log("limitsArtists:",xLimitsArtists,yLimitsArtists)
    }
    else{
        console.log("Viewing songs...")
        //create a new matrix that contain all the needed data to represent each song
        //i.e. an array ofor each song with the values of the categories
        songsData=[];
        for(var i=0;i<data.length;i++){
            songData=[]
            for(var j=0;j<categories.length;j++){
                value=norm_min_max(data[i][categories[j]], cat_limits[j][0], cat_limits[j][1])
                songData.push(value)
            }
            songsData.push(songData)
        }
        console.log("songsData:",songsData)

        songsPCA=getPCA(songsData)
        
        //add some information to each element
        for (var i = 0; i < songsPCA.length; i++) {
            //song data
            songsPCA[i].push(data[i])
        }
        scatter_data=songsPCA
        yLimitsSongs=getMaxMin(scatter_data, 1)
        xLimitsSongs=getMaxMin(scatter_data, 0)
        console.log("limitsSongs:",xLimitsSongs,yLimitsSongs)
    }
    if (this_artist) {
        xLimits=xLimitsArtists
        yLimits=yLimitsArtists
    }
    else{
        xLimits=xLimitsSongs
        yLimits=yLimitsSongs
    }

    console.log("xLimits:",xLimits,"yLimits:",yLimits)

    // Add X and Y axis
    x = d3.scaleLinear()
        .domain([xLimits[0], xLimits[1]])
        .range([ 0, width ]);

    y = d3.scaleLinear()
        .domain([yLimits[0],yLimits[1]])
        .range([ height, 0]);

    /*
    //axis don't indicate anything if we usa PCA, useless
    var xAxis_ = d3.axisBottom(x).ticks(0, ".0f")
    var yAxis_=d3.axisLeft(y).ticks(0, ".0f")
    
    var xAxis=svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .attr('id', "axis--x")
    .call(xAxis_) 

    var yAxis=svg.append("g")
    .attr('id', "axis--y")
    .call(yAxis_);
    */

    // everything out of this area won't be drawn
    var clip = svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width )
        .attr("height", height )
        .attr("x", 0)
        .attr("y", 0);

    // Create the scatter variable: where both the circles and the brush take place
    var scatter;
    if (this_artist) {
        scatter_artists=svg.append('g').attr("clip-path", "url(#clip)")
        scatter=scatter_artists
        }
    else {
        scatter_songs=svg.append('g').attr("clip-path", "url(#clip)")
        scatter=scatter_songs
    }



    /*
    ***************************
    INTERACTIONS
    ***************************
    */

    //BRUSHING ON BOTH AXIS

    var brush = d3.brush().extent([[0, 0], [width, height]]).on("end", brushended),
    idleTimeout,
    idleDelay = 350;

    scatter.append("g")
    .attr("class", "brush")
    .call(brush);

    function brushended(event) {

        var s = event.selection;
        if (!s) {
            if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
            x.domain(d3.extent(scatter_data, function (d) { return d[0]; })).nice();
            y.domain(d3.extent(scatter_data, function (d) { return d[1]; })).nice();
            
        } else {
            x.domain([s[0][0], s[1][0]].map(x.invert, x));
            y.domain([s[1][1], s[0][1]].map(y.invert, y));
            scatter.select(".brush").call(brush.move, null);
        }
        zoom();
    }

    function idled() {
        idleTimeout = null;
    }

    function zoom() {
        //xAxis.transition().call(xAxis_);
        //yAxis.transition().call(yAxis_);
        scatter.selectAll("circle").transition()
        .attr("cx", function (d) { return x(d[0]); })
        .attr("cy", function (d) { return y(d[1]); });
    }

    // Added this to zoom out once as the page starts, otherwise it starts with a little zoom
    x.domain(d3.extent(scatter_data, function (d) { return d[0]; })).nice();
    y.domain(d3.extent(scatter_data, function (d) { return d[1]; })).nice();
    zoom()

    tooltip_div = d3.select("body").append("div")	
        .attr("class", "tooltip")				
        .style("opacity", 0);


    //CREATE SCATTER PLOT and add interaction with mouse
    scatter
    .selectAll(".dot")
    //.data(data)
    .data(scatter_data)
    .enter()
    .append("circle")
        //.attr("cx", function (d) { return x(d[0]); } )
        //.attr("cy", function (d) { return y(d[1]); } )
        //PCA
        .attr("cx", function (d) { return x(d[0]); } )
        .attr("cy", function (d) { return y(d[1]); } )
        .attrs(base_attr)
        .styles(base_style)
        .on('click', function(d) {
            console.log("selected element on scatter:",d)
            return onClick(this_artist,d.originalTarget.__data__)})
        .on('mouseover', onMouseOver(this_artist))
        .on('mouseout', onMouseOut(this_artist))
}

function applyFilter(lowLimit, topLimit, cat) {

    filterLimits[cat][0] = lowLimit;
    filterLimits[cat][1] = topLimit;

    displayedArtists = [];
    displayedSongs = [];
    const filteredSongs = d3.filter(songsPCA, function(d) {
        for (const k in filterLimits) {
            if (d[2][k] < filterLimits[k][0] || d[2][k] > filterLimits[k][1]) {
                return false;
            }
        }
        // Artists that have at least one unfiltered song in the songs graph are displayed
        displayedSongs.push(d[2]["name"]);
        displayedArtists.push(d[2]["artists"]);
        return true;
    })

    artistsNonDuplicates = [];
    const filteredArtists = d3.filter(artistsPCA, function(d) {
        if (displayedArtists.includes(d[2]["artists"]) && !artistsNonDuplicates.includes(d[2]["artists"])) {
            // displayedArtists has a lot of duplicates, we build another array that doesn't have them and we use it to filter the artists
            artistsNonDuplicates.push(d[2]["artists"]);
            return true;
        }
        return false;
    })

    // We should distinguish the case when displayedSongs is empty because the function applyFilter has never been called yet from the case
    // where it is empty because all songs have been filtered out when applying filters. This is necessary for the search, to correctly display elements that have been filtered out
    if (displayedSongs == []) {
        displayedSongs.push("--No songs--");
    }

    // Same thing as create scatter plot a few lines above this
    // If that changes this should change too, they must be the same
    scatter_songs.selectAll("circle")
        .data(filteredSongs)
        .join("circle")
            .attr("cx", function (d) { return x(d[0]); } )
            .attr("cy", function (d) { return y(d[1]); } )
            .attrs(base_attr)
            .styles(base_style)
            .on('click', function(d) {
                console.log("selected element on scatter:",d)
                return onClick(false,d.originalTarget.__data__)})
            .on('mouseover', onMouseOver(false))
            .on('mouseout', onMouseOut(false))

    // Do the same for scatter_artists where data is filteredArtists
    scatter_artists.selectAll("circle")
        .data(filteredArtists)
        .join("circle")
            .attr("cx", function (d) { return x(d[0]); } )
            .attr("cy", function (d) { return y(d[1]); } )
            .attrs(base_attr)
            .styles(base_style)
            .on('click', function(d) {
                console.log("selected element on scatter:",d)
                return onClick(true,d.originalTarget.__data__)})
            .on('mouseover', onMouseOver(true))
            .on('mouseout', onMouseOut(true))
}


function main() {
    const div_height = document.getElementById("scatter-plot-1").clientHeight;
    const div_width = document.getElementById("scatter-plot-1").clientWidth;
    
    // set the dimensions and margins of the graph
    const margin = {top: 10, right: 20, bottom: 20, left: 20},
    width = div_width - margin.left - margin.right,
    height = div_height - margin.top - margin.bottom;
    
    // append the svg object to the body of the page
    const svg1 = d3.select("#scatter-plot-1")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const svg2 = d3.select("#scatter-plot-2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const filterBar = document.getElementById("filter-bar");

    const statsHeader = document.getElementById("stats-h3");
    statsHeader.addEventListener('mouseover', (event) => {
        tooltip_div.transition()		
            .duration(200)		
            .style("opacity", 1);                    	
        tooltip_div.html("This section reports the statistics of the selected song and the 5 most similar songs. Each song is associated to a color, which is always the same in every graph. If one song is particularly interesting, by clicking on its stats it's possible to find songs similar to that one.")
            .style("width", 250 + "px")
            .style("left", (event.clientX+5) + "px")		
            .style("top", (event.clientY+5) + "px");
    })
    statsHeader.addEventListener("mouseout", (event) => {
        tooltip_div.transition()		
            .duration(500)		
            .style("opacity", 0);	
    })

    document.getElementById("1-stats")
    .addEventListener("click", function(){
        console.log("clicchetto 1")
        if(nearest_elements) {
            let this_artist=true
            if(selected_song) this_artist=false
            onClick(this_artist,nearest_elements[0].data)
        }          
    })  
    document.getElementById("2-stats")
    .addEventListener("click", function(){
        console.log("clicchetto 2")
        if(nearest_elements) {
            let this_artist=true
            if(selected_song) this_artist=false
            onClick(this_artist,nearest_elements[1].data)
        }          
    })   
    document.getElementById("3-stats")
    .addEventListener("click", function(){
        console.log("clicchetto 3")
        if(nearest_elements) {
            let this_artist=true
            if(selected_song) this_artist=false
            onClick(this_artist,nearest_elements[2].data)
        }          
    })   
    document.getElementById("4-stats")
    .addEventListener("click", function(){
        console.log("clicchetto 4")
        if(nearest_elements) {
            let this_artist=true
            if(selected_song) this_artist=false
            onClick(this_artist,nearest_elements[3].data)
        }          
    }) 
    document.getElementById("5-stats")
    .addEventListener("click", function(){
        console.log("clicchetto 5")
        if(nearest_elements) {
            let this_artist=true
            if(selected_song) this_artist=false
            onClick(this_artist,nearest_elements[4].data)
        }          
    })       
    


    //Read the data and plot the plots
    d3.csv("../tracks_mid_1k.csv",d3.autoType)
        .then( function(data){ 
            console.log("data loaded")
            //get max and min for categories of radial plot (to nromalize)
            for(var i=0;i<categories.length;i++){
                const limits=getMaxMin(data, categories[i]) //limits[0] is min, limits[1] is max
                cat_limits.push(limits)
            }

            // Initialize filters
            for (cat of categories) {
                const nameContainer = document.createElement("div");
                nameContainer.classList.add("filter-name-container");

                const limits = document.createElement("span");
                limits.classList.add("filter-limits");
                limits.id = `${cat}-limits`;

                let description = "";
                if (cat == "acousticness") {
                    description = "<span style=\"font-weight: bold\">Acousticness</span> is a confidence measure from 0.0 to 1.0 of whether the track is acoustic. 1.0 represents high confidence the track is acoustic."
                }
                else if (cat == "danceability") {
                    description = "<span style=\"font-weight: bold\">Danceability</span> describes how suitable a track is for dancing based on a combination of musical elements including tempo, rhythm stability, beat strength, and overall regularity. A value of 0.0 is least danceable and 1.0 is most danceable."
                }
                else if (cat == "energy") {
                    description = "<span style=\"font-weight: bold\">Energy</span> is a measure from 0.0 to 1.0 and represents a perceptual measure of intensity and activity. Typically, energetic tracks feel fast, loud, and noisy. For example, death metal has high energy, while a Bach prelude scores low on the scale. Perceptual features contributing to this attribute include dynamic range, perceived loudness, timbre, onset rate, and general entropy."
                }
                else if (cat == "instrumentalness") {
                    description = "<span style=\"font-weight: bold\">Instrumentalness</span> predicts whether a track contains no vocals. \"Ooh\" and \"aah\" sounds are treated as instrumental in this context. Rap or spoken word tracks are clearly \"vocal\". The closer the instrumentalness value is to 1.0, the greater likelihood the track contains no vocal content. Values above 0.5 are intended to represent instrumental tracks, but confidence is higher as the value approaches 1.0."
                }
                else if (cat == "liveness") {
                    description = "<span style=\"font-weight: bold\">Liveness</span> detects the presence of an audience in the recording. Higher liveness values represent an increased probability that the track was performed live. A value above 0.8 provides strong likelihood that the track is live."
                }
                else if (cat == "loudness") {
                    description = "The overall <span style=\"font-weight: bold\">loudness</span> of a track in decibels (dB). Loudness values are averaged across the entire track and are useful for comparing relative loudness of tracks. Loudness is the quality of a sound that is the primary psychological correlate of physical strength (amplitude). Values typically range between -60 and 0 db."
                }
                else if (cat == "speechiness") {
                    description = "<span style=\"font-weight: bold\">Speechiness</span> detects the presence of spoken words in a track. The more exclusively speech-like the recording (e.g. talk show, audio book, poetry), the closer to 1.0 the attribute value. Values above 0.66 describe tracks that are probably made entirely of spoken words. Values between 0.33 and 0.66 describe tracks that may contain both music and speech, either in sections or layered, including such cases as rap music. Values below 0.33 most likely represent music and other non-speech-like tracks."
                }
                else if (cat == "tempo") {
                    description = "The overall estimated <span style=\"font-weight: bold\">tempo</span> of a track in beats per minute (BPM). In musical terminology, tempo is the speed or pace of a given piece and derives directly from the average beat duration."
                }
                else if (cat == "valence") {
                    description = "<span style=\"font-weight: bold\">Valence</span> is a measure from 0.0 to 1.0 describing the musical positiveness conveyed by a track. Tracks with high valence sound more positive (e.g. happy, cheerful, euphoric), while tracks with low valence sound more negative (e.g. sad, depressed, angry)."
                }
                const filterName = document.createElement("div");
                filterName.innerHTML = `${capitalize(cat)} <img class="question-mark" src="../images/question-mark-on-a-circular-black-background.png" alt="Question Mark Icon">`;
                filterName.style.fontWeight = "bold";
                filterName.classList.add("filter-name");
                filterName.addEventListener('mouseover', (event) => {
                    tooltip_div.transition()		
                        .duration(200)		
                        .style("opacity", 1);                    	
                    tooltip_div.html(description)
                        .style("width", 250 + "px")
                        .style("left", (event.clientX+5) + "px")		
                        .style("top", (event.clientY+5) + "px");
                })
                filterName.addEventListener("mouseout", (event) => {
                    tooltip_div.transition()		
                        .duration(500)		
                        .style("opacity", 0);	
                })

                const filterContainer = document.createElement("div");
                filterContainer.classList.add("filter-container");
                filterContainer.id = `${cat}-filter-container`;

                nameContainer.appendChild(limits);
                nameContainer.appendChild(filterName);
                filterBar.appendChild(nameContainer)
                filterBar.appendChild(filterContainer);

                createHistogram(data, cat, applyFilter);

                filterLimits[cat] = getMaxMin(data, cat);
            }

            if (filterLimits['tempo'] > 220) alert("Trovata una canzone con tempo > 220, sistemare l'istogramma dei filtri")

            console.log("limits:",cat_limits)

            // Building searchArray for the searchbar
            
            for (el of data) {
                searchArray.push(el)
            }

            //CLICK ON STAT BOX
            /*
            let stats=[]
            for(var k=1;k<=K_nearest;k++){
                let stat=document.getElementById(k+"-stats")
                stat.addEventListener("click", function(){
                    console.log("clicchetto",k)
                    
                    if(nearest_elements) {
                        let this_artist=true
                        if(selected_song) this_artist=false
                        onClick(this_artist,nearest_elements[k])
                    }                   
                    
                })
                stats.push(stat)
            }
            */


            console.log("plot ready")
            ScatterPlotMain(data, margin, width, height, svg1, false)
            ScatterPlotMain(data, margin, width, height, svg2, true)

            radialPlotMain()
            boxPlotMain()
            //similarityPlot()
            
            })
        .catch((error) => console.log(error))
}

main();
