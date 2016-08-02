// ***********************************************
// This is the function to call the bar charts 
// for zip code top/bottom lists
// *********************************************** 

function callZipCodeLateStageRankings(chartID) {
    /**************** 
      Dimension vars
    ****************/
    var width = $(chartID).width();
    var height = standardHeight;
    var margin = {
        top: 35,
        right: 50,
        bottom: 50,
        left: 65
    };

    /******************** 
     Data and chart vars
    ********************/
    var filteredZips, nestedZips;
    var averages = [];
    var ranked = [];
    var measure = "highest";

    /******************************* 
     scales and d3 chart generators
    ********************************/
    //Set up scales, notice rangeBands for bar charts
    var xScale = d3.scale.linear()
        .range([margin.left, width - margin.right]);

    var yScale = d3.scale.ordinal()
        .rangeBands([margin.top, height - margin.bottom], .3);

    /******************** 
     Main svg
    ********************/
    var svg = d3.select(chartID)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

   /*====================================================================
        check to see if the dataset meets the cutoff - if yes, proceed, if not, draw the "not enough data" message
    ==================================================================*/
// set up the data first, we check from the nonNullZips
    setData();

    if (filteredZips.length < zipcodeListLength) {

        notEnoughDataMessage(width, height, svg);

    } else {
        /******************** 
          html button setup
        *********************/
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

        // draw separation line here, it has no transition
        svg.append("line")
            .attr("x1", margin.left - 10)
            .attr("y1", margin.top)
            .attr("x2", margin.left - 10)
            .attr("y2", height - margin.bottom)
            .attr("stroke", "#ccc")
            .attr("stroke-width", 3);
    } // end check

    /*====================================================================
               Data formatting
    ==================================================================*/

    function setData() {
        // filter the zipcode data to make sure we get zipcodes without nulls
        filteredZips = zipcodesDataset.filter(function (d) {
            return d["late_stage_percentage"] != null;
        });

        nestedZips = d3.nest().key(function (d) {
            //                console.log(d.zipcode);
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
            highest: averages.slice(0, 5),
            lowest: averages.slice((averages.length - 5), averages.length)
        });
        //    Set x scale domain - does not change
        xScale.domain([0, d3.max(averages, function (d) {
            return d["mean"];
        })]);
    } // end setData()
    /*====================================================================
     draw()
    ==================================================================*/

    function draw() {
        //        d3.selectAll("g.label-group").remove();
        //    Set y scale domain - changes with selection
        yScale.domain(ranked[0][measure].map(function (d) {
            return d.zipcode;
        }));

        // select all rect.bar elements, bind the data
        var bars = svg.selectAll("rect.bar")
            .data(ranked[0][measure]);

        // add the new bars
        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);

        // remove the unwanted bars (not in the dataset)
        bars.exit()
            .transition()
            .duration(300)
            .ease("exp")
            .attr("width", 0)
            .remove();

        // transition new and remaining bars
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

         /**************************************** 
          setup the labels (enter exit transition)
         *****************************************/
        // label that is the zipcode
        var zipcodeLabel = svg.selectAll("text.zipcodeLabel")
            .data(ranked[0][measure]);
        
        zipcodeLabel.enter()
            .append("text")
            .attr("class", function (d, i) {
                return ("zipcodeLabel " + "label" + i); // the second class is so we can select all the same classed elements on hover of a bar
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
            .attr("dy", (yScale.rangeBand() / 2 + 5))
            .attr("fill", "#444")
            .attr("text-anchor", "start");

        // label that is the value (late stage percentage)
        var valueLabel = svg.selectAll("text.valueLabel")
            .data(ranked[0][measure]);
        
        valueLabel.enter()
            .append("text")
            .attr("class", function (d, i) {
                return ("valueLabel smaller-bold " + "label" + i); // the second class is so we can select all the same classed elements on hover of a bar
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
            .attr("dy", (yScale.rangeBand() / 2 + 5))
            .attr("dx", ".5em")
            .attr("fill", "#444")
            .attr("text-anchor", "start")
            .attr("text-anchor", "start");
        
        console.log("RANKED", ranked);
    } // end draw()
    /*====================================================================
         Mouse Functions
    ======================================================================*/

    function mouseover(d, i) {
        svg.selectAll("text.label" + i)
            .attr("fill", "#f1735f");
    } // end mouseover

    function mouseout(d, i) {
        svg.selectAll("text.label" + i)
            .attr("fill", "#444");
    } // end mouseout
} // end callZipCodeLateStageRankings()