// ***********************************************
// This is the function to call the line chart
// for late stage percentage per year
// *********************************************** 

function callLateStageLine() {

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

    var circle, chartText, circleText;

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
        .tickFormat(function (d) {
            return d3.format("%")(d)
        })
        .orient("left");

    // bisector
    var bisect = d3.bisector(function (d) {
        return d.year;
    }).left;

    // Line generator
    var line = d3.svg.line()
        .x(function (d) {
            return xScale(dateFormat.parse(d.year));
        })
        .y(function (d) {
            return yScale(+d.late_stage_percentage);
        });

    //Create the empty SVG image
    var svg = d3.select("#chart1")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    //Load data
    d3.csv("data/Female_Breast_Cancer-1.csv", function (error, data) {

        if (error) {
            console.log("error: ", error)
        };

        var dataset = [];

        // get the data just for the counties we want
        data.forEach(function (d, i) {
            if (d.county == county) {
                //Add a new object to the new data array
                dataset.push(d);
            }
        });

        console.log("% LINE d", data);
        console.log("% LINE dataset", dataset);

        //Set scale domains - max and min of the years
        xScale.domain(
            d3.extent(years, function (d) {
                return dateFormat.parse(d);
            }));

        // max of rates to 0 (reversed, remember)
        yScale.domain([
    	d3.max(data, function (d) {
                return +d.late_stage_percentage;
            }),
        0
    ]);

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
            .text("Late Stage Percentage (%)");

        //Title
        svg.append("text")
            .attr("class", "chart-title")
            .attr("x", margin.left)
            .attr("y", 0)
            .attr("dy", "1em")
            .style("text-anchor", "start")
            .text("Late Stage Percentage per Year for County " + county);


        //Within each group, create a new line/path,
        //binding just the rates data to each one
        //        groups.selectAll("path")
        //            .data(function (d) { // because there's a group with data already, we select the data within that
        //                return [d.late_stage_percentage]; // it has to be an array for the line function
        //            })

        svg.append("path")
            .datum(dataset)
            //            .attr("class", "line")
            .attr("stroke", "#f1735f")
            .attr("stroke-width", 3)
            .attr("fill", "none")
            .attr("d", line);

        circle = svg.append("circle")
            .attr("r", 5)
            .attr("opacity", 0)
            .attr("stroke", "#f1735f")
            .attr("stroke-width", 2.5)
            .attr("fill", "#fff")
            .style("pointer-events", "none");


        // the rectangle that covers the whole chart area - so the whole chart area is mousable
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

        chartText = svg.append("text")
            .style("text-anchor", "middle")
            .attr("opacity", 0);
        /*====================================================================
                         Mouse Functions
         ======================================================================*/

        function mouseoverFunc(d) {
            //        console.log("mouseover");
            circle.attr("opacity", 1.0);
            chartText.attr("opacity", 1.0);

            var year = xScale.invert(d3.mouse(this)[0]).getFullYear();
            //            return tooltip
            //                .style("display", null) // this removes the display none setting
            //                .html("<p class='sans'><span class='tooltipHeader'>" + year + "</span></p>");
        }

        function mousemoveFunc(d) {
            //    console.log("mousemove");
            var date, index, year;
            year = xScale.invert(d3.mouse(this)[0] + margin.left).getFullYear();
            date = dateFormat.parse('' + year);
            index = 0;
            circle
                .attr("cx", xScale(date))
                .attr("cy", function () {
                    index = bisect(dataset, year, 0, dataset.length - 1);
                    return yScale(+dataset[index]["late_stage_percentage"]);
                });

            chartText.attr("y", yScale(+dataset[index]["late_stage_percentage"]) - 15 + "px") // why is this showing up on other chart
                .attr("x", xScale(date) + "px")
                .text(d3.format("%")(+dataset[index]["late_stage_percentage"]));

            //            return tooltip
            //                            .style("top", yScale(+dataset[index]["late_stage_percentage"]) + "px") // why is this showing up on other chart
            //                            .style("left", xScale(date) + 15 + "px")
            //                .style("top", (d3.event.pageY) - 70 + "px")
            //                .style("left", (d3.event.pageX + 15) + "px")
            //                .html("<p class='sans'><span class='tooltipHeader'>" + year + "</span><br>Late Stage Percentage: " + d3.format("%")(+dataset[index]["late_stage_percentage"]) + "</p>");
        }

        function mouseoutFunc(d) {
            //    console.log("mouseout");
            circle.attr("opacity", 0);
            chartText.attr("opacity", 0);
            //            return tooltip.style("display", "none"); // this hides the tooltip
        }

    });
}