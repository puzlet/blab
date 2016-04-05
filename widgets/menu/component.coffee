#!vanilla
#!no-math-sugar

# Menu component.
# For use in any web page.

class Menu
  
  constructor: (@spec) ->
    
    # Make component object accessible via jQuery.
    @container.data "blab-component", this
  
  change: (f) ->
  
  val: ->


window.$blab ?= {}
$blab.components ?= {}
$blab.components.Menu = Menu
