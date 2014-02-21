function slider(min, max) {
    var d = document;
    min = parseInt(min) ? parseInt(min) : 0;
    max = parseInt(max) ? parseInt(max) : 255;
    var me = {
        minimum_limit: min,
        minimum: min,
        maximum_limit: max,
        maximum: max,
        wrapper: d.createElement("div"),
        input_min: d.createElement("input"),
        input_max: d.createElement("input"),
        incr_min: d.createElement("div"),
        decr_min: d.createElement("div"),
        incr_max: d.createElement("div"),
        decr_max: d.createElement("div"),
        slider_wrapper: d.createElement("div"),
        slider_track: d.createElement("div"),
        slider_min: d.createElement("div"),
        slider_max: d.createElement("div")
    };

    me.wrapper.className = "range_box";

    me.input_min.type = "text";
    me.input_min.maxLength = 3;
    me.input_min.style.left = "0px";
    me.input_min.value = me.minimum;
    me.input_min.onkeyup = function() {
        if (me.input_min.value == "") {
            me.minimum = 0;
            me.slider_min.style.left = "0px";
            return;
        }
        var new_value = parseInt(me.input_min.value);
        if (!new_value) {
            new_value = 0;
            me.input_min.value = 0;
        } else {
            if (new_value < 0) {
                new_value *= -1;
            }
            if (new_value > me.maximum) {
                new_value = me.maximum;
            }

            if (new_value != me.input_min.value) {
                me.input_min.value = new_value;
            }

        }
        me.minimum = new_value;
        if (new_value == 0)
            me.input_min.select();
        me.slider_min.style.left = me.minimum + "px";
    }
    me.input_min.onblur = function() {
        if (me.input_min.value == "") {
            me.input_min.value = "0";
        }
    }
    me.wrapper.appendChild(me.input_min);

    me.decr_min.className = "button";
    me.decr_min.style.left = "50px";
    me.decr_min.innerHTML = "-";
    me.decr_min.onclick = function(e) {
        e = e || window.event;
        e.preventDefault();
        if (me.minimum <= me.minimum_limit)
            return;
        me.minimum--;
        me.input_min.value = me.minimum;
        me.slider_min.style.left = me.minimum + "px";
        return false;
    };
    me.decr_min.onmousedown = function(e) {
        e = e || window.event;
        e.preventDefault();
        return false;
    };
    me.wrapper.appendChild(me.decr_min);

    me.incr_min.className = "button";
    me.incr_min.style.left = "72px";
    me.incr_min.innerHTML = "+";
    me.incr_min.onclick = function(e) {
        e = e || window.event;
        e.preventDefault();
        if (me.minimum >= me.maximum)
            return;
        me.minimum++;
        me.input_min.value = me.minimum;
        me.slider_min.style.left = me.minimum + "px";
        return false;
    };
    me.incr_min.onmousedown = function(e) {
        e = e || window.event;
        e.preventDefault();
        return false;
    };
    me.wrapper.appendChild(me.incr_min);

    me.slider_wrapper.className = "slider_box";

    me.slider_track.className = "track";
    me.slider_wrapper.appendChild(me.slider_track);

    me.slider_min.className = "slider";
    me.slider_min.style.left = me.minimum + "px";
    me.slider_min.onmousedown = function(e) {
        e = e || window.event;

        var start = parseInt(me.slider_min.style.left) - e.clientX;
        var update = function(e) {
            e = e || window.event;
            me.minimum = Math.max(me.minimum_limit, Math.min(me.maximum, start + e.clientX));
            me.slider_min.style.left = me.minimum + "px";
            me.input_min.value = me.minimum;
            e.preventDefault();
            return false;
        };
        var cancel = function(e) {
            e = e || window.event;
            document.onmousemove = 0;
            document.onmouseup = 0;
        };

        document.onmousemove = update;
        document.onmouseup = cancel;

        e.preventDefault();
        return false;
    };
    me.slider_wrapper.appendChild(me.slider_min);

    me.slider_max.className = "slider";
    me.slider_max.style.left = me.maximum + 8 + "px";
    me.slider_max.onmousedown = function(e) {
        e = e || window.event;

        var start = parseInt(me.slider_max.style.left) - e.clientX - 8;
        var update = function(e) {
            e = e || window.event;
            me.maximum = Math.max(me.minimum, Math.min(me.maximum_limit, start + e.clientX));
            me.slider_max.style.left = me.maximum + 8 + "px";
            me.input_max.value = me.maximum;
            e.preventDefault();
            return false;
        };
        var cancel = function(e) {
            e = e || window.event;
            document.onmousemove = 0;
            document.onmouseup = 0;
        };

        document.onmousemove = update;
        document.onmouseup = cancel;

        e.preventDefault();
        return false;
    };
    me.slider_wrapper.appendChild(me.slider_max);

    me.wrapper.appendChild(me.slider_wrapper);

    me.input_max.type = "text";
    me.input_max.maxLength = 3;
    me.input_max.style.left = "373px";
    me.input_max.value = me.maximum;
    me.input_max.onkeyup = function() {
        if (me.input_max.value == "") {
            me.maximum = me.minimum;
            me.slider_max.style.left = me.maximum + 8 + "px";
            return;
        };
        var new_value = parseInt(me.input_max.value);
        if (!new_value) {
            me.maximum = me.minimum;
            me.input_max.value = me.maximum;
        } else {
            if (new_value < me.minimum) {
                me.maximum = me.minimum;
            } else if (new_value > me.maximum_limit) {
                me.maximum = me.maximum_limit;
                me.input_max.value = me.maximum;
            } else {
                me.maximum = new_value;
            }
        }
        me.slider_max.style.left = me.maximum + 8 + "px";
    };
    me.input_max.onblur = function() {
        me.input_max.value = me.maximum;
    };
    me.wrapper.appendChild(me.input_max);

    me.decr_max.className = "button";
    me.decr_max.style.left = "423px";
    me.decr_max.innerHTML = "-";
    me.decr_max.onclick = function(e) {
        e = e || window.event;
        e.preventDefault();
        if (me.maximum <= me.minimum)
            return;
        me.maximum--;
        me.input_max.value = me.maximum;
        me.slider_max.style.left = me.maximum + 8 + "px";
        return false;
    };
    me.decr_max.onmousedown = function(e) {
        e = e || window.event;
        e.preventDefault();
        return false;
    };
    me.wrapper.appendChild(me.decr_max);

    me.incr_max.className = "button";
    me.incr_max.style.left = "445px";
    me.incr_max.innerHTML = "+";
    me.incr_max.onclick = function(e) {
        e = e || window.event;
        e.preventDefault();
        if (me.maximum >= me.maximum_limit)
            return;
        me.maximum++;
        me.input_max.value = me.maximum;
        me.slider_max.style.left = me.maximum + 8 + "px";
        return false;
    };
    me.incr_max.onmousedown = function(e) {
        e = e || window.event;
        e.preventDefault();
        return false;
    };
    me.wrapper.appendChild(me.incr_max);

    me.setMin = function(value) {
        me.minimum = value;
        me.input_min.value = me.minimum;
        me.slider_min.style.left = me.minimum + "px";
    };
    me.setMax = function(value) {
        me.maximum = value;
        me.input_max.value = me.maximum;
        me.slider_max.style.left = me.maximum + 8 + "px";
    };
    
    return me;
}