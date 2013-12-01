var Backbone = require('backbone');

var codes = {
    PLAYING: 1,
    PAUSED: 0,
    STOPPED: -1
};

var State = Backbone.Model.extend({

    defaults: {
        index: -1,
        position: 0,
        status: codes.STOPPED
    },

    initialize: function () {
        this.items = new Backbone.Collection();
    },

    reset: function () {
        this.set(this.defaults);
    },

    is: function (code) {
        return this.get('status') === code;
    },

    valid: function (index) {
        return 0 <= index && index < this.items.size();
    }

});

for (var key in codes) {
    State[key] = codes[key];
}

module.exports = State;