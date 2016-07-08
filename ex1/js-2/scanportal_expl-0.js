// ***********************************************
// This is the function to call the area charts 
// for total cases and late stage cases per year
// *********************************************** 

function callCountArea() {

    //Dimensions and padding
    var width = $(window).width();
    var height = 500;
    var margin = {
        top: 40,
        right: 10,
        bottom: 50,
        left: 100
    };

    //Set up date formatting and years
    var dateFormat = d3.time.format("%Y");

    var bisect = d3.bisector(function (d) {
        return d.year;
    }).left;

    var circle, bindingLine, circleText;

    //Set up scales
    var xScale = d3.time.scale()
        .range([margin.left, width - margin.right - margin.left]);

    var yScale = d3.scale.linear()
        .range([margin.top, height - margin.bottom]);



    //Configure axis generators
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(15)
        .tickFormat(function (d) {
            return dateFormat(d);
        });

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");


    //Configure area generator
    var area = d3.svg.area()
        .x(function (d) {
            return xScale(dateFormat.parse(d.year));
        })
        .y0(height - margin.bottom)
        .y1(function (d) {
            return yScale(+d.count);
        });

    var line = d3.svg.line()
        .x(function (d) {
            return xScale(dateFormat.parse(d.year));
        })
        .y(function (d) {
            return yScale(+d.count);
        });

    //Create the empty SVG image
    var svg = d3.select("#chart0")
        .append("svg")
        .attr("width", width)
        .attr("height", height);



    //Load data
    d3.csv("data/Female_Breast_Cancer-1.csv", function (error, data) {

        if (error) {
            console.log("error: ", error)
        };

        //Create a new, empty array to hold our restructured dataset
        var datasetByCountType = [];

        //    console.log("data ", data);

        var total = [];
        var lateStage = [];


        //Set scale domains
        xScale.domain(d3.extent(years, function (d) {
            return dateFormat.parse(d);
        }));

        // domain is 0 - highest total of all counties
        yScale.domain([
        d3.max(data, function (d) {
                return +d.total;
            }),
            0
    ]);


        data.forEach(function (d, i) {

            if (d.county == county) {

                //Add a new object to the new emissions data array
                total.push({
                    county: d.county, // county name
                    cancer: d.cancer_type,
                    counting: "total", // what this is a count of
                    year: d.year, // year
                    count: d.total // the count
                });

                lateStage.push({
                    county: d.county, // county name
                    cancer: d.cancer_type,
                    counting: "late_stage", // what this is a count of
                    year: d.year, // year
                    count: d.late_stage_count // the count
                });
            }

        });

        datasetByCountType.push({
            Counting: "Total",
            counts: total
        }, {
            Counting: "Late_Stage",
            counts: lateStage
        });


        //    console.log("total", total);
        //    console.log("late stage", lateStage);
        console.log("AREA data", data);
        console.log("AREA dataset", datasetByCountType);

        //    data.forEach(function (d, i) {
        //
        //        var myEmissions = [];
        //
        //        //Loop through all the years - and get the emissions for this data element
        //        years.forEach(function (y) {
        //
        //            // If value is not empty
        //            if (d[y]) {
        //                //Add a new object to the new emissions data array - for year, amount
        //                myEmissions.push({
        //                    country: d.countryName, // we can put the country in here too. It won't hurt.
        //                    year: y,
        //                    amount: d[y] // this is the value for, for example, d["2004"]
        //                });
        //            }
        //
        //        });
        //
        //        //Create new object with this country's name and empty array
        //        // d is the current data row... from data.forEach above.
        //        dataset.push({
        //            country: d.countryName,
        //            emissions: myEmissions // we just built this!
        //        });
        //
        //    });

        // domain is 0 - highest total current county
        //    yScale.domain([
        //    					d3.max(datasetByCountType, function (d) {
        //            return d3.max(d.counts, function (d) {
        //                return +d.count;
        //            });
        //        }),
        //    					0
        //    				]);

        /* ================================= 
            Drawing
           ================================= */

        // Create the line between the two circles - x and y values set later
        bindingLine = svg.append("line")
            .attr("class", "binding-line")
            .attr("opacity", 0)
            .attr("stroke-width", 1)
            .attr("stroke", "#f1735f")
            .style("stroke-dasharray", ("5, 5"))
            .style("pointer-events", "none");

        //Axes
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height - margin.bottom) + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("x", width - margin.left - margin.right)
            .attr("y", -margin.bottom + 10)
            .attr("dy", "2em")
            .style("text-anchor", "end")
            .attr("class", "label")
            .text("Year");

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (margin.left) + ",0)")
            .call(yAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(90)")
            .attr("x", margin.top)
            .attr("y", -30)
            .attr("dy", "1em")
            .style("text-anchor", "start")
            .attr("class", "label")
            .text("Rates per 100,000");

        //Title
        svg.append("text")
            .attr("class", "chart-title")
            .attr("x", margin.left)
            .attr("y", 0)
            .attr("dy", "1em")
            .style("text-anchor", "start")
            .text("Overall and Late Stage Rates for County " + county);

        //Make a group for each count type
        var groups = svg.selectAll("g.graph")
            .data(datasetByCountType)
            .enter()
            .append("g")
            .attr("class", "graph");

        // Within each group, create a new path,
        // binding just the counts data to each one
        // these are the area paths
        groups.selectAll("path")
            .data(function (d) {
                return [d.counts];
            })
            .enter()
            .append("path")
            .attr("class", "area")
            .attr("fill", "#f1735f")
            .attr("opacity", 0.5)
            .attr("d", area);

        // Line over the area
        groups.append("path")
            .attr("class", "line")
            .style("pointer-events", "none")
            .attr("stroke", "#f1735f")
            .attr("d", function (c) {
                return line(c.counts);
            });

        //    groups.on("mouseover", mouseoverFunc)
        //        .on("mousemove", mousemoveFunc)
        //        .on("mouseout", mouseoutFunc);

        //    groups.append("text")
        //        .attr("class", "title")
        //        .attr("text-anchor", "middle")
        //        .attr("y", height)
        //        .attr("dy", margin.bottom / 2 + 5)
        //        .attr("x", width / 2).text(function (c) {
        //            return c.key;
        //        });
        //
        //    groups.append("text")
        //        .attr("class", "static_year")
        //        .attr("text-anchor", "start")
        //        .style("pointer-events", "none")
        //        .attr("dy", 13).attr("y", height)
        //        .attr("x", 0).text(function (c) {
        //            return xValue(c.values[0]).getFullYear();
        //        });
        //    groups.append("text")
        //        .attr("class", "static_year")
        //        .attr("text-anchor", "end")
        //        .style("pointer-events", "none").attr("dy", 13)
        //        .attr("y", height).attr("x", width).text(function (c) {
        //            return xValue(c.values[c.values.length - 1]).getFullYear();
        //        });



        // Two circles to show the values for the year on hover
        circle = groups.append("circle")
            .attr("r", 5)
            .attr("opacity", 0)
            .attr("stroke", "#f1735f")
            .attr("stroke-width", 2.5)
            .attr("fill", "#fff")
            .style("pointer-events", "none");

        //    circleText = groups.append("text")
        //        .attr("class", "chart-tooltip")
        //        .attr("text-anchor", "start")
        //        .attr("opacity", 0)
        //        .style("pointer-events", "none");

        // the rectangle that covers the whole chart area - so the whole chart area is mousable
        //    var g = svg.select("g")
        //        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("rect")
            .attr("class", "background")
            .style("pointer-events", "all")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("width", width - margin.left - margin.right - 50)
            .attr("fill", "#fff")
            .attr("opacity", 0)
            .attr("height", height)
            .on("mouseover", mouseoverFunc)
            .on("mousemove", mousemoveFunc)
            .on("mouseout", mouseoutFunc);
    });


    /*====================================================================
         Mouse Functions
    ======================================================================*/

    function mouseoverFunc(d) {
        //        console.log("mouseover");
        circle.attr("opacity", 1.0);
        bindingLine.attr("opacity", 1.0);
        //    circleText.attr("opacity", 1.0);

        var year = xScale.invert(d3.mouse(this)[0]).getFullYear();
        return tooltip
            .style("display", null) // this removes the display none setting
            .html("<p class='sans'><span class='tooltipHeader'>" + year + "</span></p>");
    }

    function mousemoveFunc(d) {
        //    console.log("mousemove");
        var date, index, year;
        var y2;
        var tooltipTotal;
        var tooltipLateStage;
        year = xScale.invert(d3.mouse(this)[0] + margin.left).getFullYear();
        date = dateFormat.parse('' + year);
        //    console.log("YEAR", year, "DATE", date);
        index = 0;
        //    console.log("events", window.event, d3.event);
        circle
            .attr("cx", xScale(date))
            .attr("cy", function (c) {
                index = bisect(c.counts, year, 0, c.counts.length - 1);
                if (c.Counting == "Total") {
                    y2 = yScale(+c.counts[index]["count"]);
                    tooltipTotal = +c.counts[index]["count"];
                    //    console.log("Y2", y2, +c.counts[index]["count"]);
                } else if (c.Counting == "Late_Stage") {
                    tooltipLateStage = +c.counts[index]["count"];
                } else {
                    console.log("Something went wrong");
                }

                return yScale(+c.counts[index]["count"]);
            });

        //    circleText
        //        .attr("x", xScale(date) + 10)
        //        .attr("y", function (c) {
        //            return yScale(+c.counts[index]["count"]) - 10;
        //        })
        //        .text(function (c) {
        //            return d3.format(".1f")(+c.counts[index]["count"]);
        //        });

        bindingLine
            .attr("x1", xScale(date))
            .attr("y1", yScale(0))
            .attr("x2", xScale(date))
            .attr("y2", y2);

        return tooltip
            .style("top", y2 + "px")
            .style("left", xScale(date) + 15 + "px")
            //        .style("top", (d3.event.pageY) - 80 + "px")
            //        .style("left", (d3.event.pageX + 15) + "px")
            .html("<p class='sans'><span class='tooltipHeader'>" + year + "</span><br>Total: " + tooltipTotal + "<br>Late Stage: " + tooltipLateStage + "</p>");
    }

    function mouseoutFunc(d) {
        //    console.log("mouseout");
        bindingLine.attr("opacity", 0);
        circle.attr("opacity", 0);
        //    circleText.attr("opacity", 0);
        return tooltip.style("display", "none"); // this hides the tooltip
    }
}