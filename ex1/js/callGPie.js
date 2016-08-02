function callGPie(chartID) {

    /**************** 
      Dimension vars
    ****************/
    var width = 400,
        height = 500,
        radius = Math.min(2 * width / 3, 2 * height / 3) / 2;

    /******************** 
     Data and chart vars
    ********************/
    var reformatted = [];

    /******************************* 
     scales and d3 chart generators
    ********************************/
    var color = d3.scale.ordinal()
        .range(genderColors)
        .domain(genders);

    var arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var labelArc = d3.svg.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function (d) {
            return +d.total;
        });

    /***************** 
         Main svg
        ******************/
    var svg = d3.select(chartID).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + radius + "," + height / 3 + ")");

    setupData();
    draw();

    /*====================================================================
          setupData() 
       ==================================================================*/
    function setupData() {
        var countyPop = thisCountyDataset.population;
        genders.forEach(function (d) {
            reformatted.push({
                gender: d,
                total: countyPop[d],
                percentage: countyPop[d] / countyPop.total
            });
        });
    } // end setupData()

    /*====================================================================
          draw() 
       ==================================================================*/
    function draw() {
        console.log("reformatted", reformatted);
        console.log(thisCountyDataset.population);

        var g = svg.selectAll(".arc")
            .data(pie(reformatted))
            .enter().append("g")
            .attr("class", "arc");

        g.append("path")
            .attr("d", arc)
            .style("fill", function (d) {
                return color(d.data.gender);
            })
            .attr("class", "arc")
            .attr("opacity", .85)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseout", mouseout);

        legend();
    } // end draw()
    /*====================================================================
       legend() 
    ==================================================================*/
    function legend() {

        // d3 svg legend: http://d3-legend.susielu.com/#summary
        var linear = color;

        svg.append("g")
            .attr("class", "legendLinear")
            .attr("transform", "translate(" + (radius + 10) + ", " + 0 + ")");

        var legendLinear = d3.legend.color()
            .shapeWidth(40)
            .orient('vertical')
            .scale(linear);

        svg.select(".legendLinear")
            .call(legendLinear);

    } // end legend()

/*====================================================================
                   Mouse Functions   
                ==================================================================*/
    function mouseover(d) {
        return tooltip
            .style("display", null); // this removes the display none setting
    } // end mouseover()

    function mousemove(d) {
        console.log(d);
        return tooltip
            .style("top", (d3.event.pageY) - 80 + "px")
            .style("left", (d3.event.pageX + 15) + "px")
            .html("<p class='sans'><span class='tooltipHeader'>" + d3.format("%")(d.data.percentage) + " " + uppercase(d.data.gender) + "</span><br>Pop: " + d3.format(",")(d.data.total) + "</p>");
    } // end mousemove()

    function mouseout(d) {
        return tooltip.style("display", "none"); // this hides the tooltip
    } // end mouseout()
} // end callGPie()