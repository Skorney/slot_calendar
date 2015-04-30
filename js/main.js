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
        start_moments.push(moment(data[i].working_hours.start, "h:mm A"));
        end_moments.push(moment(data[i].working_hours.end, "h:mm A"));
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

    var str = '<div style="margin-bottom: 8px">';
    str += '    <input placeholder="time range" id="time_slot_'+i+'" class="form-control" type="text" value="'+range.start.format("DD MMM h:mm A")+' - '+range.end.format("DD MMM h:mm A")+'" />';
    str += '</div>';

    return str;
}

/**
 * only shortcut for creating time range from start and end moments
 *
 * @param data - { start: moment, end: moment }
 * @returns {range|*}
 */
function get_range(data){
    var start = moment(data.start, "DD MMM h:mm A");
    var end = moment(data.end, "DD MMM h:mm A");
    return moment().range(start, end);
}

//
//
//working with booked times (subtract)
var ranges = [get_range(options.time_frame)];
var range_book = {};
var ranges_sub = [];
var ranges_result = [];

for (var k=0; k<data.length; k++) {
    for (i=0; i<data[k].booked.length; i++) {
        range_book = get_range(data[k].booked[i]);
        for (var j=0; j<ranges.length; j++){
            ranges_sub = ranges[j].subtract(range_book);
            ranges_result = ranges_result.concat(ranges_sub);
        }
        ranges = ranges_result;
        ranges_result = [];
    }
}

//calculate and write final working hours
var final_working_hours = get_working_hours_moments(data);
$("#start_w_h").val(final_working_hours[0].format("h:mm A"));
$("#end_w_h").val(final_working_hours[1].format("h:mm A"));

var moment_start_work_today = moment(final_working_hours[0], "h:mm A");
var moment_end_work_today = moment(final_working_hours[1], "h:mm A");

//write initial time-frame parameters
$("#start_t_f").val(moment(options.time_frame.start, "DD MMM h:mm A").format("DD MMM h:mm A"));
$("#end_t_f").val(moment(options.time_frame.end, "DD MMM h:mm A").format("DD MMM h:mm A"));


var tmp_start_s_w = {};
var tmp_start_e_w = {};
var tmp_end_s_w = {};
var tmp_end_e_w = {};

var intersect = {};
for (i=0; i<ranges.length; i++){

    //working with working times
    tmp_start_s_w = ranges[i].start.clone().set({hour: moment_start_work_today.hour(), minute: moment_start_work_today.minutes()});
    tmp_start_e_w = ranges[i].start.clone().set({hour: moment_end_work_today.hour(), minute: moment_end_work_today.minutes()});

    tmp_end_s_w = ranges[i].end.clone().set({hour: moment_start_work_today.hour(), minute: moment_start_work_today.minutes()});
    tmp_end_e_w = ranges[i].end.clone().set({hour: moment_end_work_today.hour(), minute: moment_end_work_today.minutes()});

    intersect = moment.range(tmp_start_s_w, tmp_end_e_w).intersect(moment.range(ranges[i].start, ranges[i].end));
    if (moment.duration(intersect.end.diff(intersect.start)).asMinutes() >= 0) {
        ranges[i].start = moment.max(ranges[i].start, tmp_start_s_w);
        ranges[i].start = moment.min(ranges[i].start, tmp_start_e_w);

        ranges[i].end = moment.min(ranges[i].end, tmp_end_e_w);
        ranges[i].end = moment.max(ranges[i].end, tmp_end_s_w);
    }
    else {
        continue;
    }

    //filter my meeting duration
    if (moment.duration(ranges[i].end.diff(ranges[i].start)).asMinutes() >= options.meeting_length) {

        //write only first options.number_possible_time_slots time slots
        if (options.number_possible_time_slots === false || --options.number_possible_time_slots >= 0){
            $("#time_slots").append(get_time_slot_html(i, ranges[i]));
        }

    }
}
