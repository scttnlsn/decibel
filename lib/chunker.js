var stream = require('stream');
var util = require('util');

module.exports = Chunker;

function Chunker(size) {
    this.size = size;
    stream.Transform.call(this);
}

util.inherits(Chunker, stream.Transform);

Chunker.prototype._transform = function (chunk, encoding, callback) {
    for (var offset = 0; offset < chunk.length; offset += this.size) {
        var buffer = chunk.slice(offset, offset + this.size);
        this.push(buffer);
    }

    if (chunk.length - offset > 0) {
        var buffer = chunk.slice(offset, chunk.length);
        this.push(buffer);
    }

    callback();
};