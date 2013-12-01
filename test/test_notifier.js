var assert = require('assert');
var events = require('events');
var Notifier = require('../lib/notifier');

describe('Notifier', function () {
    beforeEach(function () {
        this.emitter = new events.EventEmitter();
        this.notifier = new Notifier(this.emitter, { size: 100, offset: 45 });
    });

    it('emits position events', function (done) {
        this.emitter.on('position', function (position) {
            assert.equal(position, 0.5);
            done();
        });

        this.notifier.write(new Buffer('abcde'));
    });
});