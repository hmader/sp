// ***********************************************
// This is the function to call the small multiples
// for late stage percentage by race
// *********************************************** 

function callRaceBubbles(chartID) {
    var width = 150;
    var height = 150;
    var margin = {
        top: 35,
        right: 10,
        bottom: 35,
        left: 10
    };

    var reformatted = [];

    var color = d3.scale.ordinal()
        .range(["#f8f7ce", "#ffe59a", "#ffca7d", "#ffaf71", "#f6755f"])
        .domain(population);

    //Set up scale
    var circleScale = d3.scale.sqrt().range([height - margin.bottom - margin.top, 0]);

    setupData();
    draw();

    function setupData() {
        var countyPop = thisCountyDataset.population;
        population.forEach(function (d) {
            var total = countyPop[d + "_female"] + countyPop[d + "_male"];
            var percentage = total / countyPop.total;
            reformatted.push({
                race: d,
                total: total,
                percentage: percentage
            });
        });

        circleScale.domain([
    	d3.max(reformatted, function (d) {
                return +d.total;
            }),
        0
    ]);
        
        reformatted.sort(function (a, b) {
            return a.total - b.total;
        });
    };
    
    function draw() {

        var mults = d3.select(chartID).selectAll("svg")
            .data(reformatted)
            .enter()
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .each(function (d, i) {

                var svg = d3.select(this);

                console.log("Data", d);

                var g = svg.append("g")
                    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")

                g.append("circle")
                    .attr("class", "bubble")
                    .attr("r", function () {
                        return circleScale(d.total) / 2;
                    })
                    .attr("fill", function () {
                        return color(d.race);
                    });
                
                g.append("text")
                    .attr("class", "subtitle")
                    .attr("x", 0)
                    .attr("y", -height/2 + 25)
                    .attr("dy", "-1em")
                    .style("text-anchor", "middle")
                    .text(function () {
                        return uppercase(d.race);
                    });
                
                g.append("text")
                    .attr("class", "subtitle")
                    .attr("x", 0)
                    .attr("y", height/2 + 5)
                    .attr("dy", "-1em")
                    .style("text-anchor", "middle")
                    .text(function () {
                        return d3.format(",")(d.total);
                    });


            }); // end multiple

    }; // end draw 
};