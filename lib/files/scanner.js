var async = require('async');
var events = require('events');
var findit = require('findit');
var fs = require('fs');
var taglib = require('taglib');
var util = require('util');

module.exports = Scanner;

function Scanner(path) {
    this.path = path;
    this.started = false;
    this.queue = async.queue(parse.bind(this), 5);
}

util.inherits(Scanner, events.EventEmitter);

Scanner.prototype.start = function () {
    var self = this;

    this.finder = findit(this.path);

    this.finder.on('file', function (file, stat) {
        self.queue.push(file, function (metadata) {
            if (metadata) self.emit('metadata', metadata);
        });
    });
};

Scanner.prototype.stop = function () {
    if (this.finder) this.finder.stop();
    this.finder = undefined;
};

// Helpers
// ---------------

function parse(file, callback) {
    var self = this;

    taglib.read(file, function (err, tag, props) {
        if (err || !tag) return callback();

        if (props) tag.length = props.length;
        tag.path = file.slice(self.path.length - 1);
        callback(tag);
    });
}