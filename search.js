const config = {
    placeHolder: "\u2315  Search for songs or artists...",
    selector: "#search-input",
    data: {
        src: searchArray,
        keys: ["name", "artists"],
        filter: (list) => {
            // Filter duplicates
            // incase of multiple data keys usage
            const filteredResults = Array.from(
                new Set(list.map((value) => value.match))
            ).map((key) => {
                return list.find((value) => value.match === key);
            });
    
            return filteredResults;
        },
    },
    // List that shows under the input field containing the results
    resultList: {
        // If true, allows list to appear even if there are no results
        noResults: true,
        maxResults: 15,
        tabSelect: true
    },
    // Elements of resultList
    resultItem: {
        // Highlights letters of element that match with search
        highlight: true,
        element: (item, data) => {
            item.style = "font-weight: 800"
            const res = data.match.replaceAll(/<mark>|<\/mark>/g, "")

            // in this case no filter has ever been applied => all songs are good
            if (displayedSongs.length == 0){
                if (data.key == "name") {
                    item.innerHTML = `${data.match}  <span style="font-weight:400;">-  Song</span>`
                }
                else {
                    let artists = formatArtists(data.match)
    
                    item.innerHTML = `${artists}  <span style="font-weight:400;">-  Artist</span>`
                }
            }
            // in this all songs have been filtered out
            else if (displayedSongs == ["--No songs--"]) {
                if (data.key == "name") {
                    item.innerHTML = `<span style="opacity:0.5;">${data.match}  <span style="font-weigth: 400">-  Song  -  <span style="color:#fff;background:#000">FILTERED OUT</span></span></span>`
                }
                else {
                    let artists = formatArtists(data.match)
    
                    item.innerHTML = `<span style="opacity:0.5;">${artists}  <span style="font-weigth: 400">-  Artist  -  <span style="color:#fff;background:#000">FILTERED OUT</span></span></span>`
                }
                item.classList.add("disabled");
            }      
            else {
                if (displayedSongs.includes(res) || artistsNonDuplicates.includes(res)) {
                    if (data.key == "name") {
                        item.innerHTML = `${data.match}  <span style="font-weight:400;">-  Song</span>`
                    }
                    else {
                        let artists = formatArtists(data.match)
        
                        item.innerHTML = `${artists}  <span style="font-weight:400;">-  Artist</span>`
                    }
                }
                else {
                    if (data.key == "name") {
                        item.innerHTML = `<span style="opacity:0.5;">${data.match}  <span style="font-weight: 400">-  Song  -  <span style="color:#fff;background:#000">FILTERED OUT</span></span></span>`
                    }
                    else {
                        let artists = formatArtists(data.match)
        
                        item.innerHTML = `<span style="opacity:0.5;">${artists}  <span style="font-weight: 400">-  Artist  -  <span style="color:#fff;background:#000">FILTERED OUT</span></span></span>`
                    }
                    item.classList.add("disabled");
                }
            }
        }
    },
    events: {
        input: {
            focus: () => {
                autoCompleteJS.input.value = ""
            }
        }
    }
}

const autoCompleteJS = new autoComplete(config);

console.log("*********** searchArray *******************")
console.log(searchArray)

// Function executed when a search result is selected
autoCompleteJS.input.addEventListener("selection", function (event) {
	const feedback = event.detail;
	// Prepare User's Selected Value
	const selection = feedback.selection.value[feedback.selection.key];

    let this_artist = false;
    // Replace Input value with the selected value
    if (feedback.selection.key == "artists") {
        this_artist = true;
        autoCompleteJS.input.value = formatArtists(selection);
    }
    else {
        autoCompleteJS.input.value = selection;
    }
    
    // Start the same procedure that is triggered when a datapoint is clicked in the plots
    onClickSearch(feedback.selection.value, this_artist);
});

// Exactly the same onClick function in Scatter_plot.js with a few modifications to make
// it work with search results
function onClickSearch(searchedElement, this_artist) {
    // To compute the nearest neighbors I neeed the PCA coordinates, but I don't have them in searchArray,
    // so I'll need to get them from songsPCA or artistsPCA
    let elemWithPCACoords = {};
    if (!this_artist) {
        for (song of songsPCA) {
            if (song[2]["id"] == searchedElement["id"]) {
                elemWithPCACoords = song;
                selected_artist = song[2];
                break;
            }
        }
    }
    else {
        for (artist of artistsPCA) {
            if (artist[2]["artists"] == searchedElement["artists"]) {
                elemWithPCACoords = artist;
                selected_artist = artist[2];
                break;
            }
        }
    }
    onClick(this_artist, elemWithPCACoords);
    return
    //some debug info
    if (this_artist) {
        console.log("selected artist:", selected_artist)
    }
    else  console.log("selected song:", selected_artist)

    //reset all songs style
    scatter_songs.selectAll("circle").transition().duration(100)
    .attrs(base_attr)
    .styles(base_style)
    
    //get K nearest elements 
    nearest_elements=get_k_nearest_elements(this_artist, elemWithPCACoords)
    console.log("I nearest elements sono:")
    console.log(nearest_elements)
    
    updateRadialPlot(selected_artist, nearest_elements)
    // Show stats for the selected song and for the 5 closest ones
    showStats(selected_artist, 0, this_artist)
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

    update_boxplot(boxplot_songs_data,similar_boxplot_songs_data)

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
                        if (nearest_elements.some(e=> e["data"][2]["artists"]==artist["artists"])){
                            d3.select(this).transition()
                            .attrs(simil_attr)
                            .styles(simil_style)
                            .attr("class","similar")
                        }
                        else {
                        d3.select(this).transition()
                        .attrs(base_attr)
                        .styles(base_style)
                        }
                    }
                    else {
                        d3.select(this).transition()
                        .attrs(highlight_attr)
                        .styles(highlight_style)
                    }
                }

            })
    }

    //CLICK ON SONG SCATTERPLOT
    else{

        selected_song=selected_artist

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
                if (nearest_elements.some(e=> e["data"][2]["id"]==song["id"])){
                    song_style=simil_style
                    song_attr=simil_attr
                    d3.select(this).attr("class","similar")
                }
                //song of same artist
                //clicked - same artist
                else if (song["artists"]==selected_song["artists"]) {
                    //clicked
                    if (song["id"]==selected_song["id"]) {
                        song_style=highlight_style
                        song_attr=highlight_attr
                    }
                    //same artist but not selected song
                    else{
                        song_style=same_artist_style
                        song_attr=same_artist_attr
                    }
                }
                d3.select(this)
                .transition()
                .duration(200)
                .attrs(song_attr)
                .styles(song_style);
            })

    }
     
}