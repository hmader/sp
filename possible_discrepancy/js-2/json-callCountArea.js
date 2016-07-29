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
        .x(function (d) {
            return xScale(dateFormat.parse(d.year));
        })
        .y0(height - margin.bottom)
        .y1(function (d) {
            return yScale(+d.count);
        });

    //Configure line generator
    var line = d3.svg.line()
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

    setupData();
    draw();

    /*====================================================================
    
    setupData()
    ======================================================================*/

    function setupData() {

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

        datasetYears.forEach(function (d, i) {

            //Add a new object to the new emissions data array so we have a dataset for the "total ratio" area and the "late stage ratio" chart
            total.push({
                county: county, // county name
                cancer: cancerType,
                counting: "total", // this data is
                year: d.year, // year
                count: d.data.total_ratio // the count
            });

            lateStage.push({
                county: county,
                cancer: cancerType,
                counting: "late_stage", // this data is
                year: d.year, // year
                count: d.data.total_ratio * d.data.late_stage_percentage // the count
            });

        });

        // push both to datasetByCountType
        datasetByCountType.push({
            Counting: "Total",
            counts: total
        }, {
            Counting: "Late_Stage",
            counts: lateStage
        });

        console.log("DATASETBYCOUNTTYPE", datasetByCountType);

        //Set scale domains 
        xScale.domain(d3.extent(years, function (d) {
            return dateFormat.parse(d);
        }));

        // domain is 0 - highest total of all counties (allCountiesDataset)
        yScale.domain([
           d3.max(allCountiesDataset, function (c) {
                return c.total_ratio;
            })
                ,
                    0
            ]);

        // this is just printing out specific data from the allCountiesDataset, which is what we use for the y domain
        allCountiesDataset.forEach(function (d) {
            console.log("year: ", d.year, "total_ratio: ", d.total_ratio, "total: ", d.total)
        });

        console.log("c.total_ratio: ", d3.max(allCountiesDataset, function (c) {
            return c.total_ratio;
        }));

        console.log("c.total: ", d3.max(allCountiesDataset, function (c) {
            return c.total;
        }));
        // end console checks
    }
    /*====================================================================
    
    draw()
    ======================================================================*/
    function draw() {

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

        // Create the line between the two circles - x and y values set later, on hover
        bindingLine = svg.append("line")
            .attr("class", "binding-line")
            .attr("opacity", 0)
            .attr("stroke-width", 1)
            .attr("stroke", "#f1735f")
            .style("stroke-dasharray", ("5, 5"))
            .style("pointer-events", "none");

        //Make a group for each count type using datasetByCountyType
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
        circle.attr("opacity", 1.0);
        bindingLine.attr("opacity", 1.0);

        var year = xScale.invert(d3.mouse(this)[0]).getFullYear();
        return tooltip
            .style("display", null) // this removes the display none setting
            .html("<p class='sans'><span class='tooltipHeader'>" + year + "</span></p>");
    };

    function mousemoveFunc(d) {
        var date, index, year;
        var y2;
        var tooltipTotal;
        var tooltipLateStage;
        year = xScale.invert(d3.mouse(this)[0] + margin.left).getFullYear();
        date = dateFormat.parse('' + year);
        index = 0;
        circle
            .attr("cx", xScale(date))
            .attr("cy", function (c) {
                index = bisect(c.counts, year, 0, c.counts.length - 1);
                if (c.Counting == "Total") {
                    y2 = yScale(+c.counts[index]["count"]);
                    tooltipTotal = d3.format(".2f")(+c.counts[index]["count"]);
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
            .style("top", (d3.event.pageY) - 80 + "px")
            .style("left", (d3.event.pageX + 15) + "px")
            .html("<p class='sans'><span class='tooltipHeader'>" + year + "</span><br>Total: " + tooltipTotal + "<br>Late Stage: " + tooltipLateStage + "</p>");
    };

    function mouseoutFunc(d) {
        bindingLine.attr("opacity", 0);
        circle.attr("opacity", 0);
        return tooltip.style("display", "none"); // this hides the tooltip
    };

};