var countyNumber = 367;
var startYear = 2004;
var endYear = 2013;
var cancerType = 5;


/*=====================================================================
 loaded()
======================================================================*/
function loaded(error, allCounties, allZips, thisCounty) { // load in all of the data to be used in the viz

    // set all of the data to global data variables
    allCountiesDataset = allCounties;
    zipcodesDataset = allZips;
    thisCountyDataset = thisCounty;

    setupData(allCountiesDataset);
    // call the function(s) - unless we have multiple pages or triggers, just call all of the chart functions
    callAllCharts();

}
/*=====================================================================
 queue Data
=====================================================================*/
queue()
    .defer(d3.json, 'http://scanportal.org/json/county/raw/' + cancerType) // all counties in FL
    .defer(d3.json, 'http://scanportal.org/json/zipcode/raw/' + countyNumber + '/' + cancerType)
    .defer(d3.json, 'http://scanportal.org/json/county/' + countyNumber + '/' + cancerType + '/' + startYear + '/' + endYear) // all zipcodes
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

    console.log("NBY", nestByYear);
    console.log("NBC", nestByCounty);
    console.log("MBC", mapByCounty);
    console.log("THIS C", thisCountyDataset);
    console.log("GET", mapByCounty.get(countyNumber));
}

/*=====================================================================
 drawing charts
=====================================================================*/

function callAllCharts() {
        callCountyRanking("#chart0");
    //    callZipCodeRankings("#chart1");
        callLateStageRange("#chart2");
        callCountArea("#chart3");
//        callRPie("#chart4");
        callRaceRateLines("#chart5");
        callRaceMultsArea("#chart6");
    callGenderRateLines("#chart7");
    callAgeScatter("#chart8");
}

/*=====================================================================
 set up selections
=====================================================================*/

function setSelectionOptions() {
    var selections = $("select#county-selector");

    nestByCounty.forEach(function (d) {
        selections.append("<option>" + d.key + "</option>");
    });

}