// ***********************************************
// This is the function to call the county lists
// *********************************************** 

function callZipBars(chart) {

    var width = .45 * $(window).width();
    var height = 400;
    var margin = {
        top: 40,
        right: 10,
        bottom: 50,
        left: 70
    };

    //Set up scales, notice rangeBands for bar charts
    xScale = d3.scale.linear()
        .range([margin.left, width - margin.right]);

    yScale = d3.scale.ordinal()
        .rangeBands([margin.top, height - margin.bottom], .3);

    //Configure axis generators
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(5);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");

    //Create the empty SVG image
    var svg = d3.select(chart)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    //Load data
    d3.csv("data/Female_Breast_Cancer-1.csv", function (error, data) {

        if (error) {
            console.log("error: ", error)
        };

        // our new arrays
        var nest, selectFive;

        // nest the data by county
        nest = d3.nest().key(function (d) {
            return d.county;
        }).entries(data);

        // sort the newly nested array by whatever we want to extract the top/ bottom counties of
        nest.sort(function (a, b) {
            return d3.descending(+a.values[a.values.length - 1]["total"], +b.values[b.values.length - 1]["total"]);
        });

        //        This function just prints out the county and sorted by value to make sure it's in fact sorted properly
        //        nest.forEach(function(d) {
        //            console.log(d.key, d.values[d.values.length-1]["total"]);
        //        });

        // here we pick the first five off the array
        selectFive = nest.slice(0, 5);

        console.log("COUNTY data", data);
        console.log("COUNTY nest", nest);
        console.log("COUNTY selectFive", selectFive);

        //Set scale domains
        xScale.domain(
            [0, d3.max(selectFive, function (d) {
                return +d.values[d.values.length - 1]["total"];
            })]
        );

        //        console.log("MAX", d3.max(selectFive, function (d) {
        //                return +d.values[d.values.length - 1]["total"];
        //            }));
        //        console.log("MAX", xScale(d3.max(selectFive, function (d) {
        //                return +d.values[d.values.length - 1]["total"];
        //            })));
        //        
        //        console.log("DOMAIN", xScale.domain(), xScale.range());
        //        console.log(xScale(0));

        yScale.domain(
            selectFive.map(function (d) {
                return d.key;
            })
        );

        //Axes
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height - margin.bottom) + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("x", width - margin.right)
            .attr("y", -margin.bottom + 10)
            .attr("dy", "2em")
            .style("text-anchor", "end")
            .attr("class", "label")
            .text("Rate per 100,000");

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
            .text("County");

        //Title
        svg.append("text")
            .attr("class", "chart-title")
            .attr("x", margin.left)
            .attr("y", 0)
            .attr("dy", "1em")
            .style("text-anchor", "start")
            .text("Top 5 Counties for Cases 2013");

        svg.selectAll("rect.bar")
            .data(selectFive)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", margin.left)
            .attr("y", function (d) {
                return yScale(d.key);
            })
            .attr("width", function (d) {
                return xScale(+d.values[d.values.length - 1]["total"]) - margin.left;
            })
            .attr("height", yScale.rangeBand())
            .attr("fill", "#f1735f")
            .attr("opacity", .7);

        //  We are attaching the labels separately, not in a group with the bars...

        var labels = svg.selectAll("text.bar-label")
            .data(selectFive)
            .enter()
            .append("text")
            .attr("class", "bar-label")
            .attr("fill", "#fff")
            .text(function (d) {
                return d.values[d.values.length - 1]["total"];
            })
            .attr("transform", function (d) {
                return "translate(" + xScale(+d.values[d.values.length - 1]["total"]) + "," + yScale(d.key) + ")"
            })
            .attr("dy", "1.7em")
            .attr("dx", "-.5em")
            .attr("text-anchor", "end");

    });
}