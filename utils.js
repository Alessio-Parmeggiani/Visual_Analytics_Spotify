function getMaxMin(data, key) {
    let max = d3.max(data, d => d[key]);
    let min = d3.min(data, d => d[key]);
    return [min, max];
}

function norm_min_max(value, min, max) {
    return (value - min) / (max - min);
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
        category_data.min = d3.min(songs, function(d) { return d[categories[i]]; });
        category_data.min=norm_min_max(category_data.min, cat_limits[i][0], cat_limits[i][1])

        category_data.max = d3.max(songs, function(d) { return d[categories[i]]; });
        category_data.max=norm_min_max(category_data.max, cat_limits[i][0], cat_limits[i][1])

        category_data.median = d3.median(songs, function(d) { return d[categories[i]]; });
        category_data.median=norm_min_max(category_data.median, cat_limits[i][0], cat_limits[i][1])
        
        category_data.q1 = d3.quantile(songs, 0.25, function(d) { return d[categories[i]]; });
        category_data.q1=norm_min_max(category_data.q1, cat_limits[i][0], cat_limits[i][1]) 
        category_data.q3 = d3.quantile(songs, 0.75, function(d) { return d[categories[i]]; });
        category_data.q3=norm_min_max(category_data.q3, cat_limits[i][0], cat_limits[i][1])
        //interqauntile range (the box)
        category_data.iqr = category_data.q3 - category_data.q1;

        //baffi
        category_data.upper = category_data.q3 + 1.5 * category_data.iqr;
        category_data.lower = category_data.q1 - 1.5 * category_data.iqr;

        boxplot_data.push(category_data);
    }
    return boxplot_data
}