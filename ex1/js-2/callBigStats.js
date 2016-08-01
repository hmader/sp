// ***********************************************
// This is the function to add the values to the 
// "big" stats for the county
// *********************************************** 

function callBigStats() {

    var reformatted = [];
    // reformat the data from the json here
    $.each(thisCountyDataset.years, function (key, data) {
        //            console.log(key, data);
        reformatted.push({
            year: key,
            data: data
        });
        years.push(key);
    });

    var late_stage_mean = d3.format("%")(d3.mean(reformatted, function (d) {
        return d.data.late_stage_percentage;
    }));

    var total_ratio_mean = d3.format(".1f")(d3.mean(reformatted, function (d) {
        return d.data.total_ratio;
    }));
    
    $("#new-cases-stat").text("<>");
    $("#average-late-stage-stat").text(late_stage_mean);
    $("#average-rate-stat").text(total_ratio_mean);
}