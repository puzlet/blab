(function() {
  var Pointer, Progress, Widgets;

  Widgets = null;

  $blab.style = function(id, css) {
    var s;
    s = $("style#" + id);
    if (!s.length) {
      s = $("<style>", {
        id: id
      });
      s.appendTo("head");
    }
    return s.html("\n" + css + "\n");
  };

  $(document).on("layoutCompiled", function(evt, data) {
    var button, lecture, setupAudio;
    if (!($blab.lecture || $blab.lecture2)) {
      return;
    }
    Widgets = $blab.Widgets;
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
      button.click(function(evt) {
        lecture = $blab.lecture2();
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
      this.progress = new Progress();
      this.pointer = new Pointer();
      this.steps = [];
      this.stepIdx = -1;
      this.content();
    }

    Lecture2.prototype.setupAudio = function() {
      var a, audio, i, id, len, results, server;
      server = this.audioServer;
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

    Lecture2.prototype.setupGuide = function() {
      this.guide = $("#demo-guide");
      this.guide.draggable();
      this.guide.css({
        top: 30,
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
          return _this.kickoff();
        };
      })(this)), 100);
    };

    Lecture2.prototype.kickoff = function() {
      this.clear();
      this.init();
      return this.doStep();
    };

    Lecture2.prototype.init = function() {
      var hide, show;
      console.log("******** OBJECTS", $("[id|=lecture]").css("display"));
      $("[id|=lecture]").hide();
      $(".blab-input").parent().hide();
      $(".blab-menu").parent().hide();
      $(".puzlet-slider").parent().hide();
      $(".puzlet-plot").parent().hide();
      $(".widget").hide();
      this.guide.html("<b>&#8592; &#8594;</b> to navigate<br>\n<b>Esc</b> to exit");
      show = (function(_this) {
        return function() {
          _this.guide.show();
          return setTimeout((function() {
            return hide();
          }), 5000);
        };
      })(this);
      hide = (function(_this) {
        return function() {
          _this.guide.hide();
          return _this.guide.css({
            textAlign: "center"
          });
        };
      })(this);
      return setTimeout((function() {
        return show();
      }), 1000);
    };

    Lecture2.prototype.finish = function() {
      $("[id|=lecture]").show();
      $(".hide[id|=lecture]").hide();
      $(".blab-input").parent().show();
      $(".blab-menu").parent().show();
      $(".puzlet-slider").parent().show();
      $(".puzlet-plot").parent().show();
      $(".widget").show();
      return this.stepIdx = -1;
    };

    Lecture2.prototype.clear = function() {
      return this.container = $("#main-markdown");
    };

    Lecture2.prototype.content = function() {};

    Lecture2.prototype.reset = function() {
      this.guide.hide();
      this.progress.clear();
      this.pointer.hide();
      $("[id|=lecture]").show();
      $(".hide[id|=lecture]").hide();
      $(".blab-input").parent().show();
      $(".blab-menu").parent().show();
      $(".puzlet-slider").parent().show();
      $(".puzlet-plot").parent().show();
      $(".widget").show();
      $("#computation-code-wrapper").show();
      $("#buttons").show();
      $("#start-lecture-button").show();
      return this.stepIdx = -1;
    };

    Lecture2.prototype.step = function(obj, spec) {
      var action, audio, domId, origObj, origVal, pointer, rObj;
      if (spec == null) {
        spec = {};
      }
      if (typeof obj === "string") {
        obj = $("#" + obj);
      }
      if (obj.hasClass("blab-input") || obj.hasClass("blab-menu") || obj.hasClass("puzlet-slider") || obj.hasClass("puzlet-plot")) {
        origObj = obj;
        obj = obj.parent();
      }
      console.log("OBJ", obj.data(), obj);
      action = spec.action;
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
      if (spec.replace) {
        rObj = spec.replace;
        action = function(o) {
          return {
            f: function() {
              return rObj.fadeOut(300, function() {
                return o.fadeIn();
              });
            },
            b: function() {
              return o.hide(0, function() {
                return rObj.show();
              });
            }
          };
        };
      }
      if (action === "menu") {
        domId = origObj.attr("id");
        origVal = Widgets.widgets[domId].getVal();
        action = (function(_this) {
          return function(o) {
            console.log("origVal", origVal);
            return {
              f: function() {
                return _this.setMenu(origObj, spec.val);
              },
              b: function() {
                return _this.setMenu(origObj, origVal);
              }
            };
          };
        })(this);
      }
      if (action === "slide") {
        console.log("obj/origObj", obj, origObj);
        domId = obj.attr("id");
        origVal = Widgets.widgets[domId].getVal();
        action = (function(_this) {
          return function(o) {
            console.log("origVal", origVal);
            return {
              f: function() {
                return _this.slider(obj, spec.vals);
              },
              b: function() {
                return _this.slider(obj, [origVal]);
              }
            };
          };
        })(this);
      }
      if (action === "table") {
        domId = obj.attr("id");
        action = (function(_this) {
          return function(o) {
            return {
              f: function() {
                return _this.tablePopulate(obj, spec.col, spec.vals, function() {});
              },
              b: function() {}
            };
          };
        })(this);
      }
      audio = spec.audio;
      if (audio && !$("audio" + audio).length) {
        $(document.body).append("<audio id='" + audio + "' src='" + this.audioServer + "/" + audio + ".mp3'></audio>\n");
      }
      pointer = spec.pointer;
      this.steps = this.steps.concat({
        obj: obj,
        action: action,
        audio: audio,
        pointer: pointer
      });
      console.log("steps", this.steps);
      return obj;
    };

    Lecture2.prototype.doStep = function() {
      var action, audio, audioId, obj, pointer, step;
      if (this.stepIdx < this.steps.length) {
        this.stepIdx++;
      }
      this.progress.draw(this.stepIdx + 1, this.steps.length);
      if (this.stepIdx >= 0 && this.stepIdx < this.steps.length) {
        step = this.steps[this.stepIdx];
        obj = step.obj;
        action = step.action;
        action(obj).f();
        audioId = step.audio;
        if (audioId && this.enableAudio) {
          audio = document.getElementById(audioId);
          audio.play();
        }
        pointer = step.pointer;
        if (pointer) {
          this.pointer.setPosition(pointer);
        } else {
          this.pointer.hide();
        }
      }
      if (this.stepIdx >= this.steps.length) {
        this.guide.html("<b>End of lecture</b><br>\n<b>&#8592; &#8594;</b> to navigate<br>\n<b>Esc</b> to exit");
        this.guide.show();
        this.pointer.hide();
      } else {
        if (this.guide.is(":visible")) {
          this.guide.hide();
        }
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
      this.progress.draw(this.stepIdx + 1, this.steps.length);
      this.pointer.hide();
      console.log("stepIdx", this.stepIdx);
      if (this.stepIdx < 0) {
        this.guide.html("<b>Start of lecture</b><br>\n<b>&#8592; &#8594;</b> to navigate<br>\n<b>Esc</b> to exit");
        return this.guide.show();
      } else {
        if (this.guide.is(":visible")) {
          return this.guide.hide();
        }
      }
    };

    Lecture2.prototype.setMenu = function(obj, val, cb) {
      var domId;
      console.log("**** SET MENU", obj, val);
      domId = obj.attr("id");
      Widgets.widgets[domId].setVal(val);
      Widgets.widgets[domId].menu.val(val).trigger("change");
      Widgets.compute();
      return typeof cb === "function" ? cb() : void 0;
    };

    Lecture2.prototype.slider = function(obj, vals, cb) {
      var delay, domId, idx, setSlider, slider;
      delay = 200;
      idx = 0;
      domId = obj.attr("id");
      console.log("obj", obj);
      slider = obj.find(".puzlet-slider");
      setSlider = (function(_this) {
        return function(cb) {
          var v;
          console.log("setSlider");
          v = vals[idx];
          slider.slider('option', 'value', v);
          Widgets.widgets[domId].setVal(v);
          Widgets.compute();
          idx++;
          if (idx < vals.length) {
            return setTimeout((function() {
              return setSlider(cb);
            }), delay);
          } else {
            return typeof cb === "function" ? cb() : void 0;
          }
        };
      })(this);
      return setSlider(cb);
    };

    Lecture2.prototype.tablePopulate = function(obj, col, vals, cb) {
      var delay, domId, idx, setTable;
      delay = 1000;
      idx = 0;
      domId = obj.attr("id");
      setTable = (function(_this) {
        return function(cb) {
          var bg, cell, cells, dir, t, v;
          v = vals[idx];
          t = Widgets.widgets[domId];
          console.log("***t/col/vals/idx", t, col, vals, idx);
          cell = t.editableCells[col][idx];
          dir = idx < vals.length - 1 ? 1 : 0;
          cell.div.text(v);
          bg = cell.div.parent().css("background");
          cell.div.parent().css({
            background: "#ccc"
          });
          setTimeout((function() {
            cell.div.parent().css({
              background: bg
            });
            return cell.done();
          }), 200);
          idx++;
          if (idx < vals.length) {
            return setTimeout((function() {
              return setTable(cb);
            }), delay);
          } else {
            console.log("cells", $('.editable-table-cell'));
            cells = $('.editable-table-cell');
            setTimeout((function() {
              $(cells[2]).blur();
              return $("#container").click();
            }), 1000);
            return typeof cb === "function" ? cb() : void 0;
          }
        };
      })(this);
      return setTable(cb);
    };

    Lecture2.prototype.slide = function(obj, spec) {
      spec.action = "slide";
      return this.step(obj, spec);
    };

    Lecture2.prototype.table = function(obj, spec) {
      spec.action = "table";
      return this.step(obj, spec);
    };

    Lecture2.prototype.menu = function(obj, spec) {
      spec.action = "menu";
      return this.step(obj, spec);
    };

    return Lecture2;

  })();

  Progress = (function() {
    function Progress() {
      this.container = $(document.body);
      this.wrapper = $("<div>", {
        "class": "progress-outer"
      });
      this.container.append(this.wrapper);
      this.div = $("<div>", {
        "class": "progress-inner"
      });
      this.wrapper.append(this.div);
    }

    Progress.prototype.draw = function(currentStep, numSteps) {
      var fill, i, ref, results, step;
      this.currentStep = currentStep;
      this.numSteps = numSteps;
      this.clear();
      results = [];
      for (step = i = 1, ref = this.numSteps; 1 <= ref ? i <= ref : i >= ref; step = 1 <= ref ? ++i : --i) {
        fill = step === this.currentStep;
        results.push(this.circle(fill));
      }
      return results;
    };

    Progress.prototype.clear = function() {
      return this.div.empty();
    };

    Progress.prototype.circle = function(filled) {
      var circle;
      if (filled == null) {
        filled = false;
      }
      circle = $("<div>", {
        "class": "step-circle" + (filled ? " step-circle-filled" : "")
      });
      return this.div.append(circle);
    };

    return Progress;

  })();

  Pointer = (function() {
    function Pointer() {
      this.container = $("#container");
      this.pointer = $("<img>", {
        "class": "lecture-pointer",
        src: "img/pointer.png"
      });
      this.pointer.hide();
      this.pointer.css({
        left: 500,
        top: 500
      });
      this.container.append(this.pointer);
      $(document.body).click((function(_this) {
        return function(evt) {
          var offset;
          offset = _this.container.offset();
          return console.log("container(x, y)", evt.clientX - offset.left, evt.clientY);
        };
      })(this));
    }

    Pointer.prototype.show = function() {
      return this.pointer.show();
    };

    Pointer.prototype.hide = function() {
      return this.pointer.hide();
    };

    Pointer.prototype.setPosition = function(coords) {
      var adjust;
      this.show();
      adjust = {
        left: 13,
        top: 45
      };
      return this.pointer.animate({
        left: coords[0] - adjust.left,
        top: coords[1] - adjust.top
      });
    };

    return Pointer;

  })();

}).call(this);
