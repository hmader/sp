// ***********************************************
// This is the function to call the small multiples
// for late stage percentage by race
// *********************************************** 

// based off of http://bl.ocks.org/WillTurman/4631136
function callRaceStreamgraph(chartID) {
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
        .offset("wiggle")
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

    // bisector
    var bisect = d3.bisector(function (d) {
        return d.year;
    }).left;

    //Set up scales
    var xScale = d3.time.scale()
        .range([margin.left, width - margin.left - margin.right])
        .clamp(true);

    var yScale = d3.scale.linear()
        .range([height - margin.bottom - margin.top, margin.top])
        .clamp(true);


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

    var bindingLine;


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

        bindingLine = svg.append("line")
            .attr("class", "line")
            .attr("opacity", 0)
            .attr("stroke-width", 1)
            .attr("stroke", "#000")
            .style("pointer-events", "none");
    }; // end draw 
    /*====================================================================
       Mouse Functions   
    ==================================================================*/
    function mouseover(d) {
        bindingLine.attr("opacity", 1.0);

        var year = xScale.invert(d3.mouse(this)[0]).getFullYear();
        return tooltip
            .style("display", null) // this removes the display none setting
            .html("<p class='sans'><span class='tooltipHeader'>" + year + "</span></p>");
    }

    function mousemove(d) {
        var date, index, year;
        year = xScale.invert(d3.mouse(this)[0] + margin.left).getFullYear();
        date = dateFormat.parse('' + year);
        index = 0;
        bindingLine
            .attr("x1", xScale(date))
            .attr("y1", yScale(0))
            .attr("x2", xScale(date))
            .attr("y2", function () {
                index = bisect(d.values, year, 0, d.values.length - 1);
                return yScale.range()[1];
            });

        return tooltip
            .style("top", (d3.event.pageY) - 80 + "px")
            .style("left", (d3.event.pageX + 15) + "px")
            .html("<p class='sans'><span class='tooltipHeader'>" + uppercase(d.key) + ", " + d.values[index]["year"] + "</span><br>LS%: " + d3.format("%")(d.values[index]["late_stage"]) + "</p>");
    };

    function mouseout(d) {
        bindingLine.attr("opacity", 0);
        return tooltip.style("display", "none"); // this hides the tooltip
    };

};