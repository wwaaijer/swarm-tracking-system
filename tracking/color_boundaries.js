color_boudaries = {};
color_boudaries_update = {};

addListener(window, "load", function() {
    var base_r_i = document.getElementById("base_r_i"),
            base_r_t = document.getElementById("base_r_t"),
            base_g_i = document.getElementById("base_g_i"),
            base_g_t = document.getElementById("base_g_t"),
            base_b_i = document.getElementById("base_b_i"),
            base_b_t = document.getElementById("base_b_t"),
            base_u_i = document.getElementById("base_u_i"),
            base_u_t = document.getElementById("base_u_t"),
            base_l_i = document.getElementById("base_l_i"),
            base_l_t = document.getElementById("base_l_t"),
            base_c_i = document.getElementById("base_c_i"),
            base_c_t = document.getElementById("base_c_t"),
            front_r_i = document.getElementById("front_r_i"),
            front_r_t = document.getElementById("front_r_t"),
            front_g_i = document.getElementById("front_g_i"),
            front_g_t = document.getElementById("front_g_t"),
            front_b_i = document.getElementById("front_b_i"),
            front_b_t = document.getElementById("front_b_t"),
            front_u_i = document.getElementById("front_u_i"),
            front_u_t = document.getElementById("front_u_t"),
            front_l_i = document.getElementById("front_l_i"),
            front_l_t = document.getElementById("front_l_t"),
            front_c_i = document.getElementById("front_c_i"),
            front_c_t = document.getElementById("front_c_t");

    // HTML localStorage
    if (localStorage['color_boudaries']) {
        color_boudaries = JSON.parse(localStorage['color_boudaries']);
    } else {
        color_boudaries = {
            "base_r": 0,
            "base_g": 0,
            "base_b": 0,
            "base_u": 255,
            "base_l": 0,
            "base_c": 0,
            "front_r": 0,
            "front_g": 0,
            "front_b": 0,
            "front_u": 255,
            "front_l": 0,
            "front_c": 0
        };
    }

    setUpRange(base_r_i, base_r_t, "base_r");
    setUpRange(base_g_i, base_g_t, "base_g");
    setUpRange(base_b_i, base_b_t, "base_b");
    setUpRange(base_u_i, base_u_t, "base_u");
    setUpRange(base_l_i, base_l_t, "base_l");
    setUpRange(base_c_i, base_c_t, "base_c");

    setUpRange(front_r_i, front_r_t, "front_r");
    setUpRange(front_g_i, front_g_t, "front_g");
    setUpRange(front_b_i, front_b_t, "front_b");
    setUpRange(front_u_i, front_u_t, "front_u");
    setUpRange(front_l_i, front_l_t, "front_l");
    setUpRange(front_c_i, front_c_t, "front_c");

    setInterval(store_color_boudaries, 10000);

    function setUpRange(input, text, key) {
        input.value = color_boudaries[key];
        text.innerHTML = color_boudaries[key];

        addListener(input, "mousedown", function(e) {
            e = e || window.event;

            addListener(document, "mousemove", update);
            addListener(document, "mouseup", end);
        });
        addListener(input, "change", update);

        color_boudaries_update[key] = function(value) {
            input.value = value;
            text.innerHTML = value;
            color_boudaries[key] = value;
        };

        function update(e) {
            e = e || window.event;

            var newVal = input.value;
            text.innerHTML = newVal;
            color_boudaries[key] = newVal;
        }
        function end() {
            removeListener(document, "mousemove", update);
            removeListener(document, "mouseup", end);
        }
    }
});

function store_color_boudaries() {
    localStorage['color_boudaries'] = JSON.stringify(color_boudaries);
}