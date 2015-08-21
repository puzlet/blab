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
