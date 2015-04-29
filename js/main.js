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

/**
 * only shortcut for creating time range from start and end moments
 *
 * @param data - { start: moment, end: moment }
 * @param utc_offset - utc timezone
 * @returns {range|*}
 */
function get_range(data, utc_offset){
    var start = moment(data.start, "DD MMM h:mm A").utc(utc_offset);
    var end = moment(data.end, "DD MMM h:mm A").utc(utc_offset);
    return moment().range(start, end);
}

//
//
//working with booked times (subtract)
var ranges = [get_range(options.time_frame, options.utc_offset)];
var range_book = {};
var ranges_sub = [];
var ranges_result = [];

for (var k=0; k<data.length; k++) {
    for (i=0; i<data[k].booked.length; i++) {
        range_book = get_range(data[k].booked[i], data[k].utc_offset);
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
var moment_end_work_today = moment(final_working_hours[0], "h:mm A");

//write initial time-frame parameters
$("#start_t_f").val(moment(options.time_frame.start, "DD MMM h:mm A").utc(options.utc_offset).format("DD MMM h:mm A"));
$("#end_t_f").val(moment(options.time_frame.end, "DD MMM h:mm A").utc(options.utc_offset).format("DD MMM h:mm A"));


var tmp_start = {};
var tmp_end = {};
for (i=0; i<ranges.length; i++){

    //working with working times
    tmp_start = ranges[i].start.clone().set({hour: moment_start_work_today.hour(), minute: moment_start_work_today.minutes()});
    tmp_end = ranges[i].end.clone({hour: moment_end_work_today.hour(), minute: moment_end_work_today.minutes()});
    ranges[i].start = moment.max(ranges[i].start, tmp_start);
    ranges[i].end = moment.max(ranges[i].end, tmp_end);

    //filter my meeting duration
    if (moment.duration(ranges[i].end.diff(ranges[i].start)).asMinutes() >= options.meeting_length) {

        //write only first options.number_possible_time_slots time slots
        if (options.number_possible_time_slots === false || --options.number_possible_time_slots >= 0){
            $("#time_slots").append(get_time_slot_html(i, ranges[i]));
        }

    }
}