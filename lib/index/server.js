var express = require('express');

module.exports = function (metadata) {
    var app = express();

    app.use(express.json());

    app.post('/metadata', function (req, res, next) {
        metadata.save(req.body, function (err) {
            if (err) return next(err);
            res.send(200);
        });
    });

    app.get('/metadata', function (req, res, next) {
        res.json(metadata.all());
    });

    return app;
};