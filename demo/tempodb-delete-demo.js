
var TempoDBClient = require('../tempodb').TempoDBClient;
var creds = require('./creds.js')
var tempodb = new TempoDBClient(creds.key, creds.secret);

var util = require('util');

var series_key = 'your-custom-key'
// Delete a day's worth of data
series_start_date = new Date('2012-11-13')
series_end_date = new Date('2012-11-14')

var start_time = new Date();
tempodb.delete_key(series_key, series_start_date, series_end_date, function(err, result){
  console.log(result.statusCode + ': ' + result.body);
  console.log('Completed in', new Date() - start_time, 'ms\n');

});
