/* http://tempo-db.com/api/write-series/#write-series-by-key */

var TempoDBClient = require('../tempodb').TempoDBClient;
var creds = require('./creds.js')

var tempodb = new TempoDBClient(creds.key, creds.secret);
var util = require('util');

/* update to one of your series_key */
/* if you write to a key that doesn't yet exist, it will create it for you */
var series_key = '1_D90343085872CA9C_687_0_2000';


setInterval(function(){

  var data = [];
  data.push({t: new Date(), v: Math.random() * 50})

  console.log(data[0]);


  tempodb.write_key(series_key, data, function (err, result) {
    if (!err) console.log('req', result.statusCode);
  });

}, 1000);