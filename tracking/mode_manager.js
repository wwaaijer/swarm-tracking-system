mode_manager = new(function() {
    this.current = false;
    this.to = function(newMode) {
        if (this.current)
            if (this.modes[this.current].out)
                this.modes[this.current].out();

        for (var mode in this.modes) {
            if (mode == newMode)
                this.modes[mode].el.style.display = "block";
            else
                this.modes[mode].el.style.display = "none";
        }

        this.current = newMode;
        if (this.modes[newMode].in)
            this.modes[newMode].in();
    };
    this.modes = {};
});