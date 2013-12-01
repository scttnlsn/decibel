var assert = require('assert');
var nock = require('nock');
var Playable = require('../lib/playable');

describe('Playable', function () {
    beforeEach(function () {
        this.playable = new Playable({
            url: 'http://example.com/foo.mp3',
            size: 100,
            pos: 0.5,
            mime: 'audio/mpeg'
        });
    });

    it('sets offset', function () {
        assert.equal(this.playable.offset, 50);
    });

    describe('#data', function () {
        describe('206', function () {
            beforeEach(function () {
                this.req = nock('http://example.com')
                    .get('/foo.mp3')
                    .matchHeader('Range', 'bytes=50-100')
                    .reply(206, new Buffer('foo'));
            });

            it('makes request', function (done) {
                var stream = this.playable.data();

                stream.on('response', function () {
                    this.req.done();
                    done();
                }.bind(this));
            });
        });

        describe('200', function () {
            beforeEach(function () {
                this.req = nock('http://example.com')
                    .get('/foo.mp3')
                    .matchHeader('Range', 'bytes=50-100')
                    .reply(200, new Buffer('foo'));
            });

            it('resets position and offset', function (done) {
                var stream = this.playable.data();
                
                stream.on('response', function () {
                    assert.equal(this.playable.pos, 0);
                    assert.equal(this.playable.offset, 0);
                    done();
                }.bind(this));
            });
        });
    });

    describe('#notifier', function () {
        it('returns notifier', function () {
            var notifier = this.playable.notifier();
            assert.equal(notifier.offset, this.playable.offset);
            assert.equal(notifier.size, this.playable.size);
        });
    });

    describe('#decoder', function () {
        it('returns decoder for given mime', function () {
            var decoder = this.playable.decoder();
            assert.ok(decoder);
        });
    });
});