var maxWidth = 800;
var width;
var zipcodeWidth;

function getWidth() {
    if ($(window).width() >= maxWidth) {
        width = maxWidth;
        zipcodeWidth = 500;
    } else {
        width = $(window).width();
        zipcodeWidth = $(window).width();
    };
};

// global dataset variables

// These are the datasets after filtering/ formatting
var mapByCounty;
var nestByCounty;
var nestByYear;

// this is the raw json data, before filtering/ formatting
var allCountiesDataset;
var zipcodesDataset;
var thisCountyDataset;
var countyMap;

var races = ["asian", "black", "hispanic", "white", "other"]; // these are the races with data
var genders = ["female", "male"];
var population = ["asian", "black", "hispanic", "native_american", "white"]; // these are the races that make up the population in the population data


// tooltip var
var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip");

// years range
var years = ["2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013"];

// to uppercase all words in a string - removes "-" and "_"
var uppercase = function (wordString) {
    var string = wordString.replace(/-/g, " ").replace(/_/g, " ").split(" ");
    var finalString = "";
    string.forEach(function (d) {
        finalString = finalString.concat(d[0].toUpperCase() + d.substring(1, d.length) + " ");
    });
    return (finalString);
};