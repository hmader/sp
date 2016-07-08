// ***********************************************
// This is the function to call the small multiples
// for late stage percentage by race
// *********************************************** 

function callRaceMultsArea(chartID) {
    // Heavily simplified version of Jim Vallandingham's Coffee Script tutorial at The National
    // https://flowingdata.com/2014/10/15/linked-small-multiples/
    //    var width = $(window).width()/3;
    var height = 200;
    var margin = {
        top: 35,
        right: 10,
        bottom: 30,
        left: 100
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

    // date format
    var dateFormat = d3.time.format("%Y");

    //Set up scales
    var xScale = d3.time.scale()
        .range([margin.left, width - margin.right - margin.left]);

    var yScale = d3.scale.linear().range([height - margin.bottom - margin.top, margin.top]);


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
        //        console.log("YVAL", d.data, [d.race + "_late_stage"], d.data[d.race + "_late_stage"]);
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
                //                console.log(d, +data[d + "_late_stage"]);
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

        var mults = d3.select(chartID).selectAll("svg")
            .data(datasetByRace)
            .enter()
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .each(function (d, i) {

                var svg = d3.select(this)
                    .attr("width", width - margin.left - margin.right);

                // compute domains
                yScale.domain([0, 1.0]);

                xScale.domain(d3.extent(years, function (d) {
                    return dateFormat.parse(d);
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

                // area for the charts

                svg.append("path")
                    .attr("class", "area")
                    .attr("d", function (c) {
                        return area(c.values);
                    })
                    .attr("fill", "#f1735f")
                    .attr("opacity", .75);

                svg.append("path")
                    .attr("class", "line")
                    .style("pointer-events", "none")
                    .attr("stroke", "#f1735f")
                    .attr("d", function (c) {
                        return line(c.values);
                    });
            });

    } // end of read tsv
}