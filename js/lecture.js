(function() {
  var LectureMath;

  $(document).on("layoutCompiled", function(evt, data) {
    var button, lecture;
    if (!$blab.lecture) {
      return;
    }
    button = $("#start-lecture-button");
    lecture = null;
    if (button.length) {
      return;
    }
    button = $("<button>", {
      id: "start-lecture-button",
      text: "Start lecture",
      css: {
        marginBottom: "10px"
      }
    });
    $("#defs-code-heading").after(button);
    button.click(function(evt) {
      return lecture = $blab.lecture();
    });
    return $("body").keypress((function(_this) {
      return function(evt) {
        if (evt.target.tagName === "BODY") {
          return lecture != null ? lecture.doStep() : void 0;
        }
      };
    })(this));
  });

  $blab.Lecture = (function() {
    function Lecture() {
      $("#computation-code-wrapper").hide();
      $("#buttons").hide();
      this.steps = [];
      this.stepIdx = 0;
      this.clear();
      this.content();
      this.steps.push(function() {
        $("#buttons").show();
        return $("#computation-code-wrapper").show();
      });
      setTimeout(((function(_this) {
        return function() {
          return _this.doStep();
        };
      })(this)), 100);
    }

    Lecture.prototype.box = function(params) {
      var order, pos, ref;
      if (params == null) {
        params = {
          pos: 0,
          order: null
        };
      }
      pos = (ref = params != null ? params.pos : void 0) != null ? ref : 0;
      order = params != null ? params.order : void 0;
      if (pos === 0) {
        return $("#main-markdown");
      } else {
        if (order) {
          return $("#widget-box-" + pos + " .order-" + order);
        } else {
          return $("#widget-box-" + pos);
        }
      }
    };

    Lecture.prototype.clear = function() {
      this.container = $("#main-markdown");
      this.container.empty();
      $(".layout-box").hide();
      return $(".lecture-content").remove();
    };

    Lecture.prototype.math = function(math) {
      return new LectureMath(this.container, math);
    };

    Lecture.prototype.step = function(step) {
      return this.steps = this.steps.concat(step);
    };

    Lecture.prototype.doStep = function() {
      if (this.stepIdx < this.steps.length) {
        this.steps[this.stepIdx]();
      }
      return this.stepIdx++;
    };

    Lecture.prototype.html = function(html, options) {
      var container, div, ref, ref1, typed;
      container = (ref = options.container) != null ? ref : $("#main-markdown");
      div = $("<div>", {
        "class": "lecture-content"
      });
      if (options != null ? options.css : void 0) {
        div.css(options.css);
      }
      container.append(div);
      typed = (ref1 = options != null ? options.typed : void 0) != null ? ref1 : true;
      if (typed) {
        return div.typed({
          strings: [html],
          typeSpeed: 10,
          contentType: "html",
          showCursor: false,
          onStringTyped: function() {
            return $.event.trigger("htmlOutputUpdated");
          }
        });
      } else {
        div.html(html);
        return $.event.trigger("htmlOutputUpdated");
      }
    };

    return Lecture;

  })();

  LectureMath = (function() {
    function LectureMath(container1, math1) {
      var watch;
      this.container = container1;
      this.math = math1;
      this.div = $("<div>", {
        "class": "lecture-content",
        css: {
          fontSize: "24pt"
        },
        html: "$ $"
      });
      this.container.append(this.div);
      watch = true;
      $(document).on("mathjaxProcessed", (function(_this) {
        return function() {
          if (!watch) {
            return;
          }
          _this.render();
          return watch = false;
        };
      })(this));
      $.event.trigger("htmlOutputUpdated");
    }

    LectureMath.prototype.set = function(math1) {
      this.math = math1;
      return this.render();
    };

    LectureMath.prototype.append = function(math) {
      this.math = this.math + math;
      return this.render();
    };

    LectureMath.prototype.render = function() {
      this.div.html("$" + this.math + "$");
      return $.event.trigger("htmlOutputUpdated");
    };

    return LectureMath;

  })();

}).call(this);
