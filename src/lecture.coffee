$(document).on "layoutCompiled", (evt, data) ->
  
  return unless $blab.lecture or $blab.lecture2
  
  button = $ "#start-lecture-button"
  lecture = null
  
  return if button.length
  
  button = $ "<button>",
    id: "start-lecture-button"
    text: "Start lecture"
    css: marginBottom: "10px"
  
  $("#defs-code-heading").after button
  
  if $blab.lecture
    button.click (evt) ->
      lecture = $blab.lecture()
    
    # TODO: clear event
    $("body").keydown (evt) =>
      lecture?.doStep() if evt.target.tagName is "BODY" #and evt.keyCode is 32
    
    #$("body").keydown (evt) =>
    #  console.log evt
  
  if $blab.lecture2
    button.click (evt) ->
      lecture = $blab.lecture2()
      
    # TODO: clear event
    $("body").keydown (evt) =>
      return unless evt.target.tagName is "BODY"
      if evt.keyCode is 37
        lecture?.back()
      else
        console.log evt.keyCode
        lecture?.doStep() #and evt.keyCode is 32  
    

class $blab.Lecture2
  
  constructor: ->
    
    $("#computation-code-wrapper").hide()
    $("#buttons").hide()
    
    @steps = []
    @stepIdx = -1
    
    @clear()
    @init()
    @content()
    
    #@steps.push =>
    #  @finish()
    #  $("#buttons").show()
    #  $("#computation-code-wrapper").show()
      
    setTimeout (=> @doStep()), 100  #100
    
  init: ->
    # Can override in lecture blab.
    $("[id|=lecture]").hide()
    $(".puzlet-slider").parent().hide()
    $(".puzlet-plot").parent().hide()
    # ZZZ same for table, plot2, etc.
    #$("#slider-k").siblings().andSelf().css(opacity: 0.2)  
    #$("#plot-plot").siblings().andSelf().css(opacity: 0.2)
    
  finish: ->
    $("[id|=lecture]").show()
    $(".puzlet-slider").parent().show()
    $(".puzlet-plot").parent().show()
    # ZZZ same for table, plot2, etc.
  
  clear: ->
    @container = $ "#main-markdown"  # ZZZ no need to be property
    #@container.empty()
    #$(".layout-box").hide()
    #$(".lecture-content").remove()
    
    #@box(pos: 1).hide()
    #@box(pos: 2).hide()
    
  content: ->
    
    
  step: (obj, action) ->
    
    # option to pass array/obj for first arg.  then can do multiple transitions.
    
    if typeof obj is "string"
      obj = $("#"+obj)
    
    # Use parent object for specified widgets
    if obj.hasClass("puzlet-slider") or obj.hasClass("puzlet-plot")
      # ZZZ do for table, plot2, etc.  way to detect any widget?
      obj = obj.parent()
    
    #console.log("slider", $("#slider-k").hasClass("puzlet-slider"))
    #console.log("slider", $("#plot-plot").hasClass("puzlet-plot"))
    
    console.log "OBJ", obj.data(), obj
    
    action ?= (o) ->
      f: -> o.show()
      b: -> o.hide()
      
    if action is "fade"
      action = (o) ->
        f: -> o.fadeIn()
        b: -> o.fadeOut()
      
    @steps = @steps.concat {obj, action}
    console.log "steps", @steps
    
  doStep: ->
    if @stepIdx<@steps.length
      @stepIdx++
    if @stepIdx>=0 and @stepIdx<@steps.length
      step = @steps[@stepIdx]
      obj = step.obj
      action = step.action
      action(obj).f()
      audioId = obj.data().audio
      if audioId
        audio = document.getElementById(audioId)
        audio.play()
        
    else
      @finish()
      $("#buttons").show()
      $("#computation-code-wrapper").show()
    console.log "stepIdx", @stepIdx
    
  back: ->
    console.log "BACK STEP"
    if @stepIdx>=0 and @stepIdx<@steps.length
      step = @steps[@stepIdx]
      obj = step.obj
      action = step.action
      action(obj).b()
      #@steps[@stepIdx].action.b(obj)
    if @stepIdx>=0
      @stepIdx--
    console.log "stepIdx", @stepIdx
  

#-------------------- OLD LECTURE CLASS ----------------------#

class $blab.Lecture
  
  #@used: false
  
  constructor: ->
    
    $("#computation-code-wrapper").hide()
    $("#buttons").hide()
    
    @steps = []
    @stepIdx = 0
    
    @clear()
    @init()
    @content()
    
    @steps.push ->
      $("#buttons").show()
      $("#computation-code-wrapper").show()
    
    setTimeout (=> @doStep()), 100  #100
  
  box: (params = {pos: 0, order: null}) ->
    pos = params?.pos ? 0
    order = params?.order
    if pos is 0
      $ "#main-markdown"
    else
      if order
        $ "#widget-box-#{pos} .order-#{order}"
      else
        $ "#widget-box-#{pos}"
  
  clear: ->
    @container = $ "#main-markdown"  # ZZZ no need to be property
    @container.empty()
    $(".layout-box").hide()
    $(".lecture-content").remove()
    #@box(pos: 1).hide()
    #@box(pos: 2).hide()
  
  math: (math) ->
    new LectureMath @container, math
  
  step: (step) ->
    @steps = @steps.concat step
    
  doStep: ->
    @steps[@stepIdx]() if @stepIdx<@steps.length
    @stepIdx++
  
  html: (html, options) ->
    
    # TO FIX: math rendered after typed
    
    container = options?.container ? $("#main-markdown")
    
    div = $ "<div>", class: "lecture-content"
    div.css(options.css) if options?.css
    container.append div
    
    typed = options?.typed ? true
    
    if typed
      div.typed
        strings: [html]
        typeSpeed: 10
        contentType: "html"
        showCursor: false
        onStringTyped: ->
          $.event.trigger "htmlOutputUpdated"
    else
      div.html html
      $.event.trigger "htmlOutputUpdated"
      
  audio: (id) ->
    audio = document.getElementById(id) #$ "#x-squared"
    #console.log "audio", audio
    #intro.currentTime = 1;
    #intro.duration = 0.5;
    audio.play()
    #setTimeout(function() {intro.pause()}, 1000)
    #setTimeout(function() {intro.play()}, 2000)
    #var n = 0;
    #audio[0].onended = function() {
    #  document.getElementById("text").innerHTML = "Other text.";
    #  n++;
    #  if (n<2) sam.play();
    #};

class LectureMath
  
  constructor: (@container, @math) ->
    @div = $ "<div>",
      class: "lecture-content"
      css: fontSize: "24pt"
      html: "$ $"
    @container.append @div
    
    watch = true
    $(document).on "mathjaxProcessed", =>
      return unless watch
      @render()
      watch = false
      
    $.event.trigger "htmlOutputUpdated"
    
    #div.fadeOut(0).delay(100).fadeIn(100)
    
  set: (@math) ->
    @render()
    
  append: (math) ->
    @math = @math + math
    @render()
    
  render: ->
    @div.html "$#{@math}$"  # ZZZ after rendered above?
    $.event.trigger "htmlOutputUpdated"

