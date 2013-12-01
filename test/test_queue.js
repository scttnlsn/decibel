var assert = require('assert');
var sinon = require('sinon');
var Player = require('../lib/player');
var Queue = require('../lib/queue');
var State = require('../lib/state');

var player = new Player();
var queue = new Queue(player);

describe('Queue', function () {
    beforeEach(function () {
        queue.state.reset();
        queue.state.items.reset();
    });

    beforeEach(function () {
        this.play = sinon.stub(player, 'play').yields();
        this.stop = sinon.stub(player, 'stop').yields();
    });

    afterEach(function () {
        this.play.restore();
        this.stop.restore();
    });

    it('binds to state change events', function (done) {
        function cb(state) {
            assert.equal(state.position, 123);
            queue.removeListener('state', cb);
            done();
        }

        queue.on('state', cb);
        queue.state.set('position', 123);
    });

    it('binds to player position events', function () {
        queue.state.set('status', State.PLAYING);
        player.emit('position', 123);
        assert.equal(queue.state.get('position'), 123);
    });

    it('binds to queue add events', function (done) {
        function cb(item) {
            assert.equal(item.url, 'bar');
            queue.removeListener('queue:add', cb);
            done();
        }

        queue.on('queue:add', cb);
        queue.state.items.add([{ url: 'bar' }]);
    });

    it('binds to queue reset events', function (done) {
        function cb(items) {
            assert.equal(items.length, 2);
            queue.removeListener('queue:reset', cb);
            done();
        }

        queue.on('queue:reset', cb);
        queue.state.items.reset([{ url: 'foo' }, { url: 'bar' }]);
    });

    describe('#append', function () {
        it('appends given items to queue', function () {
            queue.append([{ foo: 'bar' }, { baz: 'qux' }]);
            assert.equal(queue.state.items.size(), 2);
        });

        it('emits queue:add events', function () {
            var count = 0;

            queue.on('queue:add', function () {
                count++;
            });

            queue.append([{ foo: 'bar' }, { baz: 'qux' }]);
            assert.equal(count, 2);
        });
    });

    describe('#replace', function () {
        it('replaces queue with given items', function () {
            queue.append([{ test: 'test' }]);
            queue.replace([{ foo: 'bar' }, { baz: 'qux' }]);
            assert.equal(queue.state.items.size(), 2);
        });

        it('plays the first item in the queue', function () {
            queue.replace([{ url: 'bar' }, { url: 'qux' }]);

            assert.ok(this.play.calledOnce);
            assert.deepEqual(this.play.getCall(0).args[0], { url: 'bar', pos: 0 });
        });
    });

    describe('#next', function () {
        beforeEach(function () {
            queue.state.items.add([{ url: 'foo' }, { url: 'bar' }]);
        });

        describe('with remaining items', function () {
            beforeEach(function () {
                queue.state.set({ index: 0, status: State.PLAYING });
            });

            it('advances to beginning of next item', function () {
                queue.next();
                assert.equal(queue.state.get('index'), 1);
                assert.equal(queue.state.get('position'), 0);
            });

            it('plays the next item', function () {
                queue.next();
                assert.ok(this.play.calledOnce);
                assert.deepEqual(this.play.getCall(0).args[0], { url: 'bar', pos: 0 });
            });
        });

        describe('with no remaining items', function () {
            beforeEach(function () {
                queue.state.set({ index: 1, status: State.PLAYING });
            });

            it('resets state', function () {
                queue.next();
                assert.equal(queue.state.get('index'), -1);
                assert.equal(queue.state.get('position'), 0);
                assert.ok(queue.state.is(State.STOPPED));
            });

            it('stops the player', function () {
                queue.next();
                assert.ok(this.stop.calledOnce);
            });
        });
    });

    describe('#prev', function () {
        beforeEach(function () {
            queue.state.items.add([{ url: 'foo' }, { url: 'bar' }]);
        });

        describe('with previous items', function () {
            beforeEach(function () {
                queue.state.set({ index: 1, status: State.PLAYING });
            });

            it('moves to beginning of previous item', function () {
                queue.prev();
                assert.equal(queue.state.get('index'), 0);
                assert.equal(queue.state.get('position'), 0);
            });

            it('plays the previous item', function () {
                queue.prev();
                assert.ok(this.play.calledOnce);
                assert.deepEqual(this.play.getCall(0).args[0], { url: 'foo', pos: 0 });
            });
        });

        describe('with no previous items', function () {
            beforeEach(function () {
                queue.state.set({ index: 0, status: State.PLAYING });
            });

            it('moves to beginning of current item', function () {
                queue.prev();
                assert.equal(queue.state.get('index'), 0);
                assert.equal(queue.state.get('position'), 0);
                assert.ok(queue.state.is(State.PLAYING));
            });

            it('plays the current item', function () {
                queue.prev();
                assert.ok(this.play.calledOnce);
                assert.deepEqual(this.play.getCall(0).args[0], { url: 'foo', pos: 0 });
            });
        });
    });

    describe('#pause', function () {
        beforeEach(function () {
            queue.state.items.add([{ url: 'foo' }, { url: 'bar' }]);
            queue.state.set({ index: 0, status: State.PLAYING });
        });

        it('sets state to paused', function () {
            queue.pause();
            assert.ok(queue.state.is(State.PAUSED));
        });

        it('stops player', function () {
            queue.pause();
            assert.ok(this.stop.calledOnce);
        });
    });

    describe('#play', function () {
        beforeEach(function () {
            queue.state.items.add([{ url: 'foo' }, { url: 'bar' }]);
        });

        describe('when stopped', function () {
            it('plays first item', function () {
                queue.play();
                assert.ok(this.play.calledOnce);
                assert.deepEqual(this.play.getCall(0).args[0], { url: 'foo', pos: 0 });
            });
        });

        describe('when paused', function () {
            beforeEach(function () {
                queue.state.set({ index: 0, position: 123, status: State.PAUSED });
            });

            it('resumes current item', function () {
                queue.play();
                assert.ok(this.play.calledOnce);
                assert.deepEqual(this.play.getCall(0).args[0], { url: 'foo', pos: 123 });
            });
        });

        describe('when playing', function () {
            beforeEach(function () {
                queue.state.set({ index: 0, position: 123, status: State.PLAYING });
            });

            it('moves to given index/position', function () {
                queue.play(1, 456);
                assert.ok(this.play.calledOnce);
                assert.deepEqual(this.play.getCall(0).args[0], { url: 'bar', pos: 456 });
            });
        });
    });

    describe('#stop', function () {
        beforeEach(function () {
            queue.state.items.add([{ url: 'foo' }, { url: 'bar' }]);
            queue.state.set({ index: 0, position: 123, status: State.PLAYING });
        });

        it('resets state', function () {
            queue.stop();
            assert.equal(queue.state.get('index'), -1);
            assert.equal(queue.state.get('position'), 0);
            assert.ok(queue.state.is(State.STOPPED));
        });
    });
});