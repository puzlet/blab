Widgets = null

$(document).on "layoutCompiled", (evt, data) ->
  
  return unless $blab.lecture or $blab.lecture2
  
  Widgets = $blab.Widgets
  
  button = $ "#start-lecture-button"
  lecture = null
  
  return if button.length
  
  button = $ "<button>",
    id: "start-lecture-button"
    text: "Start lecture"
    css: marginBottom: "10px"
  
  $("#widgets-container").after button
  
  if $blab.lecture
    button.click (evt) ->
      lecture = $blab.lecture()
    
    # TODO: clear event
    $("body").keydown (evt) =>
      lecture?.doStep() if evt.target.tagName is "BODY" #and evt.keyCode is 32
    
    #$("body").keydown (evt) =>
    #  console.log evt
  
  if $blab.lecture2
    
    setupAudio = ->
      server = lecture.audioServer
      audio = $("[data-audio]")
      for a in audio
        id = $(a).data "audio"
        unless $("audio#{id}").length
          $(document.body).append "<audio id='#{id}' src='#{server}/#{id}.mp3'></audio>\n"
    
    lecture = $blab.lecture2()
    setupAudio()
    
    button.click (evt) ->
      lecture = $blab.lecture2()
      setupAudio()
      lecture.start()  # Wait until audio loaded?
      
    # TODO: clear event
    $("body").keydown (evt) =>
      return unless evt.target.tagName is "BODY"
      return unless lecture
      if evt.keyCode is 37
        lecture?.back()
      else if evt.keyCode is 27  # Escape
        lecture?.reset()
        lecture = null  # ZZZ better way?
      else
        console.log evt.keyCode
        lecture?.doStep() #and evt.keyCode is 32
        



# TODO
# lecture button should appear only once all audio loaded.
# load audio in defs section?  search for data-audio attributes?  do via lecture.coffee?
# way to have math builds - elements that don't show in initital presentation.

# * yellow popup text boxes - placed anywhere.
# * similarly, balloon pointer boxes.  point at text/widget etc., and explain it.
# * a generic pointer (scripted) for audio/voiceovers.

class $blab.Lecture2
  
  constructor: ->
    
    @setupGuide()
  
    
  setupGuide: ->
    
    @guide = $ "#demo-guide"
    @guide.draggable()
    
    @guide.css
      top: 30
      left: ($("body").width() - 200)
      background: background ? "#ff9"
      textAlign: "center"
      width: 150
    
    @guide.hide()
  
  start: ->
    
    $("#computation-code-wrapper").hide()
    $("#buttons").hide()
    $("#start-lecture-button").hide()
    
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
    console.log "******** OBJECTS", $("[id|=lecture]").css("display")
    # Can override in lecture blab.
    $("[id|=lecture]").hide()
    $(".puzlet-slider").parent().hide()
    $(".puzlet-plot").parent().hide()
    # ZZZ same for table, plot2, etc.
    #$("#slider-k").siblings().andSelf().css(opacity: 0.2)  
    #$("#plot-plot").siblings().andSelf().css(opacity: 0.2)
    
    @guide.html """
      <b>&#8592; &#8594;</b> to navigate<br>
      <b>Esc</b> to exit
    """
    #@guide.css textAlign: "left"
    
    show = =>
      @guide.show()
      setTimeout (-> hide()), 5000
      
    hide = =>
      @guide.hide()
      @guide.css textAlign: "center"
    
    setTimeout (-> show()), 1000 #.delay(3000).hide()
    
    
  # ZZZ UNUSED?
  finish: ->
    $("[id|=lecture]").show()
    $(".hide[id|=lecture]").hide()
    
    #$("[id|=lecture]:not[display=none]").show()
    $(".puzlet-slider").parent().show()
    $(".puzlet-plot").parent().show()
    
    @stepIdx = -1
    
    # ZZZ same for table, plot2, etc.
  
  clear: ->
    @container = $ "#main-markdown"  # ZZZ no need to be property
    #@container.empty()
    #$(".layout-box").hide()
    #$(".lecture-content").remove()
    
    #@box(pos: 1).hide()
    #@box(pos: 2).hide()
    
  content: ->
  
  reset: ->
    
    @guide.hide()
    
    $("[id|=lecture]").show()
    $(".hide[id|=lecture]").hide()
    
    #$("[id|=lecture]:not[display=none]").show()
    $(".puzlet-slider").parent().show()
    $(".puzlet-plot").parent().show()
    
    $("#computation-code-wrapper").show()
    $("#buttons").show()
    $("#start-lecture-button").show()
    
    @stepIdx = -1
    
    
  step: (obj, action, opt) ->
    
    # option to pass array/obj for first arg.  then can do multiple transitions.
    
    if typeof obj is "string"
      obj = $("#"+obj)
    
    # Use parent object for specified widgets
    if obj.hasClass("puzlet-slider") or obj.hasClass("puzlet-plot")
      # ZZZ do for table, plot2, etc.  way to detect any widget?
      origObj = obj
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
    
    # ZZZ options for replace
    if action is "replace"
      action = (o) ->
        f: -> opt.fadeOut(300, -> o.fadeIn())
        b: -> o.fadeOut(300, -> opt.fadeIn())
        #f: -> replaceObj.hide(0, -> o.show())
        #b: -> o.hide(0, -> replaceObj.show()) 
          #replaceObj.show(0, -> o.hide())
          
    if action is "slide"
        #id = "k"  # ZZZ temp
        #id = origObj.attr "id"
        domId = origObj.attr "id"
        origVal = Widgets.widgets[domId].getVal()
        action = (o) =>
          console.log "origVal", origVal
          #console.log "**** action id", id
          f: => @slider origObj, opt
          b: => @slider origObj, [origVal]  # ZZZ should be original val?
      
    @steps = @steps.concat {obj, action}
    console.log "steps", @steps
    
    obj
    
  doStep: ->
    if @stepIdx<@steps.length
      @stepIdx++
    if @stepIdx>=0 and @stepIdx<@steps.length
      step = @steps[@stepIdx]
      obj = step.obj
      action = step.action
      action(obj).f()
      audioId = obj.data().audio
      if audioId and @enableAudio
        audio = document.getElementById(audioId)
        audio.play()
      
    if @stepIdx>=@steps.length
      @guide.html """
        <b>End of lecture</b><br>
        <b>&#8592; &#8594;</b> to navigate<br>
        <b>Esc</b> to exit
      """
      @guide.show()
    else
      @guide.hide() if @guide.is(":visible")
      #alert "AT END"
        
    #else
    #  @finish()
    #  $("#buttons").show()
    #  $("#computation-code-wrapper").show()
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
    if @stepIdx<0
      @guide.html """
        <b>Start of lecture</b><br>
        <b>&#8592; &#8594;</b> to navigate<br>
        <b>Esc</b> to exit
      """
      @guide.show()
    else
      @guide.hide() if @guide.is(":visible")
      #alert "BACK TO START"
      #@reset()
      
  slider: (obj, vals, cb) ->
    delay = 200
    idx = 0
    domId = obj.attr "id"
    #$.event.trigger "clickInputWidget"
    setSlider = (cb) =>
      console.log "setSlider"
      v = vals[idx]
      
      #console.log "****** id, domId", id, domId
      obj.slider 'option', 'value', v
#      $("#"+domId).slider 'option', 'value', v
      Widgets.widgets[domId].setVal v
      Widgets.compute()
      idx++
      if idx < vals.length
        setTimeout (-> setSlider(cb)), delay
      else
        cb?()
      
    setSlider(cb)
    #setTimeout (-> setSlider(cb)), 0
  

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

