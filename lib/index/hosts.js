var mdns = require('mdns2');

module.exports = Hosts;

function Hosts() {
    var self = this;

    this.hosts = {};
    this.browser = mdns.createBrowser(mdns.tcp('decibel'));

    this.browser.on('serviceUp', function (service) {
        var info = extract(service);
        if (info) self.hosts[info.uuid] = info.host;
    });
}

Hosts.prototype.listen = function () {
    this.browser.start();
};

Hosts.prototype.get = function (uuid) {
    return this.hosts[uuid];
};

// Helpers
// ---------------

function extract(service) {
    var type = service.type.name;
    var name = service.txtRecord.name;
    var uuid = service.txtRecord.uuid;
    var host = [service.addresses[1], service.port].join(':');

    if (type === 'decibel' && name === 'decibel-files') {
        return { uuid: uuid, host: host };
    }
}