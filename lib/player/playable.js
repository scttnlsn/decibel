var request = require('request');
var util = require('util');
var decoders = require('./decoders');
var Notifier = require('./notifier');

module.exports = Playable;

function Playable(options) {
    this.url = options.url;
    this.mime = options.mime;
    this.size = options.size;
    this.pos = options.pos || 0;
    this.offset = Math.round(this.size * this.pos);
}

Playable.prototype.data = function () {
    var self = this;

    var req = request({
        method: 'GET',
        url: this.url,
        headers: {
            'Range': util.format('bytes=%s-%s', this.offset, this.size - 1)
        }
    });

    req.on('response', function (res) {
        if (res.statusCode !== 206) {
            self.pos = 0;
            self.offset = 0;
        }
    });

    return req;
};

Playable.prototype.notifier = function (emitter) {
    return new Notifier(emitter, {
        offset: this.offset,
        size: this.size,
        interval: 500
    });
};

Playable.prototype.decoder = function () {
    var decoder = decoders.create(this.mime);
    if (!decoder) return null;
    return decoder;
};