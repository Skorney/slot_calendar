function get_moment(date_arr){
    return moment(date_arr[0], "DD MMM ha").utcOffset(date_arr[1]);
}

var options = {
    utc_offset: "+3",
    meeting_length: 120, /* in minutes */
    number_possible_time_slots: 0, /* how much slots to return, 0 == all */
    time_frame: {
        start: "24th Mar 8AM", end: "29th Mar 6PM"
    }
};

var start = get_moment(options.time_frame.start);
console.log(start.format('YYYY-MM-DD HH:mm'));

end = get_moment(options.time_frame.end);
console.log(end.format('YYYY-MM-DD HH:mm'));

var range = moment().range(start, end).toDate();
console.log(range);