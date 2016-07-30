// ***********************************************
// This is the function to call the bar charts 
// for this county's ranking
// *********************************************** 

function callCountyRanking(chartID) {
    var height = standardHeight;
    var margin = {
        top: 35,
        right: 50,
        bottom: 70,
        left: 100
    };

    var averages = [];
    var measure = "late_stage_percentage",
        axesText = "Avg. Late Stage Percentage";

    var countyMeans = [];

    var bisect = d3.bisector(function (d) {
        return d.date;
    }).left;

    var dateFormat = d3.time.format("%Y");
    //Set up scales, notice rangeBands for bar charts
    var yScale = d3.scale.linear()
        .range([margin.top, height - margin.bottom]);

    var xScale = d3.scale.ordinal()
        .rangeBands([margin.left, width - margin.right], .2);

    //Create the empty SVG image
    var svg = d3.select(chartID)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Configure axis generators

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .tickPadding(10);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .outerTickSize(0)
        .tickSubdivide(1)
        .innerTickSize(-width + margin.right + margin.left)
        .tickPadding(10)
        .tickFormat(function (d) {
            if (measure == "late_stage_percentage") {
                return d3.format("%")(d)
            } else if (measure == "total_ratio") {
                return d3.format(".2f")(d)
            } else {
                console.log("Error: 'measure' variable incorrect");
            }
        });

    //setup our ui buttons:
    d3.select("#countyrank-LS")
        .on("click", function (d, i) {
            $("#countyrank-RATE").removeClass("selected");
            $("#countyrank-LS").addClass("selected");
            measure = "late_stage_percentage";
            draw(measure);
        });
    d3.select("#countyrank-RATE")
        .on("click", function (d, i) {
            $("#countyrank-LS").removeClass("selected");
            $("#countyrank-RATE").addClass("selected");
            measure = "total_ratio";
            draw(measure);
        });

    // call the functions
    setupData();
    draw(measure);

    /*====================================================================
         setupData(), also draws axes and text labels
    ======================================================================*/
    function setupData() {

        // getting the averages of late stage percentage of each county in a neat little array
        nestByCounty.forEach(function (d) {
            var late_stage_mean = d3.mean(d.values, function (c) {
                return c.late_stage_percentage;
            });
            var total_ratio_mean = d3.mean(d.values, function (c) {
                return c.total_ratio;
            });

            if (isNaN(total_ratio_mean)) {
                total_ratio_mean = 0;
            };

            if (isNaN(late_stage_mean)) {
                late_stage_mean = 0;
            };

            if (d.key == countyNumber) {
                countyMeans.push({
                    late_stage_percentage: late_stage_mean,
                    total_ratio: total_ratio_mean
                });
            };

            averages.push({
                county: d.key,
                late_stage_percentage_mean: late_stage_mean,
                total_ratio_mean: total_ratio_mean
            });
        });

        yScale.domain(
                    [d3.max(averages, function (d) {
                return +d[measure + "_mean"];
            }), 0]
        );

        xScale.domain(
            averages.map(function (d) {
                return d.county;
            })
        );

        //Axes
        svg.append("g")
            .attr("class", "x axis hide-ticks")
            .attr("transform", "translate(0," + (height - margin.bottom) + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("x", width - margin.right)
            .attr("y", margin.top - 35)
            .attr("dy", "2em")
            .style("text-anchor", "end")
            .attr("class", "label")
            .text("County");

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (margin.left) + ",0)")
            .call(yAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("x", -height + margin.bottom + margin.top)
            .attr("y", -60)
            .attr("dy", "1em")
            .style("text-anchor", "start")
            .attr("class", "label")
            .text("");

        var countyLabel = svg.append("text")
            .attr("class", "county-ranking-label county-label")
            .style("opacity", 1)
            .text(function (d) {
                return countyMap[countyNumber];
            })
            .attr("dy", "1.2em")
            .attr("dx", ".5em")
            .attr("fill", "#444")
            .attr("text-anchor", "middle");

        var countyValue = svg.append("text")
            .attr("class", " county-ranking-label county-value")
            .style("opacity", 1)
            .attr("dy", "1.2em")
            .attr("dx", ".5em")
            .attr("fill", "#444")
            .attr("text-anchor", "middle");
    };

    /*====================================================================
         draw(), includes transitions
    ======================================================================*/
    function draw(measure) {
        averages.sort(function (a, b) {
            return b[measure + "_mean"] - a[measure + "_mean"];
        });

        yScale.domain(
                    [d3.max(averages, function (d) {
                return +d[measure + "_mean"];
            }), 0]
        );

        xScale.domain(
            averages.map(function (d) {
                return d.county;
            })
        );

        /// draw the bars
        var bars = svg.selectAll("rect.bar")
            .data(averages, function (d) {
                return d.county;
            });

        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .style("pointer-events", "all")
            .on("mouseover", mouseoverFunc)
            .on("mousemove", mousemoveFunc)
            .on("mouseout", mouseoutFunc);

        bars.exit()
            .transition()
            .duration(500)
            .ease("exp")
            .attr("width", 0)
            .remove();

        bars.transition()
            .duration(500)
            .ease("quad")
            .attr("y", function (d) {
                return yScale(+d[measure + "_mean"]);
            })
            .attr("transform", function (d) {
                return "translate(" + xScale(d.county) + ",0)"
            })
            .attr("height", function (d) {
                return height - margin.bottom - yScale(+d[measure + "_mean"]);
            })
            .attr("width", xScale.rangeBand())
            .attr("fill", function (d) {

                if (d.county == countyNumber) {
                    return "#f1735f";
                } else {
                    return "#ccc";
                }
            })
            .attr("opacity", function (d) {

                if (d.county == countyNumber) {
                    return .7;
                } else {
                    return .5;
                }
            });

        svg.select(".y.axis")
            .transition()
            .duration(300)
            .ease("quad")
            .call(yAxis);

        svg.select(".x.axis")
            .transition()
            .duration(300)
            .ease("quad")
            .call(xAxis);

        //  transition the labels
        var countyLabel = svg.select("text.county-label")
            .transition()
            .duration(500)
            .ease("quad")
            .attr("transform", "translate(" + xScale(countyNumber) + "," + (height - margin.bottom + 10) + ")");
        var countyValue = svg.select("text.county-value")
            .transition()
            .duration(500)
            .ease("quad")
            .attr("transform", "translate(" + xScale(countyNumber) + "," + (yScale(countyMeans[0][measure]) - 25) + ")")
            .text(function () {
                if (measure == "late_stage_percentage") {
                    return d3.format("%")(countyMeans[0][measure]);
                } else if (measure == "total_ratio") {
                    return d3.format(".2f")(countyMeans[0][measure]);
                } else {
                    console.log("Error: 'measure' variable incorrect");
                }
            });
    }
    /*====================================================================
         Mouse Functions
    ======================================================================*/

    function mouseoverFunc(d) {
        return tooltip
            .style("display", null); // this removes the display none setting
    };

    function mousemoveFunc(d) {
        return tooltip
            .style("top", (d3.event.pageY) - 80 + "px")
            .style("left", (d3.event.pageX + 15) + "px")
            .html(function () {
                if (measure == "late_stage_percentage") {
                    return "<p class='sans'><span class='tooltipHeader'>" + countyMap[d.county] + " County</span><br>Mean LS%: " + d3.format('%')(d[measure + "_mean"]) + "</p>"
                } else {
                    return "<p class='sans'><span class='tooltipHeader'>" + countyMap[d.county] + " County</span><br>Mean Rate: " + d3.format(".2f")(d[measure + "_mean"]) + "</p>"
                }
            });
    };

    function mouseoutFunc(d) {
        return tooltip.style("display", "none"); // this hides the tooltip
    };

};