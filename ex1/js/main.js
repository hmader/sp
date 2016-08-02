/*=====================================================================
 global variables
======================================================================*/

/**************************************
Message for charts with not enough data 
***************************************/
var not_enough_data_message_text = " - Not Enough Data to Draw Chart -";

/************************************
These variables affect the api route 
*************************************/
var countyNumber = 367; // the number of the selected county
var startYear = 2004; // start/earliest year
var endYear = 2013; // end/latest yera
var cancerType = 5; // cancer number

/**************************************
These variables affect chart dimensions 
***************************************/

var standardHeight = 330; // standard height for the majority of the charts
var raceMultiplesHeight = 105; // height for the race area small multiples
var genderMultiplesHeight = 150; // height for the gender area small multiples
var zipcodeListLength = 5; // number of zipcodes in the zipcode rankings
var numberOfYears = startYear - endYear; // this is used in the check - it's start year - end year
var races = ["asian", "black", "hispanic", "white", "other"]; // these are the races that are represented with cancer data (for the area small multiples). These races have cancer data.
var genders = ["female", "male"]; // gender categories for the charts
var population = ["asian", "black", "hispanic", "native_american", "white"]; // these are the races that make up the population in the population data. Not all of these have cancer data
var raceColors1 = ["#f8f7ce", "#ffe59a", "#ffca7d", "#f6755f", "#ffaf71"]; // these correspond to the races array
//var raceColors1 = ["#FFDC7F", "#663D2A", "#D68A3F", "#FFDFBE", "#FF7090"]; // these correspond to the races array
var raceColors2 = ["#f8f7ce", "#ffe59a", "#ffca7d", "#ffaf71", "#f6755f"]; // these correspond to the population array
//var raceColors2 = ["#FFDC7F", "#663D2A", "#D68A3F", "#A53820", "#FFDFBE"]; // these correspond to the population array
var genderColors = ["#f6755f", "#ffaf71"]; // these correspond to the genders array

/* years range */
var years = []; // we push the years from the json to the years array, but if for some reason all the years aren't present we'd need to manually create this array
//var years = ["2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013"];

/**************
Data variables 
***************/
// These are the datasets after nesting
var nestByCounty;
var nestByYear;

// this is the raw json data, before nesting
var allCountiesDataset;
var zipcodesDataset;
var thisCountyDataset;
var countyMap;

/*******
tooltip 
********/
var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip");

/*=====================================================================
 loaded()
======================================================================*/
function loaded(error, allCounties, allZips, thisCounty, countyNameMap) { // load in all of the data to be used in the viz

    // set all of the data to global data variables
    allCountiesDataset = allCounties;
    zipcodesDataset = allZips;
    thisCountyDataset = thisCounty;
    countyMap = countyNameMap;

    $(".county-name-text").text(countyMap[countyNumber] + " County"); // set the text of every span with this class to have the correct county name
    $(".cancer-type-text").text(thisCountyDataset.cancer.name + " Cancer"); // set the text of every span with this class to have the correct cancer name
    
/*******************************
nest the data by year and county 
********************************/
    setupData(allCountiesDataset);
    
/************************************
push all the years to the years array 
*************************************/
    $.each(thisCountyDataset.years, function (key, data) {
        years.push(key)
    });
    
/*********************************************
call the function(s) - unless we have
multiple pages or triggers, just call all 
of the chart functions
**********************************************/
//    getWidth();
    callAllCharts();
} // end loaded()
/*=====================================================================
 queue Data
=====================================================================*/
queue()
    .defer(d3.json, 'http://scanportal.org/json/county/raw/' + cancerType) // all counties in FL
    .defer(d3.json, 'http://scanportal.org/json/zipcode/raw/' + countyNumber + '/' + cancerType) // all zipcodes
    .defer(d3.json, 'http://scanportal.org/json/county/' + countyNumber + '/' + cancerType + '/' + startYear + '/' + endYear) // this county
    .defer(d3.json, 'http://scanportal.org/api/counties') // county id - name map
    .await(loaded);

/*=====================================================================
 setupData()
=====================================================================*/
function setupData(d) {
    nestByCounty = d3.nest().key(function (d) {
        //                console.log(d.county);
        return d.county;
    }).entries(d);

    nestByYear = d3.nest().key(function (d) {
        //                console.log(d.county);
        return d.year;
    }).entries(d);

//    console.log("ALL", allCountiesDataset);
//    console.log("NBY", nestByYear);
//    console.log("NBC", nestByCounty);
//    console.log("THIS C", thisCountyDataset);
//    console.log("ZIPS", zipcodesDataset);
} // end queue()

/*=====================================================================
 drawing charts
=====================================================================*/

function callAllCharts() {
    
    callBigStats();
    callCountyRanking("#countyBarChart");
    callZipCodeLateStageRankings("#zipcodeLSBarChart");
    callZipCodeRateRankings("#zipcodeRATEBarChart");
    callLateStageRange("#lateStageRangeChart");
    callCountArea("#countAreaChart");
    callRaceBubbles("#raceBubbleChart");
    callGPie("#genderPieChart");
    callRaceMultsArea("#raceSmallMultiplesChart");
    callGenderMultsArea("#genderSmallMultiplesChart");
    
} // end callAllCharts()

/*=====================================================================
 window resize
=====================================================================*/

$(window).resize(function () {
    clearAllsvg();
//    getWidth();
    callAllCharts();
});

function clearAllsvg() {
    d3.selectAll('svg').remove();
} // end clearAllsvg()

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