// ***********************************************
// This is the function to call the bar charts 
// for zip code top/bottom lists
// *********************************************** 

function callZipCodeLateStageRankings(chartID) {

    // local vars
    var thisW = width*.45;
    var height = standardHeight;
    var margin = {
        top: 35,
        right: 50,
        bottom: 50,
        left: 65
    };

    var filteredZips, nestedZips;
    var averages = [];
    var ranked = [];
    var measure = "highest";

    //Set up scales, notice rangeBands for bar charts
    var xScale = d3.scale.linear()
        .range([margin.left, thisW - margin.right]);

    var yScale = d3.scale.ordinal()
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

    //Create the empty SVG image
    var svg = d3.select(chartID)
        .append("svg")
        .attr("width", thisW)
        .attr("height", height);

    // check to see if the dataset meets the cutoff - if yes, proceed, if not, draw the "not enough data" message

    setData();

    if (filteredZips.length < zipcodeListLength) {

        notEnoughDataMessage(thisW, height, svg);

    } else {
        $("#zipcodeLS-high").addClass("selected");
        //setup our ui buttons:
        d3.select("#zipcodeLS-high")
            .on("click", function (d, i) {
                $("#zipcodeLS-low").removeClass("selected");
                $("#zipcodeLS-high").addClass("selected");
                measure = "highest";
                draw();
            });
        d3.select("#zipcodeLS-low")
            .on("click", function (d, i) {
                $("#zipcodeLS-high").removeClass("selected");
                $("#zipcodeLS-low").addClass("selected");
                measure = "lowest";
                draw();
            });

        // draw!
        draw();

        // separation line
        svg.append("line")
            .attr("x1", margin.left - 10)
            .attr("y1", margin.top)
            .attr("x2", margin.left - 10)
            .attr("y2", height - margin.bottom)
            .attr("stroke", "#ccc")
            .attr("stroke-width", 3);
    }
    /*====================================================================
               Data formatting
            ==================================================================*/

    function setData() {
        // filter the zipcode data to make sure we get zipcodes without nulls
        filteredZips = zipcodesDataset.filter(function (d) {
            return d["late_stage_percentage"] != null;
        });

        nestedZips = d3.nest().key(function (d) {
            return d.zipcode;
        }).entries(filteredZips);

        nestedZips.forEach(function (d) {
            var mean = d3.mean(d.values, function (c) {
                return c["late_stage_percentage"];
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
            highest: averages.slice(0, zipcodeListLength),
            lowest: averages.slice((averages.length - zipcodeListLength), averages.length)
        });
        //    Set x scale domain - does not change
        xScale.domain([0, d3.max(averages, function (d) {
            return d["mean"];
        })]);
    }
    /*====================================================================
     draw()
    ==================================================================*/

    function draw() {
        //    Set y scale domain - changes with selection
        yScale.domain(ranked[0][measure].map(function (d) {
            return d.zipcode;
        }));

        var bars = svg.selectAll("rect.bar")
            .data(ranked[0][measure]);

        bars.enter()
            .append("rect")
            .attr("class", function (d, i) {
                return ("bar " + d.zipcode);
            })
            .attr("fill", "#f1735f")
            .attr("opacity", .7)
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);

        bars.exit()
            .transition()
            .duration(300)
            .ease("exp")
            .attr("translate", "transform(x," + yScale(height) + ")")
            .remove();

        bars.transition()
            .duration(300)
            .ease("quad")
            .attr("x", margin.left)
            .attr("transform", function (d) {
                return "translate(0," + yScale(d.zipcode) + ")"
            })
            .attr("width", function (d) {
                return xScale(+d.mean) - margin.left;
            })
            .attr("height", yScale.rangeBand());

        //  We are attaching the labels, transition added
        var zipcodeLabel = svg.selectAll("text.zipcodeLabel")
            .data(ranked[0][measure]);
        zipcodeLabel.exit()
            .transition()
            .duration(150)
            .ease("exp")
            .style("opacity", 0)
            .remove();
        zipcodeLabel.enter()
            .append("text")
            .attr("class", function (d, i) {
                return ("zipcodeLabel smaller-bold " + "label" + i);
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
                return "valueLabel smaller-bold " + "label" + i;
            });
        valueLabel.transition()
            .duration(300)
            .ease("quad")
            .style("opacity", 0)
            .transition()
            .duration(300)
            .style("opacity", 1)
            .text(function (d) {
                return d3.format("%")(d.mean);
            })
            .attr("transform", function (d) {
                return "translate(" + xScale(d.mean) + "," + yScale(d.zipcode) + ")";
            })
            .attr("dy", "1.2em")
            .attr("dx", ".5em")
            .attr("fill", "#444")
            .attr("text-anchor", "start")
            .attr("text-anchor", "start");
    }

    /*====================================================================
         Mouse Functions
    ======================================================================*/

    function mouseover(d, i) {
        svg.selectAll("text.label" + i)
            .attr("fill", "#f1735f");
    }

    function mouseout(d, i) {
        svg.selectAll("text.label" + i)
            .attr("fill", "#444");
    }
}