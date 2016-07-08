// ***********************************************
// This is the function to call the small multiples
// for late stage percentage by race
// *********************************************** 

function callRaceMults(jsonURL, chartID) {
    // Heavily simplified version of Jim Vallandingham's Coffee Script tutorial at The National
    // https://flowingdata.com/2014/10/15/linked-small-multiples/
    //    var width = $(window).width()/3;
    var height = 200;
    var margin = {
        top: 35,
        right: 70,
        bottom: 30,
        left: 50
    };

    var datasetByRace = null,
        years = [],
        data = [],
        circle = null,
        caption = null,
        curYear = null;

    var bisect = d3.bisector(function (d) {
        return d.date;
    }).left;

    var dateFormat = d3.time.format("%Y");
    //Set up scales
    var xScale = d3.scale.ordinal().rangeRoundBands([margin.left, width - margin.right - margin.left], .5);

    var yScale = d3.scale.linear().range([height - margin.bottom - margin.top, margin.top]);

    var xValue = function (d) {
        return d.year;
    };
    var yValue = function (d) {
        //        console.log("YVAL", d.data, [d.race + "_late_stage"], d.data[d.race + "_late_stage"]);
        return d.data[d.race + "_late_stage"];
    };

    // to uppercase one-word strings
    var uppercase = function (wordString) {
        return (wordString[0].toUpperCase() + wordString.slice(1, wordString.length));
    }

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
            return d3.format("%")(d)
        })
        .outerTickSize(0)
        .tickSubdivide(1)
        .tickSize(-width + margin.right + 2 * margin.left)
        .tickPadding(10);

    d3.json(jsonURL, function (error, json) {

        if (error) {
            console.log(error);
        };

        var prenest = [];

        $.each(json.years, function (key, data) {
            prenest.push({
                race: "asian",
                year: key,
                data: data
            }, {
                race: "black",
                year: key,
                data: data
            }, {
                race: "white",
                year: key,
                data: data
            });

            years.push(key);
        });

        datasetByRace = d3.nest().key(function (d) {
            return d.race;
        }).entries(prenest);

        console.log("prenest", prenest);
        console.log("databy race", datasetByRace);
        //        var dataset = transformData(data);

        var mults = d3.select(chartID).selectAll("svg")
            .data(datasetByRace)
            .enter()
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .each(function (d, i) {

                var svg = d3.select(this)
                    .attr("width", width - margin.left - margin.right);


                // compute domains
                yScale.domain([0, 1.0]);

                xScale.domain(d.values.map(function (d) {
                    return d.year;
                }));

                // Chart Title
                //                svg.append("text")
                //                    .attr("class", "chart-title")
                //                    .attr("x", margin.left)
                //                    .attr("y", 0)
                //                    .attr("dy", "1em")
                //                    .style("text-anchor", "start")
                //                    .text(function (d) {
                //                        return "Late Stage % for " + uppercase(d.key);
                //                    });
                // Axes

                svg.append("g")
                    .attr("class", "y axis multiple")
                    .attr("transform", "translate(" + (margin.left) + ",0)")
                    .call(yAxis)
                    .append("text")
                    .attr("class", "label")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("dy", "1em")
                    .style("text-anchor", "start")
                    .attr("class", "label").text(function (d) {
                        return uppercase(d.key) + " Late Stage %";
                    });

                svg.append("g")
                    .attr("class", "x axis multiple")
                    .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
                    .call(xAxis)
                    .append("text")
                    .attr("class", "label")
                    .attr("x", width - margin.left - margin.right - 10)
                    .attr("y", 0)
                    .attr("dy", "2em")
                    .style("text-anchor", "end")
                    .attr("class", "label")
                    .text("");

                // bars for the charts

                svg.append("g")
                    .attr("class", "percentages")
                    .selectAll(".bar")
                    .data(function (d) {
                        return d.values;
                    })
                    .enter()
                    .append("rect")
                    .attr("class", function (d) {
                        return d.race;
                    })
                    .attr("x", function (d) {
                        //                    console.log(d.year);
                        return xScale(d.year);
                    })
                    .attr("width", xScale.rangeBand())
                    .attr("y", function (d) {
                        //                            console.log(d, d.data, d.data[d.race + "_late_stage"]);
                        //                    console.log(yScale(.2));
                        return yScale(d.data[d.race + "_late_stage"]);
                    })
                    .attr("height", function (d) {
                        return height - margin.bottom - margin.top - yScale(d.data[d.race + "_late_stage"]);
                    })
                    .attr("fill", "#f1735f")
                    .attr("opacity", .75);
                //                    .on('mouseout', function (d) {
                //                        tip.hide(d);
                //                        var replacedStrings = d.country.replace(" ", "_");
                //                        d3.selectAll(".wrapperScatterMultiples ." + replacedStrings).classed("hoverFocus", false);
                //                    })
                //                    .on('mouseover', function (d) {
                //                        tip.show(d);
                //                        var replacedStrings = d.country.replace(" ", "_");
                //                        d3.selectAll(".wrapperScatterMultiples ." + replacedStrings).classed("hoverFocus", true);
                //                    });


                //                svg.call(tip);

            }); // end of creating the chart for each data row

        //        function mouseover() {
        //            circle.attr("opacity", 1.0);
        //            d3.selectAll(".static_year").classed("hidden", true);
        //            return mousemove.call(this);
        //        };
        //
        //        function mousemove() {
        //            var date, index, year;
        //            year = xScale.invert(d3.mouse(this)[0]).getFullYear();
        //            date = format.parse('' + year);
        //            index = 0;
        //            circle.attr("cx", xScale(date)).attr("cy", function (c) {
        //                index = bisect(c.values, date, 0, c.values.length - 1);
        //                return yScale(yValue(c.values[index]));
        //            });
        //            caption.attr("x", xScale(date)).attr("y", function (c) {
        //                return yScale(yValue(c.values[index]));
        //            }).text(function (c) {
        //                return yValue(c.values[index]);
        //            });
        //            return curYear.attr("x", xScale(date)).text(year);
        //        };
        //
        //        function mouseout() {
        //            d3.selectAll(".static_year").classed("hidden", false);
        //            circle.attr("opacity", 0);
        //            caption.text("");
        //            return curYear.text("");
        //        };
        //
        //        d3.select("#button-wrap").selectAll("div").on("click", function () {
        //            var id;
        //            id = d3.select(this).attr("id");
        //            d3.select("#button-wrap").selectAll("div").classed("active", false);
        //            d3.select("#" + id).classed("active", true);
        //            return $("#vis").isotope({
        //                sortBy: id
        //            });
        //        }); // end button setup

    }); // end of read tsv
}