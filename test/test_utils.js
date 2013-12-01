var assert = require('assert');
var nock = require('nock');
var errors = require('../lib/errors');
var utils = require('../lib/utils');

describe('Utils', function () {
    describe('#stat', function () {
        describe('200', function () {
            beforeEach(function () {
                this.req = nock('http://example.com')
                    .head('/foo.mp3')
                    .reply(200, {}, { 'Content-Type': 'audio/mpeg', 'Content-Length': 123 });
            });

            it('performs HEAD request', function (done) {
                utils.stat('http://example.com/foo.mp3', function (err, stats) {
                    if (err) return done(err);

                    this.req.done();
                    done();
                }.bind(this));
            });

            it('returns mime type and byte size', function (done) {
                utils.stat('http://example.com/foo.mp3', function (err, stats) {
                    if (err) return done(err);

                    assert.equal(stats.mime, 'audio/mpeg');
                    assert.equal(stats.size, 123);
                    done();
                });
            });
        });

        describe('404', function () {
            beforeEach(function () {
                this.req = nock('http://example.com').head('/foo.mp3').reply(404);
            });

            it('returns error', function (done) {
                utils.stat('http://example.com/foo.mp3', function (err) {
                    assert.ok(err);
                    assert.ok(err instanceof errors.NotFound);
                    done();
                });
            });
        });
    });
});