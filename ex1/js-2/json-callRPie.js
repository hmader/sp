function callRPie(chartID) {

    var width = 960,
        height = 500,
        radius = Math.min(width, height) / 2;

    var color = d3.scale.ordinal()
        .range(["#ca0020", "#f4a582", "#92c5de", "#0571b0"])
        .domain(races);
    
    var arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var labelArc = d3.svg.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function (d) {
            return d.population;
        });

    var svg = d3.select(chartID).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    draw();
    
    function draw() {
        
        console.log(thisCountyDataset.population);

//        var g = svg.selectAll(".arc")
//            .data(pie(data))
//            .enter().append("g")
//            .attr("class", "arc");
//
//        g.append("path")
//            .attr("d", arc)
//            .style("fill", function (d) {
//                return color(d.data.age);
//            });
//
//        g.append("text")
//            .attr("transform", function (d) {
//                return "translate(" + labelArc.centroid(d) + ")";
//            })
//            .attr("dy", ".35em")
//            .text(function (d) {
//                return d.data.age;
//            });
    }
}