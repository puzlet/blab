class DemoButton
  
  text: "Click here to run demo"
  
  constructor: ->
    
    @container = $ "#widgets"
    
    @firstLayout = true
    $blab.Layout.on "renderedWidgets", =>
      return unless @firstLayout
      @create()
      @firstLayout = false
  
    @firstChange = true
    $(document).on "codeNodeChanged", =>
      return unless @firstChange
      @button.fadeOut(1000)
      @firstChange = true
    
  create: ->
    @clicked = false
    @button = $ "<div>",
      id: "demo-button"
      html: @text
      #css:
        #width: @width
      #  left: (@container.width() - @width)/2
      click: =>
        return if @clicked
        @clicked = true
        @button.fadeOut(1000, -> new Demo)
    @container.append @button
    @button.css left: (@container.width() - @button.width())/2
    

new DemoButton

guide = $ "#demo-guide"

app = $blab.blabrApp
markdownEditor = app.markdownEditor
computationEditor = app.computationEditor
widgetEditor = app.widgetEditor
Widgets = $blab.Widgets

class Editor
  
  delay: 500
  charDelay: 150
  runOnStatement: false
  
  constructor: (@appEditor, @guide) ->
    @editor = @appEditor.editor
    @ace = @appEditor.aceEditor
    
  statement: (@statementStr, cb) ->
    @statementCharIdx = 0
    @statementStr = "\n" + @statementStr
    @statementLength = @statementStr.length
    @ace.focus()
    @ace.navigateFileEnd()
    @char cb
    
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
    console.log "line", line
    @ace.focus()
    @gotoLine line, =>
      if spec.find
        @step (=> @ace.find spec.find), =>
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
    
    
class Demo
  
  constructor: ->
    
    console.log "DEMO"
    #demoButton.hide()
  
    @script = new Script
    @markdown = new Markdown guide
    @computation = new Computation guide
    @layout = new Layout guide
    @sliders = new Sliders guide
    
    $blab.demoScript
      compute: (p...) => @compute(p...)
      widget: (p...) => @widget(p...)
      slider: (p...) => @slider(p...)
      md: (p...) => @md(p...)
      delays: (p...) => @delays(p...)
      
    @script.step (cb) =>
      guide.hide()
      cb()
    
    @script.run()
  
  md: (spec) ->
    @script.step (cb) =>
      display = markdownEditor.editor.outer.css "display"
      markdownEditor.trigger "clickText", {start: 0} if display is "none"
      edit = =>
        if spec.replace
          @markdown.replace spec, cb
        else if spec.append
          @markdown.statement spec.append, cb
        else if spec.close
          markdownEditor.setViewPort null
          cb()
      @markdown.explain(spec.guide) if spec.guide
      setTimeout (-> edit()), 500
  
  compute: (statement, html="") ->
    @script.step (cb) =>
      @computation.explain html if html.length
      @computation.statement statement, =>
        guide.hide()
        cb()
      
  widget: (spec) ->
    @script.step (cb) =>
      @layout.explain spec.guide, =>
        @layout.replace spec, cb
        
  slider: (spec) ->
    @script.step (cb) =>
      @sliders.explain spec.guide, =>
        @sliders.animate(spec.id, spec.vals, cb)
        
  delays: (spec) ->
    @script.stepDelay = spec.step
    
    @markdown.delay = spec.changeCode
    @computation.delay = spec.changeCode
    @layout.delay = spec.changeCode
    
    @markdown.charDelay = spec.mdChar
    @computation.charDelay = spec.codeChar
    
    @sliders.delay = spec.slider

