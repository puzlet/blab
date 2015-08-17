console.log "-------------Demo runner"

class MainDemoStart
  
  constructor: (@runDemo) ->
    @container = $ "#demo-start-button-area"
    @container.addClass "demo-start-button-main"
    $("#main-markdown").css opacity: 0
  
  clear: (callback) ->
    @button.clear()
    @container.slideUp 1000, =>
      $("#top-banner").slideUp 400, =>
        $("#main-markdown").animate {opacity: 1}, 1500, -> callback?()
    
  create: ->
    
    img = $ "<img>",
      id: "demo-start-button-main-image"
      src: "img/blab.png"
    
    @div = $ "<div>",
      class: "demo-start-button-main-text"
        
    #@logo()
    
    @div.append "<h1>Scientific computing for the web.</h1>"
    
    @container.append(img).append(@div)
    @container.click => @clear => @runDemo()
    
    @button = new PlayButton @div, (=>)
    
  logo: ->
    
    @logoContainer = $ "<div>", id: "blabr-logo"
    @div.append @logoContainer
    
    @logo = $ "<img>",
      src: "img/blabr-logo.png"
      height: 60
    @logoContainer.append(@logo).append("<p>Blabr</p>")


class DemoButton
  
  constructor: (@runDemo) ->
    @container = $ "#demo-start-button-area"
    @container.css height: 80
      
  clear: (callback) ->
    @button.clear()
    @container.slideUp 1000, -> callback?()
    
  create: ->
    @button = new PlayButton @container, (=> @clear => @runDemo())


class PlayButton
  
  constructor: (@container, @callback) ->
    
    @button = $ "<img>", 
      src: "img/play.png"
      css:
        height: 60
        cursor: "pointer"
      click: =>
        return if @clicked
        @clicked = true
        @callback?()
        
    @container.append @button
    
  clear: (callback) ->
    @button.fadeOut 500, -> callback?()


class DemoRunner
  
  constructor: ->
    
    @isMain = not $blab.resources.getSource?
    
    @start = if @isMain then new MainDemoStart(=> @run()) else new DemoButton(=> @run())
    
    @firstLayout = true
    $blab.Layout.on "renderedWidgets", =>
      return unless @firstLayout
      @start.create()
      @firstLayout = false
      
    @firstChange = true
    $(document).on "codeNodeChanged", =>
      return unless @firstChange
      @start.clear()
      
  run: =>
    new Demo
    #setTimeout (-> new Demo), 200 #1500
    
    
new DemoRunner


guide = $ "#demo-guide"
guide.draggable()

guideClose = (guide) ->
  new $blab.utils.CloseButton guide, =>
    guide.hide()
    $.event.trigger "demoGuideClose"

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
    
  statement: (@statementStr, initDelay, cb) ->
    @statementCharIdx = 0
    @statementLength = @statementStr.length
    @ace.focus()
    
    doStatement = =>
      @ace.insert "\n" unless @firstAppend
      @firstAppend = false
      @ace.navigateFileEnd()
      @ace.removeToLineStart() if @ace.getCursorPosition().column>0  # Remove any indentation
      setTimeout (=> @char cb), initDelay
    
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
    #c = $("#blabr-tagline")
    #pos = c.offset()
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
    guideClose @guide
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
      top: pos.top + c.height() + 40
      left: pos.left + 300
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
    $.event.trigger "clickInputWidget"
    setSlider = (cb) =>
      v = vals[idx]
      domId = "slider-"+id
      $("#"+domId).slider 'option', 'value', v
      Widgets.widgets[domId].setVal v
      Widgets.compute()
      idx++
      if idx < vals.length
        setTimeout (-> setSlider(cb)), @delay
      else
        cb()
        
    setTimeout (-> setSlider(cb)), 1000
    
  explain: (html, cb) ->
    @guide.show()
    @guide.animate {
      top: 20
      left: 400
    }, 400, cb
    @guide.html html


class Tables
  
  delay: 1000
  
  constructor: (@guide) ->
    
  populate: (id, col, vals, cb) ->
    idx = 0
    setTable = (cb) =>
      v = vals[idx]
      domId = "table-"+id
      t = Widgets.widgets[domId]
      cell = t.editableCells[col][idx]  # 0 needs to be arg.
      dir = if idx<vals.length-1 then 1 else 0
      cell.enterVal(v, dir)
      # setTimeout (-> cell.div.blur()), 1000 if dir is 0
      idx++
      if idx < vals.length
        setTimeout (-> setTable(cb)), @delay
      else
        cb()
        
    setTable(cb)
    
  explain: (html, cb) ->
    @guide.show()
    c = computationEditor.editor.container
    pos = c.position()
    @guide.animate {
      top: pos.top - 30
      left: pos.left
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
    @tables = new Tables guide
    
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
    
    $(document).on "demoGuideClose", =>
      return unless @tId
      clearTimeout @tId
      @tId = null
      @nextStep()
      @nextStep = null
    
    $blab.demoScript
      text: (p...) => @text(p...)
      compute: (p...) => @compute(p...)
      defs: (p...) => @defs(p...)
      widget: (p...) => @widget(p...)
      slider: (p...) => @slider(p...)
      table: (p...) => @table(p...)
      md: (p...) => @md(p...)
      widgetEditor: (p...) => @widgetEditor(p...)
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
          @markdown.statement spec.append, 0, d
        else if spec.close
          markdownEditor.setViewPort null
          d()
      # TODO: This should be triggered after md editor visible.
      setTimeout (=> @markdown.explain(spec.guide)), 500 if spec.guide
      setTimeout (-> edit()), 900
  
  compute: (statement, html="", dwell=@dwellDelay, initDelay=0) ->
    @script.step (cb) =>
      @computation.explain html if html.length
      @computation.statement statement, initDelay, =>
        done = ->
          guide.hide()
          cb()
        @dwell dwell, -> done()
        
  defs: (statement, html="", dwell=@dwellDelay) ->
    @script.step (cb) =>
      @definitions.explain html if html.length
      @definitions.statement statement, 0, =>
        @dwell dwell, -> 
          guide.hide()
          cb()
      
  widget: (spec) ->
    @script.step (cb) =>
      @layout.explain spec.guide, =>
        @layout.replace spec, =>
          @dwell (spec.dwell ? @dwellDelay), cb
        
  slider: (spec) ->
    dwell = spec.dwell ? @dwellDelay
    @script.step (cb) =>
      @sliders.explain spec.guide, =>
        @sliders.animate spec.id, spec.vals, =>
          @dwell dwell, -> cb()
  
  table: (spec) ->
    dwell = spec.dwell ? @dwellDelay
    @script.step (cb) =>
      @tables.explain spec.guide, =>
        @tables.populate spec.id, (spec.col ? 0), spec.vals, =>
          @dwell dwell, -> cb()
          
  widgetEditor: (spec) ->
    @script.step (cb) =>
      app.disablePopupWidgetEditor = not(spec.enable) if spec.enable?
      cb()
        
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
        The "Doc & Examples" link (bottom of page)<br>
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
        
      $blab.blabrGuide.slideDown()
      #setTimeout (-> $("#demo-list").slideDown()), 1000
      @textGuide.explain html, bg, =>
        @dwell dwell, -> done()

