left_power = 100;
right_power = 122;
turning_speed = 183;
driving_speed = 60;

function initial_calibration() {
    if (!tracking)
        return console.log("(initial calibration) Not tracking yet!");
    
    var sum = 0, counter = 0, startAngle, startTime, angleData = [];
    
    console.log("(initial calibration) Start");
    
    onTrackingData = function(x, y, angle, length, time) {
        sum += angle;
        counter++;
        
        // Collect 5 angle values for reference
        if (counter >= 5) {
            startAngle = sum / counter;

            onTrackingData = function(x, y, angle, length) {
                angleData.push(angle);
            };
            
            // Initiate a right turn
            sendCommand(left_power, -right_power, 1000, 0);

            setTimeout(function() {
                var sum = 0, endAngle, angleDif;
                onTrackingData = false;
                
                // Read 5 last values for comparing
                for (var c = 5; c > 0; c--) {
                    sum += angleData[angleData.length - c];
                }

                endAngle = sum / 5;

                angleDif = endAngle - startAngle;
                if (angleDif < 0)
                    angleDif += Math.PI * 2;

                turning_speed = angleDif;

                console.log("(initial calibration) Rotation speed : " + angleDif / Math.PI * 180 + " deg / second");
                
                // Rotate to the center of the screen (safest direction for drive speed test)
                var xDif = videostream.width / 2 - doodle.x,
                        yDif = videostream.height / 2 - doodle.y,
                        targetAngle = Math.atan(yDif / xDif);

                if (xDif < 0) {
                    targetAngle += Math.PI;
                } else if (yDif < 0) {
                    targetAngle += Math.PI + Math.PI;
                }

                turnDoodleTo(targetAngle, initial_drive);
            }, 1500);
        }
    };
}

function initial_drive() {
    var sumX = 0, sumY = 0, dataX = [], dataY = [], counter = 0, startX, startY;

    onTrackingData = function(x, y, angle, length, time) {
        sumX += x;
        sumY += y;
        counter++;
        
        // Collect 5 coordinates for reference
        if (counter >= 5) {
            startX = sumX / counter;
            startY = sumY / counter;

            onTrackingData = function(x, y, angle, length) {
                dataX.push(x);
                dataY.push(y);
            };

            sendCommand(left_power, right_power, 1000, 0);

            setTimeout(function() {
                var sumX = 0, sumY = 0, endX, endY, difX, difY;
                onTrackingData = false;
                
                // Read 5 last values for comparation
                for (var c = 5; c > 0; c--) {
                    sumX += dataX[dataX.length - c];
                    sumY += dataY[dataY.length - c];
                }

                endX = sumX / 5;
                endY = sumY / 5;

                difX = endX - startX;
                difY = endY - startY;

                driving_speed = Math.sqrt(difX*difX + difY*difY);
                
                console.log("(initial calibration) Driving speed : " + driving_speed + " px / second");
                
                // Calibration done
                doodleDrawNext();
            }, 1500);
        }
    }
}