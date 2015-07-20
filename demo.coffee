class DemoButton
  
  width: 250
  text: "Click here to run demo"
  
  constructor: ->
    
    @container = $ "#widgets"
    
    @firstLayout = true
    $blab.Layout.on "renderedWidgets", =>
      return unless @firstLayout
      @create()
      @firstLayout = false
  
    $(document).on "codeNodeChanged", => @button.fadeOut(1000)
    
  create: ->
    @clicked = false
    @button = $ "<div>",
      id: "demo-button"
      html: @text
      css:
        width: @width
        left: (@container.width() - @width)/2
      click: =>
        return if @clicked
        @clicked = true
        @button.fadeOut(1000, -> new Demo)
    @container.append @button

new DemoButton

guide = $ "#demo-guide"

app = $blab.blabrApp
markdownEditor = app.markdownEditor
computationEditor = app.computationEditor
widgetEditor = app.widgetEditor
Widgets = $blab.Widgets

# TODO: superclass for Markdown etc.  Editor.

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
      
  replace: (line, numWords, word, cb) ->
    @ace.focus()
    @gotoLine line, =>
      @navigateRight numWords, =>
        @replaceWordRight word, =>
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
  
  explain: (html) ->
    @guide.show()
    c = @editor.container
    pos = c.position()
    @guide.css
      top: pos.top + c.height() + 30
      left: pos.left
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
  
  #delay: 500
  runOnStatement: true
  
  constructor: (@guide) ->
    super widgetEditor, @guide
  
  explain: (html, cb) ->
    @guide.show()
    c = @editor.outer
    pos = c.offset()
    @guide.animate {
      top: pos.top + 30
      left: pos.left + 400
    }, 400, cb
    @guide.html html


class Slider
  
  constructor: (@guide) ->
    
  animate: (cb) ->
    
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
    
    @explain "Adjust the slider and see the computation updated on-the-fly.", -> setSliderR(cb)
    
  explain: (html, cb) ->
    @guide.show()
    #c = @editor.outer
    #pos = c.offset()
    @guide.animate {
      top: 20
      left: 400 #pos.left + 400
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
    @slider = new Slider guide
    
    # ZZZ TEMP
    #@script.run()
    #return
    
    demoScript
      compute: (p...) => @compute(p...)
      widget: (p...) => @widget(p...)
      
    @script.step (cb) =>
      @slider.animate(cb)
      
    @script.step (cb) =>
      guide.hide()
      cb()
      
    @script.step (cb) =>
      markdownEditor.trigger "clickText", {start: 0}
      test = =>
        @markdown.replace 1, 1, "Quadratic", =>
          @markdown.statement "Write markdown here.  Supports MathJax: $y = k x^2$.", =>
            setTimeout (->
              markdownEditor.setViewPort null
              cb()
            ), 2000
      setTimeout (-> test()), 1000
    
    @script.run()
  
  compute: (statement, html="") ->
    @script.step (cb) =>
      @computation.explain html
      @computation.statement statement, =>
        guide.hide()
        cb()
      
  widget: (spec) ->
    @script.step (cb) =>
      @layout.explain spec.guide, =>
        @layout.replace spec.line, spec.word, spec.replace, cb


demoScript = (spec) ->
  
  {compute, widget} = spec
  
  compute "k = slider \"k\"", "Create a slider in the canvas above."
  compute "x = [1..5]", "Define a vector."
  compute "y = k*x*x", "Vector equation based on slider value and x.<br>The result is shown in the box on the right."
  compute "table \"xy\", x, y", "Display the data in a table.<br>Table parameters are shown below."
  
  widget
    line: 13, word: 2, replace: ": [\"$x$\", \"$kx$\"]"
    guide: "Add column headings to table.  Supports MathJax."
    
  widget
    line: 14, word: 3, replace: "100, 100"
    guide: "Set column widths."
  
  compute "plot \"plot\", x, y", "Plot the data."
  
  #widget
  #  line: 18, word: 7, replace: "300"
  #  guide: "Change size of plot"
  
  widget
    line: 21, word: 1, replace: ""
    guide: "Change the plot's y-axis limit."
    
  widget
    line: 21, word: 9, replace: "100"
    guide: "Change the plot's y-axis limit."
  
  widget
    line: 25, word: 3, replace: "2"
    guide: "Change the plot position."
  

