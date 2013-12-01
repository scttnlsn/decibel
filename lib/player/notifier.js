var stream = require('stream');
var util = require('util');

module.exports = Notifier;

function Notifier(emitter, params) {
    this.emitter = emitter;
    this.offset = params.offset;
    this.size = params.size;
    this.interval = params.interval || 0;
    this.count = 0;

    this._last = 0;
    
    stream.Transform.call(this);
}

util.inherits(Notifier, stream.Transform);

Notifier.prototype.position = function () {
    return (this.offset + this.count) / this.size;
};

Notifier.prototype.notify = function () {
    var now = Date.now();

    if (now - this._last > this.interval) {
        this._last = now;
        this.emitter.emit('position', this.position());
    }
};

Notifier.prototype._transform = function (chunk, encoding, callback) {
    this.count += chunk.length;
    this.notify();
    this.push(chunk);
    callback();
};