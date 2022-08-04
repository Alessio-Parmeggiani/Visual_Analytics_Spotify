function createHistogram(data, cat, update) {
    const div_height = document.getElementById(`${cat}-filter-container`).clientHeight;
    const div_width = document.getElementById(`${cat}-filter-container`).clientWidth;

    // set the dimensions and margins of the histogram
    const margin = {top: 10, right: 20, bottom: 25, left: 35},
    width = div_width - margin.left - margin.right,
    height = div_height - margin.top - margin.bottom;

    const limitsSpan = document.getElementById(`${cat}-limits`)

    let lowLimit;
    let topLimit;

    let catMin;
    let catMax;

    let binsNum;

    if (cat == "tempo") {
        // Values found analyzing the dataset
        catMin = 0;
        catMax = 220;
        binsNum = 22;
    }
    else if (cat == "loudness") {
        // As per Spotify API documentation
        catMin = -60;   
        catMax = 0;
        binsNum = 12;
    }
    else {
        catMin = 0;
        catMax = 1;
        binsNum = 20;
    }

    const svg = d3.select(`#${cat}-filter-container`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // On the x axis we have the values for the speechiness
        // they go from 0 to 1
        let x = d3.scaleLinear()
            .domain([catMin, catMax])
            .range([0, width]);
        
        svg.append("g")
            .call(d3.axisBottom(x))
            .attr("transform", function(d) {
                return `translate(0, ${height})`
            });

        // I want the histogram to show the distribution of values between 0 and 1
        // So if there are no more values greater than the maximum of a category, I want to show it
        let histogram = d3.histogram()
            .value(function(d) { return d[cat] })
            .domain(x.domain())
            .thresholds(x.ticks(binsNum));

        let bins = histogram(data);
        let histArr = getHistValues(data, binsNum, cat, catMin, catMax);
        //console.log(`histArr: ${histArr}`)

        // the y axis represents the number of samples that have value for that
        // category in the bin
        let y = d3.scaleLinear()
            .domain([0, d3.max(histArr)])
            .range([height, 0]);

        // define ticks
        const numTicks = 7
        let step = Math.round(d3.max(histArr)/(numTicks))
        let tickArr = []
        for (let i=0; i<numTicks; i++) {
            if (step*i < d3.max(histArr)) {
                tickArr.push(step*i)
            }
        }
        tickArr.push(d3.max(histArr))

        svg.append("g")
            .call(d3.axisLeft(y)
                .tickValues(tickArr));

        svg.selectAll("rect")
            .data(bins)
            .enter()
            .append("rect")
                .attr("x", 1)
                .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
                .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
                .attr("height", function(d) { return height - y(d.length); })
                .style("fill", "#69b3a2");

        /*
        let brushLabelL = svg.append("text")
                    .attr("id", "brush-label-L")
                    .attr("x", 0)
                    .attr("y", height+25)

        let brushLabelR = svg.append("text")
                    .attr("id", "brush-label-R")
                    .attr("x", 0)
                    .attr("y", height+25)
        */

        let brush = d3.brushX()
            .extent([[0, 0], [width, height]])
            .on("brush", function(event) {
                let s = event.selection;

                // this is to avoid the execution of the following code when the brush is automatically resized to a prefixed value
                // without it it would keep looping because every resize generates a new brush event
                if (!event.sourceEvent) return;

                lowLimit = round2Bin(x.invert(s[0]), cat, binsNum, catMin, catMax);
                topLimit = round2Bin(x.invert(s[1]), cat, binsNum, catMin, catMax);

                /*
                // update and move labels
                brushLabelL
                    .attr("x", [lowLimit].map(x)[0])
                    .text(`${lowLimit}`)
                brushLabelR
                    .attr("x", [topLimit].map(x)[0])
                    .text(`${topLimit}`)
                */

                limitsSpan.innerHTML = `[${lowLimit}, ${topLimit}]`

                // moving the brush to one of the bins
                d3.select(this).call(brush.move, [lowLimit, topLimit].map(x))

                // Lowering opacity of histogram bars not selected
                svg.selectAll("rect")
                    .style("opacity", function(d) {
                        return (d.x0 >= lowLimit && d.x1 <= topLimit) ? "1" : "0.4"
                    })

                update(lowLimit, topLimit, cat)
            })
            .on("end", function(event) {
                // If I click outside of the brush, reset filter
                if (event.selection == null) {
                    /*
                    brushLabelL
                        .attr("x", [lowLimit].map(x)[0])
                        .text("")
                    brushLabelR
                        .attr("x", [topLimit].map(x)[0])
                        .text("")
                    */

                    limitsSpan.innerHTML = ""

                    lowLimit = catMin;
                    topLimit = catMax;

                    svg.selectAll("rect")
                        .style("opacity", "1")

                    update(lowLimit, topLimit, cat)
                }

                console.log(`I valori sono: ${lowLimit}, ${topLimit}`)
            })

        svg.append("g")
            .attr("class", "brush")
            .call(brush)

    return lowLimit, topLimit;
}