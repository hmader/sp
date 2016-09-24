// ***********************************************
// This is the function to call the bar charts 
// for this county's ranking
// *********************************************** 

function callCancerRanking(chartID, cancerID) {
    /**************** 
      Dimension vars
    ****************/
    var width = $(chartID).width();
    var height = standardHeight;
    var margin = {
        top: 60,
        right: 25,
        bottom: 65,
        left: 75
    };

    /******************** 
     Data and chart vars
    ********************/
    var cancerType = cancerID;
    var circle, casesLine, cancerLine, casesText, cancerText;

    /******************************* 
     scales and d3 chart generators
    ********************************/

    //Set up scales, notice rangeBands for bar charts
    var yScale = d3.scale.sqrt()
        .range([margin.top, height - margin.bottom])
        .domain([d3.max(allCancerDataset, function (d) {
            return +d.cases;
        }), 0]);

    var xScale = d3.scale.ordinal()
        .rangeBands([margin.left, width - margin.right], .2)
        .domain(cancerNames);

    /******************** 
        Main svg
    ********************/
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
        .innerTickSize(-width + margin.right + margin.left)
        .tickPadding(10)
        .ticks(4);

    /************************** 
      call the chart functions
    ***************************/
    draw();

    /*====================================================================
         draw(), includes transitions
 ======================================================================*/
    function draw() {

        drawAxes();

        /// draw the bars
        // select all rect.bar (rectangles classed .bar) elements, bind data
        var bars = svg.selectAll("rect.bar")
            .data(allCancerDataset)
            .enter()
            .append("rect")
            .attr("class", function (d) {
                if (d.id == cancerType) {
                    addStaticText(d);
                }
                return "bar bar" + d.id;
            })
            .style("pointer-events", "all")
            .attr("y", function (d) {
                return yScale(+d.cases);
            })
            .attr("transform", function (d) {
                return "translate(" + xScale(d.name) + ",0)"
            })
            .attr("height", function (d) {
                return height - margin.bottom - yScale(+d.cases);
            })
            .attr("width", xScale.rangeBand())
            .attr("fill", function (d) {
                if (d.id == cancerType) {
                    return "#f1735f";
                } else {
                    return "#ccc";
                }
            })
            .attr("opacity", function (d) {
                if (d.id == cancerType) {
                    return .9;
                } else {
                    return .5;
                }
            });

        // line leading to cancer name of hover
        cancerLine = svg.append("line")
            .attr("stroke-width", 1)
            .attr("stroke", "#aaaaaa")
            .style("stroke-dasharray", ("5, 5"))
            .style("pointer-events", "none")
            .attr("opacity", 0);

        // line leading to number of cases of hover
        casesLine = svg.append("line")
            .attr("stroke-width", 1)
            .attr("stroke", "#f1735f")
            .style("stroke-dasharray", ("5, 5"))
            .style("pointer-events", "none")
            .attr("opacity", 0);

        // text of cancer type
        cancerText = svg.append("text")
            .attr("class", "smaller-bold")
            .style("text-anchor", "end")
            .attr("opacity", 0);

        // text of cases of cancer type
        casesText = svg.append("text")
            .attr("class", "smaller-bold")
            .style("text-anchor", "middle")
            .attr("opacity", 0);

        /*=====================================================================
                  Voronoi
======================================================================*/
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
                return xScale(d.name) + xScale.rangeBand() / 2;
            })
            .y(function (d) {
                return yScale(0);
            })
            .clipExtent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]]);

        //Create the Voronoi grid
        voronoiGroup.selectAll("path")
            .data(voronoi(allCancerDataset)) //Use vononoi() with your dataset inside
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
                return "voronoi v" + d.id;
            })
            //                        .style("stroke", "#2074A0") //If you want to look at the cells
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseover", mouseoverFunc)
            .on("mouseout", mouseoutFunc);
    } // end draw()

    /*====================================================================
         legend()
 ======================================================================*/

    function legend() {
        // add the legend group element to the svg
        var legend = svg.append("g")
            .attr("class", "mylegend")
            .attr("transform", "translate(0,0)");

        // icon values & space between legend elements
        var iconWidth = 35;
        var iconHeight = 10;
        var margin = 10;

        // we set these manually because it's not based off of what's in an array/ we can't loop through an array to draw the icons in the legend

        var tc = legend.append("g")
            .attr("class", "legendGroup");

        tc.append("rect")
            .attr("height", iconHeight)
            .attr("width", iconWidth)
            .attr("fill", "#f1735f");

        var text = tc.append("text")
            .attr("x", iconWidth + 5)
            .attr("y", iconHeight)
            .style("text-anchor", "start")
            .attr("class", "legendLabel")
            .text(thisCountyDataset.county.name + " County");

        var oc = legend.append("g")
            .attr("class", "legendGroup")
            .attr("transform", function () {
                return "translate(" + (tc.node().getBBox().width + margin) + ",0)" // tc.node().getBBox().width gives us the width of the "tc" element (icon and text) we created above. Translate the next element over this much plus the margin
            });

        oc.append("rect")
            .attr("height", iconHeight)
            .attr("width", iconWidth)
            .attr("fill", "#cccccc");

        oc.append("text")
            .attr("x", iconWidth + 5)
            .attr("y", iconHeight)
            .style("text-anchor", "start")
            .attr("class", "legendLabel")
            .text("Other FL Counties");


        //                var legend = svg.append("g")
        //                    .attr("class", "mylegend")
        //                    .attr("transform", "translate(0,0)");
        //        
        //                genders.forEach(function (d, i) {
        //        
        //                    var iconWidth = 35;
        //                    var iconHeight = 15;
        //                    var margin = 70;
        //                    var g = legend.append("g")
        //                        .attr("class", "legendGroup")
        //                        .attr("transform", function () {
        //                            return "translate(" + (iconWidth * i + margin * i) + ",0)"
        //                        });
        //        
        //                    g.append("rect")
        //                        .attr("height", iconHeight)
        //                        .attr("width", iconWidth)
        //                        .attr("fill", function () {
        //                            console.log("GENDER", d);
        //                            return color(d);
        //                        });
        //                    g.append("text")
        //                        .attr("x", iconWidth + 5)
        //                        .attr("y", iconHeight)
        //                        .style("text-anchor", "start")
        //                        .attr("class", "legendLabel")
        //                        .text(uppercase(d));
        //                });

    } // end legend()

    /*====================================================================
             addStaticText()
     ======================================================================*/

    function addStaticText(d) {

        var x = xScale(d.name) + xScale.rangeBand() / 2;
        var y = yScale(d.cases);

        svg.append("line")
            .attr("stroke-width", 1)
            .attr("class", "hide-on-hover")
            .attr("stroke", "#aaaaaa")
            .style("stroke-dasharray", ("5, 5"))
            .style("pointer-events", "none")
            .attr("x1", x)
            .attr("y1", yScale(0))
            .attr("x2", x)
            .attr("y2", height - 55)
            .attr("opacity", 1.0);

        // line leading to number of cases of hover
        svg.append("line")
            .attr("class", "hide-on-hover")
            .attr("stroke-width", 1)
            .attr("stroke", "#f1735f")
            .style("stroke-dasharray", ("5, 5"))
            .style("pointer-events", "none")
            .attr("x1", x)
            .attr("y1", y)
            .attr("x2", x)
            .attr("y2", y - 15)
            .attr("opacity", 1.0);

        // text of panel cancer
        svg.append("text")
            .attr("class", "smaller-bold hide-on-hover")
            .style("text-anchor", "end")
            .attr("x", x + 2)
            .attr("y", height - 47)
            .attr("opacity", 1.0)
            .text(d.name)
            .call(wrap, margin.left * 1.25);

        // text of panel cases
        svg.append("text")
            .attr("class", "smaller-bold hide-on-hover")
            .style("text-anchor", "middle")
            .attr("x", x)
            .attr("y", y - 18)
            .attr("opacity", 1.0)
            .text(d3.format(",")(d.cases));
    }

    /*====================================================================
             drawAxes()
     ======================================================================*/

    function drawAxes() {

        // X axis
        svg.append("g")
            .attr("class", "x axis hide-ticks")
            .attr("transform", "translate(0," + (height - margin.bottom) + ")")
            .call(xAxis)
            .append("text")
            .attr("x", width - margin.right)
            .attr("y", 0)
            .attr("class", "hide-on-hover")
            .attr("dy", "2em")
            .style("text-anchor", "end")
            .style("fill", "#aaaaaa")
            .text("Cancer Type");
        // Y axis
        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (margin.left) + ",0)")
            .call(yAxis)
            .append("text")
            .attr("class", "label")
            .attr("x", (width - margin.right - margin.left) / 2)
            .attr("y", 0)
            .attr("dy", "2em")
            .style("text-anchor", "middle")
            .attr("class", "label")
            .text("Cases in " + year + " (FL)");
    } // end drawAxes()
    /*====================================================================
         wrap() text
         http://stackoverflow.com/questions/24784302/wrapping-text-in-d3
 ======================================================================*/
    function wrap(text, width) {
        text.each(function () {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                x = text.attr("x"),
                y = text.attr("y"),
                dy = 0, //parseFloat(text.attr("dy")),
                tspan = text.text(null)
                .append("tspan")
                .attr("x", x)
                .attr("y", y)
                .attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", ++lineNumber * lineHeight + dy + "em")
                        .text(word);
                }
            }
        });
    }
    /*====================================================================
         Mouse Functions
 ======================================================================*/
    function mouseoverFunc(d) {
        var x = xScale(d.name) + xScale.rangeBand() / 2;
        var y = yScale(d.cases);

        svg.selectAll(".hide-on-hover").attr("opacity", 0);
        svg.select(".bar" + d.id).classed("hover", true);

        casesText
            .attr("x", x)
            .attr("y", y - 18)
            .attr("opacity", 1.0)
            .text(d3.format(",")(d.cases));

        cancerText
            .attr("x", x + 2)
            .attr("y", height - 47)
            .attr("opacity", 1.0)
            .text(d.name)
            .call(wrap, margin.left * 1.25);

        cancerLine.attr("x1", x)
            .attr("y1", yScale(0))
            .attr("x2", x)
            .attr("y2", height - 55)
            .attr("opacity", 1.0);

        casesLine.attr("x1", x)
            .attr("y1", y)
            .attr("x2", x)
            .attr("y2", y - 15)
            .attr("opacity", 1.0);
    } // end mouseover()

    function mouseoutFunc(d) {
        casesLine.attr("opacity", 0);
        cancerLine.attr("opacity", 0);
        casesText.attr("opacity", 0);
        cancerText.attr("opacity", 0);
        svg.selectAll(".hide-on-hover").attr("opacity", 1.0);
        svg.select(".bar" + d.id).classed("hover", false);
    } // end mouseout()
} // end callCountyRanking()