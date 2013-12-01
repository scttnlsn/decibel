var assert = require('assert');
var async = require('async');
var nock = require('nock');
var sinon = require('sinon');
var helpers = require('./helpers');
var Player = require('../lib/player');
var utils = require('../lib/utils');

var player = new Player();
var tone = helpers.tone();

function play(callback) {
    var req = nock('http://example.com')
        .get('/foo.mp3')
        .reply(200, tone.slice());

    player.play({ url: 'http://example.com/foo.mp3' }, function (err) {
        if (err) return callback(err);

        req.done();
        callback();
    });
}

describe('Player', function () {
    beforeEach(function () {
        this.output = sinon.stub(player, '_output', helpers.speaker);
        this.stat = sinon.stub(utils, 'stat').yields(null, { size: tone.length, mime: 'audio/mpeg' });
    });

    afterEach(function () {
        this.output.restore();
        this.stat.restore();
    });

    it('plays and stops', function (done) {
        async.series([
            play,
            function (callback) {
                var speaker = player.output;
                assert.ok(speaker);

                function check() {
                    assert.ok(speaker.count > 0);
                    player.removeListener('end', check);
                    callback();
                }

                player.on('end', check);
            },
            play,
            function (callback) {
                var ended = false;

                player.output.on('close', function () {
                    ended = true;
                });

                player.stop(function (err) {
                    if (err) return callback(err);

                    assert.ok(ended);
                    callback();
                });
            }
        ], done);
    });
});