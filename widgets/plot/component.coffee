#!vanilla
#!no-math-sugar

# Plot component.
# For any web page.

class Plot
  
  constructor: (@spec) ->
    
    {@container, @title, @width, @height, @xlabel, @ylabel, @css} = @spec
    
    #@outer = $ "<div>", class: "plot-container"
    
    @plot = $ "<div>",
      class: "puzlet-plot"
      css:
        width: @width ? 400
        height: @height ? 200
    
    @displayTitle(@title) if @title
    
    @container.append @plot
#    @outer.append @plot
    
    @plot.css(@css) if @css
    
    #@container.append @outer
  
  ui: -> (x, y) => @setVal([x, y])
  
  destroy: ->
    #@caption.remove()
    #@plot.remove()  # ZZZ needed?  remove outer ok?
  
  displayTitle: (title) ->
    @caption = $ "<div>",
      class: "plot-title"
      html: title
    @container.append @caption
#    @outer.append @caption
  
  setVal: (v) ->
    
    @value = v
    
    params = @spec
    params.series.shadowSize ?= 0
    params.series ?= {color: "#55f"}
    @setAxes params
    
    lol = (u) -> # list of lists
      if u[0].length?
        z = u
      else
        z = []
        z.push u
      z
      
    X = lol v[0]
    Y = lol v[1]
    
    maxRows =  Math.max(X.length, Y.length)
    d = []
    for k in [0...maxRows]
      xRow = Math.min(k,X.length-1)
      yRow = Math.min(k,Y.length-1)
      l = numeric.transpose([X[xRow], Y[yRow]])
      d.push l
    
    @flot = $.plot @plot, d, params
    
    # Center plot in parent container
    o = @flot.getPlotOffset()
    m = (@plot.parent().width() - @plot.width() - o.left + o.right)/2
    @plot.css marginLeft: m
    
  setAxes: (params) ->
    
    params.xaxis ?= {}
    params.yaxis ?= {}
    
    params.xaxis?.axisLabel = params.xlabel if params.xlabel
    params.yaxis?.axisLabel = params.ylabel if params.ylabel
    params.xaxis?.axisLabelUseCanvas ?= true
    params.yaxis?.axisLabelUseCanvas ?= true
    params.xaxis?.axisLabelPadding ?= 10
    params.yaxis?.axisLabelPadding ?= 10


window.$blab ?= {}
$blab.components ?= {}
$blab.components.Plot = Plot
