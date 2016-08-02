// ***********************************************
// This is the function to add the values to the 
// "big" stats for the county
// *********************************************** 

function callBigStats() {

    var reformatted = []; // new array for data
    
    // reformat the data from the json here
    $.each(thisCountyDataset.years, function (key, data) {
        reformatted.push({
            year: key,
            data: data
        });
    });

    // mean of the late_stage_percent for selected county from 2004-2013
    var late_stage_mean = d3.format("%")(d3.mean(reformatted, function (d) {
        return d.data.late_stage_percentage;
    }));
    
    // mean of the total_ratio for selected county from 2004-2013
    var total_ratio_mean = d3.format(".1f")(d3.mean(reformatted, function (d) {
        return d.data.total_ratio;
    }));
    
    // set the text by selecting the corresponding <span> element
    $("#new-cases-stat").text("<>");
    $("#average-late-stage-stat").text(late_stage_mean);
    $("#average-rate-stat").text(total_ratio_mean);
}