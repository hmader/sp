// ***********************************************
// This is the function to call the small multiples
// for late stage percentage by gender
// *********************************************** 

function callGenderMultsArea(chartID) {
     // Heavily simplified version of Jim Vallandingham's Coffee Script tutorial at The National
    // https://flowingdata.com/2014/10/15/linked-small-multiples/
    var height = genderMultiplesHeight;
    var margin = {
        top: 30,
        right: 15,
        bottom: 30,
        left: 50
    };

    var color = d3.scale.ordinal()
        .range(["#f6755f", "#ffaf71"])
        .domain(genders);

    var datasetByGender = null,
        years = [],
        data = [],
        circle = null,
        caption = null,
        lines = null,
        curYear = null;

    var bisect = d3.bisector(function (d) {
        return d.year;
    }).left;

    var measure = "late_stage";

    // date format
    var dateFormat = d3.time.format("%Y");

    //Set up scales
    var xScale = d3.time.scale()
        .range([margin.left, width - margin.right])
        .clamp(true);

    var yScale = d3.scale.linear()
        .range([height - margin.bottom, margin.top])
        .clamp(true);


    //Configure area generator
    var area = d3.svg.area()
        .x(function (d) {
            return xScale(dateFormat.parse(d.year));
        })
        .y0(height - margin.bottom)
        .y1(function (d) {
            return yScale(+d[measure]);
        });

    var line = d3.svg.line()
        .x(function (d) {
            return xScale(dateFormat.parse(d.year));
        })
        .y(function (d) {
            return yScale(+d[measure]);
        });

    var xValue = function (d) {
        return d.year;
    };
    var yValue = function (d) {
        if (measure == "late_stage") {
            return d.data[d.gender + "_late_stage"];
        } else if (measure == "rate") {
            return d.data[d.gender];
        } else {
            console.log("Error: 'measure' variable incorrect");
        }
    };

    // Configure axis generators

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(0)
        .tickPadding(10)
        .tickValues(xScale.domain().filter(function (d, i) {
            return !(i % 2);
        }));


    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .ticks(2)
        .tickFormat(function (d) {
            if (measure == "late_stage") {
                return d3.format("%")(d)
            } else if (measure == "rate") {
                return d3.format(".0f")(d)
            } else {
                console.log("Error: 'measure' variable incorrect");
            }
        })
        .outerTickSize(0)
        .tickSubdivide(1)
        .tickSize(-width + margin.right + margin.left)
        .tickPadding(10);

 // check to see if the dataset meets the cutoff - if yes, proceed, if not, draw the "not enough data" message
    if (Object.keys(thisCountyDataset.years).length < numberOfYears) {

        var height = standardHeight;
        var svg = d3.select(chartID)
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        notEnoughDataMessage(width, height, svg);

    } else {
        //setup our ui buttons:
        $("#genderMultiples-LS").addClass("selected");

        d3.select("#genderMultiples-RATE")
            .on("click", function (d, i) {
                $("#genderMultiples-LS").removeClass("selected");
                $("#genderMultiples-RATE").addClass("selected");
                measure = "rate";
                redraw();
            });
        d3.select("#genderMultiples-LS")
            .on("click", function (d, i) {
                $("#genderMultiples-RATE").removeClass("selected");
                $("#genderMultiples-LS").addClass("selected");
                measure = "late_stage";
                redraw();
            });
        // call the chart functions
        setupData();
        draw();
    } // end check
    /*====================================================================
       setupData() Function 
    ==================================================================*/
    function setupData() {

        var prenest = [];

        $.each(thisCountyDataset.years, function (key, data) {
            genders.forEach(function (d, i) { // genders[] is an array defined in global-vars.js of the genders from the dataset

                prenest.push({
                    gender: d,
                    year: key,
                    late_stage: +data[d + "_late_stage"],
                    rate: +data[d],
                    data: data
                });
            });

            years.push(key);
        });

        datasetByGender = d3.nest().key(function (d) {
            return d.gender;
        }).entries(prenest);

        datasetByGender.sort(function (a, b) {
            return (d3.mean(b.values, function (c) {
                return c["late_stage"];
            })) - (d3.mean(a.values, function (c) {
                return c["late_stage"];
            }));
        });
    } // end setupData
    /*====================================================================
       draw() Function 
    ==================================================================*/

    function draw() {
        d3.select(chartID).datum(datasetByGender).each(function (thisData) {
            data = thisData;
            // compute domains
            var ymax;

            if (measure == "late_stage") {
                ymax = 1.0;
            } else if (measure == "rate") {
                ymax = d3.max(datasetByGender, function (d) {
                    return d3.max(d.values, function (c) {
                        return c.rate;
                    });

                });
            };

            yScale.domain([0, ymax]);

            xScale.domain(d3.extent(years, function (d) {
                return dateFormat.parse(d);
            }));

            var div = d3.select(this).selectAll(".multiple").data(data);
            div.enter()
                .append("svg")
                .attr("class", "multiple gender-svg")
                .attr("width", width)
                .attr("height", height)
                .append("svg");

            var svg = div.select("svg")
                .attr("width", width)
                .attr("height", height);

            // Axes

            svg.append("g")
                .attr("class", "y axis multiple")
                .attr("transform", "translate(" + margin.left + ",0)")
                .call(yAxis)
                .append("text")
                .attr("class", "multiples-subtitle")
                .attr("x", 0)
                .attr("y", 0)
                .attr("dy", "1em")
                .style("text-anchor", "start")
            .style("fill", "#666")
                .text(function (d) {
                    return uppercase(d.key);
                });
            // end axes

            var g = svg.append("g")
                .attr("transform", "translate(" + margin.left + ",0)");

            g.append("rect")
                .attr("class", "background")
                .style("pointer-events", "all")
                .attr("width", width - margin.right)
                .attr("height", height - margin.bottom)
                .attr("fill", "none")
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseout", mouseout);

            var lines = g.append("g")
                .attr("transform", "translate(" + (-margin.left) + ",0)");

            lines.append("path")
                .attr("class", "area")
                .style("pointer-events", "none")
                .attr("d", function (c) {
                    return area(c.values);
                })
                .attr("fill", function (d) {
                    return color(d.key);
                })
                .attr("opacity", .65);

            lines.append("path")
                .attr("class", "line gender-mult")
                .style("pointer-events", "none")
                .attr("stroke", function (d) {
                    return color(d.key);
                })
                .attr("d", function (c) {
                    return line(c.values);
                });

            //********************

            lines.append("text")
                .attr("class", "static-year")
                .attr("text-anchor", "start")
                .attr("fill", "#aaa")
                .style("pointer-events", "none")
                .attr("dy", 15).attr("y", height - margin.bottom)
                .attr("x", margin.left)
                .text(function (c) {
                    return c.values[0]["year"];
                });

            lines.append("text")
                .attr("class", "static-year")
                .attr("text-anchor", "end")
                .attr("fill", "#aaa")
                .style("pointer-events", "none")
                .attr("dy", 15)
                .attr("y", height - margin.bottom)
                .attr("x", width - margin.right)
                .text(function (c) {
                    return c.values[c.values.length - 1]["year"];
                });

            circle = lines.append("circle")
                .attr("r", 2.2)
                .attr("opacity", 0)
                .style("pointer-events", "none");

            caption = lines.append("text")
                .attr("class", "multiples-caption")
                .attr("text-anchor", "middle")
                .style("pointer-events", "none")
                .attr("dy", -8);

            curYear = lines.append("text")
                .attr("class", "curYear")
                .attr("text-anchor", "middle")
                .style("pointer-events", "none")
                .attr("dy", 15)
                .attr("y", height - margin.bottom);
        }); // end multiple

    } // end draw 

    /*====================================================================
       redraw()  
    ==================================================================*/
    function redraw() {

        svgs = d3.selectAll("svg.multiple.gender-svg");
        var ymax;

        if (measure == "late_stage") {
            ymax = 1.0;
        } else if (measure == "rate") {
            ymax = d3.max(datasetByGender, function (d) {
                return d3.max(d.values, function (c) {
                    return c.rate;
                });

            });
        };

        yScale.domain([0, ymax]);
        console.log("in transition", yScale.domain());

        svgs.each(function (d) {
            var chart = d3.select(this);

            console.log("chart", chart);
            chart.select(".y.axis")
                .transition()
                .duration(300)
                .call(yAxis);

            var thisArea = chart.select("path.area");

            thisArea.transition()
                .duration(300)
                .ease("quad")
                .attr("d", function (c) {
                    return area(c.values);
                });

            var thisLine = chart.select("path.line");

            thisLine.transition()
                .duration(300)
                .ease("quad")
                .attr("d", function (c) {
                    return line(c.values);
                });
        });
    } // end redraw
    /*====================================================================
       Mouse Functions   
    ==================================================================*/
    function mouseover() {
        circle.attr("opacity", 1.0);
        d3.selectAll(".static-year").classed("hidden", true);
        return mousemove.call(this);
    } // end mouseover

    function mousemove() {
        var date, index, year;
        year = xScale.invert(d3.mouse(this)[0] + margin.left).getFullYear();
        date = dateFormat.parse('' + year);
        index = 0;
        circle
            .attr("cx", xScale(date))
            .attr("cy", function (c) {
                index = bisect(c.values, year, 0, c.values.length - 1);
                return yScale(yValue(c.values[index]));
            });

        caption
            .attr("x", xScale(date))
            .attr("y", function (c) {
                return yScale(yValue(c.values[index]));
            })
            .text(function (c) {
                if (measure == "late_stage") {
                    return d3.format("%")(yValue(c.values[index]));
                } else if (measure == "rate") {
                    return d3.format(".2f")(yValue(c.values[index]));
                } else {
                    console.log("Error: 'measure' variable incorrect");
                }
            });
        return curYear.attr("x", xScale(date)).text(year);
    } // end mousemove

    function mouseout() {
        d3.selectAll(".static-year").classed("hidden", false);
        circle.attr("opacity", 0);
        caption.text("");
        return curYear.text("");
    } // end mouseout
    
} // end callGenderMultsArea