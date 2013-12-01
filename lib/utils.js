var request = require('request');
var errors = require('./errors');

exports.stat = function (url, callback) {
    request({ method: 'HEAD', url: url }, function (err, res) {
        if (err) return callback(err);

        if (res.statusCode === 404) return callback(new errors.NotFound());
        if (res.statusCode >= 400) return callback(new Error('Stat error: ' + url));

        var mime = res.headers['content-type'];
        var size = parseInt(res.headers['content-length'], 10);

        callback(null, { mime: mime, size: size });
    });
};