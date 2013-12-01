var Backbone = require('backbone');
var EventEmitter = require('eventemitter2').EventEmitter2;
var util = require('util');
var errors = require('./errors');
var State = require('./state');
var player = require('./player');

module.exports = Queue;

function Queue(player) {
    EventEmitter.call(this, { wildcard: true });

    var self = this;

    this.player = player;
    this.state = new State();

    this.player.on('position', function (position) {
        if (self.state.is(State.PLAYING)) self.state.set('position', position);
    });

    this.player.on('end', function () {
        self.next();
    });

    this.state.on('change', function () {
        self.emit('state', self.state.toJSON());
    });

    this.state.items.on('add', function (item) {
        self.emit('queue:add', item.toJSON());
    });

    this.state.items.on('reset', function () {
        self.emit('queue:reset', self.state.items.toJSON());
    });
}

util.inherits(Queue, EventEmitter);

Queue.prototype.append = function (items) {
    this.state.items.add(items);
};

Queue.prototype.replace = function (items) {
    this.state.items.reset(items);
    if (this.state.items.isEmpty()) return;
    this.play(0, 0);
};

Queue.prototype.next = function () {
    if (this.state.is(State.STOPPED)) return;

    var index = this.state.get('index') + 1;
    if (!this.state.valid(index)) return this.stop();
    this._change(index);
};

Queue.prototype.prev = function () {
    if (this.state.is(State.STOPPED)) return;

    var index = Math.max(this.state.get('index') - 1, 0);
    this._change(index);
};

Queue.prototype.pause = function () {
    if (this.state.is(State.STOPPED)) return;

    this.state.set({ status: State.PAUSED });
    this.player.stop(this._errback.bind(this));
};

Queue.prototype.play = function (index, position) {
    var self = this;

    if (index === undefined || index === null) {
        index = this.state.is(State.STOPPED) ? 0 : this.state.get('index');
    }

    if (position === undefined || position === null) {
        position = this.state.get('position');
    }

    var item = this.state.items.at(index);
    if (!item) return;

    this.state.set({ index: index, position: position, status: State.PLAYING });

    this.player.play({ url: item.get('url'), pos: position }, function (err) {
        if (err) {
            if (err instanceof errors.NotFound || err instanceof errors.UnsupportedType) {
                self.emit('unplayable', index);
                self.next();
            } else {
                self._errback(err);
            }
        }
    });
};

Queue.prototype.stop = function () {
    this.state.reset();
    this.player.stop(this._errback.bind(this));
};

Queue.prototype._change = function (index) {
    if (this.state.is(State.PAUSED)) {
        this.state.set({ index: index, position: 0 });
    } else {
        this.play(index, 0);
    }
};

Queue.prototype._errback = function (err) {
    if (err) this.emit('error', err);
};