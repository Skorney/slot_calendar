/**
 * returns array with MAX start working hour and MIN end working hour from ALL workers
 *
 * @param data
 * @returns {Array} - [ moment with MAX start w.hour, moment with MIN end w.hour ]
 */
function get_working_hours_moments(data) {
    var start_moments = [];
    var end_moments = [];

    for (var i=0; i<data.length; i++){
        start_moments.push(moment(data[i].working_hours.start, "h:mm A").utc(data[i].utc_offset));
        end_moments.push(moment(data[i].working_hours.end, "h:mm A").utc(data[i].utc_offset));
    }
    return [
        moment.max.apply(null, start_moments),
        moment.min.apply(null, end_moments)
    ]
}

/**
 * return HTML code of time-slot to append in interface
 *
 * @param i - iteration var, number of slot
 * @param range - range: [ start_date, end_date ]
 * @returns {string}
 */
function get_time_slot_html(i, range){

    var str = '<div class="input-group" style="margin-bottom: 8px">';
    str += '    <input placeholder="time range" id="time_slot_'+i+'" class="form-control" type="text" value="'+range.start.utc(options.utc_offset).format("DD MMM h:mm A")+' - '+range.end.format("DD MMM h:mm A")+'" />';
    str += '    <div class="input-group-addon">UTC '+options.utc_offset+'</div>';
    str += '</div>';

    return str;
}


function get_range(data, utc_offset){
    var start = moment(data.start, "DD MMM h:mm A").utc(utc_offset);
    var end = moment(data.end, "DD MMM h:mm A").utc(utc_offset);
    return moment().range(start, end);
}

function get_range_moments(moment_start, moment_end, utc_offset){
    var start = moment_start.utc(utc_offset);
    var end = moment_end.utc(utc_offset);
    return moment().range(start, end);
}

var options = {
    utc_offset: "+0",
    meeting_length: 240, /* in minutes */
    number_possible_time_slots: 0, /* how much slots to return, 0 == all */
    time_frame: {
        start: "24th Mar 6:20AM", end: "29th Mar 6:20PM"
    }
};




//get_range(options.time_frame, "+3").by('days', function(m) {
//
//    var start_hour = moment("8AM", "ha").get("hour");
//    var end_hour = moment("6PM", "ha").get("hour");
//    var work_hours_range = get_range_moments(m.clone().hour(start_hour), m.clone().hour(end_hour), "+3");
//
//});


var ranges = [get_range(options.time_frame, options.utc_offset)];
var range_book = {};
var ranges_sub = [];
var ranges_result = [];

for (i=0; i<data[0].booked.length; i++) {
    range_book = get_range(data[0].booked[i], data[0].utc_offset);
    for (var j=0; j<ranges.length; j++){
        ranges_sub = ranges[j].subtract(range_book);
        ranges_result = ranges_result.concat(ranges_sub);
    }
    ranges = ranges_result;
    ranges_result = [];
}



var final_working_hours = get_working_hours_moments(data);
$("#start_w_h").val(final_working_hours[0].format("h:mm A"));
$("#end_w_h").val(final_working_hours[1].format("h:mm A"));

$("#start_t_f").val(moment(options.time_frame.start, "DD MMM h:mm A").utc(options.utc_offset).format("DD MMM h:mm A"));
$("#end_t_f").val(moment(options.time_frame.end, "DD MMM h:mm A").utc(options.utc_offset).format("DD MMM h:mm A"));

for (i=0; i<ranges.length; i++){
    if (moment.duration(ranges[i].end.diff(ranges[i].start)).asMinutes() >= options.meeting_length) {
        $("#time_slots").append(get_time_slot_html(i, ranges[i]));
    }
}