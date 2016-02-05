(function() {
  var LectureMath;

  $(document).on("layoutCompiled", function(evt, data) {
    var button, lecture, setupAudio;
    if (!($blab.lecture || $blab.lecture2)) {
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
    $("#widgets-container").after(button);
    if ($blab.lecture) {
      button.click(function(evt) {
        return lecture = $blab.lecture();
      });
      $("body").keydown((function(_this) {
        return function(evt) {
          if (evt.target.tagName === "BODY") {
            return lecture != null ? lecture.doStep() : void 0;
          }
        };
      })(this));
    }
    if ($blab.lecture2) {
      setupAudio = function() {
        var a, audio, i, id, len, results, server;
        server = lecture.audioServer;
        audio = $("[data-audio]");
        results = [];
        for (i = 0, len = audio.length; i < len; i++) {
          a = audio[i];
          id = $(a).data("audio");
          if (!$("audio" + id).length) {
            results.push($(document.body).append("<audio id='" + id + "' src='" + server + "/" + id + ".mp3'></audio>\n"));
          } else {
            results.push(void 0);
          }
        }
        return results;
      };
      lecture = $blab.lecture2();
      setupAudio();
      button.click(function(evt) {
        lecture = $blab.lecture2();
        setupAudio();
        return lecture.start();
      });
      return $("body").keydown((function(_this) {
        return function(evt) {
          if (evt.target.tagName !== "BODY") {
            return;
          }
          if (!lecture) {
            return;
          }
          if (evt.keyCode === 37) {
            return lecture != null ? lecture.back() : void 0;
          } else if (evt.keyCode === 27) {
            if (lecture != null) {
              lecture.reset();
            }
            return lecture = null;
          } else {
            console.log(evt.keyCode);
            return lecture != null ? lecture.doStep() : void 0;
          }
        };
      })(this));
    }
  });

  $blab.Lecture2 = (function() {
    function Lecture2() {
      this.setupGuide();
    }

    Lecture2.prototype.setupGuide = function() {
      this.guide = $("#demo-guide");
      this.guide.draggable();
      this.guide.css({
        top: 20,
        left: $("body").width() - 200,
        background: typeof background !== "undefined" && background !== null ? background : "#ff9",
        textAlign: "center",
        width: 150
      });
      return this.guide.hide();
    };

    Lecture2.prototype.start = function() {
      $("#computation-code-wrapper").hide();
      $("#buttons").hide();
      $("#start-lecture-button").hide();
      this.steps = [];
      this.stepIdx = -1;
      this.clear();
      this.init();
      this.content();
      return setTimeout(((function(_this) {
        return function() {
          return _this.doStep();
        };
      })(this)), 100);
    };

    Lecture2.prototype.init = function() {
      console.log("******** OBJECTS", $("[id|=lecture]").css("display"));
      $("[id|=lecture]").hide();
      $(".puzlet-slider").parent().hide();
      return $(".puzlet-plot").parent().hide();
    };

    Lecture2.prototype.finish = function() {
      $("[id|=lecture]").show();
      $(".hide[id|=lecture]").hide();
      $(".puzlet-slider").parent().show();
      $(".puzlet-plot").parent().show();
      return this.stepIdx = -1;
    };

    Lecture2.prototype.clear = function() {
      return this.container = $("#main-markdown");
    };

    Lecture2.prototype.content = function() {};

    Lecture2.prototype.reset = function() {
      $("[id|=lecture]").show();
      $(".hide[id|=lecture]").hide();
      $(".puzlet-slider").parent().show();
      $(".puzlet-plot").parent().show();
      $("#computation-code-wrapper").show();
      $("#buttons").show();
      $("#start-lecture-button").show();
      return this.stepIdx = -1;
    };

    Lecture2.prototype.step = function(obj, action, replaceObj) {
      if (typeof obj === "string") {
        obj = $("#" + obj);
      }
      if (obj.hasClass("puzlet-slider") || obj.hasClass("puzlet-plot")) {
        obj = obj.parent();
      }
      console.log("OBJ", obj.data(), obj);
      if (action == null) {
        action = function(o) {
          return {
            f: function() {
              return o.show();
            },
            b: function() {
              return o.hide();
            }
          };
        };
      }
      if (action === "fade") {
        action = function(o) {
          return {
            f: function() {
              return o.fadeIn();
            },
            b: function() {
              return o.fadeOut();
            }
          };
        };
      }
      if (action === "replace") {
        action = function(o) {
          return {
            f: function() {
              return replaceObj.fadeOut(300, function() {
                return o.fadeIn();
              });
            },
            b: function() {
              return o.fadeOut(300, function() {
                return replaceObj.fadeIn();
              });
            }
          };
        };
      }
      this.steps = this.steps.concat({
        obj: obj,
        action: action
      });
      console.log("steps", this.steps);
      return obj;
    };

    Lecture2.prototype.doStep = function() {
      var action, audio, audioId, obj, step;
      if (this.stepIdx < this.steps.length) {
        this.stepIdx++;
      }
      if (this.stepIdx >= 0 && this.stepIdx < this.steps.length) {
        step = this.steps[this.stepIdx];
        obj = step.obj;
        action = step.action;
        action(obj).f();
        audioId = obj.data().audio;
        if (audioId && this.enableAudio) {
          audio = document.getElementById(audioId);
          audio.play();
        }
      }
      if (this.stepIdx >= this.steps.length) {
        this.guide.html("At end of lecture.<br>Press <b>Esc</b> to exit.");
        this.guide.show();
      } else {
        this.guide.hide();
      }
      return console.log("stepIdx", this.stepIdx);
    };

    Lecture2.prototype.back = function() {
      var action, obj, step;
      console.log("BACK STEP");
      if (this.stepIdx >= 0 && this.stepIdx < this.steps.length) {
        step = this.steps[this.stepIdx];
        obj = step.obj;
        action = step.action;
        action(obj).b();
      }
      if (this.stepIdx >= 0) {
        this.stepIdx--;
      }
      console.log("stepIdx", this.stepIdx);
      if (this.stepIdx < 0) {
        this.guide.html("At start of lecture.<br>Press <b>Esc</b> to exit.");
        return this.guide.show();
      } else {
        return this.guide.hide();
      }
    };

    return Lecture2;

  })();

  $blab.Lecture = (function() {
    function Lecture() {
      $("#computation-code-wrapper").hide();
      $("#buttons").hide();
      this.steps = [];
      this.stepIdx = 0;
      this.clear();
      this.init();
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
      container = (ref = options != null ? options.container : void 0) != null ? ref : $("#main-markdown");
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

    Lecture.prototype.audio = function(id) {
      var audio;
      audio = document.getElementById(id);
      return audio.play();
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
