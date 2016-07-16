function callRPie(chartID) {

    var width = 400,
        height = 360,
        radius = Math.min(2 * width / 3, 2 * height / 3) / 2;

    var reformatted = [];

    var color = d3.scale.ordinal()
        .range(["#f8f7ce", "#ffe59a", "#ffca7d", "#ffaf71", "#f6755f"])
        .domain(population);

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

    var svg = d3.select(chartID).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 3 + ")");

    setupData();
    draw();

    function setupData() {
        var countyPop = thisCountyDataset.population;
        population.forEach(function (d) {
            var total = countyPop[d + "_female"] + countyPop[d + "_male"];
            var percentage = total/countyPop.total;
            reformatted.push({
                race: d,
                total: total,
                percentage: percentage
            });
        });
    };

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
                return color(d.data.race);
            })
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseout", mouseout);

        var linear = color;

        svg.append("g")
            .attr("class", "legendLinear")
            .attr("transform", "translate(" + (-radius + 10) + ", " + (radius + 10) + ")");

        var legendLinear = d3.legend.color()
            .shapeWidth(30)
            .orient('vertical')
            .scale(linear);

        svg.select(".legendLinear")
            .call(legendLinear);
    };

    /*====================================================================
           Mouse Functions   
        ==================================================================*/
    function mouseover(d) {
        return tooltip
            .style("display", null); // this removes the display none setting
    };

    function mousemove(d) {
        console.log(d);
        return tooltip
            .style("top", (d3.event.pageY) - 80 + "px")
            .style("left", (d3.event.pageX + 15) + "px")
            .html("<p class='sans'><span class='tooltipHeader'>" + uppercase(d.data.race) + "</span><br>Pop: " + d3.format(",")(d.data.total) + "</p>");
    };

    function mouseout(d) {
        return tooltip.style("display", "none"); // this hides the tooltip
    };
};