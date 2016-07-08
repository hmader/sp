// ***********************************************
// This is the function to call the bar charts 
// for this county's ranking
// *********************************************** 

function callCountyRanking(chartID) {
    var height = 300;
    var margin = {
        top: 35,
        right: 10,
        bottom: 70,
        left: 100
    };

    var averages = [];

    var bisect = d3.bisector(function (d) {
        return d.date;
    }).left;

    var dateFormat = d3.time.format("%Y");
    //Set up scales, notice rangeBands for bar charts
    yScale = d3.scale.linear()
        .range([margin.top, height - margin.bottom - margin.top]);

    xScale = d3.scale.ordinal()
        .rangeBands([margin.left, width - margin.right - margin.left], .2);

    //Configure axis generators
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .tickValues(xScale.domain().filter(function (d, i) {
            return !(i % 2);
        }));

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");

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
        .orient("left")
        .outerTickSize(0)
        .tickSubdivide(1)
        .innerTickSize(-width + margin.right + 2 * margin.left)
        .tickPadding(10)
        .tickFormat(function (d) {
            return d3.format("%")(d)
        });

    draw();

    function draw() {

        // getting the averages of late stage percentage of each county in a neat little array
        nestByCounty.forEach(function (d) {
            var mean = d3.mean(d.values, function (c) {
                return c.late_stage_percentage;
            });
            averages.push({
                county: d.key,
                mean: mean
            });
        });

        averages.sort(function (a, b) {
            return b.mean - a.mean;
        });

        console.log("AVG", averages);


        yScale.domain(
                    [d3.max(averages, function (d) {
                return +d.mean;
            }), 0]
        );

        //        console.log("MAX", d3.max(averages, function (d) {
        //                        console.log("D", +d.mean);
        //                        return +d.mean;
        //                    }));

        xScale.domain(
            averages.map(function (d) {
                return d.county;
            })
        );

        //Axes
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height - margin.bottom - margin.top) + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("x", width - margin.right)
            .attr("y", margin.top - 10)
            .attr("dy", "2em")
            .style("text-anchor", "end")
            .attr("class", "label")
            .text("");

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (margin.left) + ",0)")
            .call(yAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("x", -height + margin.bottom)
            .attr("y", -53)
            .attr("dy", "1em")
            .style("text-anchor", "start")
            .attr("class", "label")
            .text("Avg. Late Stage Percentage");

        //Title
        svg.append("text")
            .attr("class", "chart-title")
            .attr("x", margin.left)
            .attr("y", 0)
            .attr("dy", "1em")
            .style("text-anchor", "start")
            .text(function () {
                return ("Out of all " + nestByCounty.length + " Counties in Florida, " + thisCountyDataset.county.name + " County is number " + " Late Stage Percentages in " + thisCountyDataset.cancer.name + " on average from 2004 to 2013");
            });

        svg.selectAll("rect.bar")
            .data(averages)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("y", function (d) {
                return yScale(+d.mean);
            })
            .attr("x", function (d) {
                //                console.log(d);
                return xScale(d.county);
            })
            .attr("height", function (d) {
                return height - margin.bottom - margin.top - yScale(+d.mean);
            })
            .attr("width", xScale.rangeBand())
            .attr("fill", function (d) {

                if (d.county == countyNumber) {
                    return "#f1735f";
                } else {
                    return "#ccc";
                }
            })
            .attr("opacity", function (d) {

                if (d.county == countyNumber) {
                    return .7;
                } else {
                    return .5;
                }
            })
            .style("pointer-events", "all")
            .on("mouseover", mouseoverFunc)
            .on("mousemove", mousemoveFunc)
            .on("mouseout", mouseoutFunc);

    }

    /*====================================================================
         Mouse Functions
    ======================================================================*/

    function mouseoverFunc(d) {
        return tooltip
            .style("display", null); // this removes the display none setting
    }

    function mousemoveFunc(d) {
        return tooltip
            .style("top", (d3.event.pageY) - 80 + "px")
            .style("left", (d3.event.pageX + 15) + "px")
            .html("<p class='sans'><span class='tooltipHeader'>" + d.county + " County</span><br>Mean LS%: " + d3.format('%')(d.mean) + "</p>");
    }

    function mouseoutFunc(d) {
        return tooltip.style("display", "none"); // this hides the tooltip
    }

}