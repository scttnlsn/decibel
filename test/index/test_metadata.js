var assert = require('assert');
var events = require('events');
var sinon = require('sinon');
var Metadata = require('../../lib/index/metadata');

describe('Metadata', function () {
    beforeEach(function () {
        this.hosts = { get: function () {}};
        this.db = { put: function () {}, createReadStream: function () {}};
        this.metadata = new Metadata(this.db, this.hosts);
    });

    describe('#save', function () {
        beforeEach(function (done) {
            this.put = sinon.stub(this.db, 'put').yields();
            this.metadata.save({ id: 'foo', bar: 'baz' }, done);
        });

        afterEach(function () {
            this.put.restore();
        });

        it('writes data to db', function () {
            assert.ok(this.put.calledOnce);
            var args = this.put.getCall(0).args;
            assert.equal(args[0], 'foo');
            assert.equal(args[1], '{"id":"foo","bar":"baz"}');
        });

        it('saves data in memory', function () {
            assert.deepEqual(this.metadata.store['foo'], { id: 'foo', bar: 'baz' });
        });
    });

    describe('#load', function () {
        beforeEach(function (done) {
            this.emitter = new events.EventEmitter();
            this.load = sinon.stub(this.db, 'createReadStream').returns(this.emitter);
            this.metadata.load(done);

            this.emitter.emit('data', { key: 'foo', value: JSON.stringify({ bar: 'baz' })});
            this.emitter.emit('data', { key: 'bar', value: JSON.stringify({ bar: 'qux' })});
            this.emitter.emit('end');
        });

        afterEach(function () {
            this.load.restore();
        });

        it('loads all data from db', function () {
            assert.deepEqual(this.metadata.store['foo'], { id: 'foo', bar: 'baz' });
            assert.deepEqual(this.metadata.store['bar'], { id: 'bar', bar: 'qux' });
        });
    });

    describe('#all', function () {
        beforeEach(function () {
            this.metadata.store['foo'] = { id: 'foo', path: '/foo', uuid: 1 };
            this.metadata.store['bar'] = { id: 'bar', path: '/bar', uuid: 2 };
            this.metadata.store['qux'] = { id: 'qux', path: '/qux', uuid: 3 };

            this.get = sinon.stub(this.hosts, 'get', function (uuid) {
                if (uuid !== 3) return '127.0.0.1:3000';
            });
            
            this.all = this.metadata.all();
        });

        afterEach(function () {
            this.get.restore();
        });

        it('returns all data from store with valid host', function () {
            assert.deepEqual(this.all, {
                foo: { id: 'foo', url: 'http://127.0.0.1:3000/foo' },
                bar: { id: 'bar', url: 'http://127.0.0.1:3000/bar' }
            });
        });
    });
});