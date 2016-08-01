// ***********************************************
// This is the function to call the small multiples
// for late stage percentage by race
// *********************************************** 

function callRaceBubbleCluster(chartID) {
    var diameter = 400,
        clusterpadding = 6,
        maxRadius = 12;

    var color = d3.scale.ordinal()
        .range(raceColors2)
        .domain(population);

    var svg = d3.select(chartID).append("svg")
        .attr("width", diameter)
        .attr("height", diameter);

    // reformat the data
    var countyPop = thisCountyDataset.population;
    var reformatted = [];
    population.forEach(function (d) {
        var population = countyPop[d + "_female"] + countyPop[d + "_male"];
        reformatted.push({
            race: d,
            population: population
        });
    });

    var bubble = d3.layout.pack()
        .sort(null)
        .size([diameter, diameter])
        .padding(1.5);

    var data = reformatted.map(function (d) {
        d.value = +d.population;
        return d;
    });
    
    console.log("DATA", data);
    data.sort(function(a, b) {
       return b.population - a.population; 
    });
        console.log("DATA", data);


    var nodes = bubble.nodes({
        children: data
    }).filter(function (d) {
        return !d.children;
    });

    //setup the chart
    var bubbles = svg.append("g")
        .attr("transform", "translate(0,0)")
        .selectAll(".bubble")
        .data(nodes)
        .enter();
    
    //create the bubbles
    bubbles.append("circle")
        .attr("r", function(d){ return d.r; })
        .attr("cx", function(d){ return d.x; })
        .attr("cy", function(d){ return d.y; })
        .style("fill", function(d) { return color(d.race); });
}