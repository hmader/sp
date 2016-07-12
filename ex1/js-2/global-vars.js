var width;

if ($(window).width() > 900) {
    width = 900;
} else {
    width = $(window).width();
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

var races = ["asian", "black", "hispanic", "white", "other"];
var genders = ["female", "male"];

// county select
var county = "0";

// tooltip var
var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip");

// years range
var years = ["2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013"];

// to uppercase one-word strings
var uppercase = function (wordString) {
    return (wordString[0].toUpperCase() + wordString.slice(1, wordString.length));
}