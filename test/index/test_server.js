var assert = require('assert');
var sinon = require('sinon');
var request = require('supertest');
var server = require('../../lib/index/server');

describe('Server', function () {
    beforeEach(function () {
        this.metadata = { save: function () {}, all: function () {}};
        this.app = server(this.metadata);
    });

    describe('POST /metadata', function () {
        beforeEach(function (done) {
            this.save = sinon.stub(this.metadata, 'save').yields();

            request(this.app)
                .post('/metadata')
                .set('Content-Type', 'application/json')
                .send({ id: 'foo' })
                .expect(200)
                .end(done);
        });

        afterEach(function () {
            this.save.restore();
        });

        it('saves metadata', function () {
            assert.ok(this.save.calledOnce);
            assert.deepEqual(this.save.firstCall.args[0], { id: 'foo' });
        });
    });

    describe('GET /metadata', function () {
        beforeEach(function (done) {
            var self = this;

            this.all = sinon.stub(this.metadata, 'all').returns({ foo: {}, bar: {} });

            request(this.app)
                .get('/metadata')
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) return done(err);

                    self.res = res;
                    done();
                });
        });

        afterEach(function () {
            this.all.restore();
        });

        it('returns metadata', function () {
            assert.deepEqual(this.res.body, { foo: {}, bar: {} });
        });
    });
});