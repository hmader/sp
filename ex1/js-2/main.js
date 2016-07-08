$('document').ready(function () {
    setSelectionOptions();
    callAllCharts();
});

$(window).resize(function () {
    clearAllsvg();
    callAllCharts();
});

//setup our ui -- requires access to data variable, so inside csv
d3.select("select#county-selector")
    .on("change", function () {
        var selection = d3.select("select").property("value");
        county = selection;
        clearAllsvg();
        callAllCharts();
    });


function clearAllsvg() {
    d3.selectAll('svg').remove();
}

function callAllCharts() {
    callCountArea();
    callLateStageLine();
    callZipBars("#chart2");
}

function setSelectionOptions() {
    var selections = $("select#county-selector");

    d3.csv("data/Female_Breast_Cancer-1.csv", function (error, data) {
        var keyArray = d3.nest().key(function (d) {
            return d.county;
        }).entries(data);

        console.log("KEY ARRAY", keyArray);

        county = keyArray[0].key;

        keyArray.forEach(function (d) {
            selections.append("<option>" + d.key + "</option>");
        });

    });
}