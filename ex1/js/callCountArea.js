// ***********************************************
// This is the function to call the area charts 
// for total cases and late stage cases per year
// *********************************************** 

function callCountArea(chartID) {

    /**************** 
      Dimension vars
    ****************/
    var width = $(chartID).width();
    var height = standardHeight;
    var margin = {
        top: 65,
        right: 50,
        bottom: 50,
        left: 90
    };

    /******************** 
     Data and chart vars
    ********************/
    var circle, bindingLine, circleText;

    //Create new, empty arrays to hold our restructured datasets
    var datasetYears = [];
    var datasetByCountType = [];
    var years = [];
    var total = [];
    var lateStage = [];

    /******************************* 
     scales and d3 chart generators
    ********************************/
    //Set up date formatting and years
    var dateFormat = d3.time.format("%Y");

    // bisect - helps us find index/ insert into an array
    var bisect = d3.bisector(function (d) {
        return d.year;
    }).left;

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
            return yScale(+d.count);
        });

    //Configure line generator
    var line = d3.svg.line()
        .x(function (d) {
            return xScale(dateFormat.parse(d.year));
        })
        .y(function (d) {
            return yScale(+d.count);
        });

    /************ 
      Main svg
    ************/
    //Create the empty SVG image
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
        setupData();
        draw();
    }

    /*====================================================================

    setupData()
    ======================================================================*/

    function setupData() {

        var county = thisCountyDataset.county.name;
        var cancerType = thisCountyDataset.cancer.name;

        // reformat the data from the json here
        $.each(thisCountyDataset.years, function (key, data) {
            //            console.log(key, data);
            datasetYears.push({
                year: key,
                data: data
            });
            years.push(key);
        });

        datasetYears.forEach(function (d, i) {
            // Set up the data in a format that we can use to draw the chart - will push these to our final data array
            total.push({
                county: county, // county name
                cancer: cancerType,
                counting: "total", // this data is
                year: d.year, // year
                count: d.data.total_ratio // the count
            });

            lateStage.push({
                county: county,
                cancer: cancerType,
                counting: "late_stage", // this data is
                year: d.year, // year
                count: d.data.total_ratio * d.data.late_stage_percentage // the count
            });

        });

        // push both to datasetByCountType, the dataset we use for our charts - draws a chart from each object in this array
        datasetByCountType.push({
            Counting: "Total",
            counts: total
        }, {
            Counting: "Late_Stage",
            counts: lateStage
        });

        //Set scale domains 
        xScale.domain(d3.extent(years, function (d) {
            return dateFormat.parse(d);
        }));

        // domain is 0 to highest total of all counties (allCountiesDataset) so we have some reference for where this county stands compared to all
        yScale.domain([
           d3.max(allCountiesDataset, function (c) {
                return c.total_ratio;
            })
                ,
                    0
            ]);

    } // end setupData()
    /*====================================================================  
        draw()
 ======================================================================*/
    function draw() {
        // draw our legend
        legend();
        
        // draw the axes
        drawAxes();
        
        // Create the line between the two circles - x and y values set later, on hover
        bindingLine = svg.append("line")
            .attr("class", "binding-line")
            .attr("opacity", 0)
            .attr("stroke-width", 1)
            .attr("stroke", "#f1735f")
            .style("stroke-dasharray", ("5, 5"))
            .style("pointer-events", "none");

        //Make a group for each count type using datasetByCountyType
        var groups = svg.selectAll("g.graph")
            .data(datasetByCountType)
            .enter()
            .append("g")
            .attr("class", "graph");

        // Within each group, create a new path,
        // binding just the counts data to each one
        // these are the area paths
        groups.selectAll("path")
            .data(function (d) {
                return [d.counts];
            })
            .enter()
            .append("path")
            .attr("class", "area")
            .attr("fill", "#f1735f")
            .attr("opacity", 0.4)
            .attr("d", area);

        // Line over the area
        groups.append("path")
            .attr("class", "line")
            .style("pointer-events", "none")
            .attr("stroke", "#f1735f")
            .attr("d", function (c) {
                return line(c.counts);
            });

        // Two circles to show the values for the year on hover
        circle = groups.append("circle")
            .attr("r", 5)
            .attr("opacity", 0)
            .attr("stroke", "#f1735f")
            .attr("stroke-width", 2.5)
            .attr("fill", "#fff")
            .style("pointer-events", "none");

        // background rectangle that receives the mouse events
        svg.append("rect")
            .attr("class", "background")
            .style("pointer-events", "all")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("width", width - margin.right - 50)
            .attr("fill", "#fff")
            .attr("opacity", 0)
            .attr("height", height)
            .on("mouseover", mouseoverFunc)
            .on("mousemove", mousemoveFunc)
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

        var total = legend.append("g")
            .attr("class", "legendGroup");

        total.append("rect")
            .attr("height", iconHeight)
            .attr("width", iconWidth)
            .attr("fill", "#f1735f")
            .attr("opacity", .4);

        total.append("text")
            .attr("x", iconWidth + 5)
            .attr("y", iconHeight)
            .style("text-anchor", "start")
            .attr("class", "legendLabel")
            .text("Overall Rate");

        var ls = legend.append("g")
            .attr("class", "legendGroup")
            .attr("transform", function () {
                return "translate(" + (total.node().getBBox().width + margin) + ",0)" // total.node().getBBox().width gives us the width of the "total" element (icon and text) we created above. Translate the next element over this much plus the margin
            });

        ls.append("rect")
            .attr("height", iconHeight)
            .attr("width", iconWidth)
            .attr("fill", "#f1735f")
            .attr("opacity", .8);

        ls.append("text")
            .attr("x", iconWidth + 5)
            .attr("y", iconHeight)
            .style("text-anchor", "start")
            .attr("class", "legendLabel")
            .text("Late Stage Rate");
    } // end legend()
    
/*====================================================================
         drawAxes()
 ======================================================================*/    
    function drawAxes() {
     // X axis
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
        //Y axis
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
            .text("Rate per 100,000");   
    } // end drawAxes()

    /*====================================================================
         Mouse Functions
 ======================================================================*/

    function mouseoverFunc(d) {
        circle.attr("opacity", 1.0);
        bindingLine.attr("opacity", 1.0);

        var year = xScale.invert(d3.mouse(this)[0]).getFullYear();
        return tooltip
            .style("display", null) // this removes the display none setting
            .html("<p class='sans'><span class='tooltipHeader'>" + year + "</span></p>");
    } // end mouseover

    function mousemoveFunc(d) {
        var date, index, year;
        var y2;
        var tooltipTotal;
        var tooltipLateStage;
        year = xScale.invert(d3.mouse(this)[0] + margin.left).getFullYear();
        date = dateFormat.parse('' + year);
        index = 0;
        circle // highlighting circles
            .attr("cx", xScale(date))
            .attr("cy", function (c) {
                index = bisect(c.counts, year, 0, c.counts.length - 1); // use bisect to find our index
                if (c.Counting == "Total") {
                    y2 = yScale(+c.counts[index]["count"]);
                    tooltipTotal = d3.format(".2f")(+c.counts[index]["count"]);
                } else if (c.Counting == "Late_Stage") {
                    tooltipLateStage = d3.format(".2f")(+c.counts[index]["count"]);
                } else {
                    console.log("Something went wrong");
                }

                return yScale(+c.counts[index]["count"]);
            });

        // settings for the line between our highlighted points
        bindingLine
            .attr("x1", xScale(date))
            .attr("y1", yScale(0))
            .attr("x2", xScale(date))
            .attr("y2", y2);

        // set tooltip values
        return tooltip
            .style("top", (d3.event.pageY) - 80 + "px")
            .style("left", (d3.event.pageX + 15) + "px")
            .html("<p class='sans'><span class='tooltipHeader'>" + year + "</span><br>Overall Rate: " + tooltipTotal + "<br>Late Stage Rate: " + tooltipLateStage + "</p>");
    } // end mousemove

    function mouseoutFunc(d) {
        bindingLine.attr("opacity", 0); // hides the line
        circle.attr("opacity", 0); // hides the circles
        return tooltip.style("display", "none"); // this hides the tooltip
    } // end mouseout

} // end callCountyArea()