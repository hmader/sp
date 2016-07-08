// ***********************************************
// This is the function to call the line chart
// for late stage percentage per year
// *********************************************** 

function callLateStageLine(jsonURL) {
    var height = 400;
    var margin = {
        top: 40,
        right: 10,
        bottom: 50,
        left: 100
    };

    //Set up date formatting and years
    var dateFormat = d3.time.format("%Y");

    var circle, chartText, circleText;
    var circlesVoi;

    //Create new, empty arrays to hold our restructured datasets
    var datasetYears = [];
    var years = [];
    var total = [];
    var lateStage = [];

    //Set up scales
    var xScale = d3.time.scale()
        .range([margin.left, width - margin.right - margin.left]);

    var yScale = d3.scale.linear()
        .range([margin.top, height - margin.bottom]);

    //Configure axis generators
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(endYear - startYear)
        .tickFormat(function (d) {
            return dateFormat(d);
        });

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .tickFormat(function (d) {
            return d3.format("%")(d)
        })
        .orient("left");

    // Line generator
    var line = d3.svg.line()
        .x(function (d) {
            return xScale(dateFormat.parse(d.year));
        })
        .y(function (d) {
            return yScale(+d.data.late_stage_percentage);
        });

    //Create the empty SVG image
    var svg = d3.select("#chart1")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    //Load data
    d3.json(jsonURL, function (error, json) {

        if (error) {
            console.log("error: ", error)
        };

//        console.log("Late Stage Line JSON: ", json);

        var county = json.county.name;
        var cancerType = json.cancer.name;

        $.each(json.years, function (key, data) {
            //            console.log(key, data);
            datasetYears.push({
                year: key,
                data: data
            });

            years.push(key);
        });

//        console.log("datasetYears", datasetYears);
        //Set scale domains 
        xScale.domain(d3.extent(years, function (d) {
            return dateFormat.parse(d);
        }));

        // domain is 0 - highest of current set -- temporary, must make for highest total of all counties
        yScale.domain([
           d3.max(datasetYears, function (c) {
                return c.data.late_stage_percentage;
            })
                ,
                    0
            ]);

        //Axes
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height - margin.bottom) + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("x", width - margin.left - margin.right)
            .attr("y", -margin.bottom + 10)
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
            .attr("transform", "rotate(90)")
            .attr("x", margin.top)
            .attr("y", -30)
            .attr("dy", "1em")
            .style("text-anchor", "start")
            .attr("class", "label")
            .text("Late Stage Percentage (%)");

        //Title
        svg.append("text")
            .attr("class", "chart-title")
            .attr("x", margin.left)
            .attr("y", 0)
            .attr("dy", "1em")
            .style("text-anchor", "start")
            .text("Late Stage Percentage per year for " + cancerType + " in " + county + " County");


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
            .clipExtent([[margin.left, margin.top], [width - margin.left, height - margin.bottom]]);

        //Create the Voronoi grid
        voronoiGroup.selectAll("path")
            .data(voronoi(datasetYears)) //Use vononoi() with your dataset inside
            .enter().append("path")
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
    });
    /*====================================================================
                     Mouse Functions
     ======================================================================*/

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
    }

    function mouseoutFunc(d) {
        circle.attr("opacity", 0);
        chartText.attr("opacity", 0);
    }

}