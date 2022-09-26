let base_color="#69b3a2"
let highlight_color="red"

//https://observablehq.com/@d3/color-schemes
let simil_colors=["#7fc97f","#beaed4","#fdc086","#ffff99","#386cb0","#f0027f","#bf5b17","#666666"]

//Scatterplot styles
let base_style={
    "opacity": 0.5,
    "fill":base_color,
}
let base_attr={
    "r":3,
    "stroke": "none",
}

//clicked element
let highlight_style={
    "opacity": 1,
    "fill":highlight_color,
}
let highlight_attr={
    "r":8,
    "stroke": "black",
    "stroke-width":2,
}

//mouse over element
let over_style={
    "opacity": 1,
    "fill":"green",
}
let over_attr={
    "r":8,
    "stroke": "black",
    "stroke-width":2,
}

//songs of clicked artist or artist of clicked song
let select_style={
    "opacity": 1,
    "fill":"#FF66D8",
}
let select_attr={
    "r":7,
    "stroke": "red",
    "stroke-width":1,
}
let select_co_style={
    "opacity": 1,
    "fill":"blue",
}
let select_co_attr={
    "r":6,
    "stroke": "blue",
    "stroke-width":1,
}

//similar artists/songs to clicked
let simil_style={
    "opacity": 1,
    "fill":"yellow",
}
let simil_attr={
    "r":7,
    "stroke": "black",
    "stroke-width":1,
}


//songs of the same artist of clicked song
let same_artist_style={
    "opacity": 0.8,
    "fill":"grey",
}
let same_artist_attr={
    "r":5,
    "stroke": "red",
    "stroke-width":1,
}

let same_co_artist_style={
    "opacity": 0.8,
    "fill":base_color,
}
let same_co_artist_attr={
    "r":3,
    "stroke": "none",
    "stroke-width":1,
}

let inactive_style={
    "opacity": 0.2,
    "fill":"grey",
}

let simil_plot_style={
    "opacity":1,
    "fill":base_color
}

