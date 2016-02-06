(function() {
  var AxesLabels, EditableCell, Input, Plot, Slider, Table, TableCellSelector, Widget,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Widget = $blab.Widget;

  Input = (function(superClass) {
    extend(Input, superClass);

    function Input() {
      return Input.__super__.constructor.apply(this, arguments);
    }

    Input.handle = "input";

    Input.initVal = 0;

    Input.initSpec = function(id) {
      return "init: " + Input.initVal + "\nprompt: \"" + id + ":\"\nunit: \"\"\nalign: \"left\"\npos: 1, order: 1";
    };

    Input.compute = function() {
      var id, ref, v;
      id = arguments[0], v = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      return (ref = this.getVal.apply(this, [id].concat(slice.call(v)))) != null ? ref : this.initVal;
    };

    Input.prototype.create = function(spec) {
      var clickEvent, ref, ref1;
      this.spec = spec;
      ref = this.spec, this.init = ref.init, this.prompt = ref.prompt, this.unit = ref.unit, this.align = ref.align;
      this.inputContainer = $("#" + this.domId());
      if (this.inputContainer.length) {
        this.outer = this.inputContainer.parent();
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
        "class": "input-container"
      });
      this.promptContainer = $("<div>", {
        "class": "input-prompt-container"
      });
      this.outer.append(this.promptContainer);
      this.inputPrompt = $("<div>", {
        "class": "input-prompt"
      });
      this.promptContainer.append(this.inputPrompt);
      this.inputPrompt.append(this.prompt);
      this.inputContainer = $("<div>", {
        "class": "blab-input",
        id: this.domId(),
        mouseup: (function(_this) {
          return function(e) {
            return e.stopPropagation();
          };
        })(this)
      });
      this.outer.append(this.inputContainer);
      this.outer.mouseup(function() {
        return clickEvent();
      });
      this.textContainer = $("<div>", {
        "class": "input-text-container"
      });
      this.outer.append(this.textContainer);
      this.textDiv = $("<div>", {
        "class": "input-text"
      });
      this.textContainer.append(this.textDiv);
      if (this.unit) {
        this.textDiv.html(this.unit);
      }
      this.appendToCanvas(this.outer);
      this.input = $("<input>", {
        type: "number",
        value: this.init,
        mouseup: function(e) {
          return e.stopPropagation();
        },
        change: (function(_this) {
          return function() {
            _this.setVal(parseFloat(_this.input.val()));
            return _this.computeAll();
          };
        })(this)
      });
      if (this.align) {
        this.input.css({
          textAlign: this.align
        });
      }
      this.inputContainer.append(this.input);
      return this.setVal(this.init);
    };

    Input.prototype.initialize = function() {
      return this.setVal(this.init);
    };

    Input.prototype.setVal = function(v) {
      return this.value = v;
    };

    Input.prototype.getVal = function() {
      this.setUsed();
      return this.value;
    };

    return Input;

  })(Widget);

  Slider = (function(superClass) {
    extend(Slider, superClass);

    function Slider() {
      return Slider.__super__.constructor.apply(this, arguments);
    }

    Slider.handle = "slider";

    Slider.initVal = 5;

    Slider.initSpec = function(id) {
      return "min: 0, max: 10, step: 0.1, init: " + Slider.initVal + "\nprompt: \"" + id + ":\"\nunit: \"\"\npos: 1, order: 1";
    };

    Slider.compute = function() {
      var id, ref, v;
      id = arguments[0], v = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      return (ref = this.getVal.apply(this, [id].concat(slice.call(v)))) != null ? ref : this.initVal;
    };

    Slider.prototype.create = function(spec) {
      var base, clickEvent, ref, ref1, ref2, sliding;
      this.spec = spec;
      ref = this.spec, this.min = ref.min, this.max = ref.max, this.step = ref.step, this.init = ref.init, this.prompt = ref.prompt, this.text = ref.text, this.val = ref.val, this.unit = ref.unit;
      this.sliderContainer = $("#" + this.domId());
      if (this.sliderContainer.length) {
        if (typeof (base = this.sliderContainer).slider === "function") {
          base.slider("destroy");
        }
        this.outer = this.sliderContainer.parent();
        if ((ref1 = this.outer) != null) {
          ref1.remove();
        }
      }
      sliding = false;
      clickEvent = (function(_this) {
        return function() {
          if (!sliding) {
            _this.select();
          }
          return sliding = false;
        };
      })(this);
      this.outer = $("<div>", {
        "class": "slider-container"
      });
      this.sliderPromptContainer = $("<div>", {
        "class": "slider-prompt-container"
      });
      this.outer.append(this.sliderPromptContainer);
      this.sliderPrompt = $("<div>", {
        "class": "slider-prompt"
      });
      this.sliderPromptContainer.append(this.sliderPrompt);
      this.sliderPrompt.append(this.prompt);
      this.sliderContainer = $("<div>", {
        "class": "puzlet-slider",
        id: this.domId(),
        mousedown: (function(_this) {
          return function(e) {
            return $.event.trigger("clickInputWidget");
          };
        })(this),
        mouseup: (function(_this) {
          return function(e) {};
        })(this)
      });
      this.outer.append(this.sliderContainer);
      this.outer.mouseup(function(evt) {
        if (!$(evt.target).hasClass("ui-slider-handle")) {
          return clickEvent();
        }
      });
      this.textContainer = $("<div>", {
        "class": "slider-text-container"
      });
      this.outer.append(this.textContainer);
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
      this.appendToCanvas(this.outer);
      this.fast = (ref2 = this.spec.fast) != null ? ref2 : true;
      this.slider = this.sliderContainer.slider({
        range: "min",
        min: this.min,
        max: this.max,
        step: this.step,
        value: this.init,
        mouseup: function(e) {},
        slide: (function(_this) {
          return function(e, ui) {
            sliding = true;
            _this.setVal(ui.value);
            if (_this.fast) {
              return _this.computeAll();
            }
          };
        })(this),
        change: (function(_this) {
          return function(e, ui) {
            if (!_this.fast) {
              _this.computeAll();
            }
            return setTimeout((function() {
              return sliding = false;
            }), 100);
          };
        })(this)
      });
      return this.setVal(this.init);
    };

    Slider.prototype.initialize = function() {
      return this.setVal(this.init);
    };

    Slider.prototype.setVal = function(v) {
      this.textDiv.html(this.val ? this.val(v) : this.text ? this.text(v) : v);
      return this.value = v;
    };

    Slider.prototype.getVal = function() {
      this.setUsed();
      return this.value;
    };

    return Slider;

  })(Widget);

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
      var d, i, idx, j, len, q, ref, ref1, row, tr, val, x;
      this.setColGroup(v.length);
      this.tbody.empty();
      row = [];
      ref = v[0];
      for (idx = j = 0, len = ref.length; j < len; idx = ++j) {
        x = ref[idx];
        tr = $("<tr>");
        this.tbody.append(tr);
        for (i = q = 0, ref1 = v.length; 0 <= ref1 ? q < ref1 : q > ref1; i = 0 <= ref1 ? ++q : --q) {
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
      var base, base1, cell, idx, j, len, len1, name, numCols, q, ref, ref1, ref2, ref3, td, tr, val, x;
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
      for (idx = q = 0, len1 = ref2.length; q < len1; idx = ++q) {
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
          cell.text(v);
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

  Plot = (function(superClass) {
    extend(Plot, superClass);

    function Plot() {
      return Plot.__super__.constructor.apply(this, arguments);
    }

    Plot.handle = "plot";

    Plot.initSpec = function(id) {
      return "title: \"" + id + "\"\nwidth: 300, height: 200\nxlabel: \"x\", ylabel: \"y\"\n# xaxis: {min: 0, max: 1}\n# yaxis: {min: 0, max: 1}\nseries: {lines: lineWidth: 1}\ncolors: [\"red\", \"blue\"]\ngrid: {backgroundColor: \"white\"}\npos: 1, order: 1";
    };

    Plot.compute = function() {
      var id, v;
      id = arguments[0], v = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      return this.setVal.apply(this, [id].concat(slice.call(v)));
    };

    Plot.prototype.create = function(spec) {
      var ref, ref1, ref2;
      this.spec = spec;
      ref = this.spec, this.title = ref.title, this.width = ref.width, this.height = ref.height, this.xlabel = ref.xlabel, this.ylabel = ref.ylabel, this.css = ref.css;
      this.outer = $("<div>", {
        css: {
          textAlign: "center"
        },
        mouseup: (function(_this) {
          return function() {
            return _this.select();
          };
        })(this)
      });
      this.plot = $("#" + this.domId());
      if (this.plot.length) {
        this.plot.remove();
      }
      this.plot = $("<div>", {
        id: this.domId(),
        "class": "puzlet-plot",
        css: {
          width: (ref1 = this.width) != null ? ref1 : 400,
          height: (ref2 = this.height) != null ? ref2 : 200
        },
        mouseup: (function(_this) {
          return function() {
            return _this.select();
          };
        })(this)
      });
      if (this.title) {
        this.caption = $("<div>", {
          html: this.title,
          css: {
            fontSize: "10pt",
            marginBottom: -8
          }
        });
        this.outer.append(this.caption);
      }
      this.outer.append(this.plot);
      if (this.css) {
        this.plot.css(this.css);
      }
      this.appendToCanvas(this.outer);
      return this.setVal([[0], [0]]);
    };

    Plot.prototype.initialize = function() {};

    Plot.prototype.setVal = function(v) {
      var X, Y, base, d, j, k, l, lol, m, maxRows, o, params, ref, xRow, yRow;
      this.setUsed();
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
      for (k = j = 0, ref = maxRows; 0 <= ref ? j < ref : j > ref; k = 0 <= ref ? ++j : --j) {
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

  })(Widget);

  AxesLabels = (function() {
    function AxesLabels(container1, params1) {
      this.container = container1;
      this.params = params1;
      if (this.params.xlabel) {
        this.xaxisLabel = this.appendLabel(this.params.xlabel, "xaxisLabel");
      }
      if (this.params.ylabel) {
        this.yaxisLabel = this.appendLabel(this.params.ylabel, "yaxisLabel");
      }
    }

    AxesLabels.prototype.appendLabel = function(txt, className) {
      var label;
      label = $("<div>", {
        text: txt
      });
      label.addClass("axisLabel");
      label.addClass(className);
      this.container.append(label);
      return label;
    };

    AxesLabels.prototype.position = function() {
      var ref, ref1;
      if ((ref = this.xaxisLabel) != null) {
        ref.css({
          marginLeft: (-this.xaxisLabel.width() / 2 + 10) + "px",
          marginBottom: "-20px"
        });
      }
      return (ref1 = this.yaxisLabel) != null ? ref1.css({
        marginLeft: "-27px",
        marginTop: (this.yaxisLabel.width() / 2 - 10) + "px"
      }) : void 0;
    };

    return AxesLabels;

  })();

  $blab.baseWidgets = [Input, Slider, Table, Plot];

}).call(this);
