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
        img: "//blabr.org/img/mystery-curve.png",
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
        img: "//blabr.org/img/solitons.png",
        id: "2a55efd937f9d3e87d29"
      }, {
        text: "A toy problem for compressive sensing",
        img: "//blabr.org/img/cs-intro.png",
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
      return this.append("<div class=\"guide-col\">\n  <h3>Examples</h3>\n  " + str + "\n</div>");
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
        text: "About Blabr",
        click: (function(_this) {
          return function() {
            return _this.footer.slideToggle(500);
          };
        })(this)
      });
      this.containerButton.append(this.button);
      this.footer = $("<div>", {
        "class": "guide-footer"
      });
      this.container.append(this.footer);
      this.footer.hide();
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
      this.footer.append("<a href='//blabr.org' target='_blank'>Blabr</a> \nis developed by \n<a href=\"//github.com/mvclark\" target=\"_blank\">Martin Clark</a> and \n<a href=\"//github.com/garyballantyne\" target=\"_blank\">Gary Ballantyne</a> (Haulashore Limited) \nas part of the <a href='//github.com/puzlet' target='_blank'>Puzlet</a> project.<br>\nThanks to: " + str + ".");
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
