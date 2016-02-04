$(document).on "layoutCompiled", (evt, data) ->
  
  return unless $blab.lecture
  
  button = $ "#start-lecture-button"
  lecture = null
  
  return if button.length
  
  button = $ "<button>",
    id: "start-lecture-button"
    text: "Start lecture"
    css: marginBottom: "10px"
  
  $("#defs-code-heading").after button
  
  button.click (evt) ->
    lecture = $blab.lecture()
    
  # TODO: clear event
  $("body").keypress (evt) =>
    lecture?.doStep() if evt.target.tagName is "BODY" #and evt.keyCode is 32


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

