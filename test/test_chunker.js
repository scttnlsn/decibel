var assert = require('assert');
var Chunker = require('../lib/chunker');

describe('Chunker', function () {
    beforeEach(function () {
        this.chunker = new Chunker(2);
    });

    describe('larger', function () {
        it('splits data into smaller chunks', function () {
            var chunks = [];
            this.chunker.on('data', chunks.push.bind(chunks));
            this.chunker.write(new Buffer('abcde'));

            assert.equal(chunks.length, 3);
            assert.equal(chunks[0].toString(), 'ab');
            assert.equal(chunks[1].toString(), 'cd');
            assert.equal(chunks[2].toString(), 'e');
        });
    });

    describe('smaller', function () {
        it('passes data through untouched', function () {
            var chunks = [];
            this.chunker.on('data', chunks.push.bind(chunks));
            this.chunker.write('a');
            this.chunker.write('b');

            assert.equal(chunks.length, 2);
            assert.equal(chunks[0].toString(), 'a');
            assert.equal(chunks[1].toString(), 'b');
        });
    });
});