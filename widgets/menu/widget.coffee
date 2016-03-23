#!vanilla
#!no-math-sugar

# Menu widget for blabr.

# TODO: factor out component

Widget = $blab.Widget

class Menu extends Widget
  
  @handle: "menu"
  
  @initVal: 1
  
  @initSpec: (id) -> """
    init: #{Menu.initVal}
    prompt: "#{id}:"
    options: [
      {text: "Option 1", value: 1}
      {text: "Option 2", value: 2}
    ],
    align: "left"
    pos: 1, order: 1
  """
  
  @compute: (id, v...) ->
    @getVal(id, v...) ? @initVal
  
  create: (@spec) ->
    
    {@init, @prompt,  @options, @align} = @spec
    
    @menuContainer = $("#"+@domId())
    if @menuContainer.length
      # TODO: Need to destroy input?
      @outer = @menuContainer.parent()
      @outer?.remove()
      
    clickEvent = => @select()
    
    @outer = $ "<div>", class: "menu-container"
      
    @promptContainer = $ "<div>", class: "menu-prompt-container"
    @outer.append @promptContainer
    
    @menuPrompt = $ "<div>", class: "menu-prompt"
    @promptContainer.append @menuPrompt
    
    @menuPrompt.append @prompt
    
    @menuContainer = $ "<div>",
      class: "blab-menu"
      id: @domId()
      mouseup: (e) => e.stopPropagation()
    @outer.append @menuContainer
    
    @outer.mouseup -> clickEvent()
    
    @textContainer = $ "<div>", class: "menu-text-container"
    @outer.append @textContainer
    
    @textDiv = $ "<div>", class: "menu-text"
    @textContainer.append @textDiv
    
    @appendToCanvas @outer
    
    @menu = $ "<select>",
      value: @init
      #mouseup: (e) -> e.stopPropagation()
      change: =>
        v = @menu.val()
        val = if v then parseFloat(v) else null
        val = v if isNaN(val)  # handle text value
        @setVal(val)
        @computeAll()
    
    for option in @options
      o = $ "<option>",
        text: option.text
        value: option.value
        selected: option.value is @init
      @menu.append o
        
    @menu.css(textAlign: @align) if @align
    
    @menuContainer.append @menu
    
    @setVal @init
    
  initialize: -> @setVal @init
  
  setVal: (v) ->
    @value = v
  
  getVal: ->
    @setUsed()
    @value

Widget.register [Menu]