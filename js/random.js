var sample = [];

loadData();

function loadData() {
    for (var a=[], i = 0; i < 209406; ++i) a[i]=i;

// http://stackoverflow.com/questions/962802#962890
    function shuffle(array) {
        var tmp, current, top = array.length;
        if(top) while(--top) {
            current = Math.floor(Math.random() * (top + 1));
            tmp = array[current];
            array[current] = array[top];
            array[top] = tmp;
        }
        return array;
    }

    a = shuffle(a);
    console.log(a);

    d3.csv("data/201807-citibike-tripdata.csv", function(data) {

        var date1 = new RegExp("07/01/18");
        var date2 = new RegExp("07/02/18");
        var date3 = new RegExp("07/03/18");
        var date4 = new RegExp("07/04/18");
        var date5 = new RegExp("07/05/18");
        var date6 = new RegExp("07/06/18");
        var date7 = new RegExp("07/07/18");

        var dates = [date1, date2, date3, date4, date5, date6, date7];
        var filtereddata = [];

        data.forEach(function(d) {
            for (i = 0; i < dates.length; i++) {
                if (dates[i].test(d.starttime) == true) {
                    filtereddata.push(d);
                    return;
                }
            }
        });
        // console.log(filtereddata);

        for (var i = 0; i < 10000; i++) {
            var temp = filtereddata[a[i]];
            sample.push(temp);
        }

        console.log(sample);


    })

}

function convertArrayOfObjectsToCSV(args) {
    var result, ctr, keys, columnDelimiter, lineDelimiter, data;

    data = args.data || null;
    if (data == null || !data.length) {
        return null;
    }

    columnDelimiter = args.columnDelimiter || ',';
    lineDelimiter = args.lineDelimiter || '\n';

    keys = Object.keys(data[0]);

    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    data.forEach(function(item) {
        ctr = 0;
        keys.forEach(function(key) {
            if (ctr > 0) result += columnDelimiter;

            result += item[key];
            ctr++;
        });
        result += lineDelimiter;
    });

    return result;
}

function downloadCSV(args) {
    var data, filename, link;
    var csv = convertArrayOfObjectsToCSV({
        data: sample
    });
    if (csv == null) return;

    filename = args.filename || 'export.csv';

    if (!csv.match(/^data:text\/csv/i)) {
        csv = 'data:text/csv;charset=utf-8,' + csv;
    }
    data = encodeURI(csv);

    link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();
}


