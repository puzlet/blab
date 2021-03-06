(function() {
  var App, Background, BlabEvents, Buttons, Computation, ComputationButtons, ComputationEditor, Definitions, DefinitionsEditor, EditPageButton, EmbedDialog, Errors, Gist, GoogleAnalytics, Layout, Loader, MarkdownEditor, PopupEditorManager, Settings, TextEditor, Widget, WidgetEditor, Widgets, codeSections,
    slice = [].slice,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  console.log("---Blabr", navigator.userAgent);

  $blab.isIe10 = /MSIE 10.0/i.test(navigator.userAgent);

  $blab.isIe11 = /rv:11.0/i.test(navigator.userAgent);

  $blab.isLteIe9 = $("html").attr("class") === "ie";

  $blab.isIe = $blab.isLteIe9 || $blab.isIe10 || $blab.isIe11;

  if ($blab.isLteIe9) {
    alert("This version of IE not currently supported.  Please try Chrome/Safari/Firefox/IE10+.");
  }

  if (typeof $blab !== "undefined" && $blab !== null ? $blab.layoutProcessed : void 0) {
    return;
  }

  $blab.layoutProcessed = true;

  $blab.codeDecoration = true;

  Widget = (function() {
    Widget.handle = null;

    Widget.register = function(W) {
      return Widgets.register(W);
    };

    Widget.getName = function(W) {
      var name, ref;
      name = (ref = W.name) != null ? ref : /^function\s+([\w\$]+)\s*\(/.exec(W.toString())[1];
      return name;
    };

    Widget.getWidget = function() {
      var name, ref;
      name = (ref = this.name) != null ? ref : Widget.getName(this);
      return Widgets.Registry[name];
    };

    Widget.getApi = function() {
      var name, ref;
      name = (ref = this.name) != null ? ref : Widget.getName(this);
      return "$blab.Widgets.Registry." + name;
    };

    Widget.layoutPreamble = function() {
      var W, api;
      W = this.getWidget();
      api = this.getApi();
      return W.handle + " = (id, spec) -> new " + api + "(id, spec)";
    };

    Widget.computePreamble = function() {
      var W, api;
      W = this.getWidget();
      api = this.getApi();
      return W.handle + " = (id, v...) ->\n  " + api + ".compute(id, v...)";
    };

    Widget.fetch = function() {
      var W, id, v, w;
      id = arguments[0], v = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      W = this.getWidget();
      w = Widgets.fetch.apply(Widgets, [W, id].concat(slice.call(v)));
      if (w != null) {
        w.setUsed();
      }
      return w;
    };

    Widget.compute = function() {
      var id, ref, v;
      id = arguments[0], v = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      if (this.source) {
        return (ref = this.getVal.apply(this, [id].concat(slice.call(v)))) != null ? ref : this.initVal;
      } else {
        return this.setVal.apply(this, [id].concat(slice.call(v)));
      }
    };

    Widget.getVal = function() {
      var id, ref, v;
      id = arguments[0], v = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      return (ref = this.fetch.apply(this, [id].concat(slice.call(v)))) != null ? ref.getVal() : void 0;
    };

    Widget.setVal = function() {
      var id, ref, v;
      id = arguments[0], v = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      if ((ref = this.fetch.apply(this, [id].concat(slice.call(v)))) != null) {
        ref.setVal(v);
      }
      return null;
    };

    Widget.setValAndGet = function() {
      var id, ref, v;
      id = arguments[0], v = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      return (ref = this.fetch.apply(this, [id].concat(slice.call(v)))) != null ? ref.setVal(v) : void 0;
    };

    Widget.domIdPrefix = function() {
      var W;
      W = this.getWidget();
      return W.handle + "-";
    };

    Widget.createDomId = function(prefix, id) {
      var domId;
      domId = prefix + id.split(" ").join("-");
      return domId;
    };

    function Widget(p1, p2) {
      this.p1 = p1;
      this.p2 = p2;
      this.used = false;
      if (typeof this.p1 === "string") {
        this.id = this.p1;
        this.spec = this.p2;
        this.spec.id = this.id;
      } else {
        this.spec = this.p1;
        this.id = this.spec.id;
      }
      if (typeof this.create === "function") {
        this.create(this.spec);
      }
    }

    Widget.prototype.initialize = function() {
      return this.setVal(this.initVal);
    };

    Widget.prototype.setVal = function(v) {
      return this.value = v;
    };

    Widget.prototype.getVal = function() {
      return this.value;
    };

    Widget.prototype.appendToCanvas = function(mainContainer) {
      var domId, events;
      this.mainContainer = mainContainer;
      Widgets.append(this.domId(), this, this.mainContainer);
      domId = this.domId();
      if (!$("#" + domId).length) {
        this.mainContainer.attr({
          id: domId
        });
      }
      events = $._data(this.mainContainer.get(0), "events");
      if (!(events != null ? events.mouseup : void 0)) {
        return this.mainContainer.mouseup((function(_this) {
          return function() {
            return _this.select();
          };
        })(this));
      }
    };

    Widget.prototype.domId = function() {
      return Widget.createDomId(this.constructor.domIdPrefix(), this.id);
    };

    Widget.prototype.select = function() {
      var type;
      type = this.constructor.handle;
      return $.event.trigger("clickWidget", {
        type: type,
        id: this.domId(),
        widget: this
      });
    };

    Widget.prototype.computeAll = function() {
      return Widgets.compute();
    };

    Widget.prototype.setUsed = function(used) {
      if (used == null) {
        used = true;
      }
      if (used === this.used) {
        return;
      }
      this.mainContainer.css({
        opacity: (used ? 1 : 0.2)
      });
      return this.used = used;
    };

    return Widget;

  })();

  Widgets = (function() {
    function Widgets() {}

    Widgets.filename = "layout.coffee";

    Widgets.Registry = {};

    Widgets.register = function(WidgetSet) {
      var W, i, len, name, results1;
      console.log("Register", WidgetSet);
      results1 = [];
      for (i = 0, len = WidgetSet.length; i < len; i++) {
        W = WidgetSet[i];
        if (W.cssUrl) {
          $blab.resources.fetch(W.cssUrl);
        }
        name = Widget.getName(W);
        console.log("Widget", name);
        results1.push(this.Registry[name] = W);
      }
      return results1;
    };

    Widgets.widgets = {};

    Widgets.count = 0;

    Widgets.initialize = function() {
      console.log("======= Widgets initialize");
      this.Layout = Layout;
      if (this.widgetEditor == null) {
        this.widgetEditor = new WidgetEditor(this.filename);
      }
      $(document).on("aceFilesLoaded", (function(_this) {
        return function() {
          var resource;
          if (_this.widgetEditor.editor) {
            return;
          }
          resource = $blab.resources.find(_this.filename);
          return _this.widgetEditor.init(resource);
        };
      })(this));
      $(document).on("preCompileCoffee", (function(_this) {
        return function(evt, data) {
          var resource, url;
          resource = data.resource;
          url = resource.url;
          _this.count = 0;
          if (url !== _this.filename) {
            return;
          }
          _this.widgetEditor.init(resource);
          _this.precode();
          _this.removeAllFromCanvas();
          return _this.widgets = {};
        };
      })(this));
      $(document).on("compiledCoffeeScript", (function(_this) {
        return function(evt, data) {
          var err, i, key, len, ref, widget;
          if (data.url !== _this.filename) {
            return;
          }
          err = $blab.windowError;
          $.event.trigger("layoutError", {
            source: _this.filename,
            error: err
          });
          $.event.trigger("blabError", {
            source: _this.filename,
            error: err
          });
          if (err) {
            $blab.windowError = false;
            return;
          }
          ref = _this.widgets;
          for (widget = i = 0, len = ref.length; i < len; widget = ++i) {
            key = ref[widget];
            if (widget != null) {
              if (typeof widget.initialize === "function") {
                widget.initialize();
              }
            }
          }
          Computation.init();
          return $.event.trigger("htmlOutputUpdated");
        };
      })(this));
      return this.queueCompile(2000);
    };

    Widgets.append = function(id, widget, element) {
      this.widgets[id] = widget;
      return this.Layout.append(element, widget);
    };

    Widgets.fetch = function() {
      var Widget, id, id2, idSpecified, prefix, v, w;
      Widget = arguments[0], id = arguments[1], v = 3 <= arguments.length ? slice.call(arguments, 2) : [];
      idSpecified = id != null;
      if (!idSpecified) {
        id = this.count;
        this.count++;
      }
      prefix = Widget.domIdPrefix();
      id2 = prefix ? Widget.createDomId(prefix, id) : id;
      w = this.widgets[id2];
      if (w) {
        return w;
      }
      if (idSpecified) {
        this.createFromId.apply(this, [Widget, id].concat(slice.call(v)));
      } else {
        this.createFromCounter.apply(this, [Widget, id].concat(slice.call(v)));
      }
      return null;
    };

    Widgets.createFromId = function() {
      var Widget, code, id, name, resource, s, spec, v;
      Widget = arguments[0], id = arguments[1], v = 3 <= arguments.length ? slice.call(arguments, 2) : [];
      resource = $blab.resources.find(this.filename);
      name = Widget.handle;
      spec = Widget.initSpec(id, v);
      s = spec.split("\n").join("\n  ");
      code = name + " \"" + id + "\",\n  " + s + "\n";
      resource.containers.fileNodes[0].editor.set(resource.content + "\n" + code);
      return this.queueCompile();
    };

    Widgets.createFromCounter = function() {
      var Widget, id, make, spec, v;
      Widget = arguments[0], id = arguments[1], v = 3 <= arguments.length ? slice.call(arguments, 2) : [];
      spec = Widget.initSpec(id, v);
      make = function() {
        return new Widget(id, eval(CoffeeScript.compile(spec, {
          bare: true
        })));
      };
      return setTimeout(make, 700);
    };

    Widgets.queueCompile = function(t) {
      var resource;
      if (t == null) {
        t = 500;
      }
      resource = $blab.resources.find(this.filename);
      if (this.tCompile) {
        clearTimeout(this.tCompile);
        this.tCompile = null;
      }
      return this.tCompile = setTimeout(((function(_this) {
        return function() {
          resource.compile();
          return $.event.trigger("layoutCompiled");
        };
      })(this)), t);
    };

    Widgets.compute = function() {
      return Computation.compute();
    };

    Widgets.precode = function() {
      var W, n, preamble, precompile, ref;
      preamble = Layout.shortcuts + "\n";
      ref = this.Registry;
      for (n in ref) {
        W = ref[n];
        preamble += W.layoutPreamble() + "\n";
      }
      precompile = {};
      precompile[this.filename] = {
        preamble: preamble,
        postamble: ""
      };
      return $blab.precompile(precompile);
    };

    Widgets.getFromSignature = function(handle, id) {
      var name, prefix, ref, widget;
      ref = this.Registry;
      for (name in ref) {
        Widget = ref[name];
        if (Widget.handle !== handle) {
          continue;
        }
        prefix = Widget.domIdPrefix();
        if (prefix) {
          id = Widget.createDomId(prefix, id);
        }
        widget = this.widgets[id];
        break;
      }
      return widget != null ? widget : null;
    };

    Widgets.setAllUnused = function() {
      var id, ref, results1, w;
      ref = this.widgets;
      results1 = [];
      for (id in ref) {
        w = ref[id];
        results1.push(w.setUsed(false));
      }
      return results1;
    };

    Widgets.removeAllFromCanvas = function() {
      var id, ref, ref1, results1, w;
      ref = this.widgets;
      results1 = [];
      for (id in ref) {
        w = ref[id];
        if (typeof w.destroy === "function") {
          w.destroy();
        }
        results1.push((ref1 = w.mainContainer) != null ? ref1.remove() : void 0);
      }
      return results1;
    };

    return Widgets;

  })();

  WidgetEditor = (function() {
    function WidgetEditor(filename1) {
      this.filename = filename1;
      this.firstDisplay = true;
      this.currentLine = null;
      this.viewPortDisplayed = false;
      this.sliding = false;
      this.next = (function(_this) {
        return function() {};
      })(this);
      this.shown = false;
      this.observers = {
        setViewPort: [],
        clickDelete: [],
        clickCloseButton: []
      };
    }

    WidgetEditor.prototype.init = function(resource1) {
      var ref, ref1;
      this.resource = resource1;
      if (this.editor) {
        return;
      }
      this.editor = (ref = this.resource.containers) != null ? (ref1 = ref.fileNodes) != null ? ref1[0].editor : void 0 : void 0;
      if (!this.editor) {
        return;
      }
      this.aceEditor = this.editor.editor;
      this.setViewPort(null);
      this.editor.onChange((function(_this) {
        return function() {
          return _this.showTip();
        };
      })(this));
      this.aceEditor.setShowFoldWidgets(true);
      this.container = this.editor.container;
      this.parent = this.container.parent();
      this.closeButton = new $blab.utils.CloseButton(this.parent, (function(_this) {
        return function() {
          return _this.trigger("clickCloseButton");
        };
      })(this));
      return this.closeButton.css({
        right: 30
      });
    };

    WidgetEditor.prototype.setViewPort = function(txt) {
      if (!this.editor) {
        return;
      }
      this.viewPortDisplayed = txt !== null;
      this.trigger("setViewPort");
      this.container = this.editor.container;
      this.parent = this.container.parent();
      if (this.firstDisplay) {
        this.container.removeClass("init-editor");
        this.container.css({
          maxHeight: "0px"
        });
        this.parent.show();
        this.editor.show(true);
        if (txt) {
          this.vp(txt, true);
        } else {
          setTimeout(((function(_this) {
            return function() {
              return _this.parent.hide();
            };
          })(this)), 1000);
        }
        return this.firstDisplay = false;
      } else {
        if (this.sliding) {
          return this.next = (function(_this) {
            return function() {
              _this.vp(txt);
              return _this.next = function() {};
            };
          })(this);
        } else {
          return this.vp(txt);
        }
      }
    };

    WidgetEditor.prototype.vp = function(txt, first) {
      var code, i, idx, len, line, lines, spec;
      if (first == null) {
        first = false;
      }
      this.container.css({
        maxHeight: "",
        border: "3px solid #aaf"
      });
      this.start = null;
      spec = this.editor.spec;
      if (txt) {
        code = this.editor.code();
        lines = code.split("\n");
        for (idx = i = 0, len = lines.length; i < len; idx = ++i) {
          line = lines[idx];
          if (line.indexOf(txt) !== -1) {
            this.start = idx;
          }
          if ((this.start != null) && line === "") {
            this.end = idx;
            break;
          }
        }
      }
      if (this.start === null) {
        this.editor.spec.viewPort = false;
        this.sliding = true;
        this.parent.slideUp(400, (function(_this) {
          return function() {
            _this.sliding = false;
            return _this.next();
          };
        })(this));
        return;
      }
      if (!this.parent.hasClass("popup-editor")) {
        this.parent.addClass("popup-editor");
      }
      this.parent.css({
        maxHeight: "0px"
      });
      this.parent.show();
      this.deleteButton();
      this.errorMessage();
      if (this.start) {
        this.editor.show(true);
      }
      spec.viewPort = true;
      spec.startLine = this.start + 1;
      spec.endLine = this.end - this.start + 1 < 20 ? this.end + 1 : this.start + 20;
      this.editor.setViewPort();
      this.editor.editorContainer[0].onwheel = function() {
        return false;
      };
      this.parent.hide();
      this.parent.css({
        maxHeight: ""
      });
      this.sliding = true;
      return this.parent.slideDown(400, (function(_this) {
        return function() {
          _this.sliding = false;
          return _this.next();
        };
      })(this));
    };

    WidgetEditor.prototype.showTip = function() {
      var ref, ref1, ref2;
      if (!((ref = this.del) != null ? ref.is(':empty') : void 0) && this.edited) {
        return;
      }
      this.edited = true;
      if ((ref1 = this.del) != null) {
        ref1.css({
          color: "#aaa"
        });
      }
      return (ref2 = this.del) != null ? ref2.html("Press shift-return to update") : void 0;
    };

    WidgetEditor.prototype.deleteButton = function() {
      var ref, ref1, widget;
      if ((ref = this.del) != null) {
        ref.empty();
      }
      if (!((ref1 = this.del) != null ? ref1.length : void 0)) {
        this.del = $("<div>", {
          css: {
            position: "absolute",
            display: "inline-block",
            top: 5,
            right: 15
          }
        });
        this.editor.editorContainer.append(this.del);
      }
      if (!this.currentId) {
        return;
      }
      widget = Widgets.widgets[this.currentId];
      if (widget != null ? widget.used : void 0) {
        return;
      }
      this.delButton = $("<span>", {
        text: "Delete",
        css: {
          cursor: "pointer"
        },
        click: (function(_this) {
          return function() {
            var selection;
            selection = _this.aceEditor.selection;
            if (!(_this.start && _this.end)) {
              return;
            }
            selection.moveCursorTo(_this.start - 1, 0);
            selection.selectTo(_this.end, 0);
            _this.aceEditor.removeLines();
            _this.editor.run();
            _this.parent.hide();
            return _this.trigger("clickDelete");
          };
        })(this)
      });
      return this.del.append(this.delButton);
    };

    WidgetEditor.prototype.errorMessage = function() {
      var ref, ref1;
      if ((ref = this.message) != null) {
        ref.empty();
      }
      if (!((ref1 = this.message) != null ? ref1.length : void 0)) {
        this.message = $("<div>", {
          css: {
            position: "absolute",
            display: "inline-block",
            top: 5,
            right: 15,
            color: "red"
          }
        });
        return this.editor.editorContainer.append(this.message);
      }
    };

    WidgetEditor.prototype.folding = function() {
      var ed, editor, ref, ref1, resource, session;
      resource = $blab.resources.find(this.filename);
      ed = (ref = resource.containers) != null ? (ref1 = ref.fileNodes) != null ? ref1[0].editor : void 0 : void 0;
      if (!ed) {
        return;
      }
      return;
      editor = ed.editor;
      editor.setShowFoldWidgets(true);
      session = editor.getSession();
      session.on("changeFold", function() {
        return ed.setHeight(session.getScreenLength());
      });
      return session.foldAll(1, 10000, 0);
    };

    WidgetEditor.prototype.on = function(evt, observer) {
      return this.observers[evt].push(observer);
    };

    WidgetEditor.prototype.trigger = function(evt, data) {
      var i, len, observer, ref, results1;
      ref = this.observers[evt];
      results1 = [];
      for (i = 0, len = ref.length; i < len; i++) {
        observer = ref[i];
        results1.push(observer(data));
      }
      return results1;
    };

    return WidgetEditor;

  })();

  Computation = (function() {
    function Computation() {}

    Computation.filename = "compute.coffee";

    Computation.init = function() {
      var p;
      p = this.precode();
      if (!this.initialized) {
        $(document).on("allBlabDefinitionsLoaded", (function(_this) {
          return function(evt, data) {
            _this.defs = data.list;
            _this.precode();
            _this.initialized = true;
            return _this.compute();
          };
        })(this));
      }
      return this.compute();
    };

    Computation.compute = function() {
      var resource;
      resource = $blab.resources.find(this.filename);
      return resource != null ? resource.compile() : void 0;
    };

    Computation.precode = function() {
      var W, WidgetName, preamble, precompile, ref;
      preamble = "";
      ref = Widgets.Registry;
      for (WidgetName in ref) {
        W = ref[WidgetName];
        preamble += W.computePreamble() + "\n";
      }
      if (this.defs) {
        preamble += this.defs + "\n";
      }
      precompile = {};
      precompile[this.filename] = {
        preamble: preamble,
        postamble: ""
      };
      $blab.precompile(precompile);
      return true;
    };

    return Computation;

  })();

  ComputationEditor = (function() {
    ComputationEditor.prototype.filename = "compute.coffee";

    ComputationEditor.prototype.code = {
      slider: "x = slider \"x\"",
      plot: "plot \"my-plot\", x, y",
      table: "table \"my-table\", x, y"
    };

    function ComputationEditor() {
      this.setLine = bind(this.setLine, this);
      this.currentLine = null;
      this.observers = {
        cursorOnWidget: []
      };
      $("#computation-code-heading").html("Computation <div id='computation-hint' class='code-hint'>Press shift-enter to run</div>");
      this.hint = $("#computation-hint");
      this.hint.hide();
      $(document).on("preCompileCoffee", (function(_this) {
        return function(evt, data) {
          var resource, url;
          resource = data.resource;
          url = resource != null ? resource.url : void 0;
          if (url === _this.filename) {
            return _this.init(resource);
          }
        };
      })(this));
      $(document).on("compiledCoffeeScript", (function(_this) {
        return function(evt, data) {
          if (data.url !== _this.filename) {

          }
        };
      })(this));
      $(document).on("clickComputationButton", (function(_this) {
        return function(evt, data) {
          _this.aceEditor.focus();
          return _this.aceEditor.insert(_this.code[data.button] + "\n");
        };
      })(this));
      $(document).on("runCode", (function(_this) {
        return function(evt, data) {
          if (data.filename !== _this.filename) {
            return;
          }
          _this.currentLine = null;
          return setTimeout((function() {
            return _this.setLine();
          }), 400);
        };
      })(this));
      $(document).on("allBlabDefinitionsLoaded", function() {});
      this.changeCursor = (function(_this) {
        return function() {};
      })(this);
    }

    ComputationEditor.prototype.init = function(resource1) {
      var ref, ref1, ref2;
      this.resource = resource1;
      if (this.editor) {
        return;
      }
      this.editor = (ref = this.resource) != null ? (ref1 = ref.containers) != null ? (ref2 = ref1.fileNodes) != null ? ref2[0].editor : void 0 : void 0 : void 0;
      if (!this.editor) {
        return;
      }
      this.aceEditor = this.editor.editor;
      this.currentLine = null;
      this.selection = this.aceEditor.selection;
      return this.selection.on("changeCursor", (function(_this) {
        return function() {
          return _this.changeCursor();
        };
      })(this));
    };

    ComputationEditor.prototype.initFocusBlur = function() {
      this.aceEditor.on("focus", (function(_this) {
        return function() {
          _this.setLine(true);
          _this.changeCursor = function() {
            return _this.setLine();
          };
          return _this.hint.fadeIn();
        };
      })(this));
      return this.aceEditor.on("blur", (function(_this) {
        return function() {
          _this.hint.fadeOut();
          _this.currentLine = null;
          return _this.changeCursor = function() {};
        };
      })(this));
    };

    ComputationEditor.prototype.setLine = function(force) {
      var cursor, ref;
      cursor = (ref = this.selection) != null ? ref.getCursor() : void 0;
      if (force || (cursor != null ? cursor.row : void 0) !== this.currentLine) {
        this.currentLine = cursor != null ? cursor.row : void 0;
        return this.inspectLineForWidget();
      }
    };

    ComputationEditor.prototype.insertCode = function(code) {
      this.aceEditor.focus();
      return this.aceEditor.insert(code);
    };

    ComputationEditor.prototype.inspectLineForWidget = function() {
      var WidgetName, code, handles, handlesStr, id, line, lines, match, matchArray, type, widgetRegex;
      if (!this.editor) {
        return;
      }
      code = this.editor.code();
      lines = code.split("\n");
      line = lines[this.currentLine];
      handles = (function() {
        var ref, results1;
        ref = Widgets.Registry;
        results1 = [];
        for (WidgetName in ref) {
          Widget = ref[WidgetName];
          results1.push(Widget.handle);
        }
        return results1;
      })();
      handlesStr = handles.join("|");
      widgetRegex = new RegExp("(" + handlesStr + ") \"([^\"]*)\"", "g");
      matchArray = widgetRegex.exec(line);
      match = matchArray === null ? null : matchArray[0];
      type = matchArray === null ? null : matchArray[1];
      id = matchArray === null ? null : matchArray[2];
      if (this.tId) {
        clearTimeout(this.tId);
        this.tId = null;
      }
      return this.tId = setTimeout(((function(_this) {
        return function() {
          var widget;
          widget = Widgets.getFromSignature(type, id);
          return _this.trigger("cursorOnWidget", {
            widget: widget,
            match: match
          });
        };
      })(this)), 200);
    };

    ComputationEditor.prototype.on = function(evt, observer) {
      return this.observers[evt].push(observer);
    };

    ComputationEditor.prototype.trigger = function(evt, data) {
      var i, len, observer, ref, results1;
      ref = this.observers[evt];
      results1 = [];
      for (i = 0, len = ref.length; i < len; i++) {
        observer = ref[i];
        results1.push(observer(data));
      }
      return results1;
    };

    return ComputationEditor;

  })();

  ComputationButtons = (function() {
    function ComputationButtons() {
      var run;
      this.container = $("#computation-buttons");
      run = $("<div>", {
        css: {
          display: "inline-block",
          color: "#aaa",
          fontSize: "10pt"
        },
        text: "Press shift-enter to run"
      });
      this.container.append(run);
    }

    ComputationButtons.prototype.create = function(txt) {
      var b;
      b = $("<button>", {
        text: txt
      });
      this.container.append(b);
      return b.click(function() {
        return $.event.trigger("clickComputationButton", {
          button: txt
        });
      });
    };

    return ComputationButtons;

  })();

  MarkdownEditor = (function() {
    MarkdownEditor.prototype.containerId = "#main-markdown";

    MarkdownEditor.prototype.filename = "blab.md";

    MarkdownEditor.prototype.markedUrl = "/puzlet/puzlet/js/marked.min.js";

    MarkdownEditor.prototype.posAttr = "data-pos";

    MarkdownEditor.prototype.widgetsId = "#widgets-container";

    MarkdownEditor.prototype.editorHeight = 15;

    function MarkdownEditor() {
      this.markdownDiv = bind(this.markdownDiv, this);
      this.initMarked();
      this.text = $(this.containerId);
      if (!this.text.length) {
        return;
      }
      this.text.css({
        cursor: "default"
      });
      this.text.mouseup((function(_this) {
        return function(evt) {
          return _this.trigger("clickText", {
            evt: evt,
            start: 0
          });
        };
      })(this));
      this.resources = $blab.resources;
      this.widgetsRendered = false;
      this.firstDisplay = true;
      this.viewPortDisplayed = false;
      this.observers = {
        initialized: [],
        setViewPort: [],
        clickText: [],
        clickCloseButton: []
      };
    }

    MarkdownEditor.prototype.setWidgetsRendered = function() {
      this.widgetsRendered = true;
      if (this.initialized) {
        return this.process();
      }
    };

    MarkdownEditor.prototype.initResource = function() {
      this.resource = this.resources.find(this.filename);
      return console.log("**** MD", this.resource);
    };

    MarkdownEditor.prototype.init = function() {
      var ref, ref1, ref2;
      this.initMarked();
      this.initResource();
      this.editor = (ref = this.resource) != null ? (ref1 = ref.containers) != null ? (ref2 = ref1.fileNodes) != null ? ref2[0].editor : void 0 : void 0 : void 0;
      this.initialized = true;
      if (!this.editor) {
        return;
      }
      this.aceEditor = this.editor.editor;
      this.container = this.editor.container;
      this.parent = this.container.parent();
      this.container.removeClass("init-editor");
      this.editor.onChange((function(_this) {
        return function() {
          return _this.render();
        };
      })(this));
      this.editor.show(false);
      this.closeButton = new $blab.utils.CloseButton(this.parent, (function(_this) {
        return function() {
          return _this.trigger("clickCloseButton");
        };
      })(this));
      this.closeButton.css({
        right: 30
      });
      this.setViewPort(null);
      if (this.widgetsRendered) {
        this.process();
      }
      return this.trigger("initialized");
    };

    MarkdownEditor.prototype.initMarked = function() {
      if (typeof marked === "undefined" || marked === null) {
        return;
      }
      marked.setOptions({
        renderer: new marked.Renderer,
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        sanitize: false,
        smartLists: true,
        smartypants: false
      });
      return this.customizeLinks();
    };

    MarkdownEditor.prototype.customizeLinks = function() {
      return marked.Renderer.prototype.link = function(href, title, text) {
        var out, prot, t;
        if (this.options.sanitize) {
          try {
            prot = decodeURIComponent(unescape(href)).replace(/[^\w:]/g, '').toLowerCase();
          } catch (_error) {
            return '';
          }
          if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
            return '';
          }
        }
        t = title ? " title=\"" + title + "\"" : "";
        return out = "<a href=\"" + href + "\" target=\"_blank\"" + t + ">" + text + "</a>";
      };
    };

    MarkdownEditor.prototype.preProcess = function(file) {
      var codeRe, escCodeMath, escMarkdown, escRe, matchEscape, preText, texRe, text, textCodeEsc, textMdEsc;
      preText = file.replace(/\\\$/g, "\\&pound;").replace(/\\`/g, "\\&sect;").replace(/([^-])([-]{3})([^-])/g, "$1&mdash;$3");
      matchEscape = function(text, RE, escape) {
        var escMatch, match, out, pos, preMatch;
        out = "";
        pos = 0;
        while ((match = RE.exec(text)) !== null) {
          preMatch = text.slice(pos, match.index);
          escMatch = escape(match[0]);
          out += preMatch + escMatch;
          pos = match.index + match[0].length;
        }
        return out += text.slice(pos);
      };
      escCodeMath = function(u) {
        return u.replace(/\$/g, function(m) {
          return "\\&yen;";
        });
      };
      codeRe = /(```)([\s\S]*?)(```)|(`)([\s\S]*?)(`)/mg;
      textCodeEsc = matchEscape(preText, codeRe, escCodeMath);
      escRe = /[\\`\*_\{\}\[\]\(\)#\+\-\.\!]/g;
      escMarkdown = function(u) {
        return u.replace(escRe, function(m) {
          return "\\" + m;
        });
      };
      texRe = /(\$\$)([\s\S]*?)(\$\$)|(\$)([\s\S]*?)(\$)/mg;
      textMdEsc = matchEscape(textCodeEsc, texRe, escMarkdown);
      text = textMdEsc.replace(/\\&pound;/g, "\\$").replace(/\\&sect;/g, "\\`").replace(/\\&yen;/g, "$");
      return text;
    };

    MarkdownEditor.prototype.renderMd = function() {
      var container, i, len, m, md, out;
      this.text.empty();
      $(".rendered-markdown").remove();
      md = this.snippets(this.preProcess(this.resource.content));
      out = [];
      if ($blab.layoutPos) {
        this.text.hide();
      }
      for (i = 0, len = md.length; i < len; i++) {
        m = md[i];
        if (m.pos === 0) {
          this.text.append(m.html);
          out.push(m.html);
        } else {
          container = Layout.getContainer(m.pos, m.order);
          this.markdownDiv(container, m);
        }
      }
      this.setTitle(out.join("\n"));
      return $.event.trigger("htmlOutputUpdated");
    };

    MarkdownEditor.prototype.process = function() {
      console.log("MarkdownEditor::process");
      if (!this.initialized) {
        this.init();
        return;
      }
      this.renderMd();
      return this.trigger("setViewPort");
    };

    MarkdownEditor.prototype.loadMarked = function(callback) {
      console.log("MarkdownEditor::loadMarked");
      this.resources.add({
        url: this.markedUrl
      });
      return this.resources.loadUnloaded(function() {
        return typeof callback === "function" ? callback() : void 0;
      });
    };

    MarkdownEditor.prototype.markdownDiv = function(container, m) {
      var div;
      div = $("<div>", {
        "class": "rendered-markdown",
        css: {
          cursor: "default"
        },
        mouseup: (function(_this) {
          return function(evt) {
            return _this.trigger("clickText", {
              evt: evt,
              start: parseInt(div.attr("data-start"))
            });
          };
        })(this)
      });
      div.attr({
        "data-pos": m.pos,
        "data-order": m.order,
        "data-start": m.start
      });
      div.append(m.html);
      container.append(div);
      return div;
    };

    MarkdownEditor.prototype.setTitle = function() {
      var headings;
      headings = $(":header");
      $blab.title = headings.length ? headings[0].innerHTML : "Puzlet";
      console.log("MarkdownEditor::setTitle", $blab.title);
      if ($blab.title !== "Untitled" && document.title !== $blab.title) {
        $.event.trigger("changeBlabTitle");
        return document.title = $blab.title;
      }
    };

    MarkdownEditor.prototype.setViewPort = function(start) {
      if (!this.editor) {
        return;
      }
      this.viewPortDisplayed = start !== null && start !== false;
      this.trigger("setViewPort");
      this.container = this.editor.container;
      this.parent = this.container.parent();
      if (this.firstDisplay) {
        this.container.removeClass("init-editor");
        this.container.css({
          maxHeight: "0px"
        });
        this.parent.show();
        this.editor.show(true);
        setTimeout(((function(_this) {
          return function() {
            return _this.vp(start, true);
          };
        })(this)), 500);
        return this.firstDisplay = false;
      } else {
        return this.vp(start);
      }
    };

    MarkdownEditor.prototype.vp = function(startChar, first) {
      var spec;
      if (first == null) {
        first = false;
      }
      this.container.css({
        maxHeight: "",
        border: "3px solid #aaf"
      });
      spec = this.editor.spec;
      spec.viewPort = true;
      if (startChar === null || startChar === false) {
        spec.startLine = 1;
        spec.endLine = this.editorHeight;
        this.editor.setViewPort();
        if (first) {
          this.editor.show(false);
          this.parent.hide();
        } else {
          this.parent.slideUp(400);
        }
        return;
      }
      if (!this.parent.hasClass("popup-editor")) {
        this.parent.addClass("popup-editor");
      }
      this.start = (startChar === 0 ? 0 : this.getStartLine(startChar));
      this.end = this.start + this.editorHeight - 1;
      if (first) {
        this.parent.show();
      } else {
        this.parent.slideDown(400);
      }
      this.editor.show(true);
      spec.startLine = this.start + 1;
      spec.endLine = this.end + 1;
      return this.editor.setViewPort();
    };

    MarkdownEditor.prototype.getStartLine = function(startChar) {
      var code, i, idx, l, len, line, lines;
      code = this.editor.code();
      lines = code.split("\n");
      l = 0;
      for (idx = i = 0, len = lines.length; i < len; idx = ++i) {
        line = lines[idx];
        l += line.length + 1;
        if (l > startChar) {
          break;
        }
      }
      return idx - 1;
    };

    MarkdownEditor.prototype.render = function() {
      if (this.renderId == null) {
        this.renderId = null;
      }
      if (this.renderId) {
        clearTimeout(this.renderId);
      }
      return this.renderId = setTimeout(((function(_this) {
        return function() {
          return _this.process();
        };
      })(this)), 500);
    };

    MarkdownEditor.prototype.snippets = function(file) {
      var found, match, md, snippet;
      if (this.RE == null) {
        this.RE = /^\s*`\s*(?:p|pos)\s*:\s*(\d+)\s*,?\s*(?:(?:o|ord|order)\s*:\s*(\d+)\s*)?.*`.*$/mg;
      }
      md = [];
      snippet = function(found) {
        var ref, ref1, ref2, source, start;
        start = (ref = found.start) != null ? ref : 0;
        source = file.slice(start, +found.end + 1 || 9e9);
        return {
          start: start,
          pos: parseInt((ref1 = found.pos) != null ? ref1 : 0),
          order: parseInt((ref2 = found.order) != null ? ref2 : 1),
          source: source,
          html: marked(source)
        };
      };
      found = {};
      while ((match = this.RE.exec(file)) !== null) {
        found.end = match.index - 1;
        md.push(snippet(found));
        found = {
          start: match.index + match[0].length + 1,
          pos: match[1],
          order: match[2]
        };
      }
      found.end = -1;
      md.push(snippet(found));
      return md;
    };

    MarkdownEditor.prototype.on = function(evt, observer) {
      return this.observers[evt].push(observer);
    };

    MarkdownEditor.prototype.trigger = function(evt, data) {
      var i, len, observer, ref, results1;
      ref = this.observers[evt];
      results1 = [];
      for (i = 0, len = ref.length; i < len; i++) {
        observer = ref[i];
        results1.push(observer(data));
      }
      return results1;
    };

    return MarkdownEditor;

  })();

  Layout = (function() {
    function Layout() {}

    Layout.shortcuts = "layout = (spec) -> $blab.Widgets.Layout.set(spec)\nsettings = (spec) -> $blab.blabrApp.setSettings(spec)\npos = (spec) -> $blab.Widgets.Layout.pos(spec)\ntext = (spec) -> $blab.Widgets.Layout.text(spec)";

    Layout.spec = {};

    Layout.currentContainer = null;

    Layout.observers = {
      renderedWidgets: [],
      clickBox: []
    };

    Layout.set = function(spec1) {
      this.spec = spec1;
      return this.render();
    };

    Layout.pos = function(currentContainer) {
      this.currentContainer = currentContainer;
    };

    Layout.render = function() {
      var c, col, d, i, j, label, len, n, o, r, ref, row, widgets;
      if (Array.isArray(this.spec)) {
        this.renderFromArray();
        return;
      }
      if (!Object.keys(this.spec).length) {
        return;
      }
      n = 1;
      widgets = $("#widgets-container");
      widgets.empty();
      ref = this.spec;
      for (label in ref) {
        row = ref[label];
        r = $("<div>", {
          id: label
        });
        widgets.append(r);
        for (i = 0, len = row.length; i < len; i++) {
          col = row[i];
          c = $("<div>", {
            "class": col,
            mouseup: (function(_this) {
              return function(evt) {
                return _this.trigger("clickBox", {
                  evt: evt
                });
              };
            })(this)
          });
          c.addClass("layout-box");
          this.appendNum(c, n);
          n++;
          r.append(c);
          for (d = j = 1; j <= 5; d = ++j) {
            o = $("<div>", {
              "class": "order-" + d
            });
            c.append(o);
          }
        }
        r.append($("<div>", {
          "class": "clear"
        }));
      }
      if (WidgetEditor.viewPortDisplayed || MarkdownEditor.viewPortDisplayed) {
        this.highlight();
      }
      return this.trigger("renderedWidgets");
    };

    Layout.renderFromArray = function() {
      var boxClass, boxId, c, cNum, colNum, d, i, j, k, len, n, numCols, o, r, ref, ref1, rowIdx, widgets;
      if (!this.spec.length) {
        return;
      }
      n = 1;
      widgets = $("#widgets-container");
      widgets.empty();
      ref = this.spec;
      for (rowIdx = i = 0, len = ref.length; i < len; rowIdx = ++i) {
        numCols = ref[rowIdx];
        if (numCols > 4) {
          console.log("Maximum of 4 columns per row");
          numCols = 4;
        }
        r = $("<div>", {
          id: "widget-row-" + (rowIdx + 1)
        });
        widgets.append(r);
        for (colNum = j = 1, ref1 = numCols; 1 <= ref1 ? j <= ref1 : j >= ref1; colNum = 1 <= ref1 ? ++j : --j) {
          cNum = colNum;
          if ($blab.layoutPos) {
            cNum = 1;
            if (n !== parseInt($blab.layoutPos)) {
              n++;
              continue;
            }
          }
          boxId = "widget-box-" + n;
          boxClass = "box-" + numCols + "-" + cNum;
          c = $("<div>", {
            id: boxId,
            "class": boxClass,
            mouseup: (function(_this) {
              return function(evt) {
                if ($(evt.target).hasClass("ui-slider-handle")) {
                  return;
                }
                return _this.trigger("clickBox", {
                  evt: evt
                });
              };
            })(this)
          });
          c.addClass("layout-box");
          r.append(c);
          this.appendNum(c, n);
          n++;
          for (d = k = 1; k <= 5; d = ++k) {
            o = $("<div>", {
              "class": "order-" + d
            });
            c.append(o);
          }
        }
        r.append($("<div>", {
          "class": "clear"
        }));
      }
      if (WidgetEditor.viewPortDisplayed || MarkdownEditor.viewPortDisplayed) {
        this.highlight();
      }
      return this.trigger("renderedWidgets");
    };

    Layout.appendNum = function(c, n) {
      var num;
      num = $("<div>", {
        text: n,
        "class": "layout-box-number",
        css: {
          marginLeft: c.width() - 23
        }
      });
      c.append(num);
      return num.hide();
    };

    Layout.highlight = function(highlight) {
      if (highlight == null) {
        highlight = true;
      }
      if (highlight) {
        $(".layout-box").addClass("layout-highlight");
        return $(".layout-box-number").show();
      } else {
        $(".layout-box-number").hide();
        return $(".layout-box").removeClass("layout-highlight");
      }
    };

    Layout.append = function(element, widget) {
      var container;
      if ((widget != null ? widget.spec.pos : void 0) != null) {
        container = this.getContainer(widget.spec.pos, widget.spec.order);
      } else {
        container = $(this.currentContainer);
      }
      return container.append(element);
    };

    Layout.getContainer = function(pos, order) {
      var container, position;
      if ($.isNumeric(pos)) {
        position = "#widget-box-" + pos;
      } else {
        position = pos;
      }
      container = $(position);
      if (order != null) {
        container = $(container).find(".order-" + order);
      }
      return container;
    };

    Layout.text = function(t) {
      return this.append(t);
    };

    Layout.on = function(evt, observer) {
      return this.observers[evt].push(observer);
    };

    Layout.trigger = function(evt, data) {
      var i, len, observer, ref, results1;
      ref = this.observers[evt];
      results1 = [];
      for (i = 0, len = ref.length; i < len; i++) {
        observer = ref[i];
        results1.push(observer(data));
      }
      return results1;
    };

    return Layout;

  })();

  Definitions = (function() {
    Definitions.prototype.filename = "defs.coffee";

    function Definitions(done) {
      this.done = done;
      this.resources = $blab.resources;
      this.coffee = this.resources.add({
        url: this.filename
      });
      $blab.definitions = {};
      $blab.use = (function(_this) {
        return function(id, callback) {
          if (id == null) {
            id = null;
          }
          return _this.use(id, callback);
        };
      })(this);
      $blab.useRecursive = (function(_this) {
        return function(urls, callback) {
          return _this.useRecursive(urls, callback);
        };
      })(this);
      this.allLoaded = false;
      $blab.defs = {};
      $blab.mainDefs = (function(_this) {
        return function(defs) {
          return _this.main(defs);
        };
      })(this);
      this.precode(this.filename);
      $(document).on("preCompileCoffee", (function(_this) {
        return function(evt, data) {
          if (data.resource.url !== _this.filename) {
            return;
          }
          $blab.defs = {};
          $blab.definitions = {};
          return _this.allLoaded = false;
        };
      })(this));
      this.resources.loadUnloaded((function(_this) {
        return function() {
          return _this.coffee.compile();
        };
      })(this));
    }

    Definitions.prototype.main = function(defs) {
      if (typeof defs === "string") {
        this.directDefs(defs);
        return;
      }
      $blab.definitions[this.filename] = defs;
      defs.loaded = true;
      $blab.defs = defs;
      this.checkLoaded(defs);
      return defs;
    };

    Definitions.prototype.use = function(id, callback) {
      var base, defs, doneLoading, loadDefsCoffee, ref, resource, url;
      if (id == null) {
        id = null;
      }
      loadDefsCoffee = typeof id === "string";
      if (loadDefsCoffee) {
        url = (id ? id + "/" : "") + this.filename;
      } else {
        url = (ref = id.url) != null ? ref : this.extractUrl(id);
      }
      if ((base = $blab.definitions)[url] == null) {
        base[url] = {};
      }
      defs = $blab.definitions[url];
      if (defs.isImport == null) {
        defs.isImport = true;
      }
      if (defs.loaded == null) {
        defs.loaded = false;
      }
      if (defs.loaded) {
        setTimeout(((function(_this) {
          return function() {
            return _this.checkLoaded(defs);
          };
        })(this)), 0);
      } else {
        doneLoading = (function(_this) {
          return function() {
            if (typeof callback === "function") {
              callback(defs);
            }
            return _this.getDefs(url, defs);
          };
        })(this);
        if (loadDefsCoffee) {
          this.loadCoffee(url, function() {
            return doneLoading();
          });
        } else {
          resource = this.resources.add(id);
          this.resources.load((function(resource) {
            return resource.url === url;
          }), function() {
            if (typeof resource.compile === "function") {
              resource.compile();
            }
            return doneLoading();
          });
        }
      }
      return defs;
    };

    Definitions.prototype.extractUrl = function(spec) {
      var fileExt, p, url, v;
      for (p in spec) {
        v = spec[p];
        url = v;
        fileExt = p;
      }
      return url;
    };

    Definitions.prototype.getDefs = function(url, defs) {
      var blabDefs, def, name;
      blabDefs = $blab.definitions[url];
      blabDefs.loaded = true;
      for (name in blabDefs) {
        def = blabDefs[name];
        defs[name] = def;
      }
      return this.checkLoaded(defs);
    };

    Definitions.prototype.checkLoaded = function(defs) {
      var blabDefs, checkAll, def, name, ref, url;
      if (this.allLoaded) {
        return;
      }
      if (!defs.loaded) {
        return false;
      }
      checkAll = true;
      for (name in defs) {
        def = defs[name];
        if (def.isImport && !def.loaded) {
          checkAll = false;
        }
      }
      if (!checkAll) {
        return false;
      }
      ref = $blab.definitions;
      for (url in ref) {
        blabDefs = ref[url];
        if (!blabDefs.loaded) {
          return false;
        }
      }
      this.allDone();
      return true;
    };

    Definitions.prototype.allDone = function() {
      this.processDerived($blab.defs);
      this.allLoaded = true;
      if (this.firstDone != null) {
        return this.triggerAllLoaded();
      } else {
        return this.done((function(_this) {
          return function() {
            _this.firstDone = true;
            return _this.triggerAllLoaded();
          };
        })(this));
      }
    };

    Definitions.prototype.processDerived = function(d) {
      var def, name;
      for (name in d) {
        def = d[name];
        if (def.isImport) {
          this.processDerived(def);
        }
      }
      return typeof d.derived === "function" ? d.derived() : void 0;
    };

    Definitions.prototype.loadCoffee = function(url, callback) {
      var coffee;
      this.removeResource(url);
      if (Gist["import"](url, this.resources, (function(_this) {
        return function(coffee) {
          return _this.doLoad(coffee, callback);
        };
      })(this))) {
        return;
      }
      coffee = this.resources.add({
        url: url
      });
      return this.doLoad(coffee, callback);
    };

    Definitions.prototype.doLoad = function(coffee, callback) {
      var url;
      url = coffee.url;
      this.precode(url);
      return this.resources.load((function(resource) {
        return resource.url === url;
      }), (function(_this) {
        return function() {
          coffee.compile();
          return typeof callback === "function" ? callback() : void 0;
        };
      })(this));
    };

    Definitions.prototype.precode = function(url) {
      var location, preamble, precompile;
      location = url.slice(0, -"/defs.coffee".length);
      preamble = "blabId = \"" + url + "\"\nuse = (id, callback) -> $blab.use(id, callback)\nload = (urls, callback) -> $blab.useRecursive(urls, callback)\nlocation = \"" + location + "\"\ndefs = (d) ->\n  if blabId is \"defs.coffee\"\n    return $blab.mainDefs(d)\n  else\n    $blab.definitions[blabId] = d\n    return d\n\n\n";
      precompile = {};
      precompile[url] = {
        preamble: preamble,
        postamble: ""
      };
      return $blab.precompile(precompile);
    };

    Definitions.prototype.directDefs = function(id) {
      var gist;
      gist = this.use(id);
      return this.main({
        derived: function() {
          var name, property, results1;
          results1 = [];
          for (name in gist) {
            property = gist[name];
            if (!(name === "loaded" || name === "isImport")) {
              results1.push(this[name] = property);
            } else {
              results1.push(void 0);
            }
          }
          return results1;
        }
      });
    };

    Definitions.prototype.triggerAllLoaded = function() {
      return $.event.trigger("allBlabDefinitionsLoaded", {
        list: this.list()
      });
    };

    Definitions.prototype.list = function() {
      var d, def, list, name, ref;
      d = [];
      console.log("$blab.defs", $blab.defs);
      ref = $blab.defs;
      for (name in ref) {
        def = ref[name];
        if (!(name === "loaded" || name === "derived")) {
          d.push(name);
        }
      }
      list = d.join(", ");
      return "{" + list + "} = $blab.defs";
    };

    Definitions.prototype.removeResource = function(url) {
      var coffeeIdx, i, idx, len, r, rArray;
      rArray = this.resources.resources;
      for (idx = i = 0, len = rArray.length; i < len; idx = ++i) {
        r = rArray[idx];
        if (r.url === url) {
          coffeeIdx = idx;
        }
      }
      if (coffeeIdx) {
        return rArray.splice(coffeeIdx, 1);
      }
    };

    Definitions.prototype.useRecursive = function(urls, callback) {
      var idx, u;
      idx = 0;
      u = (function(_this) {
        return function() {
          if (!(idx < urls.length)) {
            if (typeof callback === "function") {
              callback();
            }
            return;
          }
          return _this.use({
            url: urls[idx]
          }, function() {
            idx++;
            return u();
          });
        };
      })(this);
      return u();
    };

    return Definitions;

  })();

  Gist = (function() {
    function Gist() {}

    Gist.id = function(url) {
      var gistId, match, re;
      if (url.indexOf("gist") !== 0) {
        return false;
      }
      re = /^gist:([a-z0-9_-]+)/;
      match = re.exec(url);
      if (!match) {
        return false;
      }
      return gistId = match[1];
    };

    Gist["import"] = function(url, resources, callback) {
      var gistId;
      gistId = this.id(url);
      if (!gistId) {
        return false;
      }
      this.get(gistId, (function(_this) {
        return function(data) {
          var coffee, source;
          source = data.defs;
          coffee = resources.add({
            url: url,
            source: source
          });
          coffee.gistData = data;
          if (coffee.location == null) {
            coffee.location = {};
          }
          coffee.location.inBlab = false;
          return callback(coffee);
        };
      })(this));
      return true;
    };

    Gist.get = function(gistId, callback) {
      var api, url;
      api = "https://api.github.com/gists";
      url = api + "/" + gistId;
      return $.get(url, (function(_this) {
        return function(data) {
          var defs, description, owner, ref, ref1, ref2;
          defs = (ref = (ref1 = data.files) != null ? (ref2 = ref1["defs.coffee"]) != null ? ref2.content : void 0 : void 0) != null ? ref : null;
          description = data.description;
          owner = data.owner.login;
          return typeof callback === "function" ? callback({
            defs: defs,
            description: description,
            owner: owner
          }) : void 0;
        };
      })(this));
    };

    return Gist;

  })();

  DefinitionsEditor = (function() {
    function DefinitionsEditor(coffee1) {
      this.coffee = coffee1;
      $(document).on("aceFilesLoaded", (function(_this) {
        return function() {
          return _this.setHeading();
        };
      })(this));
    }

    DefinitionsEditor.prototype.init = function() {
      var ref, ref1;
      this.editor = (ref = this.coffee.containers) != null ? (ref1 = ref.fileNodes) != null ? ref1[0].editor : void 0 : void 0;
      this.aceEditor = this.editor.editor;
      this.aceEditor.on("focus", (function(_this) {
        return function() {
          return _this.hint.fadeIn();
        };
      })(this));
      return this.aceEditor.on("blur", (function(_this) {
        return function() {
          return _this.hint.fadeOut();
        };
      })(this));
    };

    DefinitionsEditor.prototype.setHeading = function() {
      $("#defs-code-heading").html("Definitions <div id='defs-hint' class='code-hint'>Press shift-enter to run</div>");
      this.hint = $("#defs-hint");
      return this.hint.hide();
    };

    return DefinitionsEditor;

  })();

  Buttons = (function() {
    function Buttons(spec1) {
      var b, ref, ref1, ref2, ref3, ref4, ref5, showCode;
      this.spec = spec1;
      this.container = $("#buttons");
      this.resources = $blab.resources;
      this.isGist = this.resources.getSource != null;
      this.isDemo = this.isGist && this.resources.getSource("demo.coffee");
      this.isStart = !this.isGist;
      this.isBlab = this.isGist && !this.isDemo;
      this.settings = this.spec.getSettings();
      showCode = function() {
        return $("#computation-code-wrapper").show();
      };
      if ((((ref = this.settings) != null ? ref.showCodeOnLoad : void 0) && !$blab.layoutPos) || ((this.isStart || this.isDemo) && (((ref1 = this.settings) != null ? ref1.showCodeOnLoad : void 0) == null))) {
        showCode();
      }
      if (this.isStart) {
        if ((ref2 = this.settings) != null ? ref2.showCodeOnLoad : void 0) {
          showCode();
        }
        this.startButtons();
      }
      if (this.isBlab) {
        $("#top-banner").slideUp();
        if (((ref3 = this.settings) != null ? ref3.showCodeOnLoad : void 0) && !$blab.layoutPos) {
          showCode();
        }
        if ($blab.noLogo) {
          return;
        }
        this.append("<hr>");
        this.logo();
        if ($blab.isEmbedded) {
          return;
        }
        this.docButton();
        this.sep();
        this.sourceButton();
        this.sep();
        this.revisionsButton();
        this.sep();
        this.showForkButton();
        this.sep();
        this.commentsButton();
        this.sep();
        this.embedButton();
        this.sep();
        b = this.linkButton("Edit Page", (function(_this) {
          return function() {
            return _this.makeEditable();
          };
        })(this));
        b.css({
          color: "green",
          fontWeight: "bold",
          textDecoration: "none"
        });
        b.attr({
          title: "Edit blab's layout, text, and widgets."
        });
        this.sep();
        this.moreBlabs();
        if ((ref4 = this.settings) != null ? ref4.showAuthor : void 0) {
          this.author();
        }
      }
      if (this.isDemo) {
        $("#top-banner").slideUp();
        if ((this.settings == null) || ((ref5 = this.settings) != null ? ref5.showCodeOnLoad : void 0) === true) {
          showCode();
        }
        this.makeEditable();
      }
    }

    Buttons.prototype.logo = function() {
      var logo, logoDiv, logoLink, ref, ref1;
      logoDiv = $("<div>", {
        id: "blabr-logo-footer"
      });
      logoLink = $("<a>", {
        href: $blab.isEmbedded ? "//blabr.io?" + ((ref = $blab.github) != null ? (ref1 = ref.gist) != null ? ref1.id : void 0 : void 0) : "//blabr.io"
      });
      if ($blab.isEmbedded) {
        logoLink.attr({
          target: "_blank"
        });
      }
      logoDiv.append(logoLink);
      logo = $("<img>", {
        src: "img/blabr-logo.png"
      });
      logoLink.append(logo).append("Blabr");
      return this.append(logoDiv);
    };

    Buttons.prototype.startButtons = function() {
      this.container.empty();
      this.append("<hr>");
      this.logo();
      return this.docButton();
    };

    Buttons.prototype.makeEditable = function() {
      if (this.isStart) {
        return;
      }
      $("#computation-code-wrapper").show(500);
      this.spec.makeEditable();
      this.startButtons();
      this.appendBlabButtons();
      return this.author();
    };

    Buttons.prototype.appendBlabButtons = function() {
      var s;
      this.sep();
      this.sourceButton();
      this.sep();
      this.revisionsButton();
      this.sep();
      this.showForkButton();
      this.sep();
      this.commentsButton();
      this.sep();
      this.embedButton();
      this.sep();
      s = this.linkButton("Settings", (function(_this) {
        return function() {
          console.log("settings");
          return _this.spec.editSettings();
        };
      })(this));
      return s.attr({
        title: "Edit blab settings."
      });
    };

    Buttons.prototype.docButton = function() {
      return this.linkButton("Doc & Examples", (function(_this) {
        return function() {
          return _this.spec.guide();
        };
      })(this));
    };

    Buttons.prototype.sourceButton = function() {
      var l, ref;
      l = this.linkButton("Source Control", (function() {}), (ref = $blab.github) != null ? ref.sourceLink() : void 0);
      return l.attr({
        title: "View GitHub Gist page for this blab."
      });
    };

    Buttons.prototype.revisionsButton = function() {
      var l, ref;
      l = this.linkButton("Revisions", (function() {}), ((ref = $blab.github) != null ? ref.sourceLink() : void 0) + "/revisions");
      return l.attr({
        title: "View GitHub Gist revisions for this blab."
      });
    };

    Buttons.prototype.commentsButton = function() {
      var l, ref;
      l = this.linkButton("Comment", (function() {}), ((ref = $blab.github) != null ? ref.sourceLink() : void 0) + "#comments");
      return l.attr({
        title: "Comment on this blab in GitHub Gist page."
      });
    };

    Buttons.prototype.embedButton = function() {
      var l;
      l = this.linkButton("Embed", (function(_this) {
        return function() {
          return _this.spec.embed();
        };
      })(this));
      return l.attr({
        title: "Embed this blab, or a single layout box, in your website."
      });
    };

    Buttons.prototype.showForkButton = function() {
      var b;
      b = this.forkButton = this.linkButton("Fork", (function(_this) {
        return function() {
          var forceNew, ref;
          forceNew = true;
          return (ref = $blab.github) != null ? ref.save(forceNew) : void 0;
        };
      })(this));
      return b.attr({
        title: "Create your own version of this blab."
      });
    };

    Buttons.prototype.moreBlabs = function() {
      var b;
      b = this.linkButton("More Blabs...", (function() {}), "//blabr.org");
      b.css({
        color: "blue",
        fontWeight: "bold",
        textDecoration: "none"
      });
      return b.attr({
        title: "See more blabs on blabr.org."
      });
    };

    Buttons.prototype.author = function() {
      var a, author, owner, ref, ref1;
      owner = (ref = $blab.github) != null ? (ref1 = ref.gist) != null ? ref1.gistOwner : void 0 : void 0;
      if (!owner) {
        return;
      }
      author = $("<div>", {
        id: "blab-author",
        text: "Author: ",
        css: {
          float: "right"
        }
      });
      a = $("<a>", {
        text: "@" + owner,
        href: "//gist.github.com/" + owner,
        target: "_blank",
        css: {
          textDecoration: "none"
        }
      });
      author.append(a);
      return this.container.append(author);
    };

    Buttons.prototype.createButton = function(txt) {
      var button;
      button = $("<button>", {
        text: txt
      });
      this.append(button);
      return button;
    };

    Buttons.prototype.linkButton = function(txt, click, href) {
      var button;
      button = $("<a>", {
        click: function() {
          return typeof click === "function" ? click() : void 0;
        },
        text: txt,
        target: "_blank"
      });
      if (href) {
        button.attr({
          href: href
        });
      }
      this.append(button);
      return button;
    };

    Buttons.prototype.append = function(element) {
      return this.container.append(element);
    };

    Buttons.prototype.sep = function() {
      return this.append(" | ");
    };

    return Buttons;

  })();

  EditPageButton = (function() {
    function EditPageButton(container1, callback1) {
      this.container = container1;
      this.callback = callback1;
      this.div = $("<div>", {
        id: "edit-page-button-container",
        css: {
          position: "fixed",
          bottom: 20,
          right: 10,
          zIndex: 300
        }
      });
      this.b = $("<a>", {
        id: "edit-page-button",
        click: (function(_this) {
          return function() {
            _this.b.button("refresh");
            return typeof _this.callback === "function" ? _this.callback() : void 0;
          };
        })(this)
      });
      this.b.button({
        label: "Layout"
      });
      this.div.append(this.b);
      this.container.append(this.div);
      this.hide();
    }

    EditPageButton.prototype.show = function() {
      return this.b.show();
    };

    EditPageButton.prototype.hide = function() {
      return this.b.hide();
    };

    return EditPageButton;

  })();

  Errors = (function() {
    Errors.prototype.errors = {
      "compute.coffee": {
        heading: "Computation",
        error: null
      },
      "defs.coffee": {
        heading: "Definitions",
        error: null
      },
      "layout.coffee": {
        heading: "Layout",
        error: null
      }
    };

    Errors.prototype.containerSel = "#blab-error";

    Errors.prototype.enable = true;

    function Errors() {
      var name;
      this.container = $(this.containerSel);
      this.filenames = (function() {
        var results1;
        results1 = [];
        for (name in this.errors) {
          results1.push(name);
        }
        return results1;
      }).call(this);
      window.onerror = (function(_this) {
        return function(e, url, line) {
          return $blab.windowError = e;
        };
      })(this);
      $(document).on("preCompileCoffee", (function(_this) {
        return function(e, data) {
          return _this.reset(data.resource.url);
        };
      })(this));
      $(document).on("blabError", (function(_this) {
        return function(evt, data) {
          var filename;
          filename = data.source;
          if (!(_this.enable && indexOf.call(_this.filenames, filename) >= 0)) {
            return;
          }
          $blab.windowError = false;
          _this.set(filename, data.error);
          return _this.disp();
        };
      })(this));
    }

    Errors.prototype.reset = function(filename) {
      var e, name, ref, results1;
      ref = this.errors;
      results1 = [];
      for (name in ref) {
        e = ref[name];
        if (filename === name) {
          results1.push(this.errors[name].error = null);
        } else {
          results1.push(void 0);
        }
      }
      return results1;
    };

    Errors.prototype.set = function(filename, error) {
      var e, name, ref, results1;
      ref = this.errors;
      results1 = [];
      for (name in ref) {
        e = ref[name];
        if (filename === name) {
          results1.push(this.errors[name].error = error ? error : null);
        } else {
          results1.push(void 0);
        }
      }
      return results1;
    };

    Errors.prototype.disp = function() {
      var e, error, first, name, ref, show, str;
      this.container.empty();
      new $blab.utils.CloseButton(this.container, (function(_this) {
        return function() {
          return _this.container.hide();
        };
      })(this));
      first = true;
      show = false;
      str = "";
      ref = this.errors;
      for (name in ref) {
        e = ref[name];
        error = e.error;
        if (!error) {
          continue;
        }
        show = true;
        if (!first) {
          str += "<br><br>";
        }
        str += ("<b>" + e.heading + "</b><br>") + error;
        first = false;
      }
      this.container.append(str);
      if (show) {
        return this.container.show();
      } else {
        return this.container.hide();
      }
    };

    return Errors;

  })();

  Loader = (function() {
    function Loader(init) {
      var demo, initDemo, layout, md, tables;
      this.init = init;
      this.resources = $blab.resources;
      this.resources.blockPostLoadFromSpecFile = true;
      layout = this.resources.add({
        url: "layout.coffee"
      });
      md = this.resources.add({
        url: "blab.md"
      });
      tables = this.resources.add({
        url: "tables.json"
      });
      if ((this.resources.getSource == null) || this.resources.getSource("demo.coffee")) {
        demo = this.resources.add({
          url: "demo.coffee"
        });
        initDemo = function() {
          $blab.initDemoRunner();
          return demo.compile();
        };
      }
      this.resources.loadUnloaded((function(_this) {
        return function() {
          return _this.definitions = new Definitions(function(cb) {
            _this.init();
            layout.compile();
            $blab.blabrGuide = new $blab.guideClass;
            if (typeof initDemo === "function") {
              initDemo();
            }
            _this.resources.postLoadFromSpecFile();
            return cb();
          });
        };
      })(this));
    }

    return Loader;

  })();

  BlabEvents = (function() {
    function BlabEvents() {
      this.body = $(document.body);
      this.body.mousedown((function(_this) {
        return function(e) {
          return _this.trigger("blabmousedown");
        };
      })(this));
      this.body.mouseup((function(_this) {
        return function(e) {
          return _this.trigger("blabmouseup");
        };
      })(this));
      document.body.addEventListener("copy", (function(_this) {
        return function(e) {
          return _this.trigger("blabcopy", {
            original: e
          });
        };
      })(this));
      this.unbind(["blabcompute"]);
      this.on("preCompileCoffee", (function(_this) {
        return function(e, data) {
          return _this.unbinds(data.resource.url);
        };
      })(this));
      this.on("compiledCoffeeScript", (function(_this) {
        return function(e, data) {
          return _this.triggers(data.url);
        };
      })(this));
    }

    BlabEvents.prototype.unbinds = function(filename) {
      if (filename === "layout.coffee") {
        this.unbind(["blabcompute"]);
      }
      return this.unbind(["blabmousedown", "blabmouseup", "blabcopy", "blabpaste"]);
    };

    BlabEvents.prototype.triggers = function(filename) {
      var isCompute, isLayout;
      isCompute = filename === "compute.coffee";
      isLayout = filename === "layout.coffee";
      if (!(isCompute || isLayout)) {
        this.trigger("blabError", {
          source: filename,
          error: $blab.windowError
        });
      }
      if (isCompute) {
        return this.trigger("blabcompute");
      }
    };

    BlabEvents.prototype.on = function(name, handler) {
      return $(document).on(name, function(evt, data) {
        return handler(evt, data);
      });
    };

    BlabEvents.prototype.trigger = function(evt, data) {
      return $.event.trigger(evt, data);
    };

    BlabEvents.prototype.unbind = function(events) {
      var e, i, len, results1;
      results1 = [];
      for (i = 0, len = events.length; i < len; i++) {
        e = events[i];
        results1.push($(document).unbind(e));
      }
      return results1;
    };

    return BlabEvents;

  })();

  Background = (function() {
    function Background(background) {
      if (background && screen.width >= 1024 && !$blab.isEmbedded) {
        $(document.body).css({
          backgroundImage: "url(" + background + ")"
        });
        $("#outer-container").addClass("outer-background");
        $("#outer-container").css({
          marginTop: 30,
          paddingTop: 10
        });
        $("#container").css({
          marginTop: 20
        });
      } else {
        $(document.body).css({
          backgroundImage: ""
        });
        $("#outer-container").removeClass("outer-background");
        $("#outer-container").css({
          marginTop: 0,
          paddingTop: 0
        });
        $("#container").css({
          marginTop: 40
        });
      }
    }

    return Background;

  })();

  Settings = (function() {
    function Settings() {}

    Settings.prototype.set = function(spec1) {
      var author, ref, ref1, ref2, ref3;
      this.spec = spec1;
      new Background((ref = this.spec) != null ? ref.background : void 0);
      author = $("#blab-author");
      this.spec.showAuthor = (((ref1 = this.spec) != null ? ref1.showAuthor : void 0) == null) || ((ref2 = this.spec) != null ? ref2.showAuthor : void 0);
      if (author.length) {
        if ((ref3 = this.spec) != null ? ref3.showAuthor : void 0) {
          return author.show();
        } else {
          return author.hide();
        }
      }
    };

    return Settings;

  })();

  EmbedDialog = (function() {
    function EmbedDialog() {
      this.dialog = $("<div>", {
        id: "embed-dialog",
        title: "Embed blab in your website"
      });
      this.dialog.dialog({
        autoOpen: false,
        height: 520,
        width: 500,
        modal: true,
        close: (function(_this) {
          return function() {};
        })(this)
      });
      this.layoutPos = 1;
    }

    EmbedDialog.prototype.show = function() {
      this.content();
      return this.dialog.dialog("open");
    };

    EmbedDialog.prototype.content = function() {
      var box, height, id, title, url, width;
      this.dialog.empty();
      id = $blab.github.gist.id;
      url = "//blabr.io?" + id;
      title = $blab.title;
      width = $("#container").width() + 110;
      height = $("#container").height() + 60;
      this.dialog.append("\n<p>Copy-paste the HTML code into your web page.</p>\n\n<h3>Whole blab</h3>\n<pre><code>&lt;iframe width=" + width + " height=" + height + "\nsrc=\"" + url + "\"\nstyle=\"border: 2px dotted gray;\"&gt;\n&lt;a href=\"" + url + "\"&gt;\n" + title + "\n&lt;/a&gt;&lt;/iframe&gt;</code></pre>\n<h3>Single layout box</h3>");
      this.layoutBoxField();
      box = $("#widget-box-" + this.layoutPos);
      width = box.width() + 30;
      height = box.height() + 70;
      return this.dialog.append("<pre id=\"iframe-code-box\"><code>&lt;iframe width=" + width + " height=" + height + "\nsrc=\"" + url + "&amp;pos=" + this.layoutPos + "\"\nscrolling=\"no\" style=\"border: none;\"&gt;\n&lt;a href=\"" + url + "\"&gt;\n" + title + "\n&lt;/a&gt;&lt;/iframe&gt;</code></pre>");
    };

    EmbedDialog.prototype.layoutBoxField = function() {
      var i, id, label, layoutBoxMenu, n, numBoxes, ref, sel;
      id = "embed-layout-box";
      label = $("<label>", {
        "for": id,
        text: "Layout box",
        css: {
          display: "block",
          float: "left",
          paddingRight: "10px"
        }
      });
      layoutBoxMenu = $("<select>", {
        name: "layout-box",
        id: id,
        value: this.layoutPos,
        change: (function(_this) {
          return function(evt) {
            _this.layoutPos = parseInt(layoutBoxMenu.val());
            return _this.content();
          };
        })(this),
        css: {
          marginBottom: "10px",
          width: "50px"
        }
      });
      numBoxes = $(".layout-box").length;
      for (n = i = 1, ref = numBoxes; 1 <= ref ? i <= ref : i >= ref; n = 1 <= ref ? ++i : --i) {
        sel = n === this.layoutPos ? " selected" : "";
        layoutBoxMenu.append("<option value='" + n + "' " + sel + ">" + n + "</option>");
      }
      return this.dialog.append(label).append(layoutBoxMenu);
    };

    return EmbedDialog;

  })();

  PopupEditorManager = (function() {
    function PopupEditorManager(spec1) {
      var ref;
      this.spec = spec1;
      this.highlightWidget = bind(this.highlightWidget, this);
      ref = this.spec, this.widgetEditor = ref.widgetEditor, this.markdownEditor = ref.markdownEditor;
      this.layoutEnabled = false;
      this.clickedOnComponent = false;
      this.currentComponent = null;
      this.markdownEditor.on("clickText", (function(_this) {
        return function(data) {
          var ref1;
          if (((ref1 = data.evt) != null ? ref1.target.tagName : void 0) === "A") {
            data.evt.stopPropagation();
            return;
          }
          return _this.showMarkdownEditor(data.start);
        };
      })(this));
      this.markdownEditor.on("setViewPort", (function(_this) {
        return function() {
          return _this.highlightLayout();
        };
      })(this));
      this.markdownEditor.on("clickCloseButton", (function(_this) {
        return function() {
          return _this.disableLayout();
        };
      })(this));
      this.widgetEditor.on("setViewPort", (function(_this) {
        return function() {
          return _this.highlightLayout();
        };
      })(this));
      this.widgetEditor.on("clickCloseButton", (function(_this) {
        return function() {
          return _this.disableLayout();
        };
      })(this));
      this.widgetEditor.on("clickDelete", (function(_this) {
        return function() {
          return _this.clickedOnComponent = true;
        };
      })(this));
      this.on("clickWidget", (function(_this) {
        return function(evt, data) {
          return _this.showLayoutEditor({
            widget: data.widget
          });
        };
      })(this));
      Layout.on("clickBox", (function(_this) {
        return function(data) {
          if (data.evt.target.className === "editable-table-cell") {
            return;
          }
          return _this.showLayoutEditor({
            signature: "layout"
          });
        };
      })(this));
      $(document.body).click((function(_this) {
        return function(evt) {
          return _this.hideAll(evt);
        };
      })(this));
      this.on("clickInputWidget", (function(_this) {
        return function(evt, data) {
          return _this.hideLayout();
        };
      })(this));
      this.editPageButton = new EditPageButton($("#edit-page"), (function(_this) {
        return function() {
          return _this.enableLayout();
        };
      })(this));
    }

    PopupEditorManager.prototype.enableLayout = function() {
      this.enable();
      return this.showLayoutEditor({
        signature: "layout",
        clicked: true
      });
    };

    PopupEditorManager.prototype.disableLayout = function() {
      this.enable(false);
      return this.hideLayout();
    };

    PopupEditorManager.prototype.enable = function(enabled) {
      if (enabled == null) {
        enabled = true;
      }
      if (enabled) {
        this.initEnabled = true;
      }
      return this.layoutEnabled = enabled;
    };

    PopupEditorManager.prototype.cursorOnWidget = function(widget) {
      return this.showLayoutEditor({
        widget: widget,
        id: null,
        clicked: false
      });
    };

    PopupEditorManager.prototype.showMarkdownEditor = function(start) {
      if (!this.layoutEnabled) {
        return;
      }
      this.clickedOnComponent = true;
      setTimeout(((function(_this) {
        return function() {
          return _this.clickedOnComponent = false;
        };
      })(this)), 300);
      this.highlightWidget(null);
      this.widgetEditor.setViewPort(null);
      return this.markdownEditor.setViewPort(start);
    };

    PopupEditorManager.prototype.showLayoutEditor = function(spec) {
      var clicked, id, ref, ref1, ref2, signature, type, widget;
      if (!this.layoutEnabled) {
        return;
      }
      if (this.clickedOnComponent) {
        return;
      }
      widget = spec.widget;
      signature = (ref = spec.signature) != null ? ref : null;
      clicked = (ref1 = spec.clicked) != null ? ref1 : true;
      if (widget) {
        type = widget.constructor.handle;
        id = widget.id;
        signature = type + " " + ("\"" + id + "\"");
      }
      if (clicked) {
        this.clickedOnComponent = true;
        setTimeout(((function(_this) {
          return function() {
            return _this.clickedOnComponent = false;
          };
        })(this)), 300);
      }
      this.widgetEditor.setViewPort(signature);
      this.markdownEditor.setViewPort(null);
      this.highlightWidget((ref2 = widget != null ? widget.mainContainer : void 0) != null ? ref2 : null);
      if (widget) {
        this.widgetEditor.currentId = widget.domId();
      }
      if (signature) {
        return this.editPageButton.hide();
      }
    };

    PopupEditorManager.prototype.highlightLayout = function() {
      var displayed;
      displayed = this.widgetEditor.viewPortDisplayed || this.markdownEditor.viewPortDisplayed;
      Layout.highlight(displayed);
      if (displayed) {
        return this.editPageButton.hide();
      }
    };

    PopupEditorManager.prototype.hideLayout = function() {
      this.highlightWidget(null);
      this.widgetEditor.setViewPort(null);
      this.markdownEditor.setViewPort(null);
      if (this.layoutEnabled) {
        return this.editPageButton.hide();
      } else {
        if (this.initEnabled) {
          return setTimeout(((function(_this) {
            return function() {
              return _this.editPageButton.b.fadeIn(500);
            };
          })(this)), 500);
        }
      }
    };

    PopupEditorManager.prototype.highlightWidget = function(component) {
      var ref, ref1;
      if ((ref = this.currentComponent) != null) {
        ref.removeClass("widget-highlight");
      }
      this.currentComponent = component;
      return (ref1 = this.currentComponent) != null ? ref1.addClass("widget-highlight") : void 0;
    };

    PopupEditorManager.prototype.hideAll = function(evt) {
      return setTimeout(((function(_this) {
        return function() {
          if (!(_this.clickedOnComponent || $(evt.target).attr("class"))) {
            _this.hideLayout();
          }
          return _this.clickedOnComponent = false;
        };
      })(this)), 100);
    };

    PopupEditorManager.prototype.on = function(name, handler) {
      return $(document).on(name, function(evt, data) {
        return handler(evt, data);
      });
    };

    return PopupEditorManager;

  })();

  GoogleAnalytics = (function() {
    function GoogleAnalytics() {
      var title;
      this.codeChanged = false;
      title = function() {
        var id, ref, ref1;
        id = (ref = $blab.github) != null ? (ref1 = ref.gist) != null ? ref1.id : void 0 : void 0;
        title = $blab.title === "Untitled" && !id ? "---Home Page---" : $blab.title;
        if (id) {
          return title + " [" + id + "]";
        } else {
          return title;
        }
      };
      this.track("changeBlabTitle", "blab", "view", title);
      this.track("codeNodeChanged", "blab", "firstEdit", title, ((function(_this) {
        return function() {
          return !_this.codeChanged;
        };
      })(this)), ((function(_this) {
        return function() {
          return _this.codeChanged = true;
        };
      })(this)));
      this.track("saveGitHub", "blab", "saveButton", title);
      this.track("createBlab", "blab", "createBlab", title);
      this.track("forkBlab", "blab", "forkBlab", title);
      this.track("runBlabDemo", "blab", "runDemo", title);
    }

    GoogleAnalytics.prototype.track = function(blabEvent, gCat, gEvent, gTextFcn, condition, callback) {
      if (condition == null) {
        condition = (function() {
          return true;
        });
      }
      return $(document).on(blabEvent, (function(_this) {
        return function() {
          var gText;
          gText = gTextFcn();
          if (condition()) {
            if (typeof _gaq !== "undefined" && _gaq !== null) {
              _gaq.push(["_trackEvent", gCat, gEvent, gText]);
            }
          }
          return typeof callback === "function" ? callback() : void 0;
        };
      })(this));
    };

    return GoogleAnalytics;

  })();

  App = (function() {
    function App() {
      new GoogleAnalytics;
      console.log("*** BROWSER", $("html").attr("class"));
      this.blabParams();
      this.loader = new Loader((function(_this) {
        return function() {
          return _this.init();
        };
      })(this));
    }

    App.prototype.blabParams = function() {
      var bare, getParameterByName;
      getParameterByName = function(name) {
        var regex, results;
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
        results = regex.exec(location.search);
        if (results === null) {
          return "";
        } else {
          return decodeURIComponent(results[1].replace(/\+/g, " "));
        }
      };
      bare = getParameterByName("bare");
      $blab.isBare = bare === "1";
      $blab.isEmbedded = $blab.isBare || window.self !== window.top;
      $blab.layoutPos = getParameterByName("pos");
      $blab.noLogo = (getParameterByName("logo") === "0") || $blab.layoutPos;
      if ($blab.isEmbedded) {
        $(".footer").css({
          marginBottom: "0px"
        });
        return $("#buttons").css({
          marginBottom: "0px"
        });
      }
    };

    App.prototype.init = function() {
      new BlabEvents;
      Widgets.initialize();
      this.widgetEditor = Widgets.widgetEditor;
      this.computationEditor = new ComputationEditor;
      this.markdownEditor = new MarkdownEditor;
      this.definitions = this.loader.definitions;
      this.definitionsEditor = new DefinitionsEditor(this.definitions.coffee);
      this.embedDialog = new EmbedDialog;
      this.on("aceFilesLoaded", (function(_this) {
        return function() {
          return _this.initEditors();
        };
      })(this));
      this.beforeCompute((function(_this) {
        return function() {
          Computation.precode();
          return Widgets.setAllUnused();
        };
      })(this));
      Layout.on("renderedWidgets", (function(_this) {
        return function() {
          _this.markdownEditor.initResource();
          _this.markdownEditor.renderMd();
          return _this.markdownEditor.setWidgetsRendered();
        };
      })(this));
      $("#computation-code-wrapper").hide();
      this.on("layoutCompiled", (function(_this) {
        return function() {
          return _this.initButtons();
        };
      })(this));
      this.on("codeNodeChanged", (function(_this) {
        return function() {
          if (_this.changed) {
            return;
          }
          return _this.changed = true;
        };
      })(this));
      this.settingsObj = new Settings;
      this.errors = new Errors;
      return $pz.renderHtml = (function(_this) {
        return function() {
          return _this.markdownEditor.process();
        };
      })(this);
    };

    App.prototype.initEditors = function() {
      this.markdownEditor.process();
      this.definitionsEditor.init();
      this.editors = new PopupEditorManager({
        widgetEditor: this.widgetEditor,
        markdownEditor: this.markdownEditor
      });
      this.computationEditor.on("cursorOnWidget", (function(_this) {
        return function(data) {
          var ref, ref1;
          if (((((ref = _this.settings) != null ? ref.popupWidgetEditor : void 0) != null) && !((ref1 = _this.settings) != null ? ref1.popupWidgetEditor : void 0)) || _this.disablePopupWidgetEditor) {
            return;
          }
          return _this.editors.cursorOnWidget(data.widget);
        };
      })(this));
      setTimeout(((function(_this) {
        return function() {
          return _this.computationEditor.initFocusBlur();
        };
      })(this)), 900);
      if ($blab.resources.getSource == null) {
        return this.editors.enable();
      }
    };

    App.prototype.initButtons = function() {
      if (this.buttons) {
        return;
      }
      return this.buttons = new Buttons({
        guide: (function(_this) {
          return function() {
            return $blab.blabrGuide.slideToggle();
          };
        })(this),
        embed: (function(_this) {
          return function() {
            return _this.embedDialog.show();
          };
        })(this),
        makeEditable: (function(_this) {
          return function() {
            var ref;
            return (ref = _this.editors) != null ? ref.enable() : void 0;
          };
        })(this),
        editSettings: (function(_this) {
          return function() {
            var ref, ref1;
            if ((ref = _this.editors) != null) {
              ref.enable();
            }
            return (ref1 = _this.editors) != null ? ref1.showLayoutEditor({
              signature: "settings"
            }) : void 0;
          };
        })(this),
        getSettings: (function(_this) {
          return function() {
            return _this.settings;
          };
        })(this)
      });
    };

    App.prototype.setSettings = function(settings) {
      this.settings = settings;
      return this.settingsObj.set(this.settings);
    };

    App.prototype.beforeCompute = function(handler) {
      return this.on("preCompileCoffee", (function(_this) {
        return function(e, data) {
          if (data.resource.url !== "compute.coffee") {
            return;
          }
          return handler();
        };
      })(this));
    };

    App.prototype.forceEditorRendering = function() {
      return setTimeout(((function(_this) {
        return function() {
          var ref;
          if ((ref = _this.computationEditor.aceEditor) != null) {
            ref.focus();
          }
          return setTimeout((function() {
            var ref1;
            if ((ref1 = _this.computationEditor.aceEditor) != null) {
              ref1.blur();
            }
            _this.definitionsEditor.aceEditor.focus();
            return setTimeout((function() {
              _this.definitionsEditor.aceEditor.blur();
              return _this.computationEditor.initFocusBlur();
            }), 300);
          }), 300);
        };
      })(this)), 300);
    };

    App.prototype.on = function(name, handler) {
      return $(document).on(name, function(evt, data) {
        return handler(evt, data);
      });
    };

    return App;

  })();

  $blab.AppClass = App;

  $blab.Layout = Layout;

  $blab.Widget = Widget;

  $blab.Widgets = Widgets;

  codeSections = function() {
    var comp, layout, predef, ps, removeInit, title, toggleHeading;
    title = "Show/hide code";
    comp = $("#computation-code-section");
    layout = $("#layout-code-section");
    predef = $(".predefined-code");
    predef.hide();
    $("#computation-code-heading").click(function() {
      return comp.toggle(500);
    });
    $("#layout-code-heading").click(function() {
      return layout.toggle(500);
    });
    ps = true;
    toggleHeading = function() {
      return ps = !ps;
    };
    toggleHeading();
    removeInit = function() {
      var editor, ev, ref, ref1, ref2, ref3, resource;
      resource = $blab.resources.find("predefine.coffee");
      editor = resource != null ? (ref = resource.containers) != null ? (ref1 = ref.fileNodes) != null ? ref1[0].editor : void 0 : void 0 : void 0;
      if (editor != null) {
        editor.container.removeClass("init-editor");
      }
      ev = resource != null ? (ref2 = resource.containers) != null ? (ref3 = ref2.evalNodes) != null ? ref3[0].editor : void 0 : void 0 : void 0;
      return ev != null ? ev.container.removeClass("init-editor") : void 0;
    };
    return $("#predefined-code-heading").click(function() {
      removeInit();
      predef.toggle(500);
      return toggleHeading();
    });
  };

  TextEditor = (function() {
    TextEditor.prototype.containerId = "#main-text";

    TextEditor.prototype.filename = "text.html";

    TextEditor.prototype.wikyUrl = "/puzlet/puzlet/js/wiky.js";

    TextEditor.prototype.posAttr = "data-pos";

    TextEditor.prototype.widgetsId = "#widgets-container";

    function TextEditor() {
      this.text = $(this.containerId);
      if (!this.text.length) {
        return;
      }
      this.text.css({
        cursor: "default"
      });
      this.text.click((function(_this) {
        return function() {
          return _this.toggle();
        };
      })(this));
      this.resources = $blab.resources;
      this.widgetsRendered = false;
    }

    TextEditor.prototype.setWidgetsRendered = function() {
      this.widgetsRendered = true;
      if (typeof Wiky !== "undefined" && Wiky !== null) {
        return this.process();
      }
    };

    TextEditor.prototype.loadWiky = function(callback) {
      console.log("TextEditor::loadWiky");
      this.resources.add({
        url: this.wikyUrl
      });
      return this.resources.loadUnloaded(function() {
        return typeof callback === "function" ? callback() : void 0;
      });
    };

    TextEditor.prototype.init = function() {
      var ref, ref1, ref2;
      console.log("TextEditor::init");
      this.resource = this.resources.find(this.filename);
      this.editor = (ref = this.resource) != null ? (ref1 = ref.containers) != null ? (ref2 = ref1.fileNodes) != null ? ref2[0].editor : void 0 : void 0 : void 0;
      if (!this.editor) {
        return;
      }
      this.editor.container.removeClass("init-editor");
      this.editor.onChange((function(_this) {
        return function() {
          return _this.render();
        };
      })(this));
      this.editor.show(false);
      if (this.widgetsRendered) {
        return this.process();
      }
    };

    TextEditor.prototype.render = function() {
      if (this.renderId == null) {
        this.renderId = null;
      }
      if (this.renderId) {
        clearTimeout(this.renderId);
      }
      return this.renderId = setTimeout(((function(_this) {
        return function() {
          return _this.process();
        };
      })(this)), 500);
    };

    TextEditor.prototype.process = function() {
      var html;
      console.log("TextEditor::process");
      if (typeof Wiky === "undefined" || Wiky === null) {
        this.loadWiky((function(_this) {
          return function() {
            return _this.init();
          };
        })(this));
        return;
      }
      console.log("TextEditor::process/Wiky");
      this.text.empty();
      html = Wiky.toHtml(this.resource.content);
      if (html === "") {
        return;
      }
      this.text.append(html);
      this.setTitle();
      this.positionText();
      return $.event.trigger("htmlOutputUpdated");
    };

    TextEditor.prototype.setTitle = function() {
      var headings;
      headings = $(":header");
      if (!headings.length) {
        return;
      }
      $blab.title = headings[0].innerHTML;
      return document.title = $blab.title;
    };

    TextEditor.prototype.positionText = function() {
      var append, current, divs, sel, widgets;
      sel = "div[" + this.posAttr + "]";
      widgets = $(this.widgetsId);
      current = widgets.find(sel);
      current.remove();
      divs = this.text.find(sel);
      if (!divs.length) {
        return;
      }
      append = (function(_this) {
        return function() {
          var i, len, p, results1;
          results1 = [];
          for (i = 0, len = divs.length; i < len; i++) {
            p = divs[i];
            results1.push($($(p).attr(_this.posAttr)).append($(p)));
          }
          return results1;
        };
      })(this);
      if (widgets.length) {
        return append();
      } else {
        return setTimeout((function() {
          return append();
        }), 1000);
      }
    };

    TextEditor.prototype.toggle = function() {
      if (!this.editor) {
        return;
      }
      if (this.editorShown == null) {
        this.editorShown = false;
      }
      this.editor.show(!this.editorShown);
      return this.editorShown = !this.editorShown;
    };

    return TextEditor;

  })();

}).call(this);
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
(function() {
  var Credits, Guide, GuideControl, content;

  console.log("Blabr Guide");

  content = {
    syntaxTips: ["k = slider \"k\"", "table \"my-table\", x, y", "x = table \"t\", [], [-> z]", "plot \"my-plot\", x, y", "x = [1, 2, 3]", "x = [1..3]", "x = linspace 1, 3, 3", "square = (x) -> x*x", "# comment"],
    demos: [
      {
        text: "Basic math",
        id: "58ef3095767efcdf1977"
      }, {
        text: "Basic plot",
        id: "3b19d13e5eaa11a4a540"
      }, {
        text: "Text",
        id: "277bf74a4b1e7364df29"
      }, {
        text: "Tables",
        id: "0a248098997a6f95635c"
      }, {
        text: "Sliders",
        id: "9b6fbf80ed838d1e1cef"
      }, {
        text: "Layout of components",
        id: "c7837da7dd136710e2ba"
      }, {
        text: "Function definitions",
        id: "e8457f2a62b292e1d0a2"
      }, {
        text: "Importing definitions",
        id: "d1889126b58315ba2239"
      }, {
        text: "Programming",
        id: "01df7d9c87dab79fccf0"
      }, {
        text: "Example: lunar crust I",
        id: "2c7e4d04634ee1d2aa40"
      }, {
        text: "Example: lunar crust II",
        id: "e9f3424ada245162d24f"
      }
    ],
    examples: [
      {
        text: "Mystery Curve",
        img: "//blabr.github.io/img/mystery-curve.png",
        id: "4bd90a0b619bff7707b3"
      }, {
        text: "Basic Properties of Mars as a Planetary Body",
        img: "//spacemath.github.io/resources/images/thumbs/mars2.png",
        id: "3df6e2368e89a8c3f780"
      }, {
        text: "Exploring the Interior of Pluto",
        img: "//spacemath.github.io/resources/images/thumbs/planet-core.png",
        id: "d6927773b95652943582"
      }, {
        text: "Star Trek's solitons are real",
        img: "//blabr.github.io/img/solitons.png",
        id: "2a55efd937f9d3e87d29"
      }, {
        text: "A toy problem for compressive sensing",
        img: "//blabr.github.io/img/cs-intro.png",
        id: "e8a066234715f21c21fd"
      }
    ],
    references: [
      {
        text: "Widgets",
        id: "ff66265ccd580d6a9b04"
      }, {
        text: "Language overview",
        id: "cac35c998a6640457c39"
      }, {
        text: "Definitions and imports",
        id: "919000f98b993fcfeb81"
      }, {
        text: "Math functions",
        id: "c19c10d7828efd13ddee"
      }, {
        text: "Vectors and matrices",
        id: "cb9ef53d61658dcedd45"
      }, {
        text: "Complex numbers",
        id: "c182256cc10492eb43b5"
      }, {
        text: "Linear algebra and numeric",
        id: "19516c877c92649672f4"
      }, {
        text: "Utilities",
        id: "ccd42df2e696df7e9317"
      }
    ],
    credits: [
      {
        name: "Ace",
        url: "ace.c9.io"
      }, {
        name: "CoffeeScript",
        url: "coffeescript.org"
      }, {
        name: "MathJax",
        url: "mathjax.org"
      }, {
        name: "numericjs",
        url: "numericjs.com"
      }, {
        name: "Flot",
        url: "flotcharts.org"
      }, {
        name: "PaperScript",
        url: "paperjs.org/reference/paperscript"
      }, {
        name: "jQuery",
        url: "jquery.com"
      }, {
        name: "GitHub",
        url: "github.com"
      }, {
        name: "SpaceMath",
        url: "spacemath.gsfc.nasa.gov"
      }
    ]
  };

  Guide = (function() {
    function Guide() {
      var refsCol;
      this.container = $("#demo-list");
      this.container.hide();
      this.isMain = $blab.resources.getSource == null;
      this.container.empty();
      new $blab.utils.CloseButton(this.container, (function(_this) {
        return function() {
          return _this.container.slideUp(500, function() {
            var ref;
            return (ref = _this.guideControl) != null ? ref.show() : void 0;
          });
        };
      })(this));
      this.tips();
      this.demos();
      this.examples();
      refsCol = this.references();
      new Credits(this.container, refsCol, content.credits);
    }

    Guide.prototype.append = function(txt) {
      return this.container.append(txt);
    };

    Guide.prototype.slideDown = function() {
      return this.container.slideDown(500, (function(_this) {
        return function() {
          return _this.scroll();
        };
      })(this));
    };

    Guide.prototype.slideToggle = function() {
      return this.container.slideToggle(500, (function(_this) {
        return function() {
          return _this.scroll();
        };
      })(this));
    };

    Guide.prototype.scroll = function() {
      var cTop, ch, diff, wTop, wh;
      if (!this.container.is(":visible")) {
        return;
      }
      wTop = $(window).scrollTop();
      cTop = this.container.offset().top;
      wh = $(window).height();
      ch = this.container.height();
      diff = cTop + ch - (wTop + wh);
      if (diff > 0) {
        return $("html, body").animate({
          scrollTop: wTop + diff + 70
        }, 400);
      }
    };

    Guide.prototype.tips = function() {
      var i, len, ref, str, tip;
      str = "";
      ref = content.syntaxTips;
      for (i = 0, len = ref.length; i < len; i++) {
        tip = ref[i];
        str += "<code>" + tip + "</code><br>";
      }
      return this.append("<div class=\"guide-col\">\n  <h3>Quick Syntax Tips</h3>\n  " + str + "\n</div>");
    };

    Guide.prototype.demos = function() {
      return this.append("<div class=\"guide-col\">\n  <h3>Demos</h3>\n  " + ($blab.demoListHtml({
        blank: true
      })) + "\n</div>");
    };

    Guide.prototype.examples = function() {
      var example, i, len, ref, str;
      str = "";
      ref = content.examples;
      for (i = 0, len = ref.length; i < len; i++) {
        example = ref[i];
        str += "<div class=\"gist\">\n<a href='//blabr.io?" + example.id + "' target=\"_blank\">\n<img src='" + example.img + "'>\n<p>" + example.text + "</p>\n</a>\n</div>";
      }
      return this.append("<div class=\"guide-col\">\n  <h3>Examples</h3>\n  " + str + "\n  <a href=\"//blabr.org\" target=\"_blank\">More blabs<a>\n</div>");
    };

    Guide.prototype.references = function() {
      var col;
      col = $("<div>", {
        "class": "guide-col"
      });
      this.append(col);
      col.append("<h3>Reference</h3>\n" + ($blab.refListHtml({
        blank: true
      })) + "\n<br>\n<a href=\"//coffeescript.org\" target=\"_blank\">CoffeeScript language guide</a>\n<br><br>");
      return col;
    };

    return Guide;

  })();

  GuideControl = (function() {
    function GuideControl(guide) {
      this.guide = guide;
      this.tagline = $("#blabr-tagline");
      this.tagline.show();
      this.button = $("#demo-list-button");
      this.button.click((function(_this) {
        return function() {
          return typeof _this.click === "function" ? _this.click() : void 0;
        };
      })(this));
      this.show();
    }

    GuideControl.prototype.show = function(show) {
      if (show == null) {
        show = true;
      }
      this.click = function() {};
      this.tagline.animate({
        opacity: (show ? 1 : 0)
      });
      this.tagline.css({
        cursor: (show ? "text" : "default")
      });
      this.button.css({
        cursor: (show ? "pointer" : "default")
      });
      if (!show) {
        return;
      }
      return this.click = (function(_this) {
        return function() {
          _this.show(false);
          return _this.guide.slideDown(500);
        };
      })(this);
    };

    return GuideControl;

  })();

  Credits = (function() {
    function Credits(container, containerButton, credits) {
      var credit, l, str;
      this.container = container;
      this.containerButton = containerButton;
      this.credits = credits;
      this.button = $("<button>", {
        text: "Credits",
        click: (function(_this) {
          return function() {
            return _this.credits.slideToggle(500);
          };
        })(this),
        css: {
          marginLeft: "10px"
        }
      });
      this.footer = $("<div>", {
        "class": "guide-footer"
      });
      this.container.append(this.footer);
      l = function(txt, url) {
        return "<a href='//" + url + "' target='_blank'>" + txt + "</a>";
      };
      str = ((function() {
        var i, len, ref, results;
        ref = this.credits;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          credit = ref[i];
          results.push(l(credit.name, credit.url));
        }
        return results;
      }).call(this)).join(", ");
      this.footer.append("<div style=\"display: inline-block\">\n<a href='//blabr.org' target='_blank'>Blabr</a> \nis developed by \n<a href=\"//github.com/mvclark\" target=\"_blank\">Martin Clark</a> and \n<a href=\"//github.com/garyballantyne\" target=\"_blank\">Gary Ballantyne</a> (Haulashore Limited) \nas part of the <a href='//github.com/puzlet' target='_blank'>Puzlet</a> project.\n<a href=\"//twitter.com/blabrnet\" target=\"_blank\"><img src=\"img/TwitterLogo.png\" height=24 style=\"vertical-align: middle\"/>Follow us on Twitter</a>.\n</div>");
      this.credits = $("<div>", {
        html: "Thanks to: " + str + "."
      });
      this.footer.append(this.button).append(this.credits);
      this.credits.hide();
    }

    return Credits;

  })();

  $blab.demoListHtml = function(spec) {
    var c, href, html, i, item, len, ref, t;
    html = "<ul>\n";
    ref = content.demos;
    for (i = 0, len = ref.length; i < len; i++) {
      item = ref[i];
      c = item.id === spec.highlight ? "demo-list-item-highlight" : "";
      t = spec.blank ? " target = '_blank'" : "";
      href = item.id ? "?" + item.id : "";
      html += "<li><a class='" + c + "' href='" + href + "'" + t + ">" + item.text + "</a></li>\n";
    }
    return html += "</ul>\n";
  };

  $blab.refListHtml = function(spec) {
    var html, i, item, len, ref, t;
    html = "<ul>\n";
    ref = content.references;
    for (i = 0, len = ref.length; i < len; i++) {
      item = ref[i];
      t = spec.blank ? " target = '_blank'" : "";
      html += "<li><a href='?" + item.id + "'" + t + ">" + item.text + "</a></li>\n";
    }
    return html += "</ul>\n";
  };

  $blab.guideClass = Guide;

}).call(this);
// The MIT License (MIT)

// Typed.js | Copyright (c) 2014 Matt Boldt | www.mattboldt.com

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.




! function($) {

    "use strict";

    var Typed = function(el, options) {

        // chosen element to manipulate text
        this.el = $(el);

        // options
        this.options = $.extend({}, $.fn.typed.defaults, options);

        // attribute to type into
        this.isInput = this.el.is('input');
        this.attr = this.options.attr;

        // show cursor
        this.showCursor = this.isInput ? false : this.options.showCursor;

        // text content of element
        this.elContent = this.attr ? this.el.attr(this.attr) : this.el.text()

        // html or plain text
        this.contentType = this.options.contentType;

        // typing speed
        this.typeSpeed = this.options.typeSpeed;

        // add a delay before typing starts
        this.startDelay = this.options.startDelay;

        // backspacing speed
        this.backSpeed = this.options.backSpeed;

        // amount of time to wait before backspacing
        this.backDelay = this.options.backDelay;

        // div containing strings
        this.stringsElement = this.options.stringsElement;

        // input strings of text
        this.strings = this.options.strings;

        // character number position of current string
        this.strPos = 0;

        // current array position
        this.arrayPos = 0;

        // number to stop backspacing on.
        // default 0, can change depending on how many chars
        // you want to remove at the time
        this.stopNum = 0;

        // Looping logic
        this.loop = this.options.loop;
        this.loopCount = this.options.loopCount;
        this.curLoop = 0;

        // for stopping
        this.stop = false;

        // custom cursor
        this.cursorChar = this.options.cursorChar;

        // shuffle the strings
        this.shuffle = this.options.shuffle;
        // the order of strings
        this.sequence = [];

        // All systems go!
        this.build();
    };

    Typed.prototype = {

        constructor: Typed

        ,
        init: function() {
            // begin the loop w/ first current string (global self.strings)
            // current string will be passed as an argument each time after this
            var self = this;
            self.timeout = setTimeout(function() {
                for (var i=0;i<self.strings.length;++i) self.sequence[i]=i;

                // shuffle the array if true
                if(self.shuffle) self.sequence = self.shuffleArray(self.sequence);

                // Start typing
                self.typewrite(self.strings[self.sequence[self.arrayPos]], self.strPos);
            }, self.startDelay);
        }

        ,
        build: function() {
            var self = this;
            // Insert cursor
            if (this.showCursor === true) {
                this.cursor = $("<span class=\"typed-cursor\">" + this.cursorChar + "</span>");
                this.el.after(this.cursor);
            }
            if (this.stringsElement) {
                self.strings = [];
                this.stringsElement.hide();
                var strings = this.stringsElement.find('p');
                $.each(strings, function(key, value){
                    self.strings.push($(value).html());
                });
            }
            this.init();
        }

        // pass current string state to each function, types 1 char per call
        ,
        typewrite: function(curString, curStrPos) {
            // exit when stopped
            if (this.stop === true) {
                return;
            }

            // varying values for setTimeout during typing
            // can't be global since number changes each time loop is executed
            var humanize = Math.round(Math.random() * (100 - 30)) + this.typeSpeed;
            var self = this;

            // ------------- optional ------------- //
            // backpaces a certain string faster
            // ------------------------------------ //
            // if (self.arrayPos == 1){
            //  self.backDelay = 50;
            // }
            // else{ self.backDelay = 500; }

            // contain typing function in a timeout humanize'd delay
            self.timeout = setTimeout(function() {
                // check for an escape character before a pause value
                // format: \^\d+ .. eg: ^1000 .. should be able to print the ^ too using ^^
                // single ^ are removed from string
                var charPause = 0;
                var substr = curString.substr(curStrPos);
                if (substr.charAt(0) === '^') {
                    var skip = 1; // skip atleast 1
                    if (/^\^\d+/.test(substr)) {
                        substr = /\d+/.exec(substr)[0];
                        skip += substr.length;
                        charPause = parseInt(substr);
                    }

                    // strip out the escape character and pause value so they're not printed
                    curString = curString.substring(0, curStrPos) + curString.substring(curStrPos + skip);
                }

                if (self.contentType === 'html') {
                    // skip over html tags while typing
                    var curChar = curString.substr(curStrPos).charAt(0)
                    if (curChar === '<' || curChar === '&') {
                        var tag = '';
                        var endTag = '';
                        if (curChar === '<') {
                            endTag = '>'
                        } else {
                            endTag = ';'
                        }
                        while (curString.substr(curStrPos).charAt(0) !== endTag) {
                            tag += curString.substr(curStrPos).charAt(0);
                            curStrPos++;
                        }
                        curStrPos++;
                        tag += endTag;
                    }
                }

                // timeout for any pause after a character
                self.timeout = setTimeout(function() {
                    if (curStrPos === curString.length) {
                        // fires callback function
                        self.options.onStringTyped(self.arrayPos);

                        // is this the final string
                        if (self.arrayPos === self.strings.length - 1) {
                            // animation that occurs on the last typed string
                            self.options.callback();

                            self.curLoop++;

                            // quit if we wont loop back
                            if (self.loop === false || self.curLoop === self.loopCount)
                                return;
                        }

                        self.timeout = setTimeout(function() {
                            self.backspace(curString, curStrPos);
                        }, self.backDelay);
                    } else {

                        /* call before functions if applicable */
                        if (curStrPos === 0)
                            self.options.preStringTyped(self.arrayPos);

                        // start typing each new char into existing string
                        // curString: arg, self.el.html: original text inside element
                        var nextString = curString.substr(0, curStrPos + 1);
                        if (self.attr) {
                            self.el.attr(self.attr, nextString);
                        } else {
                            if (self.isInput) {
                                self.el.val(nextString);
                            } else if (self.contentType === 'html') {
                                self.el.html(nextString);
                            } else {
                                self.el.text(nextString);
                            }
                        }

                        // add characters one by one
                        curStrPos++;
                        // loop the function
                        self.typewrite(curString, curStrPos);
                    }
                    // end of character pause
                }, charPause);

                // humanized value for typing
            }, humanize);

        }

        ,
        backspace: function(curString, curStrPos) {
            // exit when stopped
            if (this.stop === true) {
                return;
            }

            // varying values for setTimeout during typing
            // can't be global since number changes each time loop is executed
            var humanize = Math.round(Math.random() * (100 - 30)) + this.backSpeed;
            var self = this;

            self.timeout = setTimeout(function() {

                // ----- this part is optional ----- //
                // check string array position
                // on the first string, only delete one word
                // the stopNum actually represents the amount of chars to
                // keep in the current string. In my case it's 14.
                // if (self.arrayPos == 1){
                //  self.stopNum = 14;
                // }
                //every other time, delete the whole typed string
                // else{
                //  self.stopNum = 0;
                // }

                if (self.contentType === 'html') {
                    // skip over html tags while backspacing
                    if (curString.substr(curStrPos).charAt(0) === '>') {
                        var tag = '';
                        while (curString.substr(curStrPos).charAt(0) !== '<') {
                            tag -= curString.substr(curStrPos).charAt(0);
                            curStrPos--;
                        }
                        curStrPos--;
                        tag += '<';
                    }
                }

                // ----- continue important stuff ----- //
                // replace text with base text + typed characters
                var nextString = curString.substr(0, curStrPos);
                if (self.attr) {
                    self.el.attr(self.attr, nextString);
                } else {
                    if (self.isInput) {
                        self.el.val(nextString);
                    } else if (self.contentType === 'html') {
                        self.el.html(nextString);
                    } else {
                        self.el.text(nextString);
                    }
                }

                // if the number (id of character in current string) is
                // less than the stop number, keep going
                if (curStrPos > self.stopNum) {
                    // subtract characters one by one
                    curStrPos--;
                    // loop the function
                    self.backspace(curString, curStrPos);
                }
                // if the stop number has been reached, increase
                // array position to next string
                else if (curStrPos <= self.stopNum) {
                    self.arrayPos++;

                    if (self.arrayPos === self.strings.length) {
                        self.arrayPos = 0;

                        // Shuffle sequence again
                        if(self.shuffle) self.sequence = self.shuffleArray(self.sequence);

                        self.init();
                    } else
                        self.typewrite(self.strings[self.sequence[self.arrayPos]], curStrPos);
                }

                // humanized value for typing
            }, humanize);

        }
        /**
         * Shuffles the numbers in the given array.
         * @param {Array} array
         * @returns {Array}
         */
        ,shuffleArray: function(array) {
            var tmp, current, top = array.length;
            if(top) while(--top) {
                current = Math.floor(Math.random() * (top + 1));
                tmp = array[current];
                array[current] = array[top];
                array[top] = tmp;
            }
            return array;
        }

        // Start & Stop currently not working

        // , stop: function() {
        //     var self = this;

        //     self.stop = true;
        //     clearInterval(self.timeout);
        // }

        // , start: function() {
        //     var self = this;
        //     if(self.stop === false)
        //        return;

        //     this.stop = false;
        //     this.init();
        // }

        // Reset and rebuild the element
        ,
        reset: function() {
            var self = this;
            clearInterval(self.timeout);
            var id = this.el.attr('id');
            this.el.after('<span id="' + id + '"/>')
            this.el.remove();
            if (typeof this.cursor !== 'undefined') {
                this.cursor.remove();
            }
            // Send the callback
            self.options.resetCallback();
        }

    };

    $.fn.typed = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('typed'),
                options = typeof option == 'object' && option;
            if (!data) $this.data('typed', (data = new Typed(this, options)));
            if (typeof option == 'string') data[option]();
        });
    };

    $.fn.typed.defaults = {
        strings: ["These are the default values...", "You know what you should do?", "Use your own!", "Have a great day!"],
        stringsElement: null,
        // typing speed
        typeSpeed: 0,
        // time before typing starts
        startDelay: 0,
        // backspacing speed
        backSpeed: 0,
        // shuffle the strings
        shuffle: false,
        // time before backspacing
        backDelay: 500,
        // loop
        loop: false,
        // false = infinite
        loopCount: false,
        // show cursor
        showCursor: true,
        // character for cursor
        cursorChar: "|",
        // attribute to type (null == text)
        attr: null,
        // either html or text
        contentType: 'html',
        // call when done callback function
        callback: function() {},
        // starting callback function before each string
        preStringTyped: function() {},
        //callback for every typed string
        onStringTyped: function() {},
        // callback for reset
        resetCallback: function() {}
    };


}(window.jQuery);
(function() {
  var CloseButton;

  CloseButton = (function() {
    function CloseButton(container, callback) {
      this.container = container;
      this.callback = callback;
      this.button = $("<div>", {
        "class": "close-button"
      });
      this.img = $("<img>", {
        src: "img/UI_175.png",
        click: (function(_this) {
          return function() {
            return typeof _this.callback === "function" ? _this.callback() : void 0;
          };
        })(this)
      });
      this.button.append(this.img);
      this.container.append(this.button);
    }

    CloseButton.prototype.css = function(css) {
      return this.button.css(css);
    };

    return CloseButton;

  })();

  $blab.utils = {
    CloseButton: CloseButton
  };

}).call(this);
(function() {
  var Input, Widget,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Widget = $blab.Widget;

  Input = (function(superClass) {
    extend(Input, superClass);

    function Input() {
      return Input.__super__.constructor.apply(this, arguments);
    }

    Input.handle = "input";

    Input.source = true;

    Input.initVal = 0;

    Input.initSpec = function(id) {
      return "init: " + this.initVal + "\nprompt: \"" + id + ":\"\nunit: \"\"\nalign: \"left\"\npos: 1, order: 1";
    };

    Input.prototype.create = function(spec) {
      var ref;
      this.spec = spec;
      ref = this.spec, this.init = ref.init, this.prompt = ref.prompt, this.unit = ref.unit, this.align = ref.align;
      this.outer = $("<div>", {
        "class": "input-container"
      });
      this.input = new $blab.components.Input({
        container: this.outer,
        init: this.init,
        prompt: this.prompt,
        unit: this.unit,
        align: this.align,
        change: (function(_this) {
          return function() {
            _this.setVal(parseFloat(_this.input.val()));
            return _this.computeAll();
          };
        })(this)
      });
      this.appendToCanvas(this.outer);
      return this.setVal(this.init);
    };

    return Input;

  })(Widget);

  Widget.register([Input]);

}).call(this);

(function() {
  var Menu, Widget,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

  Widget = $blab.Widget;

  Menu = (function(superClass) {
    extend(Menu, superClass);

    function Menu() {
      return Menu.__super__.constructor.apply(this, arguments);
    }

    Menu.handle = "menu";

    Menu.initVal = 1;

    Menu.initSpec = function(id) {
      return "init: " + Menu.initVal + "\nprompt: \"" + id + ":\"\noptions: [\n  {text: \"Option 1\", value: 1}\n  {text: \"Option 2\", value: 2}\n],\nalign: \"left\"\npos: 1, order: 1";
    };

    Menu.compute = function() {
      var id, ref, v;
      id = arguments[0], v = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      return (ref = this.getVal.apply(this, [id].concat(slice.call(v)))) != null ? ref : this.initVal;
    };

    Menu.prototype.create = function(spec) {
      var clickEvent, i, len, o, option, ref, ref1, ref2;
      this.spec = spec;
      ref = this.spec, this.init = ref.init, this.prompt = ref.prompt, this.options = ref.options, this.align = ref.align;
      this.menuContainer = $("#" + this.domId());
      if (this.menuContainer.length) {
        this.outer = this.menuContainer.parent();
        if ((ref1 = this.outer) != null) {
          ref1.remove();
        }
      }
      clickEvent = (function(_this) {
        return function() {
          return _this.select();
        };
      })(this);
      this.outer = $("<div>", {
        "class": "menu-container"
      });
      this.promptContainer = $("<div>", {
        "class": "menu-prompt-container"
      });
      this.outer.append(this.promptContainer);
      this.menuPrompt = $("<div>", {
        "class": "menu-prompt"
      });
      this.promptContainer.append(this.menuPrompt);
      this.menuPrompt.append(this.prompt);
      this.menuContainer = $("<div>", {
        "class": "blab-menu",
        id: this.domId(),
        mouseup: (function(_this) {
          return function(e) {
            return e.stopPropagation();
          };
        })(this)
      });
      this.outer.append(this.menuContainer);
      this.outer.mouseup(function() {
        return clickEvent();
      });
      this.textContainer = $("<div>", {
        "class": "menu-text-container"
      });
      this.outer.append(this.textContainer);
      this.textDiv = $("<div>", {
        "class": "menu-text"
      });
      this.textContainer.append(this.textDiv);
      this.appendToCanvas(this.outer);
      this.menu = $("<select>", {
        value: this.init,
        change: (function(_this) {
          return function() {
            var v, val;
            v = _this.menu.val();
            val = v ? parseFloat(v) : null;
            if (isNaN(val)) {
              val = v;
            }
            _this.setVal(val);
            return _this.computeAll();
          };
        })(this)
      });
      ref2 = this.options;
      for (i = 0, len = ref2.length; i < len; i++) {
        option = ref2[i];
        o = $("<option>", {
          text: option.text,
          value: option.value,
          selected: option.value === this.init
        });
        this.menu.append(o);
      }
      if (this.align) {
        this.menu.css({
          textAlign: this.align
        });
      }
      this.menuContainer.append(this.menu);
      return this.setVal(this.init);
    };

    Menu.prototype.initialize = function() {
      return this.setVal(this.init);
    };

    Menu.prototype.setVal = function(v) {
      return this.value = v;
    };

    Menu.prototype.getVal = function() {
      this.setUsed();
      return this.value;
    };

    return Menu;

  })(Widget);

  Widget.register([Menu]);

}).call(this);

(function() {
  var Slider, Widget,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Widget = $blab.Widget;

  Slider = (function(superClass) {
    extend(Slider, superClass);

    function Slider() {
      return Slider.__super__.constructor.apply(this, arguments);
    }

    Slider.handle = "slider";

    Slider.source = true;

    Slider.initVal = 5;

    Slider.initSpec = function(id) {
      return "min: 0, max: 10, step: 0.1, init: " + this.initVal + "\nprompt: \"" + id + ":\"\nunit: \"\"\npos: 1, order: 1";
    };

    Slider.prototype.create = function(spec) {
      var ref;
      this.spec = spec;
      ref = this.spec, this.min = ref.min, this.max = ref.max, this.step = ref.step, this.init = ref.init, this.prompt = ref.prompt, this.text = ref.text, this.val = ref.val, this.unit = ref.unit, this.fast = ref.fast;
      this.outer = $("<div>", {
        "class": "slider-container"
      });
      this.slider = new $blab.components.Slider({
        container: this.outer,
        range: "min",
        min: this.min,
        max: this.max,
        step: this.step,
        init: this.init,
        prompt: this.prompt,
        val: this.val,
        unit: this.unit,
        fast: this.fast,
        change: (function(_this) {
          return function() {
            return _this.computeAll();
          };
        })(this)
      });
      return this.appendToCanvas(this.outer);
    };

    Slider.prototype.initialize = function() {
      return this.setVal(this.init);
    };

    Slider.prototype.destroy = function() {
      return this.slider.destroy();
    };

    Slider.prototype.setVal = function(v) {
      return this.slider.set(v);
    };

    Slider.prototype.getVal = function() {
      return this.slider.getVal();
    };

    return Slider;

  })(Widget);

  Widget.register([Slider]);

}).call(this);

(function() {
  var Plot, Widget,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Widget = $blab.Widget;

  Plot = (function(superClass) {
    extend(Plot, superClass);

    function Plot() {
      return Plot.__super__.constructor.apply(this, arguments);
    }

    Plot.handle = "plot";

    Plot.initSpec = function(id) {
      return "title: \"" + id + "\"\nwidth: 300, height: 200\nxlabel: \"x\", ylabel: \"y\"\n# xaxis: {min: 0, max: 1}\n# yaxis: {min: 0, max: 1}\nseries: {lines: lineWidth: 1}\ncolors: [\"red\", \"blue\"]\ngrid: {backgroundColor: \"white\"}\npos: 1, order: 1";
    };

    Plot.prototype.create = function(spec) {
      this.spec = spec;
      this.outer = $("<div>", {
        "class": "plot-container"
      });
      this.spec.container = this.outer;
      this.plot = new $blab.components.Plot(this.spec);
      this.appendToCanvas(this.outer);
      return this.setVal([[0], [0]]);
    };

    Plot.prototype.initialize = function() {};

    Plot.prototype.setVal = function(v) {
      return this.plot.setVal(v);
    };

    return Plot;

  })(Widget);

  Widget.register([Plot]);

}).call(this);

(function() {
  var EditableCell, Table, TableCellSelector, Widget,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Widget = $blab.Widget;

  Table = (function(superClass) {
    extend(Table, superClass);

    function Table() {
      return Table.__super__.constructor.apply(this, arguments);
    }

    Table.handle = "table";

    Table.initSpec = function(id, v) {
      return "title: \"" + id + "\"\nheadings: []  # [\"Column 1\", \"Column 2\"]\nwidths: 100  #[100, 100]\npos: 1, order: 1";
    };

    Table.compute = function() {
      var id, idx, j, len, v, x;
      id = arguments[0], v = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      if (!v.length) {
        return;
      }
      if (!(v[0] instanceof Object)) {
        for (idx = j = 0, len = v.length; j < len; idx = ++j) {
          x = v[idx];
          if (!Array.isArray(x)) {
            v[idx] = [x];
          }
        }
      }
      return this.setValAndGet.apply(this, [id].concat(slice.call(v)));
    };

    Table.prototype.create = function(spec) {
      var base, h, idx, j, len, name1, ref, ref1, tr;
      this.spec = spec;
      ref = this.spec, this.title = ref.title, this.headings = ref.headings, this.widths = ref.widths, this.colCss = ref.colCss, this.css = ref.css, this.precision = ref.precision;
      this.table = $("#" + this.domId());
      if (this.table.length) {
        this.table.remove();
      }
      this.table = $("<table>", {
        id: this.domId(),
        "class": "widget",
        mouseup: (function(_this) {
          return function() {
            return _this.select();
          };
        })(this)
      });
      if (this.title) {
        this.caption = $("<caption>", {
          text: this.title
        });
      }
      this.table.append(this.caption);
      if (this.css) {
        this.table.css(this.css);
      }
      this.colGroup = $("<colgroup>");
      this.table.append(this.colGroup);
      if (this.widths == null) {
        this.widths = 100;
      }
      if (!Array.isArray(this.widths)) {
        this.widths = [this.widths];
      }
      this.setColGroup();
      if (this.headings) {
        tr = $("<tr>");
        this.table.append(tr);
        ref1 = this.headings;
        for (idx = j = 0, len = ref1.length; j < len; idx = ++j) {
          h = ref1[idx];
          tr.append("<th>" + h + "</th>");
        }
      }
      this.tbody = $("<tbody>");
      this.table.append(this.tbody);
      this.appendToCanvas(this.table);
      this.tablesFile = $blab.resources.find("tables.json");
      if (!$blab.tableData) {
        $blab.tableData = this.tablesFile ? JSON.parse(this.tablesFile.content) : {};
      }
      if ((base = $blab.tableData)[name1 = this.id] == null) {
        base[name1] = {};
      }
      this.tableData = $blab.tableData[this.id];
      $(document).on("blabcompute", (function(_this) {
        return function() {
          return _this.setFunctions();
        };
      })(this));
      return this.setVal([[0]]);
    };

    Table.prototype.setColGroup = function(n) {
      var col, css, expand, i, idx, j, len, ref, ref1, ref2, results, w;
      if (n) {
        expand = n && this.widths.length < n && !Array.isArray(this.spec.widths);
        if (!expand) {
          return;
        }
        this.widths = (function() {
          var j, ref, results;
          results = [];
          for (i = j = 1, ref = n; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
            results.push(this.spec.widths);
          }
          return results;
        }).call(this);
      }
      this.colGroup.empty();
      ref = this.widths;
      results = [];
      for (idx = j = 0, len = ref.length; j < len; idx = ++j) {
        w = ref[idx];
        css = (ref1 = (ref2 = this.colCss) != null ? ref2[idx] : void 0) != null ? ref1 : {};
        css.width = w;
        col = $("<col>", {
          css: css
        });
        results.push(this.colGroup.append(col));
      }
      return results;
    };

    Table.prototype.initialize = function() {};

    Table.prototype.setVal = function(v) {
      var dynamic, editable, idx, invalid, j, l, len, o, val;
      this.setUsed();
      if (!(v[0] instanceof Array)) {
        this.v0 = v[0];
        this.first = null;
        return this.setValObject();
      }
      o = {};
      invalid = false;
      for (idx = j = 0, len = v.length; j < len; idx = ++j) {
        val = v[idx];
        l = val.length;
        if (l === 0) {
          dynamic = true;
          editable = true;
          o[idx] = val;
        } else if (l === 1 && typeof val[0] === "function") {
          dynamic = true;
          o[idx] = val[0];
        } else {
          invalid = true;
          break;
        }
      }
      if (dynamic) {
        if (invalid) {
          console.log("Invalid table signature.");
          return null;
        } else if (!editable) {
          console.log("Must have at least one editable column.");
          return null;
        } else {
          this.v0 = o;
          this.first = null;
          return this.setValObject();
        }
      } else {
        return this.setValRegular(v);
      }
    };

    Table.prototype.setValRegular = function(v) {
      var d, i, idx, j, k, len, ref, ref1, row, tr, val, x;
      this.setColGroup(v.length);
      this.tbody.empty();
      row = [];
      ref = v[0];
      for (idx = j = 0, len = ref.length; j < len; idx = ++j) {
        x = ref[idx];
        tr = $("<tr>");
        this.tbody.append(tr);
        for (i = k = 0, ref1 = v.length; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
          d = v[i][idx];
          val = typeof d === "number" ? this.format(d) : d;
          tr.append("<td class='table-cell'>" + val + "</td>");
        }
      }
      this.value = v;
      new TableCellSelector(this.domId());
      return null;
    };

    Table.prototype.setValObject = function() {
      var base, base1, cell, idx, j, k, len, len1, name, numCols, ref, ref1, ref2, ref3, td, tr, val, x;
      this.editableCells = {};
      this.functionCells = {};
      this.funcs = {};
      this.isFunc = {};
      this.editableCols = [];
      if (this.t == null) {
        this.t = {};
      }
      if (this.editNext == null) {
        this.editNext = {};
      }
      numCols = 0;
      ref = this.v0;
      for (name in ref) {
        val = ref[name];
        numCols++;
        if (!this.first) {
          this.first = name;
        }
        this.isFunc[name] = typeof val === "function";
        if (this.isFunc[name]) {
          if ((base = this.functionCells)[name] == null) {
            base[name] = [];
          }
          this.funcs[name] = val;
        } else {
          if ((base1 = this.editableCells)[name] == null) {
            base1[name] = [];
          }
          this.editableCols.push(this.setData(name, val));
          if (!this.firstEditableColName) {
            this.firstEditableColName = name;
          }
        }
      }
      this.colNames = (function() {
        var ref1, results;
        ref1 = this.editableCells;
        results = [];
        for (name in ref1) {
          cell = ref1[name];
          results.push(name);
        }
        return results;
      }).call(this);
      this.colIdx = {};
      ref1 = this.colNames;
      for (idx = j = 0, len = ref1.length; j < len; idx = ++j) {
        name = ref1[idx];
        this.colIdx[name] = idx;
      }
      if (this.currentCol == null) {
        this.currentCol = this.first;
      }
      this.setColGroup(numCols);
      this.tbody.empty();
      ref2 = this.tableData[this.firstEditableColName];
      for (idx = k = 0, len1 = ref2.length; k < len1; idx = ++k) {
        x = ref2[idx];
        tr = $("<tr>");
        this.tbody.append(tr);
        ref3 = this.v0;
        for (name in ref3) {
          val = ref3[name];
          td = $("<td>");
          tr.append(td);
          this.setCell(td, name, idx, val);
        }
      }
      new TableCellSelector(this.domId());
      this.checkForFocusCell();
      this.clickNext(this.currentCol);
      this.value = this.v0;
      if (this.editableCols.length === 1) {
        return this.editableCols[0];
      } else {
        return this.editableCols;
      }
    };

    Table.prototype.setData = function(name, val) {
      var base, idx, j, len, ref, v;
      if (val.length === 0) {
        val = [null];
      }
      if ((base = this.tableData)[name] == null) {
        base[name] = val;
      }
      val = this.tableData[name];
      this.t[name] = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = val.length; j < len; j++) {
          v = val[j];
          results.push(v);
        }
        return results;
      })();
      ref = this.t[name];
      for (idx = j = 0, len = ref.length; j < len; idx = ++j) {
        v = ref[idx];
        if (v === null) {
          this.t[name][idx] = 0;
        }
      }
      return this.t[name];
    };

    Table.prototype.setCell = function(td, name, idx, v) {
      var cell, d;
      if (this.isFunc[name]) {
        return this.functionCells[name].push(td);
      } else {
        d = this.tableData[name][idx];
        cell = this.createEditableCell(td, name, idx, d);
        return this.editableCells[name].push(cell);
      }
    };

    Table.prototype.createEditableCell = function(container, name, idx, val) {
      return new EditableCell({
        container: container,
        idx: idx,
        val: val,
        callback: (function(_this) {
          return function(val, changed, dir, colDir) {
            return _this.cellAction(name, idx, val, changed, dir, colDir);
          };
        })(this),
        del: (function(_this) {
          return function() {
            return _this.deleteRow(name, idx);
          };
        })(this),
        insert: (function(_this) {
          return function() {
            return _this.insertRow(name, idx);
          };
        })(this),
        paste: (function(_this) {
          return function(idx, val) {
            return _this.paste(name, idx, val);
          };
        })(this),
        clickCell: (function(_this) {
          return function(focus) {
            if (focus == null) {
              focus = true;
            }
            return _this.focusCell = focus ? {
              name: name,
              idx: idx
            } : null;
          };
        })(this)
      });
    };

    Table.prototype.setFunctions = function() {
      var cell, d, error, func, idx, j, len, name, ref, ref1, v, val;
      if (!this.funcs) {
        return;
      }
      ref = this.funcs;
      for (name in ref) {
        func = ref[name];
        try {
          val = func(this.t);
        } catch (_error) {
          error = _error;
          console.log("====Blabr====", error);
          return;
        }
        ref1 = this.functionCells[name];
        for (idx = j = 0, len = ref1.length; j < len; idx = ++j) {
          cell = ref1[idx];
          d = val[idx];
          v = typeof d === "number" ? this.format(d) : d;
          cell.html(v);
        }
      }
    };

    Table.prototype.cellAction = function(name, idx, val, changed, dir, colDir) {
      this.setNext(name, idx, dir, colDir);
      if (this.editNext[name] >= this.editableCells[name].length) {
        this.appendRow(name);
      }
      if (changed) {
        this.tableData[name][idx] = val;
        this.store();
        return this.computeAll();
      } else {
        return this.clickNext(this.currentCol);
      }
    };

    Table.prototype.setNext = function(name, idx, dir, colDir) {
      var m, nextIdx;
      if (dir !== 0 || colDir !== 0) {
        this.focusCell = null;
      }
      if (colDir !== 0) {
        m = this.colIdx[name] + colDir;
        if (m >= 0 && m < this.colNames.length) {
          this.currentCol = this.colNames[m];
          return this.editNext[this.currentCol] = idx;
        }
      } else {
        this.currentCol = name;
        if (dir === 0) {
          return this.editNext[name] = false;
        } else {
          nextIdx = idx + dir;
          if (nextIdx < 0) {
            nextIdx = 0;
          }
          return this.editNext[name] = nextIdx;
        }
      }
    };

    Table.prototype.clickNext = function(name) {
      var next, ok;
      next = this.editNext[name];
      ok = next !== false && next >= 0 && next < this.editableCells[name].length;
      if (ok) {
        return this.editableCells[name][this.editNext[name]].click();
      }
    };

    Table.prototype.appendRow = function(name) {
      var cell, n, ref;
      ref = this.editableCells;
      for (n in ref) {
        cell = ref[n];
        this.tableData[n].push(null);
      }
      this.store();
      return this.computeAll();
    };

    Table.prototype.insertRow = function(name, idx) {
      var cell, n, ref;
      this.currentCol = name;
      ref = this.editableCells;
      for (n in ref) {
        cell = ref[n];
        this.tableData[n].splice(idx, 0, null);
        this.editNext[n] = idx;
      }
      this.store();
      return this.computeAll();
    };

    Table.prototype.deleteRow = function(name, idx) {
      var cell, n, ref;
      this.focusCell = null;
      this.currentCol = name;
      ref = this.editableCells;
      for (n in ref) {
        cell = ref[n];
        this.tableData[n].splice(idx, 1);
      }
      this.editNext[name] = idx > 1 ? idx - 1 : 0;
      this.store();
      return this.computeAll();
    };

    Table.prototype.paste = function(name, idx, val) {
      var i, j, len, v, vals;
      vals = val.split(", ").join(" ").split(" ");
      for (i = j = 0, len = vals.length; j < len; i = ++j) {
        v = vals[i];
        this.tableData[name][idx + i] = parseFloat(v);
      }
      this.editNext[name] = idx;
      this.store();
      return this.computeAll();
    };

    Table.prototype.checkForFocusCell = function() {
      if (!this.focusCell) {
        return;
      }
      this.currentCol = this.focusCell.name;
      this.editNext[this.currentCol] = this.focusCell.idx;
      return this.focusCell = null;
    };

    Table.prototype.store = function() {
      this.tablesFile.content = JSON.stringify($blab.tableData, null, 2);
      if (!($blab.isEmbedded || (typeof $blab !== "undefined" && $blab !== null ? $blab.layoutPos : void 0) || $blab.lecture2)) {
        return $.event.trigger("codeNodeChanged");
      }
    };

    Table.prototype.format = function(x) {
      var ref;
      if (x === 0 || (typeof Number.isInteger === "function" ? Number.isInteger(x) : void 0) && Math.abs(x) < 1e10) {
        return x;
      } else {
        return x.toPrecision((ref = this.precision) != null ? ref : 4);
      }
    };

    return Table;

  })(Widget);

  EditableCell = (function() {
    function EditableCell(spec) {
      var ref;
      this.spec = spec;
      ref = this.spec, this.container = ref.container, this.idx = ref.idx, this.val = ref.val, this.callback = ref.callback, this.del = ref.del, this.insert = ref.insert, this.paste = ref.paste, this.clickCell = ref.clickCell;
      this.disp = this.val === null ? "" : this.val;
      this.div = $("<div>", {
        "class": "editable-table-cell",
        text: this.disp,
        contenteditable: true,
        focus: (function(_this) {
          return function(e) {
            _this.clickCell();
            return setTimeout((function() {
              return _this.selectElementContents(_this.div[0]);
            }), 0);
          };
        })(this),
        mousedown: (function(_this) {
          return function(e) {
            return $.event.trigger("clickInputWidget");
          };
        })(this),
        click: (function(_this) {
          return function(e) {
            e.stopPropagation();
            return _this.click(e);
          };
        })(this),
        keydown: (function(_this) {
          return function(e) {
            return _this.keyDown(e);
          };
        })(this),
        change: (function(_this) {
          return function(e) {
            return _this.change(e);
          };
        })(this),
        blur: (function(_this) {
          return function(e) {
            _this.clickCell(false);
            return setTimeout((function() {
              return _this.change(e);
            }), 100);
          };
        })(this)
      });
      this.div.on("paste", (function(_this) {
        return function(e) {
          _this.div.css({
            color: "white"
          });
          return setTimeout((function() {
            return _this.paste(_this.idx, _this.div.text());
          }), 0);
        };
      })(this));
      this.container.append(this.div);
    }

    EditableCell.prototype.selectElementContents = function(el) {
      var range, sel;
      range = document.createRange();
      range.selectNodeContents(el);
      sel = window.getSelection();
      sel.removeAllRanges();
      if (!$blab.isIe) {
        return sel != null ? typeof sel.addRange === "function" ? sel.addRange(range) : void 0 : void 0;
      }
    };

    EditableCell.prototype.click = function(e) {
      return this.div.focus();
    };

    EditableCell.prototype.reset = function() {
      this.div.empty();
      return this.div.text(this.val === null ? "" : this.val);
    };

    EditableCell.prototype.keyDown = function(e) {
      var backspace, colDir, dir, down, key, left, ret, right, up;
      key = e.keyCode;
      ret = 13;
      backspace = 8;
      left = 37;
      up = 38;
      right = 39;
      down = 40;
      if (key === ret) {
        e.preventDefault();
        if (e.shiftKey) {
          this.insert(this.idx);
        } else {
          this.noChange = true;
          this.done(0);
        }
        return;
      }
      if (key === backspace) {
        if (this.div.text() === "") {
          e.preventDefault();
          this.del(this.idx);
        }
        return;
      }
      if (key !== left && key !== up && key !== right && key !== down) {
        return;
      }
      if (key === up || key === down) {
        e.preventDefault();
      }
      dir = key === down ? 1 : key === up ? -1 : 0;
      colDir = key === right ? 1 : key === left ? -1 : 0;
      return this.done(dir, colDir);
    };

    EditableCell.prototype.change = function(e) {
      if (!this.noChange) {
        return this.done();
      }
    };

    EditableCell.prototype.enterVal = function(v, dir) {
      if (dir == null) {
        dir = 1;
      }
      this.noChange = true;
      this.div.click();
      this.div.text(v);
      return this.done(dir);
    };

    EditableCell.prototype.done = function(dir, colDir) {
      var changed, v, val;
      if (dir == null) {
        dir = 0;
      }
      if (colDir == null) {
        colDir = 0;
      }
      v = this.div.text();
      if (v === "") {
        changed = v !== this.disp;
        val = null;
        this.val = val;
        return this.callback(val, changed, dir, colDir);
      } else {
        val = v ? parseFloat(v) : null;
        if (isNaN(val)) {
          val = v;
        }
        changed = val !== this.val;
        if (changed) {
          this.val = val;
        }
        this.disp = this.val;
        return this.callback(val, changed, dir, colDir);
      }
    };

    return EditableCell;

  })();

  TableCellSelector = (function() {
    function TableCellSelector(tableId) {
      var e, j, len, ref;
      this.tableId = tableId;
      this.mouseleave = bind(this.mouseleave, this);
      this.cell = $("#" + this.tableId + " td");
      ref = ["click", "blur", "mousedown", "mousemove", "mouseenter", "mouseleave", "mouseup"];
      for (j = 0, len = ref.length; j < len; j++) {
        e = ref[j];
        this.cell.unbind(e);
      }
      this.cell.click((function(_this) {
        return function(e) {
          return _this.stop(e);
        };
      })(this));
      this.cell.blur((function(_this) {
        return function(e) {
          return console.log("blur");
        };
      })(this));
      this.cell.mousedown((function(_this) {
        return function(e) {
          return _this.mousedown(e);
        };
      })(this));
      this.cell.mousemove((function(_this) {
        return function(e) {
          return _this.mousemove(e);
        };
      })(this));
      this.cell.mouseleave((function(_this) {
        return function(e) {
          return _this.mouseleave(e);
        };
      })(this));
      this.cell.mouseenter((function(_this) {
        return function(e) {
          return _this.mouseenter(e);
        };
      })(this));
      this.cell.mouseup((function(_this) {
        return function(e) {
          return _this.mouseup(e);
        };
      })(this));
      $(document).on("blabmousedown", (function(_this) {
        return function(e) {
          if (!(_this.down && _this.inTable)) {
            return _this.reset();
          }
        };
      })(this));
      $(document).on("blabmouseup", (function(_this) {
        return function(e) {
          if (!(_this.down && _this.inTable)) {
            return _this.reset();
          }
        };
      })(this));
      $(document).on("blabcopy", (function(_this) {
        return function(e, data) {
          return _this.copy(e, data);
        };
      })(this));
      this.selected = [];
      this.reset();
    }

    TableCellSelector.prototype.reset = function() {
      this.deselectAll();
      this.down = false;
      this.inTable = false;
      this.first = false;
      this.column = null;
      this.start = -1;
      this.end = -1;
      this.selected = [];
      return this.vector = [];
    };

    TableCellSelector.prototype.mousedown = function(e) {
      var ref, row;
      this.stop(e);
      this.deselectAll();
      this.down = true;
      this.inTable = true;
      this.first = true;
      ref = this.coord(e), row = ref[0], this.column = ref[1];
      this.start = this.end = row;
      return setTimeout(((function(_this) {
        return function() {
          return _this.initFirst(e);
        };
      })(this)), 100);
    };

    TableCellSelector.prototype.initFirst = function(e) {
      if (!(this.first && this.down)) {
        return;
      }
      this.select(e);
      return this.first = false;
    };

    TableCellSelector.prototype.mousemove = function(e) {
      if (!(this.first && this.down)) {
        return;
      }
      this.stop(e);
      return this.initFirst(e);
    };

    TableCellSelector.prototype.mouseleave = function(e) {
      var col, ref, row;
      if (!this.down) {
        return;
      }
      this.stop(e);
      ref = this.coord(e), row = ref[0], col = ref[1];
      if (col !== this.column) {
        this.reset();
        return;
      }
      this.inTable = false;
      this.lastLeave = e;
      return this.lastLeaveRow = row;
    };

    TableCellSelector.prototype.mouseenter = function(e) {
      var col, ref, row;
      if (!this.down) {
        return;
      }
      this.stop(e);
      this.inTable = true;
      ref = this.coord(e), row = ref[0], col = ref[1];
      if (col !== this.column) {
        this.reset();
        return;
      }
      this.first = false;
      if (this.lastLeaveRow > row) {
        this.deselect(this.lastLeave);
      }
      if (row > this.end) {
        this.select(e);
      }
      return this.end = row;
    };

    TableCellSelector.prototype.mouseup = function(e) {
      var s;
      this.stop(e);
      this.down = false;
      this.inTable = false;
      if (this.selected.length === 1) {
        this.normal(this.start);
      }
      return this.vector = (function() {
        var j, len, ref, results;
        ref = this.selected;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          s = ref[j];
          results.push($(s.target).text());
        }
        return results;
      }).call(this);
    };

    TableCellSelector.prototype.copy = function(e, data) {
      var string;
      console.log("copy cells", this.tableId, this.vector);
      if (!this.vector.length) {
        return;
      }
      console.log("data", data);
      e = data.original;
      e.preventDefault();
      string = this.vector.join(", ");
      return e.clipboardData.setData('Text', string);
    };

    TableCellSelector.prototype.coord = function(e) {
      var col, p, row, t, td, tr;
      t = $(e.target);
      p = t.parent();
      if (this.isEditable(e)) {
        td = p;
        tr = td.parent();
      } else {
        td = t;
        tr = p;
      }
      row = tr.index();
      col = td.index();
      return [row, col];
    };

    TableCellSelector.prototype.deselectAll = function() {
      var j, len, ref, s;
      if (!this.selected.length) {
        return;
      }
      ref = this.selected;
      for (j = 0, len = ref.length; j < len; j++) {
        s = ref[j];
        this.normal(s);
      }
      return this.selected = [];
    };

    TableCellSelector.prototype.select = function(e) {
      this.highlight(e);
      return this.selected.push(e);
    };

    TableCellSelector.prototype.deselect = function(e) {
      this.selected.pop();
      return this.normal(e);
    };

    TableCellSelector.prototype.highlight = function(e) {
      return $(e.target).css({
        background: "rgb(180, 213, 254)"
      });
    };

    TableCellSelector.prototype.normal = function(e) {
      return $(e.target).css({
        background: ""
      });
    };

    TableCellSelector.prototype.isEditable = function(e) {
      return $(e.target).attr("class") === "editable-table-cell";
    };

    TableCellSelector.prototype.stop = function(e) {
      e.preventDefault();
      return e.stopPropagation();
    };

    return TableCellSelector;

  })();

  Widget.register([Table]);

}).call(this);
