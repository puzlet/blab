(function() {
  var Computation, Definitions, Demo, DemoButton, DemoControl, DemoRunner, Editor, Layout, MainDemoStart, Markdown, PlayButton, Script, Sliders, Tables, Text, Widgets, app, computationEditor, defsEditor, guide, guideClose, markdownEditor, widgetEditor,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

  console.log("-------------Demo runner");

  MainDemoStart = (function() {
    function MainDemoStart(runDemo) {
      this.runDemo = runDemo;
      this.container = $("#demo-start-button-area");
      this.container.addClass("demo-start-button-main");
      $("#main-markdown").css({
        opacity: 0
      });
    }

    MainDemoStart.prototype.clear = function(callback) {
      this.button.clear();
      return this.container.slideUp(1000, (function(_this) {
        return function() {
          return $("#top-banner").slideUp(400, function() {
            return $("#main-markdown").animate({
              opacity: 1
            }, 1500, function() {
              return typeof callback === "function" ? callback() : void 0;
            });
          });
        };
      })(this));
    };

    MainDemoStart.prototype.create = function() {
      var img;
      img = $("<img>", {
        id: "demo-start-button-main-image",
        src: "img/blab.png"
      });
      this.div = $("<div>", {
        "class": "demo-start-button-main-text"
      });
      this.div.append("<h1>Scientific computing for the web.</h1>");
      return this.container.append(img).append(this.div);
    };

    MainDemoStart.prototype.activate = function() {
      this.container.click((function(_this) {
        return function() {
          return _this.clear(function() {
            return _this.runDemo();
          });
        };
      })(this));
      return this.button = new PlayButton(this.div, ((function(_this) {
        return function() {};
      })(this)));
    };

    MainDemoStart.prototype.logo = function() {
      this.logoContainer = $("<div>", {
        id: "blabr-logo"
      });
      this.div.append(this.logoContainer);
      this.logo = $("<img>", {
        src: "img/blabr-logo.png",
        height: 60
      });
      return this.logoContainer.append(this.logo).append("<p>Blabr</p>");
    };

    return MainDemoStart;

  })();

  DemoButton = (function() {
    function DemoButton(runDemo) {
      this.runDemo = runDemo;
      this.container = $("#demo-start-button-area");
      this.container.css({
        height: 80
      });
    }

    DemoButton.prototype.clear = function(callback) {
      this.button.clear();
      return this.container.slideUp(1000, function() {
        return typeof callback === "function" ? callback() : void 0;
      });
    };

    DemoButton.prototype.create = function() {
      return this.button = new PlayButton(this.container, ((function(_this) {
        return function() {
          return _this.clear(function() {
            return _this.runDemo();
          });
        };
      })(this)));
    };

    return DemoButton;

  })();

  PlayButton = (function() {
    function PlayButton(container, callback1) {
      this.container = container;
      this.callback = callback1;
      this.button = $("<img>", {
        src: "img/play.png",
        css: {
          height: 60,
          width: 60,
          cursor: "pointer"
        },
        click: (function(_this) {
          return function() {
            if (_this.clicked) {
              return;
            }
            _this.clicked = true;
            return typeof _this.callback === "function" ? _this.callback() : void 0;
          };
        })(this)
      });
      this.container.append(this.button);
    }

    PlayButton.prototype.clear = function(callback) {
      return this.button.fadeOut(500, function() {
        return typeof callback === "function" ? callback() : void 0;
      });
    };

    return PlayButton;

  })();

  DemoRunner = (function() {
    function DemoRunner() {
      this.run = bind(this.run, this);
      this.isMain = $blab.resources.getSource == null;
      this.start = this.isMain ? new MainDemoStart((function(_this) {
        return function() {
          return _this.run();
        };
      })(this)) : new DemoButton((function(_this) {
        return function() {
          return _this.run();
        };
      })(this));
      this.start.create();
      this.firstLayout = true;
      $blab.Layout.on("renderedWidgets", (function(_this) {
        return function() {
          var base;
          if (!_this.firstLayout) {
            return;
          }
          if (typeof (base = _this.start).activate === "function") {
            base.activate();
          }
          return _this.firstLayout = false;
        };
      })(this));
      this.firstChange = true;
      $(document).on("codeNodeChanged", (function(_this) {
        return function() {
          if (!_this.firstChange) {
            return;
          }
          return _this.start.clear();
        };
      })(this));
    }

    DemoRunner.prototype.run = function() {
      return new Demo;
    };

    return DemoRunner;

  })();

  guide = null;

  guideClose = function(guide) {
    return new $blab.utils.CloseButton(guide, (function(_this) {
      return function() {
        guide.hide();
        return $.event.trigger("demoGuideClose");
      };
    })(this));
  };

  app = null;

  markdownEditor = null;

  computationEditor = null;

  defsEditor = null;

  widgetEditor = null;

  Widgets = null;

  Editor = (function() {
    Editor.prototype.delay = 500;

    Editor.prototype.charDelay = 150;

    Editor.prototype.runOnStatement = false;

    Editor.prototype.clearFirst = false;

    function Editor(appEditor, guide1) {
      this.appEditor = appEditor;
      this.guide = guide1;
      this.editor = this.appEditor.editor;
      this.ace = this.appEditor.aceEditor;
      this.firstAppend = true;
    }

    Editor.prototype.statement = function(statementStr, initDelay, cb) {
      var doStatement;
      this.statementStr = statementStr;
      this.statementCharIdx = 0;
      this.statementLength = this.statementStr.length;
      this.ace.focus();
      doStatement = (function(_this) {
        return function() {
          if (!_this.firstAppend) {
            _this.ace.insert("\n");
          }
          _this.firstAppend = false;
          _this.ace.navigateFileEnd();
          if (_this.ace.getCursorPosition().column > 0) {
            _this.ace.removeToLineStart();
          }
          return setTimeout((function() {
            return _this.char(cb);
          }), initDelay);
        };
      })(this);
      if (this.firstAppend && this.clearFirst) {
        return this.step(((function(_this) {
          return function() {
            return _this.ace.selection.selectAll();
          };
        })(this)), (function(_this) {
          return function() {
            _this.ace.insert("");
            return doStatement();
          };
        })(this));
      } else {
        return doStatement();
      }
    };

    Editor.prototype.char = function(cb) {
      var c, i;
      i = this.statementCharIdx;
      c = this.statementStr.slice(i, i + 1);
      this.ace.insert(c);
      if (i < this.statementLength) {
        this.statementCharIdx++;
        return setTimeout(((function(_this) {
          return function() {
            return _this.char(cb);
          };
        })(this)), this.charDelay);
      } else {
        if (this.runOnStatement) {
          this.editor.run();
        }
        return cb();
      }
    };

    Editor.prototype.replace = function(spec, cb) {
      var line, replace, vline, word;
      vline = spec.vline, line = spec.line, word = spec.word, replace = spec.replace;
      if (vline == null) {
        vline = 1;
      }
      if (line == null) {
        line = (this.editor.spec.startLine - 1) + vline;
      }
      this.ace.focus();
      return this.gotoLine(line, (function(_this) {
        return function() {
          if (spec.find) {
            return _this.step((function() {
              return _this.ace.find(spec.find);
            }), function() {
              if (spec.slow) {
                _this.statementStr = replace;
                _this.statementCharIdx = 0;
                _this.statementLength = _this.statementStr.length;
                return _this.char(cb);
              } else {
                return _this.step((function() {
                  return _this.ace.insert(replace);
                }), function() {
                  return _this.step((function() {
                    if (_this.runOnStatement) {
                      return _this.editor.run();
                    }
                  }), function() {
                    return typeof cb === "function" ? cb() : void 0;
                  });
                });
              }
            });
          } else {
            return _this.navigateRight(word, function() {
              return _this.replaceWordRight(replace, function() {
                return _this.step((function() {
                  if (_this.runOnStatement) {
                    return _this.editor.run();
                  }
                }), function() {
                  return typeof cb === "function" ? cb() : void 0;
                });
              });
            });
          }
        };
      })(this));
    };

    Editor.prototype.gotoLine = function(line, cb) {
      this.ace.gotoLine(line);
      return cb();
    };

    Editor.prototype.navigateRight = function(numWords, cb) {
      var navRight, wordIdx;
      wordIdx = 0;
      navRight = (function(_this) {
        return function() {
          _this.ace.navigateWordRight();
          wordIdx++;
          if (wordIdx < numWords) {
            return navRight();
          } else {
            return setTimeout(cb, _this.delay);
          }
        };
      })(this);
      return navRight();
    };

    Editor.prototype.replaceWordRight = function(word, cb) {
      return this.step(((function(_this) {
        return function() {
          return _this.ace.selection.selectWordRight();
        };
      })(this)), (function(_this) {
        return function() {
          return _this.step((function() {
            _this.ace.removeWordRight();
            _this.ace.insert(word);
            _this.ace.navigateWordLeft();
            return _this.ace.selection.selectWordRight();
          }), function() {
            return cb();
          });
        };
      })(this));
    };

    Editor.prototype.step = function(step, cb) {
      step();
      return setTimeout((function() {
        return cb();
      }), this.delay);
    };

    return Editor;

  })();

  Text = (function() {
    function Text(guide1) {
      this.guide = guide1;
    }

    Text.prototype.explain = function(html, background, cb) {
      var h, top;
      this.guide.show();
      h = $(window).height();
      top = h / 3;
      this.guide.css({
        top: top,
        left: ($("body").width() - 500) / 2,
        background: background != null ? background : "#ff9",
        width: 500
      });
      this.guide.html(html);
      guideClose(this.guide);
      return cb();
    };

    return Text;

  })();

  Markdown = (function(superClass) {
    extend(Markdown, superClass);

    Markdown.prototype.charDelay = 50;

    function Markdown(guide1) {
      this.guide = guide1;
      Markdown.__super__.constructor.call(this, markdownEditor, this.guide);
    }

    Markdown.prototype.explain = function(html, cb) {
      var c, pos;
      this.guide.show();
      c = this.editor.outer;
      pos = c.offset();
      this.guide.animate({
        top: pos.top + 10,
        left: pos.left + 500
      }, 400, cb);
      return this.guide.html(html);
    };

    return Markdown;

  })(Editor);

  Computation = (function(superClass) {
    extend(Computation, superClass);

    Computation.prototype.clearFirst = true;

    Computation.prototype.runOnStatement = true;

    function Computation(guide1) {
      this.guide = guide1;
      Computation.__super__.constructor.call(this, computationEditor, this.guide);
    }

    Computation.prototype.explain = function(html) {
      var c, pos;
      this.guide.show();
      c = this.editor.container;
      pos = c.position();
      this.guide.css({
        top: pos.top + c.height() + 70,
        left: pos.left + 300
      });
      return this.guide.html(html);
    };

    return Computation;

  })(Editor);

  Definitions = (function(superClass) {
    extend(Definitions, superClass);

    Definitions.prototype.clearFirst = true;

    Definitions.prototype.runOnStatement = true;

    function Definitions(guide1) {
      this.guide = guide1;
      Definitions.__super__.constructor.call(this, defsEditor, this.guide);
    }

    Definitions.prototype.explain = function(html) {
      var c, pos;
      this.guide.show();
      c = this.editor.container;
      pos = c.position();
      this.guide.css({
        top: pos.top + c.height() + 30,
        left: pos.left
      });
      return this.guide.html(html);
    };

    return Definitions;

  })(Editor);

  Layout = (function(superClass) {
    extend(Layout, superClass);

    Layout.prototype.runOnStatement = true;

    function Layout(guide1) {
      this.guide = guide1;
      Layout.__super__.constructor.call(this, widgetEditor, this.guide);
    }

    Layout.prototype.explain = function(html, cb) {
      var c, pos;
      this.guide.show();
      c = this.editor.outer;
      pos = c.offset();
      this.guide.animate({
        top: pos.top + 30,
        left: pos.left + 500
      }, 400, cb);
      return this.guide.html(html);
    };

    return Layout;

  })(Editor);

  Sliders = (function() {
    Sliders.prototype.delay = 200;

    function Sliders(guide1) {
      this.guide = guide1;
    }

    Sliders.prototype.animate = function(id, vals, cb) {
      var idx, setSlider;
      idx = 0;
      $.event.trigger("clickInputWidget");
      setSlider = (function(_this) {
        return function(cb) {
          var domId, slider, v;
          v = vals[idx];
          domId = $blab.Widget.createDomId("slider-", id);
          slider = $("#" + domId).find(".puzlet-slider");
          slider.slider('option', 'value', v);
          Widgets.widgets[domId].setVal(v);
          Widgets.compute();
          idx++;
          if (idx < vals.length) {
            return setTimeout((function() {
              return setSlider(cb);
            }), _this.delay);
          } else {
            return cb();
          }
        };
      })(this);
      return setTimeout((function() {
        return setSlider(cb);
      }), 1000);
    };

    Sliders.prototype.explain = function(html, cb) {
      this.guide.show();
      this.guide.animate({
        top: 20,
        left: 400
      }, 400, cb);
      return this.guide.html(html);
    };

    return Sliders;

  })();

  Tables = (function() {
    Tables.prototype.delay = 1000;

    function Tables(guide1) {
      this.guide = guide1;
    }

    Tables.prototype.populate = function(id, col, vals, cb) {
      var idx, setTable;
      idx = 0;
      setTable = (function(_this) {
        return function(cb) {
          var cell, dir, domId, t, v;
          v = vals[idx];
          domId = $blab.Widget.createDomId("table-", id);
          t = Widgets.widgets[domId];
          cell = t.editableCells[col][idx];
          dir = idx < vals.length - 1 ? 1 : 0;
          cell.enterVal(v, dir);
          idx++;
          if (idx < vals.length) {
            return setTimeout((function() {
              return setTable(cb);
            }), _this.delay);
          } else {
            return cb();
          }
        };
      })(this);
      return setTable(cb);
    };

    Tables.prototype.explain = function(html, cb) {
      var c, pos;
      this.guide.show();
      c = computationEditor.editor.container;
      pos = c.position();
      this.guide.animate({
        top: pos.top - 30,
        left: pos.left
      }, 400, cb);
      return this.guide.html(html);
    };

    return Tables;

  })();

  Script = (function() {
    Script.prototype.stepDelay = 500;

    function Script() {
      this.steps = [];
    }

    Script.prototype.step = function(step) {
      return this.steps.push(step);
    };

    Script.prototype.run = function() {
      var delay, numSteps, runStep, stepIdx;
      numSteps = this.steps.length;
      stepIdx = 0;
      delay = this.stepDelay;
      runStep = (function(_this) {
        return function() {
          var step;
          step = _this.steps[stepIdx];
          return step(function() {
            stepIdx++;
            if (stepIdx < numSteps) {
              return setTimeout((function() {
                return runStep();
              }), delay);
            } else {
              return console.log("Demo done");
            }
          });
        };
      })(this);
      return runStep();
    };

    return Script;

  })();

  DemoControl = (function() {
    function DemoControl() {
      this.control = $("#demo-control");
      this.control.show();
      this.pauseImg = $("<img>", {
        src: "img/UI_78.png",
        "class": "demo-button-img"
      });
      this.playImg = $("<img>", {
        src: "img/UI_76.png",
        "class": "demo-button-img"
      });
      this.control.click((function(_this) {
        return function() {
          if (!_this.enabled) {
            return;
          }
          return _this.trigger("click");
        };
      })(this));
      this.show(false);
      this.observers = {
        click: []
      };
    }

    DemoControl.prototype.text = function(text) {
      return this.control.html(text);
    };

    DemoControl.prototype.show = function(show, play) {
      if (show == null) {
        show = true;
      }
      if (play == null) {
        play = false;
      }
      this.enabled = show;
      this.control.css({
        opacity: (show ? 1 : 0.2),
        cursor: (show ? "pointer" : "default")
      });
      this.control.empty();
      return this.control.append((play ? this.playImg : this.pauseImg));
    };

    DemoControl.prototype.on = function(evt, observer) {
      return this.observers[evt].push(observer);
    };

    DemoControl.prototype.trigger = function(evt, data) {
      var j, len, observer, ref, results;
      ref = this.observers[evt];
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        observer = ref[j];
        results.push(observer(data));
      }
      return results;
    };

    return DemoControl;

  })();

  Demo = (function() {
    Demo.prototype.dwellDelay = 1000;

    function Demo() {
      console.log("DEMO");
      $.event.trigger("runBlabDemo");
      this.isMain = $blab.resources.getSource == null;
      app.errors.enable = false;
      this.script = new Script;
      this.textGuide = new Text(guide);
      this.markdown = new Markdown(guide);
      this.computation = new Computation(guide);
      this.definitions = new Definitions(guide);
      this.layout = new Layout(guide);
      this.sliders = new Sliders(guide);
      this.tables = new Tables(guide);
      this.control = new DemoControl;
      this.tId = null;
      this.nextStep = null;
      this.control.on("click", (function(_this) {
        return function() {
          if (_this.tId) {
            _this.control.show(true, true);
            clearTimeout(_this.tId);
            return _this.tId = null;
          } else {
            if (typeof _this.nextStep === "function") {
              _this.nextStep();
            }
            return _this.nextStep = null;
          }
        };
      })(this));
      $(document).on("demoGuideClose", (function(_this) {
        return function() {
          if (!_this.tId) {
            return;
          }
          clearTimeout(_this.tId);
          _this.tId = null;
          _this.nextStep();
          return _this.nextStep = null;
        };
      })(this));
      $blab.demoScript({
        text: (function(_this) {
          return function() {
            var p;
            p = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return _this.text.apply(_this, p);
          };
        })(this),
        compute: (function(_this) {
          return function() {
            var p;
            p = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return _this.compute.apply(_this, p);
          };
        })(this),
        defs: (function(_this) {
          return function() {
            var p;
            p = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return _this.defs.apply(_this, p);
          };
        })(this),
        widget: (function(_this) {
          return function() {
            var p;
            p = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return _this.widget.apply(_this, p);
          };
        })(this),
        slider: (function(_this) {
          return function() {
            var p;
            p = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return _this.slider.apply(_this, p);
          };
        })(this),
        table: (function(_this) {
          return function() {
            var p;
            p = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return _this.table.apply(_this, p);
          };
        })(this),
        md: (function(_this) {
          return function() {
            var p;
            p = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return _this.md.apply(_this, p);
          };
        })(this),
        widgetEditor: (function(_this) {
          return function() {
            var p;
            p = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return _this.widgetEditor.apply(_this, p);
          };
        })(this),
        delays: (function(_this) {
          return function() {
            var p;
            p = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return _this.delays.apply(_this, p);
          };
        })(this)
      });
      this.learnMore();
      this.script.run();
    }

    Demo.prototype.text = function(html, dwell, background) {
      if (dwell == null) {
        dwell = this.dwellDelay;
      }
      if (background == null) {
        background = "#ff9";
      }
      return this.script.step((function(_this) {
        return function(cb) {
          var done;
          done = function() {
            guide.css({
              width: "",
              background: "#ff9"
            });
            guide.hide();
            return cb();
          };
          return _this.textGuide.explain(html, background, function() {
            return _this.dwell(dwell, function() {
              return done();
            });
          });
        };
      })(this));
    };

    Demo.prototype.md = function(spec, dwell) {
      if (dwell == null) {
        dwell = this.dwellDelay;
      }
      if (spec.dwell) {
        dwell = spec.dwell;
      }
      return this.script.step((function(_this) {
        return function(cb) {
          var display, edit;
          display = markdownEditor.editor.outer.css("display");
          if (display === "none") {
            markdownEditor.trigger("clickText", {
              evt: null,
              start: 0
            });
          }
          edit = function() {
            var d;
            d = function() {
              return _this.dwell(dwell, function() {
                return cb();
              });
            };
            if (spec.replace) {
              return _this.markdown.replace(spec, d);
            } else if (spec.append) {
              return _this.markdown.statement(spec.append, 0, d);
            } else if (spec.close) {
              markdownEditor.setViewPort(null);
              return d();
            }
          };
          if (spec.guide) {
            setTimeout((function() {
              return _this.markdown.explain(spec.guide);
            }), 500);
          }
          return setTimeout((function() {
            return edit();
          }), 900);
        };
      })(this));
    };

    Demo.prototype.compute = function(statement, html, dwell, initDelay) {
      if (html == null) {
        html = "";
      }
      if (dwell == null) {
        dwell = this.dwellDelay;
      }
      if (initDelay == null) {
        initDelay = 0;
      }
      return this.script.step((function(_this) {
        return function(cb) {
          if (html.length) {
            _this.computation.explain(html);
          }
          return _this.computation.statement(statement, initDelay, function() {
            var done;
            done = function() {
              guide.hide();
              return cb();
            };
            return _this.dwell(dwell, function() {
              return done();
            });
          });
        };
      })(this));
    };

    Demo.prototype.defs = function(statement, html, dwell) {
      if (html == null) {
        html = "";
      }
      if (dwell == null) {
        dwell = this.dwellDelay;
      }
      return this.script.step((function(_this) {
        return function(cb) {
          if (html.length) {
            _this.definitions.explain(html);
          }
          return _this.definitions.statement(statement, 0, function() {
            return _this.dwell(dwell, function() {
              guide.hide();
              return cb();
            });
          });
        };
      })(this));
    };

    Demo.prototype.widget = function(spec) {
      return this.script.step((function(_this) {
        return function(cb) {
          return _this.layout.explain(spec.guide, function() {
            return _this.layout.replace(spec, function() {
              var ref;
              return _this.dwell((ref = spec.dwell) != null ? ref : _this.dwellDelay, cb);
            });
          });
        };
      })(this));
    };

    Demo.prototype.slider = function(spec) {
      var dwell, ref;
      dwell = (ref = spec.dwell) != null ? ref : this.dwellDelay;
      return this.script.step((function(_this) {
        return function(cb) {
          return _this.sliders.explain(spec.guide, function() {
            return _this.sliders.animate(spec.id, spec.vals, function() {
              return _this.dwell(dwell, function() {
                return cb();
              });
            });
          });
        };
      })(this));
    };

    Demo.prototype.table = function(spec) {
      var dwell, ref;
      dwell = (ref = spec.dwell) != null ? ref : this.dwellDelay;
      return this.script.step((function(_this) {
        return function(cb) {
          return _this.tables.explain(spec.guide, function() {
            var ref1;
            return _this.tables.populate(spec.id, (ref1 = spec.col) != null ? ref1 : 0, spec.vals, function() {
              return _this.dwell(dwell, function() {
                return cb();
              });
            });
          });
        };
      })(this));
    };

    Demo.prototype.widgetEditor = function(spec) {
      return this.script.step((function(_this) {
        return function(cb) {
          if (spec.close) {
            widgetEditor.setViewPort(null);
          }
          if (spec.enable != null) {
            app.disablePopupWidgetEditor = !spec.enable;
          }
          return cb();
        };
      })(this));
    };

    Demo.prototype.delays = function(spec) {
      if (spec.step) {
        this.script.stepDelay = spec.step;
      }
      if (spec.changeCode) {
        this.markdown.delay = spec.changeCode;
        this.computation.delay = spec.changeCode;
        this.layout.delay = spec.changeCode;
      }
      if (spec.mdChar) {
        this.markdown.charDelay = spec.mdChar;
      }
      if (spec.codeChar) {
        this.computation.charDelay = spec.codeChar;
        this.definitions.charDelay = spec.codeChar;
      }
      if (spec.slider) {
        this.sliders.delay = spec.slider;
      }
      if (spec.dwell) {
        return this.dwellDelay = spec.dwell;
      }
    };

    Demo.prototype.dwell = function(t, cb) {
      this.nextStep = (function(_this) {
        return function() {
          _this.control.show(false);
          return cb();
        };
      })(this);
      this.tId = setTimeout(((function(_this) {
        return function() {
          _this.nextStep();
          return _this.nextStep = null;
        };
      })(this)), t);
      return this.control.show();
    };

    Demo.prototype.learnMore = function() {
      return this.script.step((function(_this) {
        return function(cb) {
          var bg, done, dwell, html;
          html = "<b>Learn more about Blabr</b><br><br>\nThe \"Doc & Examples\" link (bottom of page)<br>\nshows demos, examples, and documentation.<br><br>\n<a href=\"" + window.location + "\">Run this demo again</a>";
          dwell = 10000;
          bg = "#ff9";
          done = function() {
            _this.control.control.hide();
            guide.css({
              width: "",
              background: bg
            });
            guide.hide();
            return cb();
          };
          $blab.blabrGuide.slideDown();
          return _this.textGuide.explain(html, bg, function() {
            return _this.dwell(dwell, function() {
              return done();
            });
          });
        };
      })(this));
    };

    return Demo;

  })();

  $blab.initDemoRunner = function() {
    guide = $("#demo-guide");
    guide.draggable();
    app = $blab.blabrApp;
    markdownEditor = app.markdownEditor;
    computationEditor = app.computationEditor;
    defsEditor = app.definitionsEditor;
    widgetEditor = app.widgetEditor;
    Widgets = $blab.Widgets;
    return new DemoRunner;
  };

}).call(this);
