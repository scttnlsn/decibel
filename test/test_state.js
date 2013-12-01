var assert = require('assert');
var State = require('../lib/state');

describe('State', function () {
    beforeEach(function () {
        this.state = new State();
    });

    it('sets defaults', function () {
        assert.ok(this.state.is(State.STOPPED));
        assert.equal(this.state.get('index'), -1);
        assert.equal(this.state.get('position'), 0);
    });

    describe('#valid', function () {
        beforeEach(function () {
            this.state.items.push({ foo: 'bar' });
            this.state.items.push({ baz: 'qux' });
        });

        it('returns true when given index is in range', function () {
            assert.ok(this.state.valid(0));
            assert.ok(this.state.valid(1));
            assert.ok(!this.state.valid(2));
        });
    });

    describe('#reset', function () {
        beforeEach(function () {
            this.state.set({ position: 123, status: State.PLAYING, index: 1 });
        });

        it('resets defaults', function () {
            this.state.reset();
            assert.ok(this.state.is(State.STOPPED));
            assert.equal(this.state.get('index'), -1);
            assert.equal(this.state.get('position'), 0);
        });
    });
});