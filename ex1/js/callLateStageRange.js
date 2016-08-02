// ***********************************************
// This is the function to call the chart with the
// late stage percentage range and where the 
// current county falls in that range
// *********************************************** 

function callLateStageRange(chartID) {

    /**************** 
      Dimension vars
    ****************/
    var width = $(chartID).width();
    var height = standardHeight;
    var margin = {
        top: 65,
        right: 50,
        bottom: 50,
        left: 100
    };

    /******************** 
     Data and chart vars
    ********************/
    var circle, yearLine, chartText;

    //Create new, empty arrays to hold our restructured datasets
    var years = [];
    var highest = [];
    var lowest = [];
    var areaData = [];
    var datasetYears = [];

    /******************************* 
     scales and d3 chart generators
    ********************************/

    //Set up date formatting and years
    var dateFormat = d3.time.format("%Y");

    //Set up scales
    var xScale = d3.time.scale()
        .range([margin.left, width - margin.right]);

    var yScale = d3.scale.linear()
        .range([margin.top, height - margin.bottom]);

    //Configure axis generators
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(endYear - startYear)
        .tickFormat(function (d) {
            return dateFormat(d);
        })
        .tickPadding(10);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .tickFormat(function (d) {
            return d3.format("%")(d)
        })
        .innerTickSize(-width + margin.right + margin.left)
        .outerTickSize(0)
        .tickPadding(10);

    //Configure area generator
    var area = d3.svg.area()
        .x(function (d) {
            return xScale(dateFormat.parse(d.year));
        })
        .y0(height - margin.bottom)
        .y1(function (d) {
            return yScale(+d.percentage);
        });

    //Configure line generator
    var line = d3.svg.line()
        .x(function (d) {
            return xScale(dateFormat.parse(d.year));
        })
        .y(function (d) {
            return yScale(+d.percentage);
        });

    /***************** 
         Main svg
        ******************/
    var svg = d3.select(chartID)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    /*====================================================================
        check to see if the dataset meets the cutoff - if yes, proceed, if not, draw the "not enough data" message
    ==================================================================*/

    if (Object.keys(thisCountyDataset.years).length < numberOfYears) {

        notEnoughDataMessage(width, height, svg);

    } else {
        // call the chart functions
        getRange();
        setupData();
        draw();
    } // end check

    /*====================================================================
           getRange()   
           get range (high/low) for each year function (gray area on chart)
==================================================================*/
    function getRange() {
        // the range includes data from all counties
        // sort the nest by year by late stage percentage
        nestByYear.forEach(function (d, i) {
            d.values.sort(function (a, b) {
                return a.late_stage_percentage - b.late_stage_percentage;
            });
        });

        nestByYear.forEach(function (d, i) {
            var end = d.values.length - 1;
            highest.push({
                year: "" + d.key,
                bound: "highest",
                county: "" + d.values[end].county,
                cancer: "" + d.values[end].cancer_type,
                percentage: +d.values[end].late_stage_percentage
            });

            lowest.push({
                year: "" + d.key,
                bound: "lowest",
                county: "" + d.values[0].county,
                cancer: "" + d.values[0].cancer_type,
                percentage: +d.values[0].late_stage_percentage
            });
            years.push(d.key);
        });
    } // end getRange()
    
    /*====================================================================
           setupData()  
     ==================================================================*/

    function setupData() {
        highest.sort(function (a, b) {
            return a.year - b.year;
        });
        lowest.sort(function (a, b) {
            return a.year - b.year;
        });

        areaData.push({
            bound: "highest",
            data: highest
        }, {
            bound: "lowest",
            data: lowest
        });

        //Set scale domains 
        xScale.domain(d3.extent(years, function (d) {
            return dateFormat.parse(d);
        }));

        yScale.domain([
           d3.max(areaData, function (c) {
                return d3.max(c.data, function (d) {
                    return +d.percentage;
                });
            })
            ,
            0
            ]);

        // reformat the data from the json here
        $.each(thisCountyDataset.years, function (key, data) {
            //            console.log(key, data);
            datasetYears.push({
                year: key,
                data: data
            });
        });

    } // end setupData()

    /*====================================================================
           draw()  
     ==================================================================*/
    function draw() {
        // call the functions that draw
        legend();
        drawRange();
        drawAxes();
        drawCountyLine();
    } // end draw

    /*====================================================================
         legend()
 ======================================================================*/
    function legend() {
        
        // legend group
        var legend = svg.append("g")
            .attr("class", "mylegend")
            .attr("transform", "translate(0,0)");

        // icons sizes and margin between legend elements
        var iconWidth = 35;
        var iconHeight = 10;
        var margin = 10;

// we set these manually because it's not based off of what's in an array/ we can't loop through an array to draw the icons in the legend
        var tc = legend.append("g")
            .attr("class", "legendGroup");

        tc.append("line")
            .attr("x1", 0)
            .attr("y1", iconHeight / 2)
            .attr("x2", iconWidth)
            .attr("y2", iconHeight / 2)
            .attr("stroke", "#f1735f")
            .attr("stroke-width", 3);

        tc.append("text")
            .attr("x", iconWidth + 5)
            .attr("y", iconHeight)
            .style("text-anchor", "start")
            .attr("class", "legendLabel")
            .text(thisCountyDataset.county.name + " County LS%");

        var range = legend.append("g")
            .attr("class", "legendGroup")
            .attr("transform", function () {
                return "translate(" + (tc.node().getBBox().width + margin) + ",0)" // tc.node().getBBox().width gives us the width of the "tc" element (icon and text) we created above. Translate the next element over this much plus the margin
            });

        range.append("rect")
            .attr("height", iconHeight)
            .attr("width", iconWidth)
            .attr("fill", "#cccccc")
            .attr("opacity", .25);

        range.append("text")
            .attr("x", iconWidth + 5)
            .attr("y", iconHeight)
            .style("text-anchor", "start")
            .attr("class", "legendLabel")
            .text("Range of Late Stage Percentage in FL");
        
    } // end legend()
    /*====================================================================
       Mouse Functions   
    ==================================================================*/
    function mouseoverFunc(d) {
        var x = xScale(dateFormat.parse(d.year));
        var y = yScale(d.data.late_stage_percentage);

        circle
            .attr("cx", x)
            .attr("cy", y)
            .attr("opacity", 1.0);
        chartText
            .attr("x", x)
            .attr("y", y - 15)
            .attr("opacity", 1.0)
            .text(d3.format("%")(d.data.late_stage_percentage));
        yearLine.attr("x1", x)
            .attr("y1", y)
            .attr("x2", x)
            .attr("y2", yScale(0))
            .attr("opacity", 1.0);
    } // end mouseover()

    function mouseoutFunc(d) {
        circle.attr("opacity", 0);
        chartText.attr("opacity", 0);
        yearLine.attr("opacity", 0);
    } // end mouseout()

    /*====================================================================
       Draw Axes function
 ======================================================================*/

    function drawAxes() {
        //Axes
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height - margin.bottom) + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("x", width - margin.right)
            .attr("y", 20)
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
            .attr("transform", "rotate(-90)")
            .attr("x", -height + margin.bottom)
            .attr("y", -60)
            .attr("dy", "1em")
            .style("text-anchor", "start")
            .attr("class", "label")
            .text("Late Stage Percentage (%)");
    } // end drawAxes()

    /*====================================================================
       Draw Area Range function
 ======================================================================*/

    function drawRange() {
        //Make a group for each count type
        var groups = svg.selectAll("g.graph")
            .data(areaData)
            .enter()
            .append("g")
            .attr("class", "graph");

        // Within each group, create a new path,
        // binding just the counts data to each one
        // these are the area paths
        groups.selectAll("path")
            .data(function (d) {
                return [d];
            })
            .enter()
            .append("path")
            .attr("class", "area")
            .attr("fill", function (d) {
                if (d.bound == "highest") {
                    return "#cccccc";
                } else {
                    return "#ffffff";
                }
            })
            .attr("opacity", function (d) {
                if (d.bound == "highest") {
                    return .18;
                } else {
                    return 1;
                }
            })
            .attr("d", function (d) {
                return area(d.data)
            });
    } // end drawRange()

    /*====================================================================
       Draw County Line function
 ======================================================================*/

    function drawCountyLine() {

        //Configure line generator (for the current county late stage line)
        var line = d3.svg.line()
            .x(function (d) {
                return xScale(dateFormat.parse(d.year));
            })
            .y(function (d) {
                return yScale(+d.data.late_stage_percentage);
            });

        //Within each group, create a new line/path,
        //binding just the rates data to each one

        svg.append("path")
            .datum(datasetYears)
            //            .attr("class", "line")
            .attr("stroke", "#f1735f")
            .attr("stroke-width", 3)
            .attr("fill", "none")
            .attr("opacity", .85)
            .attr("d", line);

        // line leading to year of hover
        yearLine = svg.append("line")
            .attr("stroke-width", 1)
            .attr("stroke", "#f1735f")
            .style("stroke-dasharray", ("5, 5"))
            .style("pointer-events", "none")
            .attr("opacity", 0);

        // Circles to show the values for the year on hover
        circle = svg.append("circle")
            .attr("r", 5)
            .attr("opacity", 0)
            .attr("stroke", "#f1735f")
            .attr("stroke-width", 2.5)
            .attr("fill", "#fff")
            .style("pointer-events", "none");

        // text of value above circle
        chartText = svg.append("text")
            .attr("class", "smaller-bold")
            .style("text-anchor", "middle")
            .attr("opacity", 0);


        // Draw the circles for voronoi
        svg.selectAll("circle.voronoi")
            .data(datasetYears)
            .enter()
            .append("circle")
            .attr("class", function (d) {
                return "voronoi " + d.year;
            })
            .attr("r", 1)
            .style("opacity", 0)
            .attr("stroke", "none")
            .attr("fill", "none")
            .attr("cx", function (d) {
                return xScale(dateFormat.parse(d.year));
            })
            .attr("cy", function (d) {
                return yScale(d.data.late_stage_percentage);
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
                return xScale(dateFormat.parse(d.year));
            })
            .y(function (d) {
                return yScale(d.data.late_stage_percentage);
            })
            .clipExtent([[margin.left, margin.top], [width, height - margin.bottom]]);

        //Create the Voronoi grid
        voronoiGroup.selectAll("path")
            .data(voronoi(datasetYears)) //Use vononoi() with your dataset inside
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
                return "voronoi " + d.year;
            })
            //            .style("stroke", "#2074A0") //If you want to look at the cells
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseover", mouseoverFunc)
            .on("mouseout", mouseoutFunc);
    } // end drawCountyLine()
} // end callLateStageRange()