var fs = require('fs');
var stream = require('stream');

exports.tone = function () {
    return fs.readFileSync(__dirname + '/fixtures/tone.mp3');
};

exports.speaker = function () {
    // Fake speaker just counts bytes written to it
    var speaker = new stream.Writable();

    speaker.count = 0;

    speaker._write = function (chunk, encoding, callback) {
        this.count += chunk.length;
        callback();
    };

    speaker.on('finish', function () {
        speaker.emit('close');
    });

    return speaker;
};