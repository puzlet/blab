class CloseButton
  
  constructor: (@container, @callback) ->
    @button = $ "<div>", class: "close-button"
    @img = $ "<img>",
      src: "img/UI_175.png"
      click: => @callback?()
    @button.append @img
    @container.append @button
    
  css: (css) ->
    @button.css css


$blab.utils = {CloseButton}