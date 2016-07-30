// ***********************************************
// This is the function to call the chart with the
// late stage percentage range and where the 
// current county falls in that range
// *********************************************** 

function callLateStageRange(chartID) {

    //Dimensions and padding
    var height = standardHeight;
    var margin = {
        top: 35,
        right: 50,
        bottom: 50,
        left: 100
    };

    //Set up date formatting and years
    var dateFormat = d3.time.format("%Y");
    var circle, bindingLine, chartText;

    //Create new, empty arrays to hold our restructured datasets
    var years = [];
    var highest = [];
    var lowest = [];
    var areaData = [];
    var datasetYears = [];

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
//        .interpolate("cardinal")
        .x(function (d) {
            return xScale(dateFormat.parse(d.year));
        })
        .y0(height - margin.bottom)
        .y1(function (d) {
            return yScale(+d.percentage);
        });

    //Configure line generator
    var line = d3.svg.line()
//        .interpolate("cardinal")
        .x(function (d) {
            return xScale(dateFormat.parse(d.year));
        })
        .y(function (d) {
            return yScale(+d.percentage);
        });


    //Create the empty SVG image
    var svg = d3.select(chartID)
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    
    // check to see if the dataset meets the cutoff - if yes, proceed, if not, draw the "not enough data" message

    if (Object.keys(thisCountyDataset.years).length < numberOfYears) {

        notEnoughDataMessage(width, height, svg);

    } else {
        // call the chart functions
        getRange();
        draw();
    }    
    
/*====================================================================
       getRange()   
       get range (high/low) for each year function
    ==================================================================*/
    function getRange() {
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
    }

/*====================================================================
       draw()  
    ==================================================================*/
    function draw() {

        var county = thisCountyDataset.county.name;
        var cancerType = thisCountyDataset.cancer.name;

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

        /* ================================= 
            Drawing
           ================================= */

        drawRange();
        drawAxes();
        drawCountyLine();

    }
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
            .attr("y", y - 20)
            .attr("opacity", 1.0)
            .text(d3.format("%")(d.data.late_stage_percentage));
    };

    function mouseoutFunc(d) {
        circle.attr("opacity", 0);
        chartText.attr("opacity", 0);
    }

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
    }

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
                    return "#f1735f";
                } else {
                    return "#ffffff";
                }
            })
            .attr("opacity", function (d) {
                if (d.bound == "highest") {
                    return .17;
                } else {
                    return 1;
                }
            })
            .attr("d", function (d) {
                return area(d.data)
            });

        // Line over the area
        groups.append("path")
            .attr("class", "line")
            .style("pointer-events", "none")
//            .attr("stroke", "#f1735f")
            .attr("opacity", .5)
            .attr("d", function (d) {
                return line(d.data);
            });
    }

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

        // Circles to show the values for the year on hover
        circle = svg.append("circle")
            .attr("r", 5)
            .attr("opacity", 0)
            .attr("stroke", "#f1735f")
            .attr("stroke-width", 2.5)
            .attr("fill", "#fff")
            .style("pointer-events", "none");


        chartText = svg.append("text")
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
    }
}