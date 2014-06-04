var socket = io.connect('http://localhost:1332');

socket.on('response', function(response) {
    //console.log("(http) : " + response.data); // Generates a lot of debug output from the doodlebot
});

function sendCommand (l, r, t, w) {
    if ( t > 65535) t = 65535;
    socket.emit("command", [ l, r,(t / 256)| 0, t % 256, w]);
}