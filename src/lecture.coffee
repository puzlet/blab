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
    #setupAudio()
    
    button.click (evt) ->
      lecture = $blab.lecture2()
      #setupAudio()
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

# Audio should be tied to transitions, rather than ion html.  But then how will load all?
# Answer: once layout done, run lecture constructor.  Will not run init method (or whatever it's called).
# This will find all audio.

class $blab.Lecture2
  
  constructor: ->
    
    @setupGuide()
    @progress = new Progress()
    
    @steps = []
    @stepIdx = -1
    
    @content()
    
  # ZZZ TEMP - not used
  setupAudio: ->
    server = @audioServer
    audio = $("[data-audio]")
    for a in audio
      id = $(a).data "audio"
      unless $("audio#{id}").length
        $(document.body).append "<audio id='#{id}' src='#{server}/#{id}.mp3'></audio>\n"
    
  
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
    
    setTimeout (=> @kickoff()), 100  #100
    #setTimeout (=> @doStep()), 100  #100
    
  kickoff: ->
    @clear()
    @init()
    @doStep()
    
  init: ->
    console.log "******** OBJECTS", $("[id|=lecture]").css("display")
    # Can override in lecture blab.
    $("[id|=lecture]").hide()
    $(".puzlet-slider").parent().hide()
    $(".puzlet-plot").parent().hide()
    $(".widget").hide()
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
    $(".widget").show()
    
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
    @progress.clear()
    
    $("[id|=lecture]").show()
    $(".hide[id|=lecture]").hide()
    
    #$("[id|=lecture]:not[display=none]").show()
    $(".puzlet-slider").parent().show()
    $(".puzlet-plot").parent().show()
    $(".widget").show()
    
    $("#computation-code-wrapper").show()
    $("#buttons").show()
    $("#start-lecture-button").show()
    
    @stepIdx = -1    
    
  step: (obj, spec={}) ->
    # was: action, opt
    
    # option to pass array/obj for first arg.  then can do multiple transitions.
    
    if typeof obj is "string"
      obj = $("#"+obj)
    
    # Use parent object for specified widgets
    if obj.hasClass("puzlet-slider") or obj.hasClass("puzlet-plot") #or obj.hasClass("widget")
      # ZZZ do for table, plot2, etc.  way to detect any widget?
      origObj = obj
      obj = obj.parent()
    
    #console.log("slider", $("#slider-k").hasClass("puzlet-slider"))
    #console.log("slider", $("#plot-plot").hasClass("puzlet-plot"))
    
    console.log "OBJ", obj.data(), obj
    
    action = spec.action
    
    action ?= (o) ->
      f: -> o.show()
      b: -> o.hide()
    
    if action is "fade"
      action = (o) ->
        f: -> o.fadeIn()
        b: -> o.fadeOut()
    
    # ZZZ options for replace
    if spec.replace
      rObj = spec.replace
#    if action is "replace"
      action = (o) ->
        f: -> rObj.fadeOut(300, -> o.fadeIn())
        b: -> o.hide(0, -> rObj.show())
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
        f: => @slider origObj, spec.vals
        b: => @slider origObj, [origVal]  # ZZZ should be original val?
          
    if action is "table"
      domId = obj.attr "id"
      action = (o) =>
        #console.log "origVal", origVal
        #console.log "**** action id", id
        f: => @tablePopulate obj, spec.col, spec.vals, -> 
          #setTimeout (-> $(document.body).click()), 1000
          #console.log "******* table done"
        #  -> console.log "CAPTION", $("caption")
          #(-> setTimeout (-> obj.click()), 1000)
        #(-> obj.blur())
        b: => #no reverse action yet
          
    audio = spec.audio
    if audio and not $("audio#{audio}").length
      $(document.body).append "<audio id='#{audio}' src='#{@audioServer}/#{audio}.mp3'></audio>\n"
      
    @steps = @steps.concat {obj, action, audio}
    console.log "steps", @steps
    
    obj
    
  doStep: ->
    if @stepIdx<@steps.length
      @stepIdx++
      
    @progress.draw @stepIdx+1, @steps.length
    
    if @stepIdx>=0 and @stepIdx<@steps.length
      step = @steps[@stepIdx]
      obj = step.obj
      action = step.action
      action(obj).f()
      audioId = step.audio
      #audioId = obj.data().audio
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
      
    @progress.draw @stepIdx+1, @steps.length
    
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
  
  # TODO: move slide/step logic here - consolidate
  slide: (obj, spec) ->
    spec.action = "slide"
    @step obj, spec
  
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
        
  tablePopulate: (obj, col, vals, cb) ->
    delay = 1000
    idx = 0
    domId = obj.attr "id"
    setTable = (cb) =>
      v = vals[idx]
      #domId = $blab.Widget.createDomId "table-", id
      t = Widgets.widgets[domId]
      console.log "***t/col/vals/idx", t, col, vals, idx
      cell = t.editableCells[col][idx]  # 0 needs to be arg.
      dir = if idx<vals.length-1 then 1 else 0
      cell.div.text v
      bg = cell.div.parent().css "background"
      cell.div.parent().css background: "#ccc"
      #cell.div.click()
      setTimeout (->
        cell.div.parent().css background: bg
        cell.done()
      ), 200
      #cell.div.blur()
      
      #changed = true
      #dir = 0
      #colDir = 0
      #cell.callback v, changed, dir, colDir
      
      
#     cell.enterVal(v, dir)
      #cell.div.blur()
      idx++
      if idx < vals.length
        setTimeout (-> setTable(cb)), delay
      else
        console.log("cells", $('.editable-table-cell'))
        cells = $('.editable-table-cell')
        setTimeout (->
          $(cells[2]).blur()
          $("#container").click()
          #$(cells[0]).focus()
          #$(document.body).focus()
        ), 1000
        cb?()
        
    setTable(cb)
      
        
  table: (obj, spec) ->
    spec.action = "table"
    @step obj, spec


class Progress
  
  constructor: ->
    
    @container = $ document.body
    
    @wrapper = $ "<div>", class: "progress-outer"
    @container.append @wrapper
    
    @div = $ "<div>", class: "progress-inner"
    @wrapper.append @div
    
  draw: (@currentStep, @numSteps) ->
    @clear()
    for step in [1..@numSteps]
      fill = step is @currentStep
      @circle(fill)
      
  clear: ->
    @div.empty()
  
  circle: (filled = false)->
    circle = $ "<div>", class: "step-circle" + (if filled then " step-circle-filled" else "")
    @div.append circle
    
    
    
    
    


