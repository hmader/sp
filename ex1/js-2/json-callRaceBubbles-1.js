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
        .range(raceColors2)
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
            return b.total - a.total;
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

                //                svg.append("rect")
                //                    .attr("class", "background")
                //                    .style("pointer-events", "all")
                //                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                //                    .attr("width", width - margin.right - margin.left)
                //                    .attr("fill", "#fff")
                //                    .attr("opacity", 0)
                //                    .attr("height", height - margin.top - margin.bottom)
                //                    .on("mouseover", mouseover)
                //                    .on("mousemove", mousemove)
                //                    .on("mouseout", mouseout);


                var g = svg.append("g")
                    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")

                g.append("circle")
                    .attr("class", "bubble")
                    //                    .style("pointer-events", "none")
                    .attr("r", function () {
                        return circleScale(d.total) / 2;
                    })
                    .attr("fill", function () {
                        return color(d.race);
                    });
//                    .on("mouseover", mouseover)
//                    .on("mousemove", mousemove)
//                    .on("mouseout", mouseout);

                g.append("text")
                    .attr("class", "subtitle")
                    .attr("x", 0)
                    .attr("y", -height / 2 + 25)
                    .attr("dy", "-1em")
                    .style("text-anchor", "middle")
                    .style("font-weight", "bold")
                    .text(function () {
                        return uppercase(d.race);
                    });

                g.append("text")
                    .attr("class", "subtitle")
                .style("pointer-events", "none")
                    .attr("x", 0)
                    .attr("y", height/2 - 5)
                    .style("text-anchor", "middle")
                    .text(function () {
                        return d3.format(",")(d.total);
                    });

            }); // end multiple

    }; // end draw
    /*====================================================================
       Mouse Functions   
==================================================================*/
    function mouseover(d) {
        var circ = d3.select(this);
        circ.attr("stroke", function (d) {
                return color(d.race);
            })
            .attr("stroke-width", 5)
            .attr("fill", "#fff");
        //        return tooltip
        //            .style("display", null); // this removes the display none setting
    };

    function mousemove(d) {
        var circ = d3.select(this);
        circ.attr("stroke", function (d) {
                return color(d.race);
            })
            .attr("stroke-width", 5)
            .attr("fill", "#fff");
        //        return tooltip
        //            .style("top", (d3.event.pageY) - 50 + "px")
        //            .style("left", (d3.event.pageX + 15) + "px")
        //            .html("<p class='sans'><span class='tooltipHeader'>" + uppercase(d.race) + "</span>" + d3.format(",")(d.total) + "</p>");
    };

    function mouseout(d) {
        var circ = d3.select(this);
        circ.attr("stroke", "none")
            .attr("stroke-width", 0)
            .attr("fill", function (d) {
                return color(d.race);
            });
        //        return tooltip.style("display", "none"); // this hides the tooltip
    };
};