var lame = require('lame');

exports.types = {
    'audio/mpeg': mpeg
};

exports.create = function (mime) {
    var decoder = this.types[mime];
    if (!decoder) return null;
    return decoder();
};

// Types

function mpeg() {
    return new lame.Decoder();
}