demoButton = $ "#demo"
guide = $ "#demo-guide"

demoButton.show()

$(document).on "codeNodeChanged", -> demoButton.hide()

demoButton.click -> new Demo

app = $blab.blabrApp
markdownEditor = app.markdownEditor
computationEditor = app.computationEditor
widgetEditor = app.widgetEditor
Widgets = $blab.Widgets

class Computation
  
  charDelay: 150 # 150
  
  constructor: (@guide) ->
    @editor = computationEditor.editor
    @ace = computationEditor.aceEditor
    
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
      @editor.run()
      cb()
  
  explain: (html) ->
    @guide.show()
    c = @editor.container
    pos = c.position()
    @guide.css
      top: pos.top + c.height() + 30
      left: pos.left
    @guide.html html


class Layout
  
  delay: 500
  
  constructor: (@guide) ->
    @editor = widgetEditor.editor
    @ace = widgetEditor.aceEditor
  
  replace: (line, numWords, word, cb) ->
    @ace.focus()
    @gotoLine line, =>
      @navigateRight numWords, =>
        @replaceWordRight word, =>
          @step (=> @editor.run()), -> cb?()
  
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
      @step (=> @ace.removeWordRight()), =>
        @step (=>
          @ace.insert(word)
          @ace.navigateWordLeft()
          @ace.selection.selectWordRight()
        ), => cb()
  
  step: (step, cb) ->
    step()
    setTimeout (-> cb()), @delay
  
  explain: (html) ->
    @guide.show()
    c = @editor.outer
    pos = c.offset()
    @guide.animate
      top: pos.top + 100
      left: pos.left + 400
    # @guide.css
    #   top: pos.top + 100
    #   left: pos.left + 400
    @guide.html html


class Slider
  
  constructor: (@guide) ->
    
  animate: (cb) ->
    
    console.log "==========SLIDER"
    
    sliderVals = [1..9]
    sliderValIdx = 0
  
    setSlider = (v) ->
      $("#k").slider 'option', 'value', v
      Widgets.widgets.k.setVal(v)
      Widgets.compute()
    
    setSliderR = (cb) ->
      #cb()
      #return # TEMP
      setSlider sliderVals[sliderValIdx]
      sliderValIdx++
      if sliderValIdx < sliderVals.length
        setTimeout (-> setSliderR(cb)), 200
      else
        cb()
    
    @explain "Move slider"
    setSliderR(cb)
    
  explain: (html) ->
    @guide.show()
    #c = @editor.outer
    #pos = c.offset()
    @guide.animate
      top: 20
      left: 400 #pos.left + 400
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
    demoButton.hide()
  
    @script = new Script
    @computation = new Computation guide
    @layout = new Layout guide
    @slider = new Slider guide
    
    demoScript
      compute: (p...) => @compute(p...)
      widget: (p...) => @widget(p...)
      
    @script.step (cb) =>
      @slider.animate(cb)
      
    @script.step (cb) =>
      @guide.hide()
      cb()
      
    @script.run()
  
  compute: (statement, html="") ->
    @script.step (cb) =>
      @computation.explain html
      @computation.statement statement, =>
        guide.hide()
        cb()
      
  widget: (spec) ->
    @script.step (cb) =>
      @layout.explain spec.guide
      @layout.replace spec.line, spec.word, spec.replace, cb
    

demoScript = (spec) ->
  
  {compute, widget} = spec
  
  compute "k = slider \"k\"", "Invoke a slider"
  compute "x = [1..5]", "Vector"
  compute "y = k*x*x", "Vector equation"
  compute "table \"xy\", x, y", "Create a table"
  compute "plot \"plot\", x, y", "Plot data"
  
  widget
    line: 18, word: 7, replace: "300"
    guide: "Change size of plot"
    
  widget
    line: 25, word: 3, replace: "2"
    guide: "Change position of plot"

