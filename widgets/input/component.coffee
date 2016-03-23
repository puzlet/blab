#!vanilla
#!no-math-sugar

# Input component.
# For use in any web page.

class Input
  
  constructor: (@spec) ->
    
    {@container, @init, @prompt, @unit, @align, change} = @spec
    
    @promptContainer = $ "<div>", class: "input-prompt-container"
    @container.append @promptContainer
    
    @inputPrompt = $ "<div>", class: "input-prompt"
    @promptContainer.append @inputPrompt
    @inputPrompt.append @prompt
    
    @inputContainer = $ "<div>", class: "blab-input"
    @container.append @inputContainer
    
    @textContainer = $ "<div>", class: "input-text-container"
    @container.append @textContainer
    
    @textDiv = $ "<div>", class: "input-text"
    @textContainer.append @textDiv
    
    @textDiv.html @unit if @unit
    
    @input = $ "<input>",
      type: "number"
      value: @init
      change: => change?()
    
    @input.css(textAlign: @align) if @align
    
    @inputContainer.append @input
    
    # Stop mouseup propagation (specific to Blabr?)
    @input.mouseup (e) -> e.stopPropagation()
    @inputContainer.mouseup (e) -> e.stopPropagation()
  
  change: (f) -> @input.change f
  
  val: -> @input.val()


window.$blab ?= {}
$blab.components ?= {}
$blab.components.Input = Input
