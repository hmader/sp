var maxWidth = 800;
var width;
var zipcodeWidth;

var standardHeight = 330;
var raceMultiplesHeight = 105;
var genderMultiplesHeight = 150;

// global dataset variables
var not_enough_data_message_text = " - Not Enough Data to Draw Chart -";

var zipcodeListLength = 5;
var numberOfYears = 9;

// These are the datasets after filtering/ formatting
var mapByCounty;
var nestByCounty;
var nestByYear;

// this is the raw json data, before filtering/ formatting
var allCountiesDataset;
var zipcodesDataset;
var thisCountyDataset;
var countyMap;

var races = ["asian", "black", "hispanic", "white", "other"]; // these are the races that are represented with cancer data
var genders = ["female", "male"];
var population = ["asian", "black", "hispanic", "native_american", "white"]; // these are the races that make up the population in the population data

var raceColors1 = ["#f8f7ce", "#ffe59a", "#ffca7d", "#f6755f", "#ffaf71"];
var raceColors2 = ["#f8f7ce", "#ffe59a", "#ffca7d", "#ffaf71", "#f6755f"];


// tooltip var
var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip");

// years range
var years = ["2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013"];

/*====================================================================
       getWidth()
       sets the width for the charts, depending on window size
    ==================================================================*/
function getWidth() {
    if ($(window).width() >= maxWidth) {
        width = maxWidth;
        zipcodeWidth = 500;
    } else {
        width = $(window).width();
        zipcodeWidth = $(window).width();
    }
}
/*====================================================================
       uppercase()
       to-uppercase all words in a string, removes "-" and "_"
    ==================================================================*/
var uppercase = function (wordString) {
    var string = wordString.replace(/-/g, " ").replace(/_/g, " ").split(" ");
    var finalString = "";
    string.forEach(function (d) {
        finalString = finalString.concat(d[0].toUpperCase() + d.substring(1, d.length) + " ");
    });
    return (finalString);
}

/*====================================================================
       notEnoughDataMessage()
    ==================================================================*/
function notEnoughDataMessage(width_of_chart, height_of_chart, chart_svg) {
    
    var height = height_of_chart;
    var width = width_of_chart;
    var svg = chart_svg;

    var message = svg.append("g");

    message.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#f2f2f2");

    message.append("text")
        .attr("class", "not-enough-data-message-text")
        .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")")
        .attr("text-anchor", "middle")
        .text(not_enough_data_message_text);


}