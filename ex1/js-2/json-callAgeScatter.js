function callAgeScatter(chartID) {
    var height = 350;
    var margin = {
        top: 60,
        right: 10,
        bottom: 50,
        left: 100
    };

    var nonNullZipcodes = [];
    var filtered = [];
    var dotRadius = 3.5;
    var circle;
    var nest;

    var xScale = d3.scale.linear()
        .range([margin.left, width - margin.left - margin.right]); //--- range is what we are mapping TO, so we want it to be the chart area

    var yScale = d3.scale.linear()
        .range([height - margin.bottom - margin.top, margin.top]); //--- range is what we are mapping TO, so we want it to be the chart area

    // Color Scale
    var colorScale = d3.scale.linear().range(["#33cc33", "#ff5c33"]).interpolate(d3.interpolateLab);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(15);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .ticks(15)
        .outerTickSize(0)
        .tickSubdivide(1)
        .innerTickSize(-width + margin.right + 2 * margin.left)
        .tickPadding(10);

    var svg = d3.select(chartID)
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    /*====================================================================
           Selection dropdown 
        ==================================================================*/

    var selections = d3.select("select#zipcodeYears")
        .on("change", draw);
    years.forEach(function (d) {
        $("select#zipcodeYears").append("<option>" + d + "</option>");
    });
    /*====================================================================
       Draw 
    ==================================================================*/
    setupData();
    draw();

    function setupData() {
        nonNullZipcodes = zipcodesDataset.filter(function (d) {
            return d.total != null;
        });

        xScale.domain([0, d3.max(nonNullZipcodes, function (d) {
            return +d.age_diagnosis;
        })]);

        yScale.domain([0, d3.max(nonNullZipcodes, function (d) {
            return +d.total;
        })]);

        colorScale.domain([0, d3.max(nonNullZipcodes, function (d) {
            return +d.total;
        })]);
        
//        var prenest = [];
//        
//        nonNullZipcodes.forEach(function(d) {
//           prenest.push({
//           age_diagnosis: d.age_diagnosis,
//               county: d.county,
//               total: d.total,
//               late_stage_percentage: d.late_stage_percentage,
//               year: d.year
//           }); 
//        });
//        
//        nest = d3.nest().key(function(d) {
//         return d.county;   
//        }).entries(prenest);
//        
//        console.log("nest", nest);

        /// axes
        // fix these translates so they use your margin and height width as needed
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height - margin.bottom - margin.top) + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("x", width - margin.left - margin.right)
            .attr("y", margin.top - margin.bottom)
            .attr("dy", "2em")
            .style("text-anchor", "end")
            .attr("class", "label")
            .text("Age");

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (margin.left) + ",0)")
            .call(yAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("x", -height + margin.bottom + margin.top)
            .attr("y", -60)
            .attr("dy", "1em")
            .style("text-anchor", "start")
            .attr("class", "label")
            .text("Total Rate");

console.log("ZIP", zipcodesDataset,nonNullZipcodes);
    };
    /*=====================================================================
                 draw()
======================================================================*/

    function draw() {

        svg.selectAll("g.voronoiGroup").remove();
        svg.selectAll("circle.highlight").remove();

        filtered = nonNullZipcodes.filter(function (d) {
            if (selections.property("value") == "All Years") {
                return d.year != null;
            } else {
                return d.year == selections.property("value");
            }
        });

        var circles = svg.selectAll("circle.dots")
            .data(filtered);

        circles.exit()
            .transition()
            .duration(300)
            .ease("exp")
            .attr("r", 0)
            .remove();

        circles.enter()
            .append("circle")
            .attr("class", "dots");

        circles
            .transition()
            .duration(300)
            .ease("quad")
            .attr("cx", function (d) {
                return xScale(+d.age_diagnosis);
            })
            .attr("cy", function (d) {
                return yScale(+d.total);
            })
            .attr("r", dotRadius)
            .attr("fill", function (d) {
                if (!isNaN(+d.age_diagnosis) && !isNaN(+d.total)) {
                    return colorScale(+d.total);
                } else {
                    return "#fff";
                }
            })
            .attr("opacity", ".6");

        // Circle to show the values for the year on hover
        circle = svg.append("circle")
            .attr("class", "highlight")
            .attr("r", 4)
            .attr("opacity", 0)
            .attr("stroke-width", 2.5)
            .attr("fill", "#fff")
            .style("pointer-events", "none");

        /*=====================================================================
                  Voronoi
======================================================================*/
        // Draw the circles for voronoi
        var voronoiCir = svg.selectAll("circle.voronoi")
            .data(filtered);

        voronoiCir.enter()
            .append("circle")
            .attr("class", "voronoi");

        voronoiCir.exit()
            .transition()
            .duration(300)
            .ease("exp")
            .attr("r", 0)
            .remove();

        voronoiCir.transition()
            .duration(300)
            .ease("quad")
            .attr("r", 1)
            .style("opacity", 0)
            .attr("stroke", "none")
            .attr("fill", "none")
            .attr("cx", function (d) {
                return xScale(+d.age_diagnosis);
            })
            .attr("cy", function (d) {
                return yScale(d.total);
            });

        // from http://www.visualcinnamon.com/2015/07/voronoi.html
        // and https://bl.ocks.org/mbostock/8033015
        var voronoiGroup = svg.append("g")
            .attr("class", "voronoiGroup");
        //Initiate the voronoi function
        //Use the same variables of the data in the .x and .y as used in the cx and cy of the circle call
        //The clip extent will make the boundaries end nicely along the chart area instead of splitting up the entire SVG
        //(if you do not do this it would mean that you already see a tooltip when your mouse is still in the axis area, which is confusing)
        var voronoi = d3.geom.voronoi()
            .x(function (d) {
                return xScale(+d.age_diagnosis);
            })
            .y(function (d) {
                return yScale(d.total);
            })
            .clipExtent([[margin.left, margin.top], [width - margin.left, height - margin.top - margin.bottom]]);

        //Create the Voronoi grid
        voronoiGroup.selectAll("path")
            .data(voronoi(filtered)) //Use vononoi() with your dataset inside
            .enter().append("path")
            .filter(function (d) {
                return d !== undefined;
            })
            .attr("d", function (d, i) {
                return "M" + d.join("L") + "Z";
            })
            .datum(function (d, i) {
                return d.point;
            })
            //Give each cell a unique class where the unique part corresponds to the circle classes
            .attr("class", function (d, i) {
                return "voronoi " + d.county;
            })
            //            .style("stroke", "#2074A0") //If you want to look at the cells
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseover", mouseoverFunc)
            .on("mousemove", mousemoveFunc)
            .on("mouseout", mouseoutFunc);
    };

    /*====================================================================
       Mouse Functions   
    ==================================================================*/

    function mouseoverFunc(d) {
        console.log(d);
        return tooltip
            .style("display", null); // this removes the display none setting
    };

    function mousemoveFunc(d) {
        var x = xScale(d.age_diagnosis);
        var y = yScale(d.total);

        circle
            .attr("cx", x)
            .attr("cy", y)
            .attr("stroke", function () {
                if (!isNaN(x) && !isNaN(y)) {
                    return colorScale(+d.total);
                } else {
                    return "#fff";
                }
            })
            .attr("opacity", 1.0);
        return tooltip
            .style("top", (d3.event.pageY) - 80 + "px")
            .style("left", (d3.event.pageX + 15) + "px")
            .html("<p class='sans'><span class='tooltipHeader'>Zipcode: " + d.county + "</span><br>Year: " + d.year + "<br>Age Diagnosis: " + d.age_diagnosis + "<br>Rate: " + d3.format(".2f")(d.total) + "</p>");
    };

    function mouseoutFunc(d) {
        circle.attr("opacity", 0);
        return tooltip.style("display", "none"); // this hides the tooltip
    };
};