// ***********************************************
// This is the function to call the line charts
// for rates per 10,000 by race
// *********************************************** 

function callRaceRateLines(chartID) {
    // Heavily simplified version of Jim Vallandingham's Coffee Script tutorial at The National
    // https://flowingdata.com/2014/10/15/linked-small-multiples/
    var height = 350;
    var margin = {
        top: 60,
        right: 10,
        bottom: 50,
        left: 100
    };

    var datasetByRace = [],
        years = [],
        dataset = [],
        circle = null;

    var bisect = d3.bisector(function (d) {
        return d.date;
    }).left;

    var color = d3.scale.ordinal()
        .range(["#f8f7ce", "#ffe59a", "#ffca7d", "#f6755f", "#ffaf71"])
        .domain(races);
                
    var dateFormat = d3.time.format("%Y");

    //Configure line generator
    // each line dataset must have a d.year and a d.rate for this to work.
    var line = d3.svg.line()
        .x(function (d) {
            return xScale(dateFormat.parse(d.year));
        })
        .y(function (d) {
            return yScale(+d.rate);
        });

    //Set up scales
    var xScale = d3.time.scale().range([margin.left, width - margin.right - margin.left]);

    var yScale = d3.scale.linear().range([margin.top, height - margin.bottom - margin.top]);

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
        .ticks(endYear - startYear)
        .tickPadding(10);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .ticks(4)
        .outerTickSize(0)
        .tickSubdivide(1)
        .innerTickSize(-width + margin.right + 2 * margin.left)
        .tickPadding(10);

    //Create the empty SVG image
    var svg = d3.select(chartID)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    draw();

    function draw() {
        races.forEach(function (d, i) {

            var rates = [];

            $.each(thisCountyDataset.years, function (key, data) {
                rates.push({
                    race: d,
                    year: "" + key,
                    rate: data[d]
                });

                dataset.push({
                    race: d,
                    year: "" + key,
                    rate: data[d]
                });

                years.push(key);
            });

            datasetByRace.push({
                race: d,
                ratesByYear: rates
            });
        });

        console.log("databy race", datasetByRace);

        //Set scale domains - max and min of the years
        xScale.domain(
            d3.extent(years, function (d) {
                return dateFormat.parse(d);
            }));

        // max of rates to 0 (reversed, remember)
        yScale.domain([
    	d3.max(datasetByRace, function (d) {
                return d3.max(d.ratesByYear, function (d) {
                    return +d.rate;
                });
            }),
        0
    ]);
        /*=====================================================================
          Adding the Axes
 ======================================================================*/
//        // Chart Title
//        svg.append("text")
//            .attr("class", "chart-title")
//            .attr("x", margin.left)
//            .attr("y", 0)
//            .attr("dy", "1em")
//            .style("text-anchor", "start")
//            .text("Rates per 10,000 by Race");

        svg.append("g")
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
            .attr("class", "y axis")
            .attr("transform", "translate(" + margin.left + ",0)")
            .call(yAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("x", -height + margin.bottom + margin.top)
            .attr("y", -60)
            .attr("dy", "1em")
            .style("text-anchor", "start")
            .attr("class", "label")
            .text("Rate per 10,000");

        /*=====================================================================
                  Lines
======================================================================*/
        //Make a group for each race
        var groups = svg.selectAll("g.lines")
            .data(datasetByRace)
            .enter()
            .append("g")
            .attr("class", "lines");
        console.log("Race Line Charts", datasetByRace);
        //Within each group, create a new line/path,
        //binding just the rates data to each one
        groups.selectAll("path")
            .data(function (d) {
                return [d.ratesByYear];
            })
            .enter()
            .append("path")
            .attr("class", "line")
            .attr("stroke", function (d) {
                return color(d[0].race);
            })
            .attr("stroke-width", 3)
            .attr("fill", "none")
            .attr("opacity", .85)
            .attr("d", line);

        // Circles to show the values for the year on hover
        circle = svg.append("circle")
            .attr("r", 5)
            .attr("opacity", 0)
            .attr("stroke-width", 2.5)
            .attr("fill", "#fff")
            .style("pointer-events", "none");
        /*=====================================================================
                  Voronoi
======================================================================*/
        // Draw the circles for voronoi
        svg.selectAll("circle.voronoi")
            .data(dataset)
            .enter()
            .append("circle")
            .attr("class", function (d) {
                return "voronoi " + d.race + d.year;
            })
            .attr("r", 1)
            .style("opacity", 0)
            .attr("stroke", "none")
            .attr("fill", "none")
            .attr("cx", function (d) {
                return xScale(dateFormat.parse(d.year));
            })
            .attr("cy", function (d) {
                return yScale(d.rate);
            });

        // from http://www.visualcinnamon.com/2015/07/voronoi.html
        // and https://bl.ocks.org/mbostock/8033015
        var voronoiGroup = svg.append("g")
            .attr("class", "voronoiGroup");
        //Initiate the voronoi function
        //Use the same variables of the data in the .x and .y as used in the cx and cy of the circle call
        //The clip extent will make the boundaries end nicely along the chart area instead of splitting up the entire SVG
        //(if you do not do this it would mean that you already see a tooltip when your mouse is still in the axis area, which is confusing)
        var voronoi = d3.geom.voronoi()
            .x(function (d) {
                return xScale(dateFormat.parse(d.year));
            })
            .y(function (d) {
                return yScale(d.rate);
            })
            .clipExtent([[margin.left, margin.top], [width - margin.left, height - margin.top - margin.bottom]]);

        //Create the Voronoi grid
        voronoiGroup.selectAll("path")
            .data(voronoi(dataset)) //Use vononoi() with your dataset inside
            .enter().append("path")
            .filter(function (d) {
                return d !== undefined;
            })
            .attr("d", function (d, i) {
                return "M" + d.join("L") + "Z";
            })
            .datum(function (d, i) {
                return d.point;
            })
            //Give each cell a unique class where the unique part corresponds to the circle classes
            .attr("class", function (d, i) {
                return "voronoi " + d.race + d.year;
            })
            //            .style("stroke", "#2074A0") //If you want to look at the cells
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseover", mouseoverFunc)
            .on("mousemove", mousemoveFunc)
            .on("mouseout", mouseoutFunc);
    }

    /*====================================================================
       Mouse Functions   
    ==================================================================*/

    function mouseoverFunc(d) {
        return tooltip
            .style("display", null); // this removes the display none setting
    };

    function mousemoveFunc(d) {

        var x = xScale(dateFormat.parse(d.year));
        var y = yScale(d.rate);

        circle
            .attr("cx", x)
            .attr("cy", y)
            .attr("stroke", function () {
                return color(d.race);
            })
            .attr("opacity", 1.0);
        return tooltip
            .style("top", (d3.event.pageY) - 80 + "px")
            .style("left", (d3.event.pageX + 15) + "px")
            .html("<p class='sans'><span class='tooltipHeader'>" + uppercase(d.race) + ", " + d.year + "</span><br>Rate: " + d3.format(".2f")(d.rate) + "</p>");
    };

    function mouseoutFunc(d) {
        circle.attr("opacity", 0);
        return tooltip.style("display", "none"); // this hides the tooltip
    };
};