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
