function callAgeScatter(chartID) {
    var height = 350;
    var margin = {
        top: 60,
        right: 10,
        bottom: 50,
        left: 100
    };

    var dotRadius = 3.5;

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
    draw();

    function draw() {

        var filtered = zipcodesDataset.filter(function (d) {
            return d.year == 2013;
        });

        xScale.domain([0, d3.max(zipcodesDataset, function (d) {
            return +d.age_diagnosis;
        })]);

        yScale.domain([0, d3.max(zipcodesDataset, function (d) {
            return +d.total;
        })]);


        colorScale.domain([0, d3.max(zipcodesDataset, function (d) {
            return +d.total;
        })]);
        
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
            .attr("x", -height + margin.bottom + margin.top + margin.top)
            .attr("y", -50)
            .attr("dy", "1em")
            .style("text-anchor", "end")
            .attr("class", "label")
            .text("Total Rate");

// scatter plot
        var circles = svg.selectAll("circle")
            .data(filtered)
            .enter()
            .append("circle");

        circles.attr("class", "dots");
        // class to the circles - ".dots".

        circles.attr("cx", function (d) {
                return xScale(+d.age_diagnosis);
            })
            .attr("cy", function (d) {
                return yScale(+d.total);
            })
            .attr("r", dotRadius) // you might want to increase your dotRadius
            .attr("fill", function (d) {
                if (!isNaN(+d.age_diagnosis) && !isNaN(+d.total)) {
                    return colorScale(+d.total);
                } else {
                    return "#fff";
                }
            })
            .attr("opacity", ".6");

        circles
            .on("mouseover", mouseoverFunc)
            .on("mousemove", mousemoveFunc)
            .on("mouseout", mouseoutFunc);
        /*====================================================================
               Mouse Functions   
            ==================================================================*/
        function mouseoverFunc(d) {
            //            console.log(d);
            //            return tooltip
            //                .style("display", null) // this removes the display none setting from it
            //                .html("<p class='sans'><span class='tooltipHeader'>" + d.County + "</span><br>Teen Birth Rate: " + d.TeenBirthRate + "<br>Infant Mortality Rate: " + +d.IMR + "</p>");
        }

        function mousemoveFunc(d) {
            //            console.log("events", window.event, d3.event);
            //            return tooltip
            //                .style("top", (d3.event.pageY - 5) + "px")
            //                .style("left", (d3.event.pageX + 15) + "px");
        }

        function mouseoutFunc(d) {
            //            return tooltip.style("display", "none"); // this sets it to invisible!
        }


    }
}