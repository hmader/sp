// ***********************************************
// This is the function to call the small multiples
// for late stage percentage by race
// *********************************************** 

function callRaceMultsArea(chartID) {
    // Heavily simplified version of Jim Vallandingham's Coffee Script tutorial at The National
    // https://flowingdata.com/2014/10/15/linked-small-multiples/
    //    var width = $(window).width()/3;
    var height = 150;
    var margin = {
        top: 35,
        right: 15,
        bottom: 15,
        left: 100
    };

    var color = d3.scale.ordinal()
        .range(["#f8f7ce", "#ffe59a", "#ffca7d", "#f6755f", "#ffaf71"])
        .domain(races);

    var datasetByRace = null,
        years = [],
        data = [],
        circle = null,
        caption = null,
        lines = null,
        curYear = null;

    var bisect = d3.bisector(function (d) {
        return d.year;
    }).left;

    // date format
    var dateFormat = d3.time.format("%Y");

    //Set up scales
    var xScale = d3.time.scale()
        .range([margin.left, width - margin.left - margin.right])
        .clamp(true);

    var yScale = d3.scale.linear()
        .range([height - margin.bottom - margin.top, margin.top])
        .clamp(true);


    //Configure area generator
    var area = d3.svg.area()
        .x(function (d) {
            return xScale(dateFormat.parse(d.year));
        })
        .y0(height - margin.bottom - margin.top)
        .y1(function (d) {
            //            console.log(d.race, d.year, d.late_stage);
            return yScale(+d.late_stage);
        });

    var line = d3.svg.line()
        .x(function (d) {
            return xScale(dateFormat.parse(d.year));
        })
        .y(function (d) {
            return yScale(+d.late_stage);
        });

    var xValue = function (d) {
        return d.year;
    };
    var yValue = function (d) {
        return d.data[d.race + "_late_stage"];
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
            return d3.format("%")(d)
        })
        .outerTickSize(0)
        .tickSubdivide(1)
        .tickSize(-width + margin.right + 2 * margin.left)
        .tickPadding(10);

    draw();

    function draw() {

        var prenest = [];

        $.each(thisCountyDataset.years, function (key, data) {
            races.forEach(function (d, i) { // races[] is an array defined in global-vars.js of the races from the dataset

                prenest.push({
                    race: d,
                    year: key,
                    late_stage: +data[d + "_late_stage"],
                    rate: +data[d],
                    data: data
                });
            });

            years.push(key);
        });

        //        console.log("RACES", races);

        datasetByRace = d3.nest().key(function (d) {
            return d.race;
        }).entries(prenest);

        //        console.log("prenest", prenest);
        //        console.log("databy race", datasetByRace);
        //        var dataset = transformData(data);


        d3.select(chartID).datum(datasetByRace).each(function (thisData) {
            data = thisData;
            // compute domains
            yScale.domain([0, 1.0]);

            xScale.domain(d3.extent(years, function (d) {
                return dateFormat.parse(d);
            }));

            var div = d3.select(this).selectAll(".multiple").data(data);
            div.enter()
                .append("div")
                .attr("class", "multiple")
                .append("svg");

            var svg = div.select("svg")
                .attr("width", width)
                .attr("height", height);
            
             // Axes

            svg.append("g")
                .attr("class", "y axis multiple")
                .attr("transform", "translate(" + (margin.left) + "," + margin.top + ")")
                .call(yAxis)
                .append("text")
                .attr("class", "subtitle")
                .attr("x", 0)
                .attr("y", 0)
                .attr("dy", "1em")
                .style("text-anchor", "start")
                .attr("class", "label").text(function (d) {
                    return uppercase(d.key) + " Late Stage %";
                });
            // end axes

            var g = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            g.append("rect")
                .attr("class", "background")
                .style("pointer-events", "all")
                .attr("width", width - margin.left - margin.left)
                .attr("height", height - margin.top - margin.bottom)
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
                .attr("class", "line")
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
                .attr("dy", 15).attr("y", height - margin.top - margin.bottom)
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
                .attr("y", height - margin.top - margin.bottom)
                .attr("x", width - margin.right - margin.left)
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
                .attr("y", height - margin.bottom - margin.top);

        }); // end multiple

    }; // end draw 
    /*====================================================================
       Mouse Functions   
    ==================================================================*/
    function mouseover() {
        console.log(circle);
        circle.attr("opacity", 1.0);
        d3.selectAll(".static-year").classed("hidden", true);
        return mousemove.call(this);
    };

    function mousemove() {
        var date, index, year;
        year = xScale.invert(d3.mouse(this)[0] + margin.left).getFullYear();
        date = dateFormat.parse('' + year);
        index = 0;
        console.log(this);
        circle
            .attr("cx", xScale(date))
            .attr("cy", function (c) {
                console.log("C", c);
                index = bisect(c.values, year, 0, c.values.length - 1);
                return yScale(yValue(c.values[index]));
            });

        caption
            .attr("x", xScale(date))
            .attr("y", function (c) {
                return yScale(yValue(c.values[index]));
            })
            .text(function (c) {
                return d3.format("%")(yValue(c.values[index]));
            });
        return curYear.attr("x", xScale(date)).text(year);
    };

    function mouseout() {
        d3.selectAll(".static-year").classed("hidden", false);
        circle.attr("opacity", 0);
        caption.text("");
        return curYear.text("");
    };
};