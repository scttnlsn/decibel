var EventEmitter = require('eventemitter2').EventEmitter2;
var Speaker = require('speaker');
var util = require('util');
var Chunker = require('./chunker');
var errors = require('./errors');
var Playable = require('./playable');
var utils = require('./utils');

module.exports = Player;

function Player() {
    EventEmitter.call(this, { wildcard: true });
    this.output = null;

    this._ended = function () {
        this.output = null;
        this.emit('end');
    }.bind(this);
}

util.inherits(Player, EventEmitter);

Player.prototype.play = function (options, callback) {
    var self = this;

    this.emit('play', options);

    utils.stat(options.url, function (err, stats) {
        if (err) return callback(err);

        var playable = new Playable({
            url: options.url,
            pos: options.pos,
            size: stats.size,
            mime: stats.mime
        });

        var data = playable.data();
        var chunker = new Chunker(1024);
        var notifier = playable.notifier(self);
        var decoder = playable.decoder();

        if (!decoder) return callback(new errors.UnsupportedType(playable.mime));

        decoder.on('format', function (format) {
            var output = self._output(format);

            output.on('finish', function () {
                data.abort();
            });

            self._set(output, function (err, output) {
                if (err) return callback(err);

                decoder.pipe(output);
                callback(null, output);
            });
        });

        decoder.on('error', function (err) {
            callback(err);
        });

        data.pipe(chunker).pipe(notifier).pipe(decoder);
    });
};

Player.prototype.stop = function (callback) {
    var self = this;

    this._set(null, function (err) {
        if (err) return callback(err);

        self.emit('stop');
        callback();
    });
};

Player.prototype._set = function (output, callback) {
    var self = this;

    var next = function () {
        if (output) output.on('finish', self._ended);
        self.output = output;
        callback(null, output);
    };

    if (this.output) {
        this.output.removeListener('finish', this._ended);
        this.output.end(next);
    } else {
        next();
    }
};

Player.prototype._output = function (format) {
    return new Speaker(format);
};