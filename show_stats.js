function showStats(data, index, view_artist) {
    let container;

    if (index == 0) {
        container = document.getElementById("main-stats");
    }
    else {
        container = document.getElementById(`${index}-stats`);
    }
    
    let stats = [];

    container.innerHTML = "";

    console.log(data);

    if (!view_artist) {
        stats = ["name", "album", "year", "speechiness", "acousticness", "instrumentalness", "liveness", "valence", "tempo", "danceability", "energy", "loudness"];
    }
    else {
        stats = ["speechiness", "acousticness", "instrumentalness", "liveness", "valence", "tempo", "danceability", "energy", "loudness"];
    }

    // Write artist names
    let p = document.createElement("p");
    p.classList.add("stat-element");
    let artists = formatArtists(data["artists"])

    p.innerHTML = `<span style="font-weight: bold">Artists: </span>` + artists;
    container.appendChild(p);

    for (const elem of stats) {
        p = document.createElement("p");
        p.classList.add("stat-element");
        if (elem != "name" && elem != "album" && elem != "year") {
            p.innerHTML = `<span style="font-weight: bold">${capitalize(elem)}</span>` + ": " + (Math.round(data[elem] * 100) / 100).toFixed(2);
        }
        else {
            p.innerHTML = `<span style="font-weight: bold">${capitalize(elem)}</span>` + ": " + data[elem];
        }
        container.appendChild(p);
    }
}

function capitalize(s) {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Capitalizes all words in a sentence. Handles the case in which there is 
 * a <mark> tag in the string (happens when using autoComplete.js)
 */
function capitalizeAll(s) {
    if (typeof s !== 'string') return '';
    let ss = s.split(' ');
    let ret = "";
    for (let word of ss) {
        // Need this in search.js, because I use this function to capitalize names of searched artists
        // Names have areas marked with <mark> indicating the correspondence to the searched string
        if (word[0] == "<") {
            word = capitalize(word.replaceAll(/<mark>/g, ""));
            ret += "<mark>" + word + " ";
        }
        else {
            ret += capitalize(word) + " ";
        }
    }
    return ret.slice(0, -1);
}

/**
 * Takes a string representing an array of artists and formats it in a readable
 * format
 */
function formatArtists(s) {
    let artists = "";
    let artistsList = s.replaceAll(/\[|\]|\'/g, '').split(',');

    for (const artist of artistsList) {
        artists += capitalizeAll(artist) + ", ";
        console.log(artist);
    }

    return artists.slice(0, -2)
}