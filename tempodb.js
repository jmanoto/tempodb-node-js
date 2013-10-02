var url = require('url');
var request = require('request');
var querystring = require("querystring")
var ID = 'TempoDB: ';
var release = require('./package.json').version;
var foreverAgent = require('forever-agent');

var SslAgent = foreverAgent.SSL;
var sslAgent = new SslAgent({maxSockets: 25});

var Agent = foreverAgent;
var agent = new Agent({maxSockets: 25});

var TempoDBClient = exports.TempoDBClient =
    function(key, secret, options) {
        /*
            options
                hostname (string)
                port (Integer)
                secure (Boolean)
                version (string)
        */
        options = options || {};

        const HOST = 'api.tempo-db.com',
              VERSION = 'v1',
              SECURE = true;

        var hostname = options.hostname || HOST;
        var auth = 'Basic ' + new Buffer(key+':'+secret).toString('base64');
        var headers = {
            'Host': hostname,
            'Authorization': auth,
            'User-Agent': "tempodb-nodejs/" + release + "_ninjablocks"
        };

        this.key = key;
        this.secret = secret;

        this.hostname = hostname;
        this.protocol = (options.secure != false) && SECURE ? 'https' : 'http'; // Have to check if boolean is false and not just undefined
        this.version = options.version || VERSION;
        this.path = '/' + this.version;
        this.headers = headers;
        this.baseUrl = this.protocol + '://' + this.hostname + '/' + this.version;

        // the agent which will be used for this instance to ensure keep-alives are honored.
        if (this.protocol == 'https') {
          this.agent = sslAgent;
        }
        else {
          this.agent = agent;
        }
    }

TempoDBClient.prototype._callApi = function(method, path, body, callback) {

    var options = {
        url:  url.parse(this.baseUrl + path || this.baseUrl),
        method: method,
        headers: this.headers,
        body: JSON.stringify(body),
        agent: this.agent,
        json: true
    };

    request(options, callback);
}

TempoDBClient.prototype.create_series = function(key, callback) {
    data = {};

    if (typeof key == 'string' && key) {
        data.key = key;
    }

    return this._callApi('POST', '/series/', data, callback);
}

TempoDBClient.prototype.get_series = function(options, callback) {
    /*
        options
            id (Array of ids or single id)
            key (Array of keys or single key)
            tag (string or Array[string])
            attr ({key: val, key2: val2})

    */
    options = options || {};
    var query_string = '?' + querystring.stringify(options);

    return this._callApi('GET', '/series/' + query_string, null, callback);
}

TempoDBClient.prototype.update_series = function(series_id, series_key, name, attributes, tags, callback) {
    if (!(tags instanceof Array)) {
        throw ID + 'tags must be an array';
    }

    if (!(attributes instanceof Object)) {
        throw ID + 'attributes must be an Object';
    }

    data = {
        id: series_id,
        key: series_key,
        name: name,
        attributes: attributes,
        tags: tags
    }

    return this._callApi('PUT', '/series/id/' + series_id + '/', data, callback);
}

TempoDBClient.prototype.read = function(start, end, options, callback) {
    /*
        options
            id (Array of ids or single id)
            key (Array of keys or single key)
            interval (string)
            function (string)

    */
    options = options || {};
    options.start = this._toISODateString(start);
    options.end = this._toISODateString(end);
    var query_string = '?' + querystring.stringify(options);

    return this._callApi('GET', '/data/' + query_string, null, callback);
};

TempoDBClient.prototype.read_id = function(series_id, start, end, options, callback) {
    /*
        options
            interval (string)
            function (string)

    */
    options = options || {};
    options.start = this._toISODateString(start);
    options.end = this._toISODateString(end);
    var query_string = '?' + querystring.stringify(options);

    return this._callApi('GET', '/series/id/' + series_id + '/data/' + query_string, null, callback);
}

TempoDBClient.prototype.read_key = function(series_key, start, end, options, callback) {
    /*
        options
            interval (string)
            function (string)

    */
    options = options || {};
    options.start = this._toISODateString(start);
    options.end = this._toISODateString(end);
    var query_string = '?' + querystring.stringify(options);

    return this._callApi('GET', '/series/key/' + series_key + '/data/' + query_string, null, callback);
}

TempoDBClient.prototype.write_id = function(series_id, data, callback) {
    return this._callApi('POST', '/series/id/' + series_id + '/data/', data, callback);
}

TempoDBClient.prototype.write_key = function(series_key, data, callback) {
    return this._callApi('POST', '/series/key/' + series_key + '/data/', data, callback);
}

TempoDBClient.prototype.write_bulk = function(ts, data, callback) {
    var body = {
        t: this._toISODateString(ts),
        data: data
    }

    return this._callApi('POST', '/data/', body, callback);
}

TempoDBClient.prototype.increment_id = function(series_id, data, callback) {
    return this._callApi('POST', '/series/id/' + series_id + '/increment/', data, callback);
}

TempoDBClient.prototype.increment_key = function(series_key, data, callback) {
    return this._callApi('POST', '/series/key/' + series_key + '/increment/', data, callback);
}

TempoDBClient.prototype.increment_bulk = function(ts, data, callback) {
    var body = {
        t: this._toISODateString(ts),
        data: data
    }

    return this._callApi('POST', '/increment/', body, callback);
}

TempoDBClient.prototype.delete_id = function(series_id, start, end, callback) {
  var options = {
    start: this._toISODateString(start),
    end:   this._toISODateString(end)
  }
  var query_string = '?' + querystring.stringify(options);

  return this._callApi('DELETE', '/series/id/'+series_id+'/data/'+query_string, null, callback);
}

TempoDBClient.prototype.delete_key = function(series_key, start, end, callback) {
  var options = {
    start: this._toISODateString(start),
    end:   this._toISODateString(end)
  }

  var query_string = '?' + querystring.stringify(options);

  return this._callApi('DELETE', '/series/key/'+series_key+'/data/'+query_string, null, callback);
}


TempoDBClient.prototype._toISODateString = function(d) {
    // If you pass a string for a date we will assume that it is already in ISO format
    if(typeof(d) == 'string') {
        return d;
    }
    return d.toISOString();
};
