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
var year = 2013; // year
var cancerType; // cancer number
var cancerName;

var index = 0; // index for the looping through cancer types
var panels;
var allpushed = 0;

/**************************************
These variables affect chart dimensions 
***************************************/
var standardHeight = 200;

/**************
Data variables 
***************/
var allCancerDataset;
var selectedCancerDataset;
var wikiDataset;

var cancerNames = [];
//var dataArray = [];
//var dataMap;

/*******
tooltip 
********/
var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip");

var $tosearch;

$('#search').keyup(function() {
    var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();
    $tosearch.show().filter(function() {
        var text = $(this).find('.panel-heading').text().replace(/\s+/g, ' ').toLowerCase();
        return !~text.indexOf(val);
    }).hide();
});

/*=====================================================================
 load in the data and begin!
======================================================================*/
d3.json('http://scanportal.org/json/cancers/overview/' + year, function (data) {
    allCancerDataset = data;

    allCancerDataset.sort(function (a, b) {
        return b.cases - a.cases;
    });

    allCancerDataset.forEach(function (d) {
        cancerNames.push(d.name);
    });

    //    drawPanels(allCancerDataset);

    //    allCancerDataset.forEach(function (d) {
    //        console.log(d);
    //        cancerType = d.id;
    //        rankingChartId = "ranking" + cancerType;
    //
    //        d3.json('http://scanportal.org/json/cancer/' + cancerType + '/comparison', function (data) {
    //
    //            console.log("chartID", rankingChartId);
    //            console.log("cancertype", cancerType);
    //            selectedCancerDataset = data;
    //            setup();
    //        });
    //    });

    allCancerDataset.forEach(function (d, i) {
        cancerType = d.id;
        cancerName = d.name;
        var chartID = "chart" + cancerType;
        setup(chartID);
        if (i == allCancerDataset.length - 1) {
            // get all the panels in an array
            panels = $('.chart').toArray();
            // for each panel, draw the charts
            fillPanels();
        }
        
        $tosearch = $('.panel');
        $("#search-wrap").removeClass("hidden");
    });

});

function fillPanels() {
    panels.forEach(function (p) {
            var id = $(p).attr('id');
            callAllCharts("#" + id, id.replace("chart", ""));
                //        callAllCharts("#" + id, id.replace("chart", ""), function () {
                //            console.log(allpushed);
                //            if (allpushed == cancerNames.length) {
                //                dataMap = d3.map(dataArray);
                //                console.log("allpushed");
                //                console.log(dataArray);
                //                console.log(dataMap);
                //            }
                //        });
            });
    }

    //function drawPanels(array) {
    // // draws panels one at a time, each panel - div and children - appear one after another. Impedes search?
    //    cancerType = array[index].id;
    //    rankingChartId = "ranking" + cancerType;
    //
    //    d3.json('http://scanportal.org/json/cancer/' + cancerType + '/comparison', function (data) {
    //        selectedCancerDataset = data;
    //        setup(function () {
    //            index++;
    //
    //            if (index < array.length) {
    //                drawPanels(array);
    //            }
    //        });
    //    });
    //}
    /*=====================================================================
     setup()
    =====================================================================*/
    function setup(chartID) {
        // append chart div
        var element = ('<div class="panel panel-default"><div class="panel-heading">' + cancerName + '</div><div class="panel-body"><a class="view-map-link" href="#">View Map ></a><div id="' + chartID + '" class="chart chart-id-' + cancerType + '"></div></div></div>');

        $('section#chart-section').append(element);
    } // end setup

    /*=====================================================================
     drawing charts
    =====================================================================*/

    function callAllCharts(chartID, cancerID /*callback*/) {
        callCancerRanking(chartID, cancerID);
        callSelectedCancerLine(chartID, cancerID);
//        callSelectedCancerLine(chartID, cancerID, callback);
    } // end callAllCharts()

    /*=====================================================================
     window resize
    =====================================================================*/

    $(window).resize(function () {
        clearAllsvg();
        fillPanels();
    });

    function clearAllsvg() {
        d3.selectAll('svg').remove();
    } // end clearAllsvg()

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