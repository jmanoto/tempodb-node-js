/* http://tempo-db.com/api/write-series/#bulk-write-multiple-series */

var TempoDBClient = require('../tempodb').TempoDBClient;
var creds = require('./creds.js')

var tempodb = new TempoDBClient(creds.key, creds.secret);

var start_time = new Date();

var data = [
    { key: "custom-series-key1", v: 1.11 },
    { key: "custom-series-key2", v: 2.22 },
    { key: "custom-series-key3", v: 3.33 },
    { key: "custom-series-key4", v: 4.44 },
];

tempodb.write_bulk(start_time, data, function(err, result){
  console.log(result.statusCode + ': ' + result.body);
  console.log('Completed in', new Date() - start_time, 'ms\n');
});
