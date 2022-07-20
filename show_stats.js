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
    let artists = "";
    let artistsList = data["artists"].replaceAll(/\[|\]|\'/g, '').split(',');

    for (const artist of artistsList) {
        artists += capitalizeAll(artist) + ", ";
        console.log(artist);
    }
    p.innerHTML = `<span style="font-weight: bold">Artists: </span>` + artists.slice(0, -2);
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

function capitalizeAll(s) {
    if (typeof s !== 'string') return '';
    let ss = s.split(' ');
    let ret = "";
    for (const word of ss) {
        ret += capitalize(word) + " ";
    }
    return ret.slice(0, -1);
}