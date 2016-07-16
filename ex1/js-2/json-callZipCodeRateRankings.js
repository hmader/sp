// ***********************************************
// This is the function to call the bar charts 
// for zip code top/bottom lists
// *********************************************** 

function callZipCodeRateRankings(chartID) {
    var width = 500;
    var height = 300;
    var margin = {
        top: 35,
        right: 50,
        bottom: 50,
        left: 65
    };

    var averages = [];
    var ranked = [];
    var measure = "highest";

    //Set up scales, notice rangeBands for bar charts
    var xScale = d3.scale.linear()
        .range([margin.left, width - margin.right]);

    var yScale = d3.scale.ordinal()
        .rangeBands([margin.top, height - margin.bottom], .3);

    //Create the empty SVG image
    var svg = d3.select(chartID)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    //setup our ui buttons:
    d3.select("#zipcodeRATE-high")
        .on("click", function (d, i) {
            $("#zipcodeRATE-low").removeClass("selected");
            $("#zipcodeRATE-high").addClass("selected");
            measure = "highest";
            draw();
        });
    d3.select("#zipcodeRATE-low")
        .on("click", function (d, i) {
            $("#zipcodeRATE-high").removeClass("selected");
            $("#zipcodeRATE-low").addClass("selected");
            measure = "lowest";
            draw();
        });

    /*====================================================================
           Data formatting
        ==================================================================*/
    setData();

    function setData() {
        var filteredZips, nestedZips;

        // filter the zipcode data to make sure we get zipcodes without nulls
        filteredZips = zipcodesDataset.filter(function (d) {
            return d["total"] != null;
        });

        nestedZips = d3.nest().key(function (d) {
            //                console.log(d.county);
            return d.county;
        }).entries(filteredZips);

        nestedZips.forEach(function (d) {
            var mean = d3.mean(d.values, function (c) {
                return c["total"];
            });
            averages.push({
                zipcode: d.key,
                mean: mean
            });
        });

        averages.sort(function (a, b) {
            return b.mean - a.mean;
        });

        // array with two data arrays
        ranked.push({
            highest: averages.slice(0, 5),
            lowest: averages.slice((averages.length - 5), averages.length)
        });
        //    Set x scale domain - does not change
        xScale.domain([0, d3.max(averages, function (d) {
            return d["mean"];
        })]);

//        //Title
//        svg.append("text")
//            .attr("class", "chart-title")
//            .attr("x", margin.left)
//            .attr("y", 0)
//            .attr("dy", "1em")
//            .style("text-anchor", "start")
//            .text(uppercase(measure) + " Zipcodes for Average Rate per 100,000");
        // separation line
        svg.append("line")
            .attr("x1", margin.left - 10)
            .attr("y1", margin.top)
            .attr("x2", margin.left - 10)
            .attr("y2", height - margin.bottom)
            .attr("stroke", "#ccc")
            .attr("stroke-width", 3);
    };
    /*====================================================================
     draw()
    ==================================================================*/

    draw();

    function draw() {
        //        d3.selectAll("g.label-group").remove();
        //    Set y scale domain - changes with selection
        yScale.domain(ranked[0][measure].map(function (d) {
            return d.zipcode;
        }));

        var bars = svg.selectAll("rect.bar")
            .data(ranked[0][measure]);

        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);

        bars.exit()
            .transition()
            .duration(300)
            .ease("exp")
            .attr("width", 0)
            .remove();

        bars.transition()
            .duration(300)
            .ease("quad")
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

        //  We are attaching the labels, transition added
        var zipcodeLabel = svg.selectAll("text.zipcodeLabel")
            .data(ranked[0][measure]);
        zipcodeLabel.enter()
            .append("text")
            .attr("class", function (d, i) {
                return ("zipcodeLabel zipcodes-ranking " + "label" + i);
            });
        zipcodeLabel.transition()
            .duration(300)
            .ease("quad")
            .style("opacity", 0)
            .transition()
            .duration(300)
            .style("opacity", 1)
            .text(function (d) {
                return d.zipcode;
            })
            .attr("transform", function (d) {
                return "translate(0," + (yScale(d.zipcode)) + ")"
            })
            .attr("dy", "1.2em")
            .attr("dx", ".5em")
            .attr("fill", "#444")
            .attr("text-anchor", "start");

        var valueLabel = svg.selectAll("text.valueLabel")
            .data(ranked[0][measure]);
        valueLabel.enter()
            .append("text")
            .attr("class", function (d, i) {
                return ("valueLabel zipcodes-ranking " + "label" + i);
            });
        valueLabel.transition()
            .duration(300)
            .ease("quad")
            .style("opacity", 0)
            .transition()
            .duration(300)
            .style("opacity", 1)
            .text(function (d) {
                return d3.format(".2f")(d.mean);
            })
            .attr("transform", function (d) {
                return "translate(" + xScale(d.mean) + "," + yScale(d.zipcode) + ")";
            })
            .attr("dy", "1.2em")
            .attr("dx", ".5em")
            .attr("fill", "#444")
            .attr("text-anchor", "start")
            .attr("text-anchor", "start");
    };
    /*====================================================================
         Mouse Functions
    ======================================================================*/

    function mouseover(d, i) {
        svg.selectAll("text.label" + i)
            .attr("fill", "#f1735f");
    };

    function mouseout(d, i) {
        svg.selectAll("text.label" + i)
            .attr("fill", "#666");
    };
};