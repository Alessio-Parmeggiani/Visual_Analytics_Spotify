let base_color="#69b3a2"
let highlight_color="#d73027"

//https://observablehq.com/@d3/color-schemes
const simil_colors = ["#fc8d59", "#fee090", "#e0f3f8", "#91bfdb", "#4575b4"]

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
    "stroke": "black",
    "stroke-width":2,
}
let select_co_style={
    "opacity": 1,
    "fill":"#984ea3",
}
let select_co_attr={
    "r":6,
    "stroke": "black",
    "stroke-width":2,
}

//similar artists/songs to clicked
let simil_style={
    "opacity": 1,
    "fill":"yellow",
}
let simil_attr={
    "r":7,
    "stroke": "black",
    "stroke-width":2,
}


//songs of the same artist of clicked song
let same_artist_style={
    "opacity": 0.8,
    "fill":"grey",
}
let same_artist_attr={
    "r":5,
    "stroke": "red",
    "stroke-width":2,
}

let same_co_artist_style={
    "opacity": 0.8,
    "fill":base_color,
}
let same_co_artist_attr={
    "r":3,
    "stroke": "none",
    "stroke-width":2,
}

let inactive_style={
    "opacity": 0.2,
    "fill":"grey",
}

let simil_plot_style={
    "opacity":1,
    "fill":base_color
}

