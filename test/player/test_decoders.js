var assert = require('assert');
var decoders = require('../../lib/player/decoders');

describe('Decoders', function () {
    describe('types', function () {
        it('supports audio/mpeg', function () {
            assert.ok(decoders.types['audio/mpeg']);
        });
    });

    describe('#create', function () {
        it('returns decoder for type', function () {
            var decoder = decoders.create('audio/mpeg');
            assert.ok(decoder);
        });
    });
});