#!vanilla
#!no-math-sugar

# Menu component.
# For use in any web page.

class Menu
  
  constructor: (@spec) ->
    
    {@container, @init, @prompt,  @options, @align, change} = @spec
    
    # Make component object accessible via jQuery.
    @container.data "blab-component", this
    
    @promptContainer = $ "<div>", class: "menu-prompt-container"
    @container.append @promptContainer
    
    @menuPrompt = $ "<div>", class: "menu-prompt"
    @promptContainer.append @menuPrompt
    
    @menuPrompt.append @prompt
    
    @menuContainer = $ "<div>", class: "blab-menu"
    @container.append @menuContainer
    
    @textContainer = $ "<div>", class: "menu-text-container"
    @container.append @textContainer
    
    @textDiv = $ "<div>", class: "menu-text"
    @textContainer.append @textDiv
    
    @changeFcn = if change then (-> change()) else (->)
    
    @menu = $ "<select>",
      value: @init
      change: =>
        v = @menu.val()
        val = if v then parseFloat(v) else null
        val = v if isNaN(val)  # handle text value
        @set(val)
        @changeFcn()
    
    for option in @options
      o = $ "<option>",
        text: option.text
        value: option.value
        selected: option.value is @init
      @menu.append o
        
    @menu.css(textAlign: @align) if @align
    
    @menuContainer.append @menu
    
    @set @init
  
  ui: -> => @getVal()
  
  lectureAction: (spec) =>
    f: => @animate(spec)
    b: => @restore()
    
  animate: (spec) ->
    @origVal = @value
    @triggerChange spec.val
    
  restore: ->
    @triggerChange @origVal
    
  triggerChange: (val) ->
    @menu.val(val).trigger "change"
  
  change: (f) -> @changeFcn = -> f?()
  
  set: (v) ->
    @value = v
  
  getVal: -> @value



window.$blab ?= {}
$blab.components ?= {}
$blab.components.Menu = Menu
