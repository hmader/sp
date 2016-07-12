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
        bottom: 100,
        left: 50
    };

    var selectFive;
    var dateFormat = d3.time.format("%Y");
    //Set up scales, notice rangeBands for bar charts
    xScale = d3.scale.linear()
        .range([margin.left, width - margin.right]);

    yScale = d3.scale.ordinal()
        .rangeBands([margin.top, height - margin.bottom], .3);

    // Configure axis generators

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .outerTickSize(0)
        .tickSubdivide(1)
        .innerTickSize(-height + margin.top + margin.bottom)
        .tickPadding(10);


    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .ticks(0)
        .tickValues(yScale.domain().filter(function (d, i) {
            return !(i % 2);
        }));

    setData("total", "highest");
    draw("total", "highest");
    setData("total", "lowest");
    draw("total", "lowest");
    setData("late_stage_percentage", "highest");
    draw("late_stage_percentage", "highest");
    setData("late_stage_percentage", "lowest");
    draw("late_stage_percentage", "lowest");


function setData(measure, selection) {
    var filteredZips, nestedZips;
    var averages = [];
    
    // filter the zipcode data to make sure we just get those that have data for year 2013
    filteredZips = zipcodesDataset.filter(function (d) {
        return d[measure] != null;
    });


    var nestedZips = d3.nest().key(function (d) {
        //                console.log(d.county);
        return d.county;
    }).entries(filteredZips);

    nestedZips.forEach(function (d) {
        var mean = d3.mean(d.values, function (c) {
            return c[measure];
        });
        averages.push({
            zipcode: d.key,
            mean: mean
        });
    });

    if (selection == "highest") {
        averages.sort(function (a, b) {
            return b.mean - a.mean;
        });
    } else if (selection == "lowest") {
        averages.sort(function (a, b) {
            return a.mean - b.mean;
        });
    } else {
        console.log("INVALID INPUT: callZipCodeRankings invalid arg.");
    }

    // make sure printed late stage % are in order
    //        filteredZips.forEach(function (d) {
    //            console.log(d[measure]);
    //        });

    console.log("filtered", filteredZips);
    console.log("averages", averages);


    // here we pick the first five off the array

    selectFive = averages.slice(0, 5);

    console.log("select 5", selectFive);
    //
    //Set scale domains
    xScale.domain(
                    [0, d3.max(averages, function (d) {
            return d["mean"];
        })]
    );

    //        console.log("DOMAIN", xScale.domain(), xScale.range());
    //        console.log(xScale);

    yScale.domain(
        selectFive.map(function (d) {
            return d.zipcode;
        })
    );
};
    function draw(measure, selection) {
        
          
    //Create the empty SVG image
    var svg = d3.select(chartID)
        .append("svg")
        .attr("width", width)
        .attr("height", height);
        //Axes
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height - margin.bottom) + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("x", width - margin.right)
            .attr("y", margin.top - 10)
            .attr("dy", "2em")
            .style("text-anchor", "end")
            .attr("class", "label")
            .text("Late Stage Percentage");

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (margin.left) + ",0)")
            .call(yAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("x", -height + margin.bottom)
            .attr("y", -30)
            .attr("dy", "1em")
            .style("text-anchor", "start")
            .attr("class", "label")
            .text("Zipcode");
        
                //Title
                svg.append("text")
                    .attr("class", "chart-title")
                    .attr("x", margin.left)
                    .attr("y", 0)
                    .attr("dy", "1em")
                    .style("text-anchor", "start")
                    .text(uppercase(selection) + " 5 Zipcodes for Average "+ uppercase(measure));
        
        svg.selectAll("rect.bar")
            .data(selectFive)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", margin.left)
            .attr("y", function (d) {
                return yScale(d.zipcode);
            })
            .attr("width", function (d) {
                return xScale(+d.mean) - margin.left;
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
            .attr("fill", "#444")
            .text(function (d) {
                return d.zipcode;
            })
            //            .attr("transform", function (d) {
            //                return "translate(" + xScale(+d.values[d.values.length - 1]["total"]) + "," + yScale(d.key) + ")"
            //            })
            .attr("transform", function (d) {
                return "translate(" + xScale(0) + "," + (yScale(d.zipcode)) + ")"
            })
            .attr("dy", "1.2em")
            .attr("dx", ".5em")
            .attr("text-anchor", "start");
    };

}