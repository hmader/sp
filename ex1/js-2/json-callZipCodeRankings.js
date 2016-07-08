// ***********************************************
// This is the function to call the bar charts 
// for zip code top/bottom lists
// *********************************************** 

function callZipCodeRankings(chartID) {
    var width = 400;
    var height = 300;
    var margin = {
        top: 35,
        right: 10,
        bottom: 70,
        left: 50
    };

    var dateFormat = d3.time.format("%Y");
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
        .ticks(0)
        .tickValues(yScale.domain().filter(function (d, i) {
            return !(i % 2);
        }));
    //        .outerTickSize(0)
    //        .tickSubdivide(1)
    //        .tickSize(-width + margin.right + margin.left)

    draw();

    function draw() {

        var filteredZips, mapByZip, selectFive;

        // filter the zipcode data to make sure we just get those that have data for year 2013
        filteredZips = zipcodesDataset.filter(function (d) {
            return d.year == 2013;
        }).sort(function (a, b) {
            return d3.ascending(+a.late_stage_percentage, +b.late_stage_percentage);
        });
        // make sure printed late stage % are in ascending order
        //        filteredZips.forEach(function (d) {
        //            console.log(d.late_stage_percentage);
        //        });

        console.log("filtered sort", filteredZips);


        // here we pick the first five off the array
        selectFive = filteredZips.slice(0, 5);
console.log("select 5", selectFive);
        //        //
        //        //Set scale domains
        //        xScale.domain(
        //            [0, d3.max(selectFive, function (d) {
        //                console.log("D", d, +d.values[d.values.length - 1]["total"]);
        //                return +d.values[d.values.length - 1]["total"];
        //            })]
        //        );
        //
        //        console.log("MAX", d3.max(selectFive, function (d) {
        //            return +d.values[d.values.length - 1]["total"];
        //        }));
        //        console.log("MAX", xScale(d3.max(selectFive, function (d) {
        //            return +d.values[d.values.length - 1]["total"];
        //        })));
        //
        //        console.log("DOMAIN", xScale.domain(), xScale.range());
        //        console.log(xScale);
        //        //
        //        yScale.domain(
        //            selectFive.map(function (d) {
        //                return d.key;
        //            })
        //        );
        //
        //        //Axes
        //        svg.append("g")
        //            .attr("class", "x axis")
        //            .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        //            .call(xAxis)
        //            .append("text")
        //            .attr("class", "label")
        //            .attr("x", width - margin.right)
        //            .attr("y", margin.top - 10)
        //            .attr("dy", "2em")
        //            .style("text-anchor", "end")
        //            .attr("class", "label")
        //            .text("Late Stage Percentage");
        //
        //        svg.append("g")
        //            .attr("class", "y axis")
        //            .attr("transform", "translate(" + (margin.left) + ",0)")
        //            .call(yAxis)
        //            .append("text")
        //            .attr("class", "label")
        //            .attr("transform", "rotate(-90)")
        //            .attr("x", -height + margin.bottom)
        //            .attr("y", -30)
        //            .attr("dy", "1em")
        //            .style("text-anchor", "start")
        //            .attr("class", "label")
        //            .text("Zipcode");
        //
        //        //Title
        //        svg.append("text")
        //            .attr("class", "chart-title")
        //            .attr("x", margin.left)
        //            .attr("y", 0)
        //            .attr("dy", "1em")
        //            .style("text-anchor", "start")
        //            .text("Top 5 Zipcodes for Cases 2013");
        //
        //        svg.selectAll("rect.bar")
        //            .data(selectFive)
        //            .enter()
        //            .append("rect")
        //            .attr("class", "bar")
        //            .attr("x", margin.left)
        //            .attr("y", function (d) {
        //                return yScale(d.key);
        //            })
        //            .attr("width", function (d) {
        //                return xScale(+d.values[d.values.length - 1]["total"]) - margin.left;
        //            })
        //            .attr("height", yScale.rangeBand())
        //            .attr("fill", "#f1735f")
        //            .attr("opacity", .7);
        //
        //        //  We are attaching the labels separately, not in a group with the bars...
        //
        //        var labels = svg.selectAll("text.bar-label")
        //            .data(selectFive)
        //            .enter()
        //            .append("text")
        //            .attr("class", "bar-label")
        //            .attr("fill", "#444")
        //            .text(function (d) {
        //                return d.values[d.values.length - 1]["zipcode"];
        //            })
        //            //            .attr("transform", function (d) {
        //            //                return "translate(" + xScale(+d.values[d.values.length - 1]["total"]) + "," + yScale(d.key) + ")"
        //            //            })
        //            .attr("transform", function (d) {
        //                return "translate(" + xScale(0) + "," + (yScale(d.key)) + ")"
        //            })
        //            .attr("dy", "1.2em")
        //            .attr("dx", ".5em")
        //            .attr("text-anchor", "start");
        //
        //





    }

}