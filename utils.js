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