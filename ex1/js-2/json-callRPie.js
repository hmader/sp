function callRPie(chartID) {

    var width = 400,
        height = 360,
        radius = Math.min(2*width/3, 2*height/3) / 2;

    var population = ["asian", "black", "hispanic", "native_american", "white"];

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
            reformatted.push({
                race: d,
                total: total
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
            });

        var linear = color;

        svg.append("g")
            .attr("class", "legendLinear")
            .attr("transform", "translate("+ (-radius + 10) +", " + (radius + 10) +")");
        
        var legendLinear = d3.legend.color()
            .shapeWidth(30)
            .orient('vertical')
            .scale(linear);

        svg.select(".legendLinear")
            .call(legendLinear);
    };
}