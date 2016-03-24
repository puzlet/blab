(function() {
  var Input;

  Input = (function() {
    function Input(spec) {
      var change, ref;
      this.spec = spec;
      ref = this.spec, this.container = ref.container, this.init = ref.init, this.prompt = ref.prompt, this.unit = ref.unit, this.align = ref.align, change = ref.change;
      this.promptContainer = $("<div>", {
        "class": "input-prompt-container"
      });
      this.container.append(this.promptContainer);
      this.inputPrompt = $("<div>", {
        "class": "input-prompt"
      });
      this.promptContainer.append(this.inputPrompt);
      this.inputPrompt.append(this.prompt);
      this.inputContainer = $("<div>", {
        "class": "blab-input"
      });
      this.container.append(this.inputContainer);
      this.textContainer = $("<div>", {
        "class": "input-text-container"
      });
      this.container.append(this.textContainer);
      this.textDiv = $("<div>", {
        "class": "input-text"
      });
      this.textContainer.append(this.textDiv);
      if (this.unit) {
        this.textDiv.html(this.unit);
      }
      this.input = $("<input>", {
        type: "number",
        value: this.init,
        change: (function(_this) {
          return function() {
            return typeof change === "function" ? change() : void 0;
          };
        })(this)
      });
      if (this.align) {
        this.input.css({
          textAlign: this.align
        });
      }
      this.inputContainer.append(this.input);
      this.input.mouseup(function(e) {
        return e.stopPropagation();
      });
      this.inputContainer.mouseup(function(e) {
        return e.stopPropagation();
      });
    }

    Input.prototype.change = function(f) {
      return this.input.change(f);
    };

    Input.prototype.val = function() {
      return this.input.val();
    };

    return Input;

  })();

  if (window.$blab == null) {
    window.$blab = {};
  }

  if ($blab.components == null) {
    $blab.components = {};
  }

  $blab.components.Input = Input;

}).call(this);

(function() {
  var Menu;

  Menu = (function() {
    function Menu(spec) {
      this.spec = spec;
    }

    Menu.prototype.change = function(f) {};

    Menu.prototype.val = function() {};

    return Menu;

  })();

  if (window.$blab == null) {
    window.$blab = {};
  }

  if ($blab.components == null) {
    $blab.components = {};
  }

  $blab.components.Menu = Menu;

}).call(this);

(function() {
  var Slider;

  Slider = (function() {
    function Slider(spec) {
      var change, ref, ref1;
      this.spec = spec;
      ref = this.spec, this.container = ref.container, this.min = ref.min, this.max = ref.max, this.step = ref.step, this.init = ref.init, this.prompt = ref.prompt, this.text = ref.text, this.val = ref.val, this.unit = ref.unit, change = ref.change;
      this.sliding = false;
      this.sliderPromptContainer = $("<div>", {
        "class": "slider-prompt-container"
      });
      this.container.append(this.sliderPromptContainer);
      this.sliderPrompt = $("<div>", {
        "class": "slider-prompt"
      });
      this.sliderPromptContainer.append(this.sliderPrompt);
      this.sliderPrompt.append(this.prompt);
      this.sliderContainer = $("<div>", {
        "class": "puzlet-slider"
      });
      this.container.append(this.sliderContainer);
      this.textContainer = $("<div>", {
        "class": "slider-text-container"
      });
      this.container.append(this.textContainer);
      this.textDiv = $("<div>", {
        "class": "slider-text-1"
      });
      this.textContainer.append(this.textDiv);
      this.textDiv2 = $("<div>", {
        "class": "slider-text-2"
      });
      this.textContainer.append(this.textDiv2);
      if (this.unit) {
        this.textDiv2.html(this.unit);
      }
      this.fast = (ref1 = this.spec.fast) != null ? ref1 : true;
      this.changeFcn = change ? (function() {
        return change();
      }) : (function() {});
      this.slider = this.sliderContainer.slider({
        range: "min",
        min: this.min,
        max: this.max,
        step: this.step,
        value: this.init,
        mouseup: function(e) {},
        slide: (function(_this) {
          return function(e, ui) {
            _this.sliding = true;
            _this.set(ui.value);
            if (_this.fast) {
              return _this.changeFcn();
            }
          };
        })(this),
        change: (function(_this) {
          return function(e, ui) {
            _this.set(ui.value);
            if (!_this.fast) {
              _this.changeFcn();
            }
            return setTimeout((function() {
              return _this.sliding = false;
            }), 100);
          };
        })(this)
      });
      this.slider.mouseup(function(e) {
        return e.stopPropagation();
      });
      this.set(this.init);
    }

    Slider.prototype.destroy = function() {
      var base;
      if (typeof (base = this.sliderContainer).slider === "function") {
        base.slider("destroy");
      }
      return this.container.empty();
    };

    Slider.prototype.change = function(f) {
      return this.changeFcn = function() {
        return typeof f === "function" ? f() : void 0;
      };
    };

    Slider.prototype.mouseup = function(f) {
      return this.slider.mouseup(f);
    };

    Slider.prototype.set = function(v) {
      this.textDiv.html(this.val ? this.val(v) : this.text ? this.text(v) : v);
      return this.value = v;
    };

    Slider.prototype.getVal = function() {
      return this.value;
    };

    return Slider;

  })();

  if (window.$blab == null) {
    window.$blab = {};
  }

  if ($blab.components == null) {
    $blab.components = {};
  }

  $blab.components.Slider = Slider;

}).call(this);

(function() {
  var Plot;

  Plot = (function() {
    function Plot(spec) {
      var ref, ref1, ref2;
      this.spec = spec;
      ref = this.spec, this.container = ref.container, this.title = ref.title, this.width = ref.width, this.height = ref.height, this.xlabel = ref.xlabel, this.ylabel = ref.ylabel, this.css = ref.css;
      this.plot = $("<div>", {
        "class": "puzlet-plot",
        css: {
          width: (ref1 = this.width) != null ? ref1 : 400,
          height: (ref2 = this.height) != null ? ref2 : 200
        }
      });
      if (this.title) {
        this.displayTitle(this.title);
      }
      this.container.append(this.plot);
      if (this.css) {
        this.plot.css(this.css);
      }
    }

    Plot.prototype.destroy = function() {};

    Plot.prototype.displayTitle = function(title) {
      this.caption = $("<div>", {
        "class": "plot-title",
        html: title
      });
      return this.container.append(this.caption);
    };

    Plot.prototype.setVal = function(v) {
      var X, Y, base, d, i, k, l, lol, m, maxRows, o, params, ref, xRow, yRow;
      this.value = v;
      params = this.spec;
      if ((base = params.series).shadowSize == null) {
        base.shadowSize = 0;
      }
      if (params.series == null) {
        params.series = {
          color: "#55f"
        };
      }
      this.setAxes(params);
      lol = function(u) {
        var z;
        if (u[0].length != null) {
          z = u;
        } else {
          z = [];
          z.push(u);
        }
        return z;
      };
      X = lol(v[0]);
      Y = lol(v[1]);
      maxRows = Math.max(X.length, Y.length);
      d = [];
      for (k = i = 0, ref = maxRows; 0 <= ref ? i < ref : i > ref; k = 0 <= ref ? ++i : --i) {
        xRow = Math.min(k, X.length - 1);
        yRow = Math.min(k, Y.length - 1);
        l = numeric.transpose([X[xRow], Y[yRow]]);
        d.push(l);
      }
      this.flot = $.plot(this.plot, d, params);
      o = this.flot.getPlotOffset();
      m = (this.plot.parent().width() - this.plot.width() - o.left + o.right) / 2;
      return this.plot.css({
        marginLeft: m
      });
    };

    Plot.prototype.setAxes = function(params) {
      var ref, ref1, ref2, ref3, ref4, ref5;
      if (params.xaxis == null) {
        params.xaxis = {};
      }
      if (params.yaxis == null) {
        params.yaxis = {};
      }
      if (params.xlabel) {
        if ((ref = params.xaxis) != null) {
          ref.axisLabel = params.xlabel;
        }
      }
      if (params.ylabel) {
        if ((ref1 = params.yaxis) != null) {
          ref1.axisLabel = params.ylabel;
        }
      }
      if ((ref2 = params.xaxis) != null) {
        if (ref2.axisLabelUseCanvas == null) {
          ref2.axisLabelUseCanvas = true;
        }
      }
      if ((ref3 = params.yaxis) != null) {
        if (ref3.axisLabelUseCanvas == null) {
          ref3.axisLabelUseCanvas = true;
        }
      }
      if ((ref4 = params.xaxis) != null) {
        if (ref4.axisLabelPadding == null) {
          ref4.axisLabelPadding = 10;
        }
      }
      return (ref5 = params.yaxis) != null ? ref5.axisLabelPadding != null ? ref5.axisLabelPadding : ref5.axisLabelPadding = 10 : void 0;
    };

    return Plot;

  })();

  if (window.$blab == null) {
    window.$blab = {};
  }

  if ($blab.components == null) {
    $blab.components = {};
  }

  $blab.components.Plot = Plot;

}).call(this);

(function() {


}).call(this);
