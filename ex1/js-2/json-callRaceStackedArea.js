// ***********************************************
// This is the function to call the small multiples
// for late stage percentage by race
// *********************************************** 

// based off of http://bl.ocks.org/WillTurman/4631136
function callRaceStackedArea(chartID) {
    var height = 250;
    var margin = {
        top: 35,
        right: 15,
        bottom: 15,
        left: 100
    };

    var color = d3.scale.ordinal()
        .range(["#f8f7ce", "#ffe59a", "#ffca7d", "#f6755f", "#ffaf71"])
        .domain(races);

    var layers;
    var stack = d3.layout.stack()
        .offset("zero")
        .values(function (d) {
            return d.values;
        })
        .x(function (d) {
            return d.year;
        })
        .y(function (d) {
            return d.late_stage;
        });

    // date format
    var dateFormat = d3.time.format("%Y");

    //Set up scales
    var xScale = d3.time.scale()
        .range([margin.left, width - margin.left - margin.right])
        .clamp(true);

    var yScale = d3.scale.linear()
        .range([height - margin.bottom - margin.top, margin.top])
        .clamp(true);

    // bisector
    var bisect = d3.bisector(function (d) {
        return d.year;
    }).left;


    //Configure area generator
    var area = d3.svg.area()
        .interpolate("cardinal")
        .x(function (d) {
            return xScale(dateFormat.parse(d.year));
        })
        .y0(function (d) {
            return yScale(d.y0);
        })
        .y1(function (d) {
            return yScale(d.y0 + d.y);
        });

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
        .orient("left");

    setupData();
    draw();

    function setupData() {
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

        layers = stack(datasetByRace);
    }

    function draw() {
        yScale.domain([0, d3.max(datasetByRace, function (d) {
            return d3.max(d.values, function (d) {
                return d.y0 + d.y;
            });
        })]);

        xScale.domain(d3.extent(years, function (d) {
            return dateFormat.parse(d);
        }));
        /*=====================================================================
          Drawing the layers
 ======================================================================*/
        svg.selectAll(".layer")
            .data(layers)
            .enter().append("path")
            .attr("class", function (d) {
                return "layer " + "" + d.key;
            })
            .attr("d", function (d) {
                return area(d.values);
            })
            .style("fill", function (d, i) {
                return color(i);
            })
            .attr("opacity", .85)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseout", mouseout);
        /*=====================================================================
                          Adding the Axes
                 ======================================================================*/
        // Chart Title
        svg.append("text")
            .attr("class", "chart-title")
            .attr("x", margin.left)
            .attr("y", 0)
            .attr("dy", "1em")
            .style("text-anchor", "start")
            .text("Late Stage % by Race");

        svg.append("g")
            .attr("pointer-events", "none")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height - margin.bottom - margin.top) + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("x", width - margin.left - margin.right)
            .attr("y", 20)
            .attr("dy", "2em")
            .style("text-anchor", "end")
            .attr("class", "label")
            .text("Year");

        svg.append("g")
            .attr("pointer-events", "none")
            .attr("class", "y axis multiple")
            .attr("transform", "translate(" + (margin.left) + "," + 0 + ")")
            .call(yAxis)
            .append("text")
            .attr("class", "subtitle")
            .attr("x", 0)
            .attr("y", 0)
            .attr("dy", "1em")
            .style("text-anchor", "start")
            .text(function (d) {
                "Late Stage %";
            });
    }; // end draw 
    /*====================================================================
       Mouse Functions   
    ==================================================================*/
    function mouseover(d) {
        console.log("MOUSE", d);
    };

    function mousemove(d) {};

    function mouseout(d) {};
};