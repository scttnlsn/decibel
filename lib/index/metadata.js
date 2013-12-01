var level = require('level');
var _ = require('underscore');

module.exports = Metadata;

function Metadata(db, hosts) {
    this.db = db;
    this.hosts = hosts;
    this.store = {};
}

Metadata.prototype.save = function (data, callback) {
    var self = this;

    this.db.put(data.id, JSON.stringify(data), function (err) {
        if (err) return callback(err);

        self.store[data.id] = data;
        callback();
    });
};

Metadata.prototype.load = function (callback) {
    var self = this;
    var stream = this.db.createReadStream();

    stream.on('data', function (data) {
        var item = JSON.parse(data.value);
        item.id = data.key;
        self.store[data.key] = item;
    });

    stream.on('error', callback);
    stream.on('end', callback);
};

Metadata.prototype.all = function () {
    var results = {};

    for (var id in this.store) {
        var result = _.clone(this.store[id]);
        var host = this.hosts.get(result.uuid);

        if (!host) continue;

        result.url = ['http://', host, result.path].join('');
        delete result.path;
        delete result.uuid;

        results[id] = result;
    }

    return results;
};