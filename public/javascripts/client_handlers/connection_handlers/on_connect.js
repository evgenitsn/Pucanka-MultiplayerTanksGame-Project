/**
 * Created by Krasimir on 10/2/2016.
 */
let client = io().connect('192.168.0.2:3000/', {autoConnect: false,
                                                reconnect: false,
                                                rememberTransport: false,
                                                transports: ['WebSocket', 'Flash Socket', 'AJAX long-polling'] })
let players = {}
// holds client id received from server
let clientId
// keeps track of latency between server and client
let lat
let serverTimeOffset = 0

// Handshake accepted between server and client
client.on('connect', () => {
    // Callback on successful connection
    client.on('my-id', (data) => {
        clientId = data.id
    })

    // send the server username for """"authentication"""" testing
    client.emit('username', {username: username})

    client.on('disconnect', () => {
        window.history.back();
    })
})

// first latency request
client.emit('latency', Date.now(), function(startTime) {
    lat = Date.now() - startTime

    console.log('latency: ' + lat)
});

// keeps track of client latency every 500 ms
setInterval(() => {
    client.emit('latency', Date.now(), function(startTime) {
        // averages the latency
        lat = (lat + (Date.now() - startTime)) / 2

        console.log('latency: ' + lat)
    });
}, 500)

// calculates the difference between server clock and client clock
client.on('time', (data) => {
    if(lat) {
        serverTimeOffset = new Date().getTime() - (data.time + lat)
    } else {
        serverTimeOffset = new Date().getTime() - data.time
    }
    console.log('time offset: ' + serverTimeOffset)
})

window.onbeforeunload = function(e) {
    client.disconnect();
};