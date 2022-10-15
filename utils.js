function get_distance(x1,x2,y1,y2){
    return Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2))
}

//take the artists for a song and parse them into an array of artists
function parseArtists(s){
    //console.log("parsing artists for:",s)
    let artistsList = s.replaceAll(/\[|\]|\'/g, '').split(',');
    //remove first character from every element except the first one
    for (let i=1;i<artistsList.length;i++){
        artistsList[i]=artistsList[i].trim();
    }
    //console.log("artistsList:",artistsList)
    return artistsList

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
        let distance=get_distance(d[0],selected_elem[0],d[1],selected_elem[1])
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


function getMaxMin(data, key) {
    let max = d3.max(data, d => d[key]);
    let min = d3.min(data, d => d[key]);
    return [min, max];
}

function getMuStd(data, key) {
    let std = d3.deviation(data, d => d[key]);
    let med = d3.median(data, d => d[key]);
    console.log("mu:",med,"std:",std)
    return [med, std];
}

function norm_min_max(value, min, max) {
    return (value - min) / (max - min);
}

function normalize(value,mean,std){
    return (value-mean)/std
}
function getPCA(pca_data){
    //data must be in matrix form
    var PCAvectors = PCA.getEigenVectors(pca_data);
    console.log("PCAvectors:",PCAvectors)
    var new_data_=PCA.computeAdjustedData(pca_data,PCAvectors[0],PCAvectors[1])
    var new_data_=new_data_["adjustedData"]
    //data is now in form [[1,3,5],[2,4,6]]
    //we need data in this form 
    //data=[[1,2],[3,4],[5,6]...]
    var new_data=[]
    for(var i=0;i<new_data_[0].length;i++){
        new_data.push([new_data_[0][i],new_data_[1][i]])
    }
    console.log("data after PCA:",new_data)
    return new_data
}

function getHistValues(data, bins, category, min, max) {
    let vals = [];
    // Special case for loudness given that min=-60dB
    if (category == "loudness") {
        for (let i=0; i<bins; i++) {
            vals.push(d3.count(data, function(d) {
                return (d[category] <= (min-max)*i/bins && d[category] > (min-max)*(i+1)/bins) ? 1 : undefined;
            }))
        }
    }
    else{
        for (let i=0; i<bins; i++) {
            vals.push(d3.count(data, function(d) {
                return (d[category] >= (max-min)*i/bins && d[category] < (max-min)*(i+1)/bins) ? 1 : undefined;
            }))
        }
    }
    //console.log(vals);
    return vals;
}

/**
 * Rounds a number to the closest bin value that is <= number
 */
function round2Bin(n, cat, bins, min, max) {
    let i = 0
    // Special case for loudness given that min=-60dB
    if (cat == "loudness") {
        while ((min-max)*i/bins >= n) {i++};
        return (min-max)*(i-1)/bins;    // i-1 so that the selection starts from the bar that was clicked, not from the following one
    }
    else {
        while ((max-min)*i/bins <= n) {i++};
        return (max-min)*(i-1)/bins;
    }
}
    
function compute_boxplot_data(songs){
    //compute boxplot data for a given category
    var boxplot_data = []
    for(var i=0;i<categories.length;i++){


        //dtaa for this category
        category_data={}
        category_data.category=categories[i]
        //if null songs then all 0 values

        if (songs.length>0) {
            category_data.min = d3.min(songs, function(d) { return d[categories[i]]; });
            category_data.min=norm_min_max(category_data.min, cat_limits[i][0], cat_limits[i][1])

            if (!category_data.min) category_data.min=0

            category_data.max = d3.max(songs, function(d) { return d[categories[i]]; });
            category_data.max=norm_min_max(category_data.max, cat_limits[i][0], cat_limits[i][1])

            if (!category_data.max) category_data.max=0

            category_data.median = d3.median(songs, function(d) { return d[categories[i]]; });
            category_data.median=norm_min_max(category_data.median, cat_limits[i][0], cat_limits[i][1])

            if (!category_data.median) category_data.median=0
            
            category_data.q1 = d3.quantile(songs, 0.25, function(d) { return d[categories[i]]; });
            category_data.q1=norm_min_max(category_data.q1, cat_limits[i][0], cat_limits[i][1]) 
            if (!category_data.q1) category_data.q1=0
            category_data.q3 = d3.quantile(songs, 0.75, function(d) { return d[categories[i]]; });
            category_data.q3=norm_min_max(category_data.q3, cat_limits[i][0], cat_limits[i][1])
            if (!category_data.q3) category_data.q3=0
            
            //interqauntile range (the box)
            category_data.iqr = category_data.q3 - category_data.q1;
            //baffi
            category_data.upper = category_data.q3 + 1.5 * category_data.iqr;
            category_data.lower = category_data.q1 - 1.5 * category_data.iqr;
        }
        else {
            category_data.min=0
            category_data.max=0
            category_data.median=0
            category_data.q1=0
            category_data.q3=0
            category_data.iqr = 0;
            //baffi
            category_data.upper = 0;
            category_data.lower = 0;
        }
        boxplot_data.push(category_data);
        
    }
    return boxplot_data
}

d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        if (this.parentNode) {
            this.parentNode.appendChild(this);
        }
    });
  };

function groupByArtist(data){
    let groupedSongs=[]
    let consideredArtists=[]
    for(var i=0;i<data.length;i++){
        let song=data[i]
        let artist=song["artists"]
        //if artist not in considered artists then add it to considered artists
        if(consideredArtists.indexOf(artist)==-1){
            consideredArtists.push(artist)
            groupedSongs.push([artist,[]])
        }
        //find the index of the artist in the grouped songs array
        let index=consideredArtists.indexOf(artist)
        groupedSongs[index][1].push(song)

        //same for every co-artist
        let coartists=song["co_artists"]
        for(var j=0;j<coartists.length;j++){
            let coartist=coartists[j]
            if(consideredArtists.indexOf(coartist)==-1){
                consideredArtists.push(coartist)
                groupedSongs.push([coartist,[]])
            }
            let index=consideredArtists.indexOf(coartist)
            groupedSongs[index][1].push(song)
        }
    }
    return groupedSongs
}

function getRadiusBySongsNumber(name,this_artist,default_radius){
    //console.log("creating scatter:",d);  
    if(!this_artist) return default_radius
    let max_value=default_radius*3;
    for (var i = 0; i < songByArtists_.length; i++) {
        let temp=songByArtists_[i]
        if (temp[0]==name) {
            //map value between 3 and 10
            let numSongs=temp[1].length;
            if(!temp[1].length) numSongs=1
            if(numSongs>maxSongsByArtist) return max_value;
            return default_radius+max_value*((numSongs)/maxSongsByArtist)   
        }
    }
    return default_radius;
}