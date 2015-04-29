function get_range(data, utc_offset){
    var start = moment(data.start, "DD MMM ha").utcOffset(utc_offset);
    var end = moment(data.end, "DD MMM ha").utcOffset(utc_offset);
    return moment().range(start, end);
}

var options = {
    utc_offset: "+3",
    meeting_length: 120, /* in minutes */
    number_possible_time_slots: 0, /* how much slots to return, 0 == all */
    time_frame: {
        start: "24th Mar 4AM", end: "29th Mar 6PM"
    }
};

get_range(options.time_frame, "+3").by('days', function(moment) {
    // Do something with `moment`
    console.log(moment.set("hour", 5));
    console.log(moment.get("hour"));
    //console.log(get_range(moment.hour("8AM"), moment.hour("6PM")));
});


var ranges = [get_range(options.time_frame, "+3")];
var range_book = {};
var ranges_sub = [];
var ranges_result = [];

for (var i=0; i<data[0].booked.length; i++) {
    range_book = get_range(data[0].booked[i], "+3");
    for (var j=0; j<=0; j++){
        ranges_sub = ranges[j].subtract(range_book);
        ranges_result = ranges_result.concat(ranges_sub);
    }

}

console.log(ranges_result);