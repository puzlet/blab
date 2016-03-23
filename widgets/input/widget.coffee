#!vanilla
#!no-math-sugar

# Input widget for blabr.

Widget = $blab.Widget

class Input extends Widget
  
  @handle: "input"
  
  @source: true
  
  @initVal: 0
  
  @initSpec: (id) -> """
    init: #{@initVal}
    prompt: "#{id}:"
    unit: ""
    align: "left"
    pos: 1, order: 1
  """

  create: (@spec) ->
  
    {@init, @prompt, @unit, @align} = @spec
  
    @outer = $ "<div>", class: "input-container"
    
    @input = new $blab.components.Input
      container: @outer
      init: @init
      prompt: @prompt
      unit: @unit
      align: @align
      change: =>
        @setVal(parseFloat(@input.val()))
        @computeAll()
    
    @appendToCanvas @outer
    
    @setVal @init

Widget.register [Input]