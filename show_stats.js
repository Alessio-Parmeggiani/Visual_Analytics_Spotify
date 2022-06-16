function showStats(data) {
    let stats = ["name", "album", "year", "speechiness", "acousticness", "instrumentalness", "liveness", "valence", "tempo", "danceability", "energy", "loudness"];
    let container = document.getElementById("stats-container");

    container.innerHTML = ""; 

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
        p.innerHTML = `<span style="font-weight: bold">${capitalize(elem)}</span>` + ": " + data[elem];
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