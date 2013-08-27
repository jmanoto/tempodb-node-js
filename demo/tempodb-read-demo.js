/* http://tempo-db.com/api/read-series/#read-series-by-key */

var util = require('util');
var TempoDBClient = require('../tempodb').TempoDBClient;
var creds = require('./creds.js')

var tempodb = new TempoDBClient(creds.key, creds.secret);

var series_key = 'your-custom-key',
  series_start_date = new Date('2012-01-01'),
  series_end_date = new Date('2012-01-02');

// read a date range
var options = {
  key: series_key,
  interval: '1hour',
  'function': 'mean'
}

var start_time = new Date();
tempodb.read(series_start_date, series_end_date, options, function (err, result) {
  console.log(result.statusCode + ': ' + util.inspect(result.body));
  console.log('Completed in', new Date() - start_time, 'ms\n');
});
