#!vanilla
#!no-math-sugar

# Slider widget for blabr.

Widget = $blab.Widget

class Slider extends Widget
  
  @handle: "slider"
  
  @source: true
  
  @initVal: 5
  
  #@cssUrl: "/puzlet/widgets/slider/style.css"
  
  @initSpec: (id) -> """
    min: 0, max: 10, step: 0.1, init: #{@initVal}
    prompt: "#{id}:"
    unit: ""
    pos: 1, order: 1
  """
  
  create: (@spec) ->
    
    {@min, @max, @step, @init, @prompt, @text, @val, @unit, @fast} = @spec
    
    @outer = $ "<div>", class: "slider-container"
    
    @slider = new $blab.components.Slider
      container: @outer
      # orientation: "vertical"  # Not working yet.
      range: "min"
      min: @min
      max: @max
      step: @step
      init: @init
      prompt: @prompt
      val: @val
      unit: @unit
      fast: @fast
      change: => @computeAll()
    
    @appendToCanvas @outer
    
    # Override default mouseup behavior.
    # Not needed if stop propagation for slider mouseup?
    # @outer.unbind "mouseup"
    # @outer.mouseup (evt) =>
    #   return if $(evt.target).hasClass("ui-slider-handle")
    #   @select() unless @slider.sliding
    #   @slider.sliding = false
    
    # For popup editor manager.  Needed?
    # @slider.sliderContainer.mousedown (e) => $.event.trigger "clickInputWidget"
    
  initialize: -> @setVal @init
  
  destroy: -> @slider.destroy()
  
  setVal: (v) -> @slider.set v
  
  getVal: -> @slider.getVal()
  
  
Widget.register [Slider]
