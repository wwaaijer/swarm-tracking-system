// Collection of points to be drawn
points = [];

mode_manager.modes["main"] = new (function() {
    this.in = function() {
        frameProcessFunc = filterGroupAndTrack;

        el_viewport = document.getElementById("viewport");
        el_viewport.style.cursor = "pointer";
        addListener(el_viewport, "click", addPoint);
    };
    this.out = function() {
        el_viewport = document.getElementById("viewport");
        el_viewport.style.cursor = "pointer";
        removeListener(el_viewport, "click", addPoint);
    }
    function addPoint(e) {
        var e = e || window.event;
        points.push([(e.clientX - e.target.offsetLeft), (e.clientY - e.target.offsetTop)]);
    }
});

mode_manager.modes["base_color"] = new (function() {
    this.in = function() {
        frameProcessFunc = filterOnBaseColor;

        el_viewport = document.getElementById("viewport");
        el_viewport.style.cursor = "pointer";
        addListener(el_viewport, "click", pickColor);
    };
    this.out = function() {
        store_color_boudaries();

        el_viewport = document.getElementById("viewport");
        el_viewport.style.cursor = "default";
        removeListener(el_viewport, "click", pickColor);
    };

    function pickColor(e) {
        var e = e || window.event;
        if (e.button == 0) {
            var pixData = c2d_video.getImageData((e.clientX - e.target.offsetLeft), (e.clientY - e.target.offsetTop), 1, 1);
            color_boudaries_update["base_r"](pixData.data[0]);
            color_boudaries_update["base_g"](pixData.data[1]);
            color_boudaries_update["base_b"](pixData.data[2]);
        }
    }
});

mode_manager.modes["front_color"] = new (function() {
    this.in = function() {
        frameProcessFunc = filterOnFrontColor;

        el_viewport = document.getElementById("viewport");
        el_viewport.style.cursor = "pointer";
        addListener(el_viewport, "click", pickColor);
    };
    this.out = function() {
        store_color_boudaries();

        el_viewport = document.getElementById("viewport");
        el_viewport.style.cursor = "default";
        removeListener(el_viewport, "click", pickColor);
    };

    function pickColor(e) {
        var e = e || window.event;
        if (e.button == 0) {
            var pixData = c2d_video.getImageData((e.clientX - e.target.offsetLeft), (e.clientY - e.target.offsetTop), 1, 1);
            color_boudaries_update["front_r"](pixData.data[0]);
            color_boudaries_update["front_g"](pixData.data[1]);
            color_boudaries_update["front_b"](pixData.data[2]);
        }
    }
});

function filterOnBaseColor() {
    // Copy the current frame from the videostream and get the image data.
    c2d_video.drawImage(videostream.video, 0, 0);
    var frameData = c2d_video.getImageData(0, 0, videostream.width, videostream.height);

    var bu = color_boudaries.base_u | 0,
            bl = color_boudaries.base_l | 0,
            bc = color_boudaries.base_c | 0,
            br = color_boudaries.base_r | 0,
            bg = color_boudaries.base_g | 0,
            bb = color_boudaries.base_b | 0;

    // Colorfiltering:
    // Check every pixel in the image data of the current frame.
    for (i = 0; i < frameData.data.length; i++) {
        // Color values for this pixel.
        var r = frameData.data[i++],
                g = frameData.data[i++],
                b = frameData.data[i++];

        // Red within base lightness boundaries?
        if (r <= bu && r >= bl) {
            // Selected blue and green value relative to the red
            // value of this pixel.
            var bg2 = r - br + bg,
                    bb2 = r - br + bb;

            // Green and blue within base deviation boundaries?
            if (g >= bg2 - bc &&
                    g <= bg2 + bc &&
                    b >= bb2 - bc &&
                    b <= bb2 + bc) {
                // Indicate pixel is within the base color 
                // boundaries by making it purple.
                frameData.data[i - 3] = 255;
                frameData.data[i - 2] = 0;
                frameData.data[i - 1] = 255;
            }
        }
    }

    // Draw the image data to the visible canvas.
    c2d_viewport.putImageData(frameData, 0, 0);
}

function filterOnFrontColor() {
    // Copy the current frame from the videostream and get the image data.
    c2d_video.drawImage(videostream.video, 0, 0);
    var frameData = c2d_video.getImageData(0, 0, videostream.width, videostream.height);

    var fu = color_boudaries.front_u | 0,
            fl = color_boudaries.front_l | 0,
            fc = color_boudaries.front_c | 0,
            fr = color_boudaries.front_r | 0,
            fg = color_boudaries.front_g | 0,
            fb = color_boudaries.front_b | 0;

    // Colorfiltering:
    // Check every pixel in the image data of the current frame.
    for (i = 0; i < frameData.data.length; i++) {
        // Color values for this pixel.
        var r = frameData.data[i++],
                g = frameData.data[i++],
                b = frameData.data[i++];

        // Red within front lightness boundaries?
        if (r <= fu && r >= fl) {
            // Selected blue and green value relative to the red
            // value of this pixel.
            var fg2 = r - fr + fg,
                    fb2 = r - fr + fb;

            // Green and blue within base deviation boundaries?
            if (g >= fg2 - fc &&
                    g <= fg2 + fc &&
                    b >= fb2 - fc &&
                    b <= fb2 + fc) {
                // Indicate pixel is within the front color 
                // boundaries by making it lime.
                frameData.data[i - 3] = 0;
                frameData.data[i - 2] = 255;
                frameData.data[i - 1] = 0;
            }
        }
    }

    // Draw the image data to the visible canvas.
    c2d_viewport.putImageData(frameData, 0, 0);
}

tracking = false;
onTrackingData = false;
doodle = {};
groups = {
    "base": {
        open: [],
        closed: []
    },
    "front": {
        open: [],
        closed: []
    }
};
fuzzy = 3;
function filterGroupAndTrack() {
    // Copy the current frame from the videostream and get the image data.
    c2d_video.drawImage(videostream.video, 0, 0);
    var frameData = c2d_video.getImageData(0, 0, videostream.width, videostream.height);

    var x = 0, y = 0, width = frameData.width,
            bu = color_boudaries.base_u | 0, // force interger type by bitwise comparation
            bl = color_boudaries.base_l | 0,
            bc = color_boudaries.base_c | 0,
            br = color_boudaries.base_r | 0,
            bg = color_boudaries.base_g | 0,
            bb = color_boudaries.base_b | 0,
            fu = color_boudaries.front_u | 0,
            fl = color_boudaries.front_l | 0,
            fc = color_boudaries.front_c | 0,
            fr = color_boudaries.front_r | 0,
            fg = color_boudaries.front_g | 0,
            fb = color_boudaries.front_b | 0;

    // Reset the groups
    groups = {
        "base": {
            open: [],
            closed: []
        },
        "front": {
            open: [],
            closed: []
        }
    };

    // Colorfiltering:
    // Check every pixel in the image data of the current frame.
    for (i = 0; i < frameData.data.length; i++) {
        // Color values for this pixel.
        var r = frameData.data[i++],
                g = frameData.data[i++],
                b = frameData.data[i++];

        // Red within base lightness boundaries?
        if (r <= bu && r >= bl) {
            // Selected blue and green value relative to the red
            // value of this pixel.
            var bg2 = r - br + bg,
                    bb2 = r - br + bb;

            // Green and blue within base deviation boundaries?
            if (g >= bg2 - bc &&
                    g <= bg2 + bc &&
                    b >= bb2 - bc &&
                    b <= bb2 + bc) {
                // Indicate pixel is within the base color 
                // boundaries by making it purple.
                frameData.data[i - 3] = 255;
                frameData.data[i - 2] = 0;
                frameData.data[i - 1] = 255;

                assignToAGroup(x, y, "base");
            }
        }

        // Red within front lightness boundaries?
        if (r <= fu && r >= fl) {
            // Selected blue and green value relative to the red
            // value of this pixel.
            var fg2 = r - fr + fg,
                    fb2 = r - fr + fb;

            // Green and blue within base deviation boundaries?
            if (g >= fg2 - fc &&
                    g <= fg2 + fc &&
                    b >= fb2 - fc &&
                    b <= fb2 + fc) {
                // Indicate pixel is within the front color 
                // boundaries by making it lime.
                frameData.data[i - 3] = 0;
                frameData.data[i - 2] = 255;
                frameData.data[i - 1] = 0;

                assignToAGroup(x, y, "front");
            }
        }
        x++;
        if (x >= width) {
            x -= width;
            y++;

            groupRowUpdate("base", y);
            groupRowUpdate("front", y);

            if (y >= frameData.height) {
                closeAllGroups("base");
                closeAllGroups("front");
            }
        }
    }

    // Draw the image data to the visible canvas.
    c2d_viewport.putImageData(frameData, 0, 0);

    var largestBase, largestFront;

    c2d_viewport.lineWidth = 2;
    c2d_viewport.strokeStyle = "rgb(255,0,0)";
    for (var groupNum = 0; groupNum < groups.base.closed.length; groupNum++) {
        var group = groups.base.closed[groupNum];

        group.x = (group.left + group.right) / 2;
        group.y = (group.top + group.bottom) / 2;

        if (largestBase) {
            if (largestBase.count < group.count)
                largestBase = group;
        } else {
            largestBase = group;
        }

        // Visualize group center
        c2d_viewport.beginPath();
        c2d_viewport.moveTo(group.x, group.y - 5);
        c2d_viewport.lineTo(group.x, group.y + 5);
        c2d_viewport.stroke();
        c2d_viewport.beginPath();
        c2d_viewport.moveTo(group.x - 5, group.y);
        c2d_viewport.lineTo(group.x + 5, group.y);
        c2d_viewport.stroke();
    }

    c2d_viewport.strokeStyle = "rgb(0,150,0)";
    for (var groupNum = 0; groupNum < groups.front.closed.length; groupNum++) {
        var group = groups.front.closed[groupNum];

        group.x = (group.left + group.right) / 2;
        group.y = (group.top + group.bottom) / 2;

        if (largestFront) {
            if (largestFront.count < group.count)
                largestFront = group;
        } else {
            largestFront = group;
        }

        // Visualize group center
        c2d_viewport.beginPath();
        c2d_viewport.moveTo(group.x, group.y - 5);
        c2d_viewport.lineTo(group.x, group.y + 5);
        c2d_viewport.stroke();
        c2d_viewport.beginPath();
        c2d_viewport.moveTo(group.x - 5, group.y);
        c2d_viewport.lineTo(group.x + 5, group.y);
        c2d_viewport.stroke();
    }

    if (largestBase && largestFront) {
        var xDif = largestFront.x - largestBase.x,
                yDif = largestFront.y - largestBase.y,
                // current angle of the doodlebot
                angle = Math.atan(yDif / xDif),
                // distance between base circle center and marker in px
                // (75mm between center of base and marker, 42.5mm between center of base and front circle)  
                distance = Math.sqrt(xDif * xDif + yDif * yDif) * 75 / 42.5;

        if (xDif < 0) {
            angle += Math.PI;
        } else if (yDif < 0) {
            angle += Math.PI + Math.PI;
        }

        doodle.x = largestBase.x;
        doodle.y = largestBase.y;
        doodle.angle = angle;
        doodle.length = distance;
        
        // Visualize marker position
        c2d_viewport.save();
        c2d_viewport.translate(largestBase.x, largestBase.y);
        c2d_viewport.rotate(angle);
        c2d_viewport.fillStyle = "rgb(0,128,255)";
        c2d_viewport.beginPath();
        c2d_viewport.moveTo(distance + 8, 0);
        c2d_viewport.arc(distance, 0, 8, 0, Math.PI + Math.PI);
        c2d_viewport.fill();
        
        // Visualize doodlebot outline
        c2d_viewport.strokeStyle = "rgb(0,128,255)";

        c2d_viewport.beginPath();
        c2d_viewport.moveTo(-distance * 0.35, -distance * 0.5 + 8);
        c2d_viewport.lineTo(-distance * 0.35, -distance * 0.5);
        c2d_viewport.lineTo(-distance * 0.35 + 8, -distance * 0.5);
        c2d_viewport.stroke();

        c2d_viewport.beginPath();
        c2d_viewport.moveTo(-distance * 0.35, distance * 0.5 - 8);
        c2d_viewport.lineTo(-distance * 0.35, distance * 0.5);
        c2d_viewport.lineTo(-distance * 0.35 + 8, distance * 0.5);
        c2d_viewport.stroke();

        c2d_viewport.beginPath();
        c2d_viewport.moveTo(distance * 1.35, -distance * 0.5 + 8);
        c2d_viewport.lineTo(distance * 1.35, -distance * 0.5);
        c2d_viewport.lineTo(distance * 1.35 - 8, -distance * 0.5);
        c2d_viewport.stroke();

        c2d_viewport.beginPath();
        c2d_viewport.moveTo(distance * 1.35, distance * 0.5 - 8);
        c2d_viewport.lineTo(distance * 1.35, distance * 0.5);
        c2d_viewport.lineTo(distance * 1.35 - 8, distance * 0.5);
        c2d_viewport.stroke();

        c2d_viewport.restore();
        
        // Trigger tracking data update
        if (onTrackingData)
            onTrackingData(largestBase.x, largestBase.y, angle, distance);

        tracking = true;
    } else {
        tracking = false;
    }
    
    // Visualize currently waiting draw points
    var prevPoint;
    for (var c = 0; c < points.length; c++) {
        var point = points[c];

        c2d_viewport.fillStyle = "rgb(0,0,255)";
        c2d_viewport.beginPath();
        c2d_viewport.moveTo(point[0] + 8, point[1]);
        c2d_viewport.arc(point[0], point[1], 8, 0, Math.PI * 2);
        c2d_viewport.fill();

        if (c % 2) {
            c2d_viewport.strokeStyle = "rgb(0,0,255)";
            c2d_viewport.lineWidth = 2;
            c2d_viewport.beginPath();
            c2d_viewport.moveTo(prevPoint[0], prevPoint[1]);
            c2d_viewport.lineTo(point[0], point[1]);
            c2d_viewport.stroke();
        }
        prevPoint = point;
    }

}

assignToAGroup = function(x, y, groupName) {
    var gotAssignedTo = -1;
    for (var groupNum = 0; groupNum < groups[groupName].open.length; groupNum++) {
        var group = groups[groupName].open[groupNum];
        
        
        if (x >= group.outerLeft && x <= group.outerRight) { // Pixel coordinates are in range of this open group
            var rowNum = y - group.top;

            group.count++;
            
            
            if (typeof group.rows[rowNum] == "undefined") { // First px on this row
                group.rows[rowNum] = {
                    left: x, right: x
                };
                group.lastRow = rowNum;

                if (x < group.left)
                    group.left = x;

            } else {
                group.rows[rowNum].right = x;
            }

            if (x > group.right)
                group.right = x;

            if (x + fuzzy > group.outerRight)
                group.outerRight = x + fuzzy; // Update group range

            if (gotAssignedTo >= 0) { // Px already assigned, merge overlapping groups
                var mergeWith = groups[groupName].open[gotAssignedTo],
                        mergeOffset = group.top - mergeWith.top;

                for (var c = 0; c < group.rows.length; c++) {

                    var mergeRow = mergeWith.rows[c + mergeOffset],
                            row = group.rows[c];
                    if (mergeRow && row) {
                        if (row.left < mergeRow.left) {
                            mergeRow.left = row.left;
                            if (mergeWith.left < row.left)
                                mergeWith.left = row.left;
                        }

                        if (row.right > mergeRow.right) {
                            mergeRow.right = row.right;
                            if (mergeWith.right < row.right)
                                mergeWith.right = row.right;
                        }
                    } else if (row) {
                        mergeWith.rows[c + mergeOffset] = row;
                    }
                }

                if (group.outerRight > mergeWith.outerRight)
                    mergeWith.outerRight = group.outerRight;
                if (group.outerLeft > mergeWith.outerLeft)
                    mergeWith.outerLeft = group.outerLeft;

                groups[groupName].open.splice(groupNum, 1);
            } else {
                gotAssignedTo = groupNum;
            }
        }
    }
    if (gotAssignedTo < 0) { // No groups for this px, create a new group
        groups[groupName].open.push({
            outerLeft: x,
            outerRight: (x + fuzzy),
            rows: [
                {
                    left: x,
                    right: x}
            ],
            lastRow: 0,
            left: x,
            right: x,
            top: y,
            count: 1
        });
    }
};

groupRowUpdate = function(groupName, y) {
    for (var groupNum = 0; groupNum < groups[groupName].open.length; groupNum++) { // Update all open groups
        var group = groups[groupName].open[groupNum];

        if (y > group.top + group.lastRow + fuzzy) { // Past the range of this group, close it
            groups[groupName].closed.push({
                left: group.left,
                right: group.right,
                top: group.top,
                bottom: group.top + group.lastRow,
                count: group.count
            });
            groups[groupName].open.splice(groupNum, 1);
        } else { // Update range for new row
            var left = videostream.width, right = 0, rowNum = y - group.top - fuzzy;
            if (rowNum < 0)
                rowNum = 0;
            for (; rowNum < group.rows.length; rowNum++) {
                if (group.rows[rowNum]) {
                    if (group.rows[rowNum].left < left)
                        left = group.rows[rowNum].left;
                    if (group.rows[rowNum].right > right)
                        right = group.rows[rowNum].right;
                }
            }

            group.outerLeft = left - fuzzy;
            group.outerRight = right + fuzzy;
        }
    }
};

closeAllGroups = function(groupName) {
    for (var groupNum = 0; groupNum < groups[groupName].open.length; groupNum++) {
        var group = groups[groupName].open[groupNum];
        groups[groupName].closed.push({
            left: group.left,
            right: group.right,
            top: group.top,
            bottom: group.top + group.lastRow,
            count: group.count
        });
    }
};