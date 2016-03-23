#!vanilla
#!no-math-sugar

# Plot widget for blabr.

Widget = $blab.Widget

class Plot extends Widget
  
  @handle: "plot"
  
  @initSpec: (id) -> """
    title: "#{id}"
    width: 300, height: 200
    xlabel: "x", ylabel: "y"
    # xaxis: {min: 0, max: 1}
    # yaxis: {min: 0, max: 1}
    series: {lines: lineWidth: 1}
    colors: ["red", "blue"]
    grid: {backgroundColor: "white"}
    pos: 1, order: 1
  """
  
  create: (@spec) ->
    @outer = $ "<div>", class: "plot-container"
    @spec.container = @outer
    @plot = new $blab.components.Plot @spec
    @appendToCanvas @outer
    @setVal([[0], [0]])
    
  initialize: ->
  
  setVal: (v) -> @plot.setVal v

Widget.register [Plot]
