var btSerial = new (require('bluetooth-serial-port')).BluetoothSerialPort(),
        http = require('http').createServer(),
        io = require('socket.io').listen(http),
        trackerSocket,
        btConnected = false,
        httpConnected = false;

io.sockets.on('connection', httpConnect);
http.listen(1332);
console.log("(http) Listening for incoming connections (:1332).");

btSerial.on('found', btFound);
console.log("(bluetooth) Searching for bluetooth devices.");
btSerial.inquire();

function httpConnect(socket) {
    httpConnected = true;
    trackerSocket = socket;
    socket.on('command', httpCommand);
    console.log("(http) Connected.");
}

function httpCommand(data) {
    if (btConnected) {
        btSerial.write(new Buffer(data), function(error, bytesWritten) {
            if (error)
                console.log("(bluetooth) Write error: " + error);
        });
        console.log("(http) forwarding to bluetooth: \"" + data + "\"");
    }
}

function btFound(address, name) {
    console.log("(bluetooth) Found " + name + " (" + address + ").");
    if (name == "RNBT-50CC") {
        btSerial.findSerialPortChannel(address, function(channel) {
            console.log("(bluetooth) " + name + " is on channel " + channel + ", attempting to connect.");
            btSerial.connect(address, channel, function() {
                btConnected = true;

                btSerial.on('data', btData);

                console.log("(bluetooth) Connected with " + name + ".");
            }, function() {
                console.log('(bluetooth) Cannot connect with ' + name);
            });
        });
    }
}

function btData(buffer) {
    if (httpConnected) {
        trackerSocket.emit("response", {data: buffer.toString('ascii')});
        console.log("(bluetooth) forwarding to http: \"" + buffer.toString('utf-8') + "\"");
    }
}