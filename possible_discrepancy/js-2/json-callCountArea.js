// ***********************************************
// This is the function to call the area charts 
// for total cases and late stage cases per year
// *********************************************** 

function callCountArea(chartID) {

    //Dimensions and padding
    var height = 300;
    var margin = {
        top: 35,
        right: 50,
        bottom: 50,
        left: 90
    };

    //Set up date formatting and years
    var dateFormat = d3.time.format("%Y");

    var bisect = d3.bisector(function (d) {
        return d.year;
    }).left;

    var circle, bindingLine, circleText;

    //Create new, empty arrays to hold our restructured datasets
    var datasetYears = [];
    var datasetByCountType = [];
    var years = [];
    var total = [];
    var lateStage = [];

    //Set up scales
    var xScale = d3.time.scale()
        .range([margin.left, width - margin.right]);

    var yScale = d3.scale.linear()
        .range([margin.top, height - margin.bottom]);

    //Configure axis generators
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(endYear - startYear)
        .tickFormat(function (d) {
            return dateFormat(d);
        })
        .tickPadding(10);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .innerTickSize(-width + margin.right + margin.left)
        .outerTickSize(0)
        .tickPadding(10);


    //Configure area generator
    var area = d3.svg.area()
//        .interpolate("cardinal")
        .x(function (d) {
            return xScale(dateFormat.parse(d.year));
        })
        .y0(height - margin.bottom)
        .y1(function (d) {
            return yScale(+d.count);
        });

    var line = d3.svg.line()
//        .interpolate("cardinal")
        .x(function (d) {
            return xScale(dateFormat.parse(d.year));
        })
        .y(function (d) {
            return yScale(+d.count);
        });

    //Create the empty SVG image
    var svg = d3.select(chartID)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    draw();

    function draw() {

        //        console.log("Area Chart JSON data: ", json);

        var county = thisCountyDataset.county.name;
        var cancerType = thisCountyDataset.cancer.name;

        // reformat the data from the json here
        $.each(thisCountyDataset.years, function (key, data) {
            //            console.log(key, data);
            datasetYears.push({
                year: key,
                data: data
            });
            years.push(key);
        });

                console.log("DATASETYEARS", datasetYears);
        //        console.log("YEARS", years);

        datasetYears.forEach(function (d, i) {

            //Add a new object to the new emissions data array
            total.push({
                county: county, // county name
                cancer: cancerType,
                counting: "total", // what this is a count of
                year: d.year, // year
                count: d.data.total_ratio // the count
            });

            lateStage.push({
                county: county,
                cancer: cancerType,
                counting: "late_stage", // what this is a count of
                year: d.year, // year
                count: d.data.total_ratio * d.data.late_stage_percentage // the count
            });

        });

        datasetByCountType.push({
            Counting: "Total",
            counts: total
        }, {
            Counting: "Late_Stage",
            counts: lateStage
        });

//        console.log("DATASETBYCOUNTTYPE", datasetByCountType);

        //Set scale domains 
        xScale.domain(d3.extent(years, function (d) {
            return dateFormat.parse(d);
        }));

        // domain is 0 - highest of current set -- temporary, must make for highest total of all counties
        yScale.domain([
           d3.max(allCountiesDataset, function (c) {
                return c.total_ratio;
            })
                ,
                    0
            ]);

        /* ================================= 
            Drawing
           ================================= */
        //Axes
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height - margin.bottom) + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("x", width - margin.right)
            .attr("y", 20)
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
            .attr("transform", "rotate(-90)")
            .attr("x", -height + margin.bottom)
            .attr("y", -60)
            .attr("dy", "1em")
            .style("text-anchor", "start")
            .attr("class", "label")
            .text("Rates per 100,000");

        //        //Title
        //        svg.append("text")
        //            .attr("class", "chart-title")
        //            .attr("x", margin.left)
        //            .attr("y", 0)
        //            .attr("dy", "1em")
        //            .style("text-anchor", "start")
        //            .text("Total and Late Stage Rates for " + cancerType + " in " + county + " County");

        // Create the line between the two circles - x and y values set later
        bindingLine = svg.append("line")
            .attr("class", "binding-line")
            .attr("opacity", 0)
            .attr("stroke-width", 1)
            .attr("stroke", "#f1735f")
            .style("stroke-dasharray", ("5, 5"))
            .style("pointer-events", "none");

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
            .attr("opacity", 0.4)
            .attr("d", area);

        // Line over the area
        groups.append("path")
            .attr("class", "line")
            .style("pointer-events", "none")
            .attr("stroke", "#f1735f")
            .attr("d", function (c) {
                return line(c.counts);
            });


        // Two circles to show the values for the year on hover
        circle = groups.append("circle")
            .attr("r", 5)
            .attr("opacity", 0)
            .attr("stroke", "#f1735f")
            .attr("stroke-width", 2.5)
            .attr("fill", "#fff")
            .style("pointer-events", "none");

        svg.append("rect")
            .attr("class", "background")
            .style("pointer-events", "all")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("width", width - margin.right - 50)
            .attr("fill", "#fff")
            .attr("opacity", 0)
            .attr("height", height)
            .on("mouseover", mouseoverFunc)
            .on("mousemove", mousemoveFunc)
            .on("mouseout", mouseoutFunc);
    };

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
    };

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
                    tooltipTotal = d3.format(".2f")(+c.counts[index]["count"]);
                    //    console.log("Y2", y2, +c.counts[index]["count"]);
                } else if (c.Counting == "Late_Stage") {
                    tooltipLateStage = d3.format(".2f")(+c.counts[index]["count"]);
                } else {
                    console.log("Something went wrong");
                }

                return yScale(+c.counts[index]["count"]);
            });

        bindingLine
            .attr("x1", xScale(date))
            .attr("y1", yScale(0))
            .attr("x2", xScale(date))
            .attr("y2", y2);

        return tooltip
            //            .style("top", y2 + 55 + "px")
            //            .style("left", xScale(date) + 15 + "px")
            .style("top", (d3.event.pageY) - 80 + "px")
            .style("left", (d3.event.pageX + 15) + "px")
            .html("<p class='sans'><span class='tooltipHeader'>" + year + "</span><br>Total: " + tooltipTotal + "<br>Late Stage: " + tooltipLateStage + "</p>");
    };

    function mouseoutFunc(d) {
        //    console.log("mouseout");
        bindingLine.attr("opacity", 0);
        circle.attr("opacity", 0);
        //    circleText.attr("opacity", 0);
        return tooltip.style("display", "none"); // this hides the tooltip
    };

};