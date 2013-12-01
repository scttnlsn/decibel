# Decibel (WIP)

Networked audio player services.

## player

A player process plays audio from URLs through the host's speakers.  It maintains a queue of playable URLs and notifies connected clients whenever its state changes.

To start a player, run:

    $ decibel-player

For available flags and options, run:

    $ decibel-player -h

      Usage: decibel-player [options]

      Options:

        -h, --help         output usage information
        -V, --version      output the version number
        -p, --port <port>  the port on which to listen (defaut 3000)
        -d, --debug        log debugging messages

The player process is controllable via a WebSocket connection:

```javascript
var socket = new WebSocket('http://localhost:3000');

// RPC call (calls `play(0, 0)` on the server)
socket.send(JSON.stringify({ name: 'play', args: [0, 0] }));

// Listen for state changes from the server
socket.onmessage = function (msg) {
    var data = JSON.parse(msg.data);
    console.log(data.name, data.args);
};
```

### API

* `append([items])` - append the given items to the player queue (each item must have a URL property)
* `replace([items])` - replace the player queue with the given items
* `next()` - advance to beginning of next item
* `prev()` - advance to beginning of previous item (or current item if no previous item exists)
* `pause()` - stop the playback but preserve the current item index and postiion
* `play(index, position)` - play the item at the given index at the specified position (current index and position values will be used if left undefined)
* `stop()` - stop the playback and reset the current item index and position

### Events

* `queue:reset` - the player queue was reset with the items passed in the first arg
* `queue:add` - the item passed in the first arg was appended to the player queue
* `state` - the player state changed to the values in the first arg (object includes index, status and position properties)

### Discovery

Decibel uses multicast DNS-SD (i.e. Zeroconf/Bonjour) to discover services on the network.  Decibel services all use the service type `_decibel._tcp` and include a `name` attribute in the TXT record corresponding to the specific type service (i.e. `decibel-player`).

## index

TODO

## fileserver

TODO