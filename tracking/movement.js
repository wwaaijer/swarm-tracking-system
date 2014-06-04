function turnDoodleTo(targetAngle, callback) {
    var rotation = targetAngle - doodle.angle, time;

    if (rotation > Math.PI)
        rotation -= Math.PI * 2 ;
    else if (rotation < -Math.PI)
        rotation = -Math.PI - rotation;

    time = Math.abs(rotation) / turning_speed * 1000;

    if (rotation > 0)
        sendCommand(left_power, -right_power, time);
    else
        sendCommand(-left_power, right_power, time);

    if (typeof callback != "undefined")
        setTimeout(callback, time + 500);
}

function driveDoodleFor(distance, draw, callback) {
    var time = distance / driving_speed * 1000;

    sendCommand(left_power, right_power, time, draw);

    if (typeof callback != "undefined")
        setTimeout(callback, time + 500);
}

function driveDoodleTo(x, y, callback) {
    var xDif = x - doodle.x, yDif = y - doodle.y, angle = Math.atan(yDif / xDif);

    if (xDif < 0) {
        angle += Math.PI;
    } else if (yDif < 0) {
        angle += Math.PI + Math.PI;
    }

    turnDoodleTo(angle, function() {
        driveDoodleFor(Math.sqrt(xDif * xDif + yDif * yDif), false, callback);
    });
}

function doodleDrawNext() {
    var a, b, lineAngle, xDif, yDif, startX, startY;
    if (points.length > 1) {
        a = points[0];
        b = points[1];
        points.splice(0, 2);

        xDif = b[0] - a[0];
        yDif = b[1] - a[1];
        lineAngle = Math.atan(yDif / xDif);

        if (xDif < 0) {
            lineAngle += Math.PI;
        } else if (yDif < 0) {
            lineAngle += Math.PI + Math.PI;
        }


        // Calculate the position where the doodlebot wil need to start drawing from. 
        // The marker needs to be on point a while the doodlebot is aligned width the line
        startX = a[0] - Math.sin(lineAngle) * doodle.length;
        startY = a[1] - Math.sin(lineAngle) * doodle.length;

        driveDoodleTo(startX, startY, function() {
            turnDoodleTo(lineAngle, function() {
                driveDoodleFor(Math.sqrt(xDif * xDif + yDif * yDif), true);
            });
        });
    }
}