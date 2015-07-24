class DemoButton
  
  #text: "Click here to run demo"
  
  constructor: ->
    
    @isMain = not $blab.resources.getSource?
    
    @container = $ "#demo-start-button-area"
    @container.css
      height: (if @isMain then 400 else 80)
      
    @container.addClass "demo-start-button-main" if @isMain
    
    if @isMain
      $("#main-markdown").hide()
      $("#demo-list").slideDown()
    
    @firstLayout = true
    $blab.Layout.on "renderedWidgets", =>
      return unless @firstLayout
      @create()
      @firstLayout = false
      
    @firstChange = true
    $(document).on "codeNodeChanged", =>
      return unless @firstChange
      @div.fadeOut 500, =>
        @container.slideUp 500, =>
          if @isMain
            $("#main-markdown").slideDown()
            $("#demo-list").slideUp()
      @firstChange = true
    
  create: ->
    @clicked = false
    @div = $ "<div>",
      id: "demo-button"
    @div.css top: 120 if @isMain
    @button = $ "<div>",
      #id: "demo-button"
      class: "demo-button"
      #html: @text
      #css:
        #width: @width
      #  left: (@container.width() - @width)/2
      click: =>
        return if @clicked
        @clicked = true
        @div.fadeOut(500, => 
          @container.slideUp 500, =>
            if @isMain
              $("#main-markdown").slideDown()
              $("#demo-list").slideUp()
            setTimeout (-> new Demo), 500)
    @intro() if @isMain  # TODO: only if main page
    @div.append "<div style='color: #aaa; margin-bottom: 4px;'>Click to run demo</div>" unless @isMain
    @div.append @button
    @playImg = $ "<img>", src: "img/UI_76.png"
    @button.append @playImg
    @container.append @div
    @div.css left: (@container.width() - @div.width())/2
    @button.css marginLeft: (@div.width() - @button.width())/2
    
  intro: ->
    @container.append """
      <div style='margin-bottom: 8px; font-size: 12pt; line-height: 150%;'>
      <img id="demo-start-button-main-image" src="img/blab.png"/>
      </div>
    """
    @div.append "<div class='demo-start-button-main-text'><h1>Scientific computing in the browser.</h1></div>"
    #<p>Blabr</b> is a tool for creating a <b>blab</b> (short for we<b><i>b lab</i></b>) &mdash;<br>
    #a web page for interactive computation.</p>
    # math, sliders, tables, plots, etc.</p>
    

new DemoButton

guide = $ "#demo-guide"

app = $blab.blabrApp
markdownEditor = app.markdownEditor
computationEditor = app.computationEditor
defsEditor = app.definitions
widgetEditor = app.widgetEditor
Widgets = $blab.Widgets

class Editor
  
  delay: 500
  charDelay: 150
  runOnStatement: false
  clearFirst: false
  
  constructor: (@appEditor, @guide) ->
    @editor = @appEditor.editor
    @ace = @appEditor.aceEditor
    @firstAppend = true
    
  statement: (@statementStr, cb) ->
    @statementCharIdx = 0
    @statementLength = @statementStr.length
    @ace.focus()
    
    doStatement = =>
      @ace.insert "\n" unless @firstAppend
      @firstAppend = false
      @ace.navigateFileEnd()
      @ace.removeToLineStart() if @ace.getCursorPosition().column>0  # Remove any indentation
      @char cb
    
    if @firstAppend and @clearFirst
      @step (=> @ace.selection.selectAll()), =>
        @ace.insert ""
        doStatement()
    else
      doStatement()
    
  char: (cb) ->
    i = @statementCharIdx
    c = @statementStr.slice(i, i+1)
    @ace.insert c
    if i < @statementLength
      @statementCharIdx++
      setTimeout (=> @char(cb)), @charDelay
    else
      @editor.run() if @runOnStatement
      cb()
      
  replace: (spec, cb) ->
    {vline, line, word, replace} = spec
    vline ?= 1
    line ?= (@editor.spec.startLine - 1) + vline
    #console.log "line", line
    @ace.focus()
    @gotoLine line, =>
      if spec.find
        @step (=> @ace.find spec.find), =>
          if spec.slow
            @statementStr = replace
            @statementCharIdx = 0
            @statementLength = @statementStr.length
            @char cb
          else
            @step (=> @ace.insert replace), =>
             @step (=>
               @editor.run() if @runOnStatement
             ), -> cb?()
      else
        @navigateRight word, =>
          @replaceWordRight replace, =>
            @step (=>
              @editor.run() if @runOnStatement
            ), -> cb?()
  
  gotoLine: (line, cb) ->
    @ace.gotoLine line
    cb()
    #setTimeout (-> cb()), @delay
  
  navigateRight: (numWords, cb) ->
    wordIdx = 0
    navRight = =>
      @ace.navigateWordRight()
      wordIdx++
      if wordIdx < numWords
        navRight()
        #setTimeout (-> navRight()), @delay
      else
        setTimeout cb, @delay
    navRight()
    
  replaceWordRight: (word, cb) ->
    @step (=> @ace.selection.selectWordRight()), =>
      @step (=>
        @ace.removeWordRight()
        @ace.insert(word)
        @ace.navigateWordLeft()
        @ace.selection.selectWordRight()
      ), => cb()
  
  step: (step, cb) ->
    step()
    setTimeout (-> cb()), @delay


class Text
  
  constructor: (@guide) ->
  
  explain: (html, background, cb) ->
    @guide.show()
    c = $("#blabr-tagline")
    pos = c.offset()
    #top = pos.top + 60
    h = $(window).height()
    top = h/3 #if top > h - 200
    @guide.css
      top: top
      left: ($("body").width() - 500)/2
      background: background ? "#ff9"
      width: 500
      #left: 500
    #@guide.animate {
    #  top: pos.top + 10
    #  left: pos.left + 500
    #}, 400, cb
    @guide.html html
    cb()


class Markdown extends Editor
  
  charDelay: 50
  
  constructor: (@guide) ->
    super markdownEditor, @guide
  
  explain: (html, cb) ->
    @guide.show()
    c = @editor.outer
    pos = c.offset()
    @guide.animate {
      top: pos.top + 10
      left: pos.left + 500
    }, 400, cb
    @guide.html html


class Computation extends Editor
  
  clearFirst: true
  runOnStatement: true
  
  constructor: (@guide) ->
    super computationEditor, @guide
  
  explain: (html) ->
    @guide.show()
    c = @editor.container
    pos = c.position()
    @guide.css
      top: pos.top + c.height() + 30
      left: pos.left
    @guide.html html


class Definitions extends Editor
  
  clearFirst: true
  runOnStatement: true
  
  constructor: (@guide) ->
    super defsEditor, @guide
    
  explain: (html) ->
    @guide.show()
    c = @editor.container
    pos = c.position()
    @guide.css
      top: pos.top + c.height() + 30
      left: pos.left
    @guide.html html


class Layout extends Editor
  
  runOnStatement: true
  
  constructor: (@guide) ->
    super widgetEditor, @guide
  
  explain: (html, cb) ->
    @guide.show()
    c = @editor.outer
    pos = c.offset()
    @guide.animate {
      top: pos.top + 30
      left: pos.left + 500
    }, 400, cb
    @guide.html html


class Sliders
  
  delay: 200
  
  constructor: (@guide) ->
    
  animate: (id, vals, cb) ->
    idx = 0
    setSlider = (cb) =>
      v = vals[idx]
      $("#"+id).slider 'option', 'value', v
      Widgets.widgets[id].setVal v
      Widgets.compute()
      idx++
      if idx < vals.length
        setTimeout (-> setSlider(cb)), @delay
      else
        cb()
        
    setSlider(cb)
    
  explain: (html, cb) ->
    @guide.show()
    @guide.animate {
      top: 20
      left: 400
    }, 400, cb
    @guide.html html


class Script
  
  stepDelay: 500 # 1000 (shouldn't be smaller than 500?)
  
  constructor: ->
    @steps = []
    
  step: (step) ->
    @steps.push step
    
  run: ->
    # TODO: method?
    numSteps = @steps.length
    stepIdx = 0
    delay = @stepDelay
    runStep = =>
      step = @steps[stepIdx]
      step ->
        stepIdx++
        if stepIdx < numSteps
          setTimeout (-> runStep()), delay # Recursion
        else
          console.log "Demo done"
    runStep()
    


class DemoControl
  
  constructor: ->
    @control = $ "#demo-control"
    @control.show()
    @pauseImg = $ "<img>", src: "img/UI_78.png", class: "demo-button-img"
    @playImg = $ "<img>", src: "img/UI_76.png", class: "demo-button-img"
    @control.click =>
      return unless @enabled
      @trigger "click"
    
    @show(false)
    
    @observers =
      click: []
  
  text: (text) -> @control.html text
  
  show: (show=true, play=false) ->
    @enabled = show
    @control.css
      opacity: (if show then 1 else 0.2)
      cursor: (if show then "pointer" else "default")
    @control.empty()
    @control.append (if play then @playImg else @pauseImg)
  
  on: (evt, observer) -> @observers[evt].push observer
  
  trigger: (evt, data) -> observer(data) for observer in @observers[evt]
  

class Demo
  
  dwellDelay: 1000
  
  constructor: ->
    
    #demo = $blab.resources.find "demo.coffee"
    #demo.content = "# Demo"
    
    console.log "DEMO"#, demo
    
    @isMain = not $blab.resources.getSource?
    
    @script = new Script
    @textGuide = new Text guide
    @markdown = new Markdown guide
    @computation = new Computation guide
    @definitions = new Definitions guide
    @layout = new Layout guide
    @sliders = new Sliders guide
    
    @control = new DemoControl
    @tId = null
    @nextStep = null
    
    @control.on "click", =>
      if @tId
        @control.show true, true
        clearTimeout(@tId)
        @tId = null
      else
        @nextStep?()
        @nextStep = null
    
    $blab.demoScript
      text: (p...) => @text(p...)
      compute: (p...) => @compute(p...)
      defs: (p...) => @defs(p...)
      widget: (p...) => @widget(p...)
      slider: (p...) => @slider(p...)
      md: (p...) => @md(p...)
      delays: (p...) => @delays(p...)
    
    @learnMore()
    
    #@script.step (cb) =>
    #  @control.control.hide()
    #  guide.hide()
    #  cb()
    
    @script.run()
    
  text: (html, dwell=@dwellDelay, background="#ff9") ->
    @script.step (cb) =>
      done = ->
        guide.css
          width: ""
          background: "#ff9"
        guide.hide()
        cb()
      @textGuide.explain html, background, =>
        @dwell dwell, -> done()
  
  md: (spec, dwell=@dwellDelay) ->
    dwell = spec.dwell if spec.dwell
    @script.step (cb) =>
      display = markdownEditor.editor.outer.css "display"
      markdownEditor.trigger "clickText", {start: 0} if display is "none"
      edit = =>
        d = => @dwell dwell, -> cb()
        if spec.replace
          @markdown.replace spec, d
        else if spec.append
          @markdown.statement spec.append, d
        else if spec.close
          markdownEditor.setViewPort null
          d()
      # TODO: This should be triggered after md editor visible.
      setTimeout (=> @markdown.explain(spec.guide)), 500 if spec.guide
      setTimeout (-> edit()), 900
  
  compute: (statement, html="", dwell=@dwellDelay) ->
    @script.step (cb) =>
      @computation.explain html if html.length
      @computation.statement statement, =>
        done = ->
          guide.hide()
          cb()
        @dwell dwell, -> done()
        
  defs: (statement, html="", dwell=@dwellDelay) ->
    @script.step (cb) =>
      @definitions.explain html if html.length
      @definitions.statement statement, =>
        @dwell dwell, -> 
          guide.hide()
          cb()
      
  widget: (spec) ->
    @script.step (cb) =>
      @layout.explain spec.guide, =>
        @layout.replace spec, =>
          @dwell (spec.dwell ? @dwellDelay), cb
        
  slider: (spec) ->
    @script.step (cb) =>
      @sliders.explain spec.guide, =>
        @sliders.animate(spec.id, spec.vals, cb)
        
  delays: (spec) ->
    @script.stepDelay = spec.step if spec.step
    
    if spec.changeCode
      @markdown.delay = spec.changeCode
      @computation.delay = spec.changeCode
      @layout.delay = spec.changeCode
    
    @markdown.charDelay = spec.mdChar if spec.mdChar
    if spec.codeChar
      @computation.charDelay = spec.codeChar
      @definitions.charDelay = spec.codeChar
    
    @sliders.delay = spec.slider if spec.slider
    
    @dwellDelay = spec.dwell if spec.dwell
    
  dwell: (t, cb) ->
    # ZZZ show control here?
    @nextStep = =>
      @control.show(false)
      cb()
    @tId = setTimeout (=>
      @nextStep()
      @nextStep = null
    ), t
    @control.show()
    
  learnMore: ->
    @script.step (cb) =>
      html = """
        <b>Learn more about Blabr</b><br><br>
        The button <button>Blabr Guide</button> (bottom of page)<br>
        shows demos, examples, and documentation.<br><br>
        <a href="#{window.location}">Run this demo again</a>
      """
      dwell = 10000
      bg = "#ff9"
      done = =>
        @control.control.hide()
        guide.css
          width: ""
          background: bg
        guide.hide()
        cb()
      setTimeout (-> $("#demo-list").slideDown()), 1000
      @textGuide.explain html, bg, =>
        @dwell dwell, -> done()

