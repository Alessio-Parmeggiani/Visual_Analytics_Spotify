var cat_limits=[];
const categories = ["speechiness","acousticness","instrumentalness","liveness","valence","tempo",
"danceability","energy","loudness"]
let filterLimits = {};

let scatter_artists;
let scatter_songs;
let selected_artist;
let selected_song;
let artistsPCA;
let songsPCA;

let tooltip_div;

let xLimits;
let yLimits;
let x;
let y;

//PCA FROM https://www.npmjs.com/package/pca-js

function prova(a){
    console.log("prova",a)
}


function onClick(this_artist) {
    // I use this structure in order use the this_artist variable defined in scatterPlotMain
    return function(d) {
        //get related data
        console.log("selected element on scatter:",d)
        
        if (this_artist) {
            console.log("selected artist:",d.originalTarget.__data__[2])    // QUI ORIGINALTARGET È DA CAMBIARE, NON È COMPATIBILE CON NESSUN BROWSER CHE NON SIA FIREFOX
        }
        else  console.log("selected song:",d.originalTarget.__data__[2])
        selected_artist=d.originalTarget.__data__[2]

        updateRadialPlot(d.originalTarget.__data__[2])
        showStats(d.originalTarget.__data__[2], this_artist)

        scatter_songs.selectAll("circle").transition().duration(100)
            .attrs(base_attr)
            .styles(base_style)

        //get songs of this artist 
        current_artist_songs=[]
        scatter_songs.selectAll("circle")
        .each(function(d){
            song=d[2]
            if (song["artists"]==selected_artist["artists"]) {
                current_artist_songs.push(song)
                //update style
                if (this_artist) {
                    d3.select(this).transition()
                    .attrs(select_attr)
                    .styles(select_style);
                }
            }
        });
        //update boxplot
        let boxplot_songs_data=compute_boxplot_data(current_artist_songs)
        update_boxplot(boxplot_songs_data)

        //CLICK ON ARTIST SCATTERPLOT
        if (this_artist) {
            //now an artist is selected, not a song
            selected_song=null

            //all other artists return to base style
            scatter_artists.selectAll("circle")
                .filter(function(d){
                    if(selected_artist){
                        //only non selected artists return to normal
                        const artist=d[2]
                        return artist["artists"]!=selected_artist["artists"]
                    }
                    //nothing has been selected
                    return true  
                })
                .transition()
                .duration(200)
                .attrs(base_attr)
                .styles(base_style) 
        }

        //CLICK ON SONG SCATTERPLOT
        else{
            selected_song=d.originalTarget.__data__[2]

            //highlight artist of selected song
            scatter_artists.selectAll("circle")
                .each(function(d){
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
                    const song=d[2]
                    if (song["artists"]==selected_song["artists"]) {
                        //hihglight selected song
                        if (song["id"]==selected_song["id"]) {
                            d3.select(this)
                                .transition()
                                .duration(200)
                                .attrs(highlight_attr)
                                .styles(highlight_style)
                        }
                        //same artist but not selected song
                        else{
                            d3.select(this)
                                .transition()
                                .duration(200)
                                .attrs(same_artist_attr)
                                .styles(same_artist_style)
                        }

                    }
                    else{
                        d3.select(this)
                            .transition()
                            .duration(200)
                            .attrs(base_attr)
                            .styles(base_style)
                    }
                })

        }
         
    }
}

function onMouseOver(this_artist) {
    return function(d, i) {
        //on song scatter plot dot is highlighted only fif it not belng to selected artist  
        d3.select(this)
            .transition()
            .duration(50)
            .attrs(highlight_attr)
            .styles(highlight_style)  
    
        const sel=d.originalTarget.__data__[2]
        let text_artist=sel["artists"].replace(/[\[\]\'']+/g, '').split(',')
        if (text_artist.length>1) {
            text_artist=text_artist[0]+" and others"
        }
        //Tooltip
        if (this_artist) {
            function checkPosX(X){
                
                const bodyWidth=document.getElementsByTagName("body")[0].clientWidth
                if (X+100>bodyWidth) return X-100
                else return X+5
            }

            const tooltipHeight=30+10*Math.round((text_artist.length/20))
            //console.log("artist: "+text_artist +" computed height: "+height)
            const artist=sel
            tooltip_div.transition()		
                .duration(200)		
                .style("opacity", .8);		
            tooltip_div	.html( "Artist:"+ text_artist+"<br/>" )	
                .style("left", (checkPosX(d.pageX)) + "px")		
                .style("top", (d.pageY+5) + "px")
                //modify height
                .style("height", (tooltipHeight)+"px")
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
            const tooltipHeight=40+20*Math.round((song_text.length/15))
            tooltip_div.transition()		
                .duration(200)		
                .style("opacity", .8);		
            tooltip_div	.html( "Song: "+ song_text+"<br/>"+
                        "Artist: "+ text_artist)	
                .style("left", (d.pageX+5) + "px")		
                .style("top", (d.pageY+5) + "px")
                .style("height", (tooltipHeight)+"px")	
        
        }
    }
}

function onMouseOut(this_artist) {
    return function (d, i) {
        //events on mouse out from scatter dot

        //tooltip disappear
        tooltip_div.transition()		
            .duration(500)		
            .style("opacity", 0);	
    
        const element=d.originalTarget.__data__[2]
        //console.log("mouse out",element)

        
        if (!selected_artist) {
            //if no artist is selected, element return to nromal
            d3.select(this)
                .transition()
                .duration(50)
                .attrs(base_attr)
                .styles(base_style)
            return
        }
        
        //if an artist is selected, distinguish between
        //highlighted: element clicked or cursor is passing over
        //selected: song of clicked artist or artist of clicked song
        //same_artist: song made by the same artist of the clicked song

        //non selected song return to normal
        if (element["artists"]!=selected_artist["artists"]) {
            d3.select(this)
            .transition()
            .duration(50)
            .attrs(base_attr)
            .styles(base_style)
        }
        //song selected remain selected
        //difference between song selected by clicking on artist or 
        //selection by clicking on other song of same artist
        else if (element["artists"]==selected_artist["artists"]) {
            if (selected_song){
                //selection by clicking on song
                if (this_artist){
                    d3.select(this)
                    .transition()
                    .duration(50)
                    .attrs(select_attr)
                    .styles(select_style)
                }
                else{
                    d3.select(this)
                    .transition()
                    .duration(50)
                    .attrs(same_artist_attr)
                    .styles(same_artist_style)
                }
            }
            else{
                //selection by clicking on artist
                if(this_artist){
                    d3.select(this)
                    .transition()
                    .duration(50)
                    .attrs(highlight_attr)
                    .styles(highlight_style)
                }
                else{
                    d3.select(this)
                    .transition()
                    .duration(50)
                    .attrs(select_attr)
                    .styles(select_style)
                }

            }
            //this is the song I selected, highlight in different color
            if (selected_song && element["id"]==selected_song["id"]) {
                d3.select(this)
                .transition()
                .duration(50)
                .attrs(highlight_attr)
                .styles(highlight_style)
            }
        }
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
    }

    xLimits=getMaxMin(scatter_data, 0)
    yLimits=getMaxMin(scatter_data, 1)

    // Add X and Y axis
    x = d3.scaleLinear()
        .domain([xLimits[0], xLimits[1]])
        .range([ 0, width ]);

    y = d3.scaleLinear()
        .domain([yLimits[0],yLimits[1]])
        .range([ height, 0]);

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
        xAxis.transition().call(xAxis_);
        yAxis.transition().call(yAxis_);
        scatter.selectAll("circle").transition()
        .attr("cx", function (d) { return x(d[0]); })
        .attr("cy", function (d) { return y(d[1]); });
    }

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
        .on('click', onClick(this_artist))
        .on('mouseover', onMouseOver(this_artist))
        .on('mouseout', onMouseOut(this_artist))
}

function applyFilter(lowLimit, topLimit, cat) {

    filterLimits[cat][0] = lowLimit;
    filterLimits[cat][1] = topLimit;

    const filteredSongs = d3.filter(songsPCA, function(d) {
        for (const k in filterLimits) {
            if (d[2][k] < filterLimits[k][0] || d[2][k] > filterLimits[k][1]) {
                return false;
            }
        }
        return true;
    })

    scatter_songs.selectAll("circle")
        .data(filteredSongs)
        .join("circle")
            .attr("cx", function (d) { return x(d[0]); } )
            .attr("cy", function (d) { return y(d[1]); } )
            .attrs(base_attr)
            .styles(base_style)
            .on('click', onClick(false))
            .on('mouseover', onMouseOver(false))
            .on('mouseout', onMouseOut(false))
}

function main() {
    const div_height = document.getElementById("scatter-plot-1").clientHeight;
    const div_width = document.getElementById("scatter-plot-1").clientWidth;

    // set the dimensions and margins of the graph
    const margin = {top: 10, right: 20, bottom: 60, left: 60},
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

    //Read the data and plot the plots
    d3.csv("../tracks_small.csv",d3.autoType)
        .then( function(data){ 
            //get max and min for categories of radial plot (to nromalize)
            for(var i=0;i<categories.length;i++){
                const limits=getMaxMin(data, categories[i]) //limits[0] is min, limits[1] is max
                cat_limits.push(limits)
            }
            for (cat of categories) {
                filterLimits[cat] = getMaxMin(data, cat) 
            }

            if (filterLimits['tempo'] > 220) alert("Trovata una canzone con tempo > 220, sistemare l'istogramma dei filtri")

            console.log("limits:",cat_limits)

            createHistogram(data, 'tempo', applyFilter);

            ScatterPlotMain(data, margin, width, height, svg1, false)
            ScatterPlotMain(data, margin, width, height, svg2, true)

            radialPlotMain()
            boxPlotMain()
            
            })
        .catch((error) => console.log(error))
}

main();
