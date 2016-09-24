// ***********************************************
// This is the function to call the line charts
// for rates per 10,000 by race
// *********************************************** 

function callSelectedCancerLine(chartID, cancerID) {

    /******************** 
     Dimension vars
    ********************/
    var width = $(chartID).width();
    var height = standardHeight;
    var margin = {
        top: 60,
        right: 25,
        bottom: 45,
        left: 75
    };

    /******************** 
     Data and chart vars
    ********************/

    var cancerType = cancerID;
    var data;
    var dataset = [];
    var circle, yearLine, chartText, theYear;
    var staticYearLine, staticChartText, staticCircle;

    /******************************* 
     scales and d3 chart generators
    ********************************/

    var dateFormat = d3.time.format("%Y");
    //Configure line generator
    // each line dataset must have a d.year and a d.late_stage for this to work.
    var line = d3.svg.line()
        //        .interpolate("cardinal")
        .x(function (d) {
            return xScale(dateFormat.parse(d.year));
        })
        .y(function (d) {
            return yScale(+d.late_stage);
        });

    //Set up scales
    var xScale = d3.time.scale().range([margin.left, width - margin.right]);
    var yScale = d3.scale.linear().range([margin.top, height - margin.bottom]).domain([1.0, 0]);

    // Configure axis generators

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(6)
        .tickPadding(10);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .innerTickSize(-width + margin.right + margin.left)
        .outerTickSize(0)
        .tickPadding(10)
        .ticks(3)
        .tickFormat(function (d) {
            return d3.format("%")(d)
        });

    //Create the empty SVG image
    var svg = d3.select(chartID)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    /*====================================================================
       Load data and call the draw functions
    ==================================================================*/
    d3.json('http://scanportal.org/json/cancer/' + cancerType + '/comparison', function (_data) {
        data = _data;
        //        if (allpushed < cancerNames.length) {
        //            dataArray.push({
        //                cancer: cancerID,
        //                data: data
        //            });
        //            allpushed++;
        //            callback();
        //        }
        // call the chart functions
        setupData();
        draw();
    }); // end load data & draw functions
    /*=====================================================================
              setupData()
     ======================================================================*/

    function setupData() {
        $.each(data.state_latestage_average, function (key, data) {
            dataset.push({
                year: key,
                late_stage: data
            });
        });

        xScale.domain(
            d3.extent(dataset, function (d) {
                return dateFormat.parse(d.year);
            }));
    } // end setupData()
    /*=====================================================================
              draw()
     ======================================================================*/
    function draw() {

        drawAxes();
        /*=====================================================================
                          Lines
        ======================================================================*/
        // append the line
        var flLine = svg.append("path")
            .datum(dataset)
            .attr("stroke", "#f1735f")
            .attr("stroke-width", 3)
            .attr("fill", "none")
            .attr("opacity", .85)
            .attr("d", line);

        /*  add static elements   */
        var g = svg.append("g");

        // line leading to end year
        staticYearLine = g.append("line")
            .attr("stroke-width", 1)
            .attr("stroke", "#f1735f")
            .attr("class", "hide-on-hover")
            .style("stroke-dasharray", ("5, 5"))
            .attr("x1", function (d) {
                return xScale(dateFormat.parse(dataset[dataset.length - 1].year));
            })
            .attr("y1", function (d) {
                return yScale(+dataset[dataset.length - 1].late_stage);
            })
            .attr("x2", function (d) {
                return xScale(dateFormat.parse(dataset[dataset.length - 1].year));
            })
            .attr("y2", function (d) {
                return yScale(0);
            })
            .style("pointer-events", "none")
            .attr("opacity", 1.0);
        // circle of most recent late stage percent
        staticCircle = g.append("circle")
            .attr("r", 5)
            .attr("class", "hide-on-hover")
            .attr("cx", function (d) {
                return xScale(dateFormat.parse(dataset[dataset.length - 1].year));
            })
            .attr("cy", function (d) {
                return yScale(+dataset[dataset.length - 1].late_stage);
            })
            .attr("opacity", 1.0)
            .attr("stroke-width", 2.5)
            .attr("fill", "#fff")
            .attr("stroke", "#f1735f")
            .style("pointer-events", "none");
        // text of value above circle
        staticChartText = svg.append("text")
            .attr("class", "smaller-bold hide-on-hover")
            .style("text-anchor", "middle")
            .attr("x", function (d) {
                return xScale(dateFormat.parse(dataset[dataset.length - 1].year));
            })
            .attr("y", function (d) {
                return yScale(+dataset[dataset.length - 1].late_stage) - 15;
            })
            .attr("opacity", 1.0)
            .text(d3.format("%")(dataset[dataset.length - 1].late_stage));
        /*  end static elements   */

        theYear = svg.append("text")
            .attr("class", "smaller-bold")
            .style("text-anchor", "middle")
            .attr("x", function (d) {
                return xScale(dateFormat.parse(dataset[dataset.length - 1].year));
            })
            .attr("y", function (d) {
                return yScale(0) + 25;
            })
            .attr("opacity", 1.0)
            .text(dataset[dataset.length - 1].year);

        // line leading to year of hover
        yearLine = svg.append("line")
            .attr("stroke-width", 1)
            .attr("stroke", "#f1735f")
            .style("stroke-dasharray", ("5, 5"))
            .style("pointer-events", "none")
            .attr("opacity", 0);

        // Circle to show the values for the year on hover
        circle = svg.append("circle")
            .attr("r", 5)
            .attr("opacity", 0)
            .attr("stroke-width", 2.5)
            .attr("fill", "#fff")
            .attr("stroke", "#f1735f")
            .style("pointer-events", "none");

        // text of value above circle
        chartText = svg.append("text")
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
                return xScale(dateFormat.parse(d.year));
            })
            .y(function (d) {
                return yScale(d.late_stage);
            })
            .clipExtent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]]);

        //Create the Voronoi grid
        voronoiGroup.selectAll("path")
            .data(voronoi(dataset)) //Use vononoi() with your dataset inside
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
    } // end draw()

    /*====================================================================
          drawAxes() 
       ==================================================================*/
    function drawAxes() {
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height - margin.bottom) + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + margin.left + ",0)")
            .call(yAxis)
            .append("text")
            .attr("class", "label")
            .attr("x", (width - margin.right - margin.left) / 2)
            .attr("y", 5)
            .attr("dy", "2em")
            .style("text-anchor", "middle")
            .attr("class", "label")
            .text("Late Stage Percentage");

    } // end drawAxes()


    /*====================================================================
       Mouse Functions   
    ==================================================================*/
    function mouseoverFunc(d) {
        var x = xScale(dateFormat.parse(d.year));
        var y = yScale(d.late_stage);

        svg.selectAll(".hide-on-hover").attr("opacity", 0);
        svg.selectAll(".x.axis>.tick>text").attr("opacity", 0);

        theYear
            .attr("x", x)
            .attr("y", (yScale(0) + 25))
            .text(d.year);
        circle
            .attr("cx", x)
            .attr("cy", y)
            .attr("opacity", 1.0);
        chartText
            .attr("x", x)
            .attr("y", y - 15)
            .attr("opacity", 1.0)
            .text(d3.format("%")(d.late_stage));
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
        theYear
            .attr("x", function (d) {
                return xScale(dateFormat.parse(dataset[dataset.length - 1].year));
            })
            .attr("y", function (d) {
                return yScale(0) + 25;
            })
            .text(dataset[dataset.length - 1].year);
        svg.selectAll(".hide-on-hover").attr("opacity", 1.0);
        svg.selectAll(".x.axis>.tick>text").attr("opacity", 1.0);
    } // end mouseout()
} // end