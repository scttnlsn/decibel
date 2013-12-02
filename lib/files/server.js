var express = require('express');
var fs = require('fs');
var mime = require('mime');
var path = require('path');

module.exports = function (options) {
    var app = express();

    app.use(function (req, res, next) {
        req.filename = unescape(path.join(options.path, path.normalize(req.path)));

        fs.stat(req.filename, function (err, stats) {
            if (err) return res.json({ error: 'Not found' }, 404);

            req.stats = stats;
            res.header('Content-Length', req.stats.size);
            res.header('Content-Type', mime.lookup(req.filename));
            next();
        });
    });

    app.head('*', function (req, res, next) {
        res.status(200);
        res.end();
    });

    app.get('*', function (req, res, next) {
        res.sendfile(req.filename);
    });

    return app;
};