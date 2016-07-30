var countyNumber = 360;
var startYear = 2004;
var endYear = 2013;
var cancerType = 5;


/*=====================================================================
 loaded()
======================================================================*/
function loaded(error, allCounties, allZips, thisCounty, countyNameMap) { // load in all of the data to be used in the viz

    // set all of the data to global data variables
    allCountiesDataset = allCounties;
    zipcodesDataset = allZips;
    thisCountyDataset = thisCounty;
    countyMap = countyNameMap;

    $(".county-name-text").text(countyMap[countyNumber] + " County");

    $(".cancer-type-text").text(thisCountyDataset.cancer.name + " Cancer");
    // formatting
    setupData(allCountiesDataset);
    // call the function(s) - unless we have multiple pages or triggers, just call all of the chart functions
    getWidth();
    callAllCharts();
}
/*=====================================================================
 queue Data
=====================================================================*/
queue()
    .defer(d3.json, 'http://scanportal.org/json/county/raw/' + cancerType) // all counties in FL
    .defer(d3.json, 'http://scanportal.org/json/zipcode/raw/' + countyNumber + '/' + cancerType) // all zipcodes
    .defer(d3.json, 'http://scanportal.org/json/county/' + countyNumber + '/' + cancerType + '/' + startYear + '/' + endYear) // this county
    .defer(d3.json, 'http://scanportal.org/api/counties') // county id - name map
    .await(loaded);


function setupData(d) {

    mapByCounty = d3.map(d, function (d) {
        return d.county
    });

    nestByCounty = d3.nest().key(function (d) {
        //                console.log(d.county);
        return d.county;
    }).entries(d);

    nestByYear = d3.nest().key(function (d) {
        //                console.log(d.county);
        return d.year;
    }).entries(d);

    console.log("ALL", allCountiesDataset);
    console.log("NBY", nestByYear);
    console.log("NBC", nestByCounty);
    console.log("MBC", mapByCounty);
    console.log("THIS C", thisCountyDataset);
    console.log("ZIPS", zipcodesDataset);
}

/*=====================================================================
 drawing charts
=====================================================================*/

function callAllCharts() {
    callCountyRanking("#countyBarChart");
    callZipCodeLateStageRankings("#zipcodeLSBarChart");
    callZipCodeRateRankings("#zipcodeRATEBarChart");
    callLateStageRange("#lateStageRangeChart");
    callCountArea("#countAreaChart");
    callRaceBubbles("#raceBubbleChart");
    callGPie("#genderPieChart");
//    callRaceRateLines("#raceRateLineChart");
    callRaceMultsArea("#raceSmallMultiplesChart");
//    callGenderRateLines("#genderRateLineChart");
    callGenderMultsArea("#genderSmallMultiplesChart");
    callAgeScatter("#zipcodeScatterChart");
}

/*=====================================================================
 window resize
=====================================================================*/

$(window).resize(function () {
    clearAllsvg();
    getWidth();
    callAllCharts();
});

function clearAllsvg() {
    d3.selectAll('svg').remove();
};