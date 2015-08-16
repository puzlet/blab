#!vanilla

# Hack to process only once - not needed?
return if $blab?.layoutProcessed
$blab.layoutProcessed = true

$blab.codeDecoration = true

class Widget
  
  @handle: null
  
  @register: (W) -> Widgets.register W
  
  @getWidget: -> Widgets.Registry[@name]
  
  @getApi: -> "$blab.Widgets.Registry."+@name
  
  @layoutPreamble: ->
    W = @getWidget()
    api = @getApi()
    "#{W.handle} = (id, spec) -> new #{api}(id, spec)"
  
  @computePreamble: ->
    W = @getWidget()
    api = @getApi()
    "#{W.handle} = (id, v...) ->\n  #{api}.compute(id, v...)"
  
  @fetch: (id, v...) ->
    W = @getWidget()
    Widgets.fetch(W, id, v...)
    
  @getVal: (id, v...) ->
    @fetch(id, v...)?.getVal()
    
  @setVal: (id, v...) ->
    @fetch(id, v...)?.setVal(v)
    null
    
  @setValAndGet: (id, v...) ->
    @fetch(id, v...)?.setVal(v)
  
  @domIdPrefix: ->
    W = @getWidget()
    W.handle + "-"
    
  constructor: (@p1, @p2) ->
    
    @used = false
    
    if typeof @p1 is "string"
      @id = @p1
      @spec = @p2
      @spec.id = @id
    else
      @spec = @p1
      @id = @spec.id
      
    @create?(@spec)
    
  appendToCanvas: (@mainContainer) ->
    Widgets.append @domId(), this, @mainContainer
  
  domId: ->
    @constructor.domIdPrefix() + @id
    
  select: ->
    type = @constructor.handle
    $.event.trigger "clickWidget", type: type, id: @domId(), widget: this  # ZZZ just pass widget?
    
  computeAll: ->
    Widgets.compute()
  
  setUsed: (used=true) ->
    return if used is @used
    @mainContainer.css(opacity: (if used then 1 else 0.2))
    @used = used


class Widgets
  
  @filename: "layout.coffee"  # should be layout.coffee
  
  @Registry: {}
  
  @register: (WidgetSet) ->
    @Registry[Widget.name] = Widget for Widget in WidgetSet
  
  @widgets: {}
  @count: 0
  
  @initialize: ->
    
    @Layout = Layout
    
    @widgetEditor ?= new WidgetEditor(@filename)
    # Hack to fix layout editor issue.
    $(document).on "aceFilesLoaded", =>
      return if @widgetEditor.editor
      resource = $blab.resources.find @filename
      @widgetEditor.init(resource) #unless @widgetEditor.editor
    
    #setTimeout (=>
    #  @widgetEditor.init(@filename) unless @widgetEditor.editor
    #), 1500
    
    $(document).on "preCompileCoffee", (evt, data) =>
      resource = data.resource
      url = resource.url
      @count = 0  # ZZZ Bug?  only for foo.coffee or widgets.coffee
      return unless url is @filename
      @widgetEditor.init(resource)
      #@Layout.render()
      @precode()
      @widgets = {}
    
    $(document).on "compiledCoffeeScript", (evt, data) =>
      return unless data.url is @filename
      err = $blab.windowError
      $.event.trigger "layoutError", {source: @filename, error: err}
      $.event.trigger "blabError", {source: @filename, error: err}
      if err
        $blab.windowError = false
        return
      widget?.initialize?() for key, widget in @widgets
      Computation.init()
      $.event.trigger "htmlOutputUpdated"
    
    @queueCompile 2000  # Hack to force compile for Gist source
      
  @append: (id, widget, element) ->
    @widgets[id] = widget
    @Layout.append element, widget
    
  @fetch: (Widget, id, v...) ->
    idSpecified = id?
    unless idSpecified
      id = @count
      @count++
    prefix = Widget.domIdPrefix()
    id2 = if prefix then prefix+id else id
    w = @widgets[id2]
    return w if w
    # Create new widget
    if idSpecified then @createFromId(Widget, id, v...) else @createFromCounter(Widget, id, v...)
    null  # Widget must set default val
    
  @createFromId: (Widget, id, v...) ->
    resource = $blab.resources.find(@filename)
    name = Widget.handle
    spec = Widget.initSpec(id, v)
    s = spec.split("\n").join("\n  ")
    code = "#{name} \"#{id}\",\n  #{s}\n"
    # ZZZ TODO: this should be method of WidgetEditor.
    resource.containers.fileNodes[0].editor.set(resource.content + "\n" + code)
    @queueCompile()
  
  @createFromCounter: (Widget, id, v...) ->
    spec = Widget.initSpec(id, v)
    make = -> new Widget id, eval(CoffeeScript.compile(spec, bare: true))
    setTimeout(make, 700)
  
  @queueCompile: (t=500) ->
    resource = $blab.resources.find(@filename)
    if @tCompile
      clearTimeout(@tCompile)
      @tCompile = null
    @tCompile = setTimeout (=> 
      resource.compile()
      $.event.trigger "layoutCompiled"
#  REINSTATE    @viewport()
    ), t
    
  @compute: -> Computation.compute()
  
  @precode: ->
    
    preamble = Layout.shortcuts + "\n"
    
    #for n, W of @Registry
    #  console.log "***Widget", W, W.layoutPreamble()
      
    preamble += W.layoutPreamble()+"\n" for n, W of @Registry
#    preamble += Widget.layoutPreamble+"\n" for n, Widget of @Registry
    
    precompile = {}
    precompile[@filename] =
      preamble: preamble
      postamble: ""
    
    $blab.precompile(precompile)
    
  @getFromSignature: (handle, id) ->
    for name, Widget of @Registry
      #console.log "W", Widget, Widget.handle, handle
      continue unless Widget.handle is handle
      prefix = Widget.domIdPrefix()
      id = prefix + id if prefix
      widget = @widgets[id]
      break
    widget ? null
    
  @setAllUnused: ->
    w.setUsed false for id, w of @widgets


class WidgetEditor #extends PopupEditor
  
  # TODO:
  # button to show whole layout file
  # move layout to eval area
  # layout fixed pos at bottom of browser window
  
  constructor: (@filename) ->
    
    @firstDisplay = true
    @currentLine = null  # compute.coffee
    @viewPortDisplayed = false
    
    @sliding = false
    @next = =>
    @shown = false
    
    @observers =
      setViewPort: []
      clickDelete: []
      clickCloseButton: []
      
    #$(document).on "layoutError", (evt, data) =>
      #console.log "ERROR", data.error
    #  e = if data.error then data.error else ""
    #  @message?.text e
      
  init: (@resource) ->
    return if @editor
    @editor = @resource.containers?.fileNodes?[0].editor
    return unless @editor
    @aceEditor = @editor.editor
    @setViewPort null
    # ZZZ init folding here?
    @editor.onChange =>
    @aceEditor.setShowFoldWidgets true
    
    @closeButton = new $blab.utils.CloseButton @editor.container.parent(), => @trigger "clickCloseButton"
    @closeButton.css right: 30
    
    #session = @aceEditor.getSession()
    #session.on "changeFold", ->
      #ed.setHeight session.getScreenLength()
    #session.foldAll(1, 10000, 0)
    #session.unfold(1, true)
      
  setViewPort: (txt) ->
    
    return unless @editor
    
    @viewPortDisplayed = txt isnt null # ZZZ temp: global
    @trigger "setViewPort"
    
    if @firstDisplay
      container = @editor.container
      container.removeClass "init-editor"
      container.css maxHeight: "10px"
      container.parent().show()
      @editor.show true
      if txt
        @vp(txt, true)  # Does this ever happen?
      else
        setTimeout (=> container.parent().hide()), 1000
      @firstDisplay = false
    else
      if @sliding
        @next = =>
          @vp txt
          @next = =>
      else
        @vp txt
  
  vp: (txt, first=false) ->
    
    @editor.container.css
      maxHeight: ""
      border: "3px solid #aaf"
    
    @start = null
    
    spec = @editor.spec
    
    if txt
      code = @editor.code()
      lines = code.split "\n"
      for line, idx in lines
        if line.indexOf(txt) isnt -1
          @start = idx
        if @start? and line is ""
          @end = idx
          break
    
    if @start is null
      @editor.spec.viewPort = false
      @sliding = true
      @editor.container.parent().slideUp 400, =>
        @sliding = false
        @next()
      return
    
    @editor.container.parent().css
      maxHeight: "10px"
    @editor.container.parent().show()
    @deleteButton()
    @errorMessage()
    
    @editor.show true if @start
    spec.viewPort = true
    spec.startLine = @start+1
    spec.endLine = if @end-@start+1<20 then @end+1 else @start+20
    @editor.setViewPort()
    @editor.editorContainer[0].onwheel = -> false
    
    @editor.container.parent().hide()
    @editor.container.parent().css
      maxHeight: ""
    
    @sliding = true
    @editor.container.parent().slideDown 400, =>
      @sliding = false
      @next()
    
  deleteButton: ->
    
    @del?.empty()
    
    return unless @currentId
    widget = Widgets.widgets[@currentId]  # ZZZ make method
    return if widget.used
    
    unless @del?.length
      @del = $ "<div>",
        css:
          position: "absolute"
          display: "inline-block"
          top: 5
          right: 15
      @editor.editorContainer.append @del
      
    @delButton = $ "<span>",
      text: "Delete"
      css: cursor: "pointer"
      click: =>
        selection = @aceEditor.selection
        return unless @start and @end
        selection.moveCursorTo(@start-1, 0)
        selection.selectTo(@end, 0)
        @aceEditor.removeLines()
        @editor.run()
        @editor.container.parent().hide()
        @trigger "clickDelete"
      
    @del.append @delButton
    
  errorMessage: ->
    
    @message?.empty()
    
    unless @message?.length
      @message = $ "<div>",
        css:
          position: "absolute"
          display: "inline-block"
          top: 5
          right: 15
          color: "red"
      @editor.editorContainer.append @message
      
  folding: ->
    # ZZZ to do
    resource = $blab.resources.find(@filename)
    ed = resource.containers?.fileNodes?[0].editor
    return unless ed
    
    #ed.show false
    return
    
    editor = ed.editor
    editor.setShowFoldWidgets true
    session = editor.getSession()
    session.on "changeFold", ->
      ed.setHeight session.getScreenLength()
    session.foldAll(1, 10000, 0)
    
  on: (evt, observer) -> @observers[evt].push observer
  
  trigger: (evt, data) -> observer(data) for observer in @observers[evt]


class Computation
  
  @filename: "compute.coffee"
  
  @init: ->
    #console.log "*********** Computation init"
    p = @precode()
    unless @initialized
      $(document).on "allBlabDefinitionsLoaded", (evt, data) =>
        @defs = data.list
        @precode()
        @initialized = true
        @compute()
    @compute()
    
  @compute: ->
    resource = $blab.resources.find(@filename)
    # This does not recompile of resource has not changed.  It just re-evaluates compiled JS.
    resource?.compile()
    
  @precode: ->
    
    preamble = ""
    preamble += W.computePreamble()+"\n" for WidgetName, W of Widgets.Registry
    preamble += @defs+"\n" if @defs
    
    #preDefine = $blab.resources.find("predefine.coffee")
    #preamble += preDefine?.content+"\n" if preDefine
    
    precompile = {}
    precompile[@filename] =
      preamble: preamble
      postamble: ""
      
    #console.log "precompile", precompile
    
    $blab.precompile(precompile)
    true
    


class ComputationEditor
  
  filename: "compute.coffee"
  
  code:
    slider: "x = slider \"x\""
    plot: "plot \"my-plot\", x, y"
    table: "table \"my-table\", x, y"
  
  constructor: ->
    
    @currentLine = null
    
    @observers =
      cursorOnWidget: []
      
    $("#computation-code-heading").html "Computation <div id='computation-hint' class='code-hint'>Press shift-enter to run</div>"
    @hint = $ "#computation-hint"
    @hint.hide()
    
    $(document).on "preCompileCoffee", (evt, data) =>
      resource = data.resource
      url = resource?.url
      @init(resource) if url is @filename
    
    # This currently does nothing - is it needed?
    $(document).on "compiledCoffeeScript", (evt, data) =>
      return unless data.url is @filename
      #@setLine()
      
    # No longer used
    $(document).on "clickComputationButton", (evt, data) =>
      @aceEditor.focus()
      @aceEditor.insert @code[data.button]+"\n"
    
    $(document).on "runCode", (evt, data) =>
      return unless data.filename is @filename
      @currentLine = null
      setTimeout (=> @setLine()), 400
      
    $(document).on "allBlabDefinitionsLoaded", -> # unused
    
    @changeCursor = => #@setLine()
    
  init: (@resource) ->
    
    return if @editor  # Return if already defined
    # ZZZ but what about current line - e.g., if widget view changed some other way.
    
    @editor = @resource?.containers?.fileNodes?[0].editor
    
    return unless @editor
    @aceEditor = @editor.editor
    
    @currentLine = null
    @selection = @aceEditor.selection
    
    @selection.on "changeCursor", =>
      #console.log "Change cursor"
      @changeCursor()
      #@setLine()
  
  initFocusBlur: ->
    
    @aceEditor.on "focus", =>
      #@currentLine = null
      @setLine(true)
      @changeCursor = => @setLine()
      @hint.fadeIn()
      
    @aceEditor.on "blur", =>
      @hint.fadeOut()
      @currentLine = null
      @changeCursor = =>
    
  setLine: (force) =>
    cursor = @selection?.getCursor()
    if force or cursor?.row isnt @currentLine
      @currentLine = cursor?.row
      @inspectLineForWidget()
      
  insertCode: (code) ->
    @aceEditor.focus()
    @aceEditor.insert code
  
  inspectLineForWidget: ->
    return unless @editor
    code = @editor.code()
    lines = code.split "\n"
    line = lines[@currentLine]  # ZZZ easier way?  pass current line - ace method?
    
    handles = (Widget.handle for WidgetName, Widget of Widgets.Registry)
    handlesStr = handles.join "|"
    #console.log handlesStr
    
    widgetRegex = new RegExp("(#{handlesStr}) \"([^\"]*)\"","g");
    
    #widgetRegex = /(slider|table|plot|bar|bar2) "([^"]*)"/
    matchArray = widgetRegex.exec(line)
    match = if matchArray is null then null else matchArray[0]
    type = if matchArray is null then null else matchArray[1]
    id = if matchArray is null then null else matchArray[2]
    if @tId
      clearTimeout @tId
      @tId = null
    @tId = setTimeout (=>
      widget = Widgets.getFromSignature type, id
      @trigger "cursorOnWidget", {widget, match}
    ), 200
    
  on: (evt, observer) -> @observers[evt].push observer
  
  trigger: (evt, data) -> observer(data) for observer in @observers[evt]
    


class ComputationButtons
  
  constructor: ->
    @container = $ "#computation-buttons"
    
    run = $ "<div>",
      css: {display: "inline-block", color: "#aaa", fontSize: "10pt"}
      text: "Press shift-enter to run"
    @container.append run
  
  create: (txt) ->
    b = $ "<button>", text: txt
    @container.append b
    b.click ->
      $.event.trigger "clickComputationButton", {button: txt}
  


class MarkdownEditor #extends PopupEditor
  
  containerId: "#main-markdown"
  filename: "blab.md"
  markedUrl: "/puzlet/puzlet/js/marked.min.js"
  posAttr: "data-pos"
  widgetsId: "#widgets"
  editorHeight: 15
  
  constructor: ->
    
    @text = $ @containerId
    return unless @text.length
    @text.css(cursor: "default")  # ZZZ do in CSS
    @text.mouseup => @trigger "clickText", {start: 0}
    
    @resources = $blab.resources
    @widgetsRendered = false
    
    @firstDisplay = true
    @viewPortDisplayed = false
    
    @observers =
      setViewPort: []
      clickText: []
      clickCloseButton: []
    
  setWidgetsRendered: ->
    @widgetsRendered = true
    @process() if marked?
  
  init: ->
    console.log "MarkdownEditor::init"
    
    marked.setOptions
      renderer: new marked.Renderer
      gfm: true
      tables: true
      breaks: false
      pedantic: false
      sanitize: false
      smartLists: true
      smartypants: false
    
    @resource = @resources.find(@filename)
    @editor = @resource?.containers?.fileNodes?[0].editor
    return unless @editor
    @aceEditor = @editor.editor
    @editor.container.removeClass "init-editor"
    @editor.onChange => @render()
    @editor.show false
    
    @closeButton = new $blab.utils.CloseButton @editor.container.parent(), => @trigger "clickCloseButton"
    @closeButton.css right: 30
    
    @setViewPort null
    
    @process() if @widgetsRendered
    
  preProcess: (file) ->
    
    # replace troublesome stuff
    preText = file
      .replace(/\\\$/g,"\\&pound;") # \$
      .replace(/\\`/g,"\\&sect;") # \`
      .replace(/([^-])([-]{3})([^-])/g, "$1&mdash;$3") 
      
    # escape matching text
    matchEscape = (text, RE, escape) ->
      out = ""
      pos = 0 # end position of last match 
      while (match = RE.exec(text)) isnt null
        preMatch = text[pos...match.index]
        escMatch = escape match[0]
        out += preMatch + escMatch
        pos = match.index+match[0].length 
      out += text[pos..] # from last match to end
  
    # escape $ within code sections
    escCodeMath = (u) -> u.replace /\$/g, (m) -> "\\&yen;"
    codeRe = /(```)([\s\S]*?)(```)|(`)([\s\S]*?)(`)/mg
    textCodeEsc =  matchEscape(preText, codeRe, escCodeMath)
    
    # escape MD chars within equations
    escRe = /[\\`\*_\{\}\[\]\(\)#\+\-\.\!]/g
    escMarkdown = (u) -> u.replace escRe, (m) -> "\\#{m}"
    texRe = /(\$\$)([\s\S]*?)(\$\$)|(\$)([\s\S]*?)(\$)/mg
    textMdEsc =  matchEscape(textCodeEsc, texRe, escMarkdown)
    
    # restore escaped stuff
    text = textMdEsc
      .replace(/\\&pound;/g,"\\$")
      .replace(/\\&sect;/g,"\\`")
      .replace(/\\&yen;/g,"$")
      
    text
    
  process: ->
    #console.log "MarkdownEditor::process"
    unless marked?
      @loadMarked => @init()
      return
    #console.log "MarkdownEditor::process/marked"
    @text.empty()
    $(".rendered-markdown").remove()
    
    md = @snippets(@preProcess @resource.content)
#    md = @snippets(@resource.content)
    
    out = []
    for m in md
      if m.pos is 0
        @text.append m.html
        out.push m.html
      else
        container = Layout.getContainer(m.pos, m.order)
        @markdownDiv(container, m)
    @setTitle(out.join "\n")
    $.event.trigger "htmlOutputUpdated"
    @trigger "setViewPort"
    
  loadMarked: (callback) ->
    console.log "MarkdownEditor::loadMarked"
    @resources.add {url: @markedUrl}
    @resources.loadUnloaded -> callback?()
    
  markdownDiv: (container, m) =>
    div = $ "<div>",
      class: "rendered-markdown"
      css: cursor: "default"
      mouseup: (evt) =>
        @trigger "clickText", {start: parseInt(div.attr "data-start")}
    div.attr("data-pos": m.pos, "data-order": m.order, "data-start": m.start)
    div.append m.html
    container.append div
    div
    
  setTitle: ->
    headings = $ ":header"
    $blab.title = if headings.length then headings[0].innerHTML else "Puzlet"
    document.title = $blab.title unless $blab.title is "Untitled"
      
  setViewPort: (start) ->
    
    return unless @editor
    
    @viewPortDisplayed = start isnt null and start isnt false
    @trigger "setViewPort"
    
    if @firstDisplay
      container = @editor.container
      container.removeClass "init-editor"  # Done above?
      container.css maxHeight: "10px"
      container.parent().show()
      @editor.show true
      setTimeout (=> @vp start, true), 500
      @firstDisplay = false
    else
      @vp start
  
  vp: (startChar, first=false) ->
    
    @editor.container.css
      maxHeight: ""
      border: "3px solid #aaf"
    
    spec = @editor.spec
    spec.viewPort = true
    
    if startChar is null or startChar is false
      spec.startLine = 1
      spec.endLine = @editorHeight
      @editor.setViewPort()
      if first
        @editor.show false
        @editor.container.parent().hide()
      else
        @editor.container.parent().slideUp 400
      return
      
    @start = (if startChar is 0 then 0 else @getStartLine startChar)
    @end = @start + @editorHeight - 1
    
    if first
      @editor.container.parent().show()
    else
      @editor.container.parent().slideDown 400
    @editor.show true
    spec.startLine = @start + 1
    spec.endLine = @end + 1
    @editor.setViewPort()
    
  getStartLine: (startChar) ->
    code = @editor.code()
    lines = code.split "\n"
    l = 0
    for line, idx in lines
      l += line.length + 1
      break if l>startChar
    idx - 1
  
  render: ->
    @renderId ?= null
    clearTimeout(@renderId) if @renderId
    @renderId = setTimeout (=>
      @process()
    ), 500
  
  snippets: (file) ->
    
    @RE ?= ///
      ^\s*`\s*                   # begin-line, space and quote
      (?:p|pos)\s*:\s*           # p: or pos:
      (\d+)\s*,?\s*              # digits and comma (optional)
      (?:                        # optional
          (?:o|ord|order)\s*:\s*   # o:, ord: or order:
          (\d+)\s*                 # digits
      )?                         # end optional
      .*`.*$                     # end quote, comment, end-line
    ///mg                      # multiline & global
    
    md = []
    
    # ZZZ method?
    snippet = (found) ->
      start  = found.start ? 0
      source = file[start..found.end]
      start: start
      pos: parseInt(found.pos ? 0)
      order: parseInt(found.order ? 1)
      source: source
      html: marked source
      
    # search file for "found" regex
    found = {}
    
    while (match = @RE.exec(file)) isnt null
      
      # snippet above match
      found.end = match.index-1
      md.push snippet(found)
    
      # snippet below match
      found =
        start: match.index+match[0].length+1
        pos: match[1]
        order: match[2]
          
    # complete snippet below last match
    found.end = -1
    md.push snippet(found)
    md
    
  on: (evt, observer) -> @observers[evt].push observer
  
  trigger: (evt, data) -> observer(data) for observer in @observers[evt]
    


class Layout
  
  @shortcuts: """
    layout = (spec) -> $blab.Widgets.Layout.set(spec)
    settings = (spec) -> $blab.blabrApp.setSettings(spec)
    pos = (spec) -> $blab.Widgets.Layout.pos(spec)
    text = (spec) -> $blab.Widgets.Layout.text(spec)
  """
  
  @spec: {}
  @currentContainer: null
  
  @observers:
    renderedWidgets: []
    clickBox: []
  
  @set: (@spec) ->
    #console.log "^^^^^^^ Layout.set"
    @render()
  
  @pos: (@currentContainer) ->
    
  @render: ->
    if Array.isArray(@spec)
      @renderFromArray()
      return
    return unless Object.keys(@spec).length
    n = 1
    widgets = $("#widgets")
    widgets.empty()
    for label, row of @spec
      r = $ "<div>", id: label
      widgets.append r
      for col in row
        c = $ "<div>",
          class: col
          mouseup: => @trigger "clickBox"
        c.addClass "layout-box"
        @appendNum c, n
        n++
        r.append c
        for d in [1..5]
          o = $ "<div>", class: "order-#{d}"
          c.append o
      r.append($ "<div>", class: "clear")
    @highlight() if WidgetEditor.viewPortDisplayed or MarkdownEditor.viewPortDisplayed  # ZZZ temp
    @trigger "renderedWidgets"
    
  @renderFromArray: ->
    return unless @spec.length
    #console.log "RENDER LAYOUT", @spec
    n = 1
    widgets = $("#widgets")
    widgets.empty()
    for numCols, rowIdx in @spec
      if numCols>4
        console.log "Maximum of 4 columns per row"
        numCols = 4
      r = $ "<div>", id: "widget-row-#{rowIdx+1}"  # ZZZ later: widgets-row-1
      widgets.append r
      for colNum in [1..numCols]
        #col = if colNum is 1 then "left" else "right"  # ZZZ temporary
        boxId = "widget-box-#{n}"
        boxClass = "box-#{numCols}-#{colNum}"
        c = $ "<div>",
          id: boxId
          class: boxClass
          mouseup: => @trigger "clickBox"  # Use mouseup instead of click so can control propagation.
        c.addClass "layout-box"
        r.append c
        @appendNum c, n
        n++
        for d in [1..5]
          o = $ "<div>", class: "order-#{d}"
          c.append o
      r.append($ "<div>", class: "clear")
    @highlight() if WidgetEditor.viewPortDisplayed or MarkdownEditor.viewPortDisplayed  # ZZZ temp
    @trigger "renderedWidgets"
  
  @appendNum: (c, n) ->
    num = $ "<div>",
      text: n
      class: "layout-box-number"
      css: marginLeft: c.width()-23
    c.append num
    #console.log "width", c.width()
    num.hide()
    
  @highlight: (highlight=true) ->
    if highlight
        $(".layout-box").addClass "layout-highlight"
        $(".layout-box-number").show() #fadeIn(1000)
    else
      $(".layout-box-number").hide()
      $(".layout-box").removeClass "layout-highlight"
        
  @append: (element, widget) ->
    if widget?.spec.pos?
      container = @getContainer widget.spec.pos, widget.spec.order
    else
      container = $(@currentContainer)
    container.append element
    
  @getContainer: (pos, order) ->
    if $.isNumeric(pos)
#    if Number.isInteger(pos)
      position = "#widget-box-#{pos}"
    else
      position = pos
    container = $(position)
    container = $(container).find(".order-"+order) if order?
    container
  
  @text: (t) -> @append t
  
  @on: (evt, observer) -> @observers[evt].push observer
  
  @trigger: (evt, data) -> observer(data) for observer in @observers[evt]
  


class Definitions
  
  filename: "defs.coffee"
  
  constructor: (@done) ->
    
    $("#defs-code-heading").html "Definitions <div id='defs-hint' class='code-hint'>Press shift-enter to run</div>"
    @hint = $ "#defs-hint"
    @hint.hide()
    
    @resources = $blab.resources
    
    @coffee = @resources.add url: @filename
    
    #@resources.blockPostLoadFromSpecFile = true #if @resources.find(@filename)
    # TODO: improve so can specify block per resource.  resources postload would check all.
    
    $blab.definitions = {}
    
    $blab.use = (id=null, callback) => @use id, callback
    
    @allLoaded = false
    $blab.defs = {}
    $blab.mainDefs = (defs) => @main(defs)
    
    @precode @filename
    
    # ZZZ Temporary - hack
    #$blab.defs = $blab.use()
      
    $(document).on "preCompileCoffee", (evt, data) =>
      resource = data.resource
      url = resource.url
      return unless url is @filename
      $blab.defs = {}
      $blab.definitions = {}
      @allLoaded = false
    
    @resources.loadUnloaded => @coffee.compile()
    
  main: (defs) ->
    # Main defs.coffee
    
    if typeof defs is "string"
      @directDefs defs
      return
    
    $blab.definitions[@filename] = defs
    defs.loaded = true
    $blab.defs = defs
    #console.log "check(1)", @filename
    @checkLoaded defs
    defs
    
  directDefs: (id) ->
    gist = @use id
    @main
      derived: ->
        for name, property of gist
          this[name] = property if not (name in ["loaded", "isImport"]) 
    
  use: (id=null, callback) ->
    
    url = (if id then "#{id}/" else "") + @filename
    
    # Initialize unless already set by another import.
    $blab.definitions[url] ?= {}
    defs = $blab.definitions[url]
    defs.isImport ?= true
    defs.loaded ?= false
    if defs.loaded
      setTimeout (=>
        #console.log "check(2)", url
        @checkLoaded defs
      ), 0
    else
      @loadCoffee url, =>
        callback?(defs)
        @getDefs url, defs
    
    defs  # Initially returns {}; fills properties when imported defs.coffee loaded.
      
  getDefs: (url, defs) ->
    # $blab.definitions[url] can be {}.
    blabDefs = $blab.definitions[url]
    blabDefs.loaded = true
    defs[name] = def for name, def of blabDefs
    #console.log "^^^^^ get defs"
    #console.log "check(3)", url
    @checkLoaded defs
  
  checkLoaded: (defs) ->
    return if @allLoaded
    # Check defs file loaded
    return false unless defs.loaded
    # Check imports loaded
    checkAll = true
    for name, def of defs
      checkAll = false if def.isImport and not def.loaded
    #console.log "checkAll", checkAll, $blab.definitions
    return false unless checkAll
    # Check all def files loaded
    for url, blabDefs of $blab.definitions
      return false unless blabDefs.loaded
    @allDone()
    true
    
  allDone: ->
    @processDerived($blab.defs)
    @allLoaded = true
    
    if @firstDone?
      $.event.trigger "allBlabDefinitionsLoaded", {list: @list()}
    else
      @done =>
        @firstDone = true
        $.event.trigger "allBlabDefinitionsLoaded", {list: @list()}
    
  processDerived: (d) ->
    for name, def of d
      @processDerived(def) if def.isImport  # Recursion
    d.derived?()
    
  list: ->
    d = []
    console.log "$blab.defs", $blab.defs
    
    for name, def of $blab.defs
      d.push name unless name is "loaded" or name is "derived"
    list = d.join ", "
    "{#{list}} = $blab.defs"
    
  initEditor: ->
    #console.log "defs containers", @coffee.containers
    @editor = @coffee.containers?.fileNodes?[0].editor
    #return unless @editor
    @aceEditor = @editor.editor
    
    @aceEditor.on "focus", => @hint.fadeIn()
    @aceEditor.on "blur", => @hint.fadeOut()
  
  loadCoffee: (url, callback) ->
    
    # TODO: need methods in $blab.resources (remove resource)
    rArray = @resources.resources
    coffeeIdx = idx for r, idx in rArray when r.url is url
    rArray.splice(coffeeIdx, 1) if coffeeIdx
    
    if url.indexOf("gist") is 0
      re = /^gist:([a-z0-9_-]+)/
      match = re.exec url
      return unless match
      gistId = match[1]
      @gist gistId, (data) =>
        source = data.defs
        coffee = @resources.add {url: url, source: source}
        coffee.gistData = data  # Hack to let Ace access gist description/author
        coffee.location.inBlab = false  # Hack for gist save
        @doLoad coffee, callback
      return
    
    coffee = @resources.add {url}
    @doLoad coffee, callback
      
  doLoad: (coffee, callback) ->
    url = coffee.url
    @precode url
    @resources.load ((resource) -> resource.url is url), =>
      coffee.compile()
      callback?()
  
  precode: (url) ->
    
    preamble = """
        blabId = "#{url}"
        use = (id, callback) -> $blab.use(id, callback)
        defs = (d) ->
          if blabId is "defs.coffee"
            return $blab.mainDefs(d)
          else
            $blab.definitions[blabId] = d
            return d
        \n\n
      """
    
    precompile = {}
    precompile[url] =
      preamble: preamble
      postamble: ""
    
    $blab.precompile(precompile)
    
  gist: (gistId, callback) ->
    api = "https://api.github.com/gists"
    url = "#{api}/#{gistId}"
    $.get(url, (data) =>
      #console.log "Gist #{gistId} loaded (defs.coffee)", data
      defs = data.files?["defs.coffee"]?.content ? null
      description = data.description
      owner = data.owner.login
      callback?({defs, description, owner})
    )


class Buttons
  
  constructor: (@spec) ->
    
    @container = $ "#buttons"
    
    @resources = $blab.resources
    @isGist = @resources.getSource?
    @isDemo = @isGist and @resources.getSource("demo.coffee")
    
    @isStart = not @isGist
    @isBlab = @isGist and not @isDemo 
    
    @settings = spec.getSettings()
    
    showCode = -> $("#computation-code-wrapper").show()
    
    showCode() if @settings?.showCodeOnLoad or ((@isStart or @isDemo) and not @settings?.showCodeOnLoad?)
    
    if @isStart
      showCode() if @settings?.showCodeOnLoad
      @spec.makeEditable()
      @startButtons()
      
    if @isBlab
      $("#top-banner").slideUp()
      showCode() if @settings?.showCodeOnLoad
      @append "<hr>"
      #console.log "SETTINGS!", spec.getSettings()
      #$("#computation-code-wrapper").hide()
      @logo()
      #@append "Powered by "
      #@linkButton "Blabr", => @spec.guide()
      # @sep()
      @linkButton "Edit Page", => @makeEditable()
      @author() if @settings?.showAuthor
        
    if @isDemo
      $("#top-banner").slideUp()
      showCode() if not @settings? or @settings?.showCodeOnLoad is true
      @makeEditable()
      
  #setSettings: (@s) ->
  #  console.log "**** SET...", @s
  
  #logoBanner: ->
  #  logoDiv = $ "<div>",
  #    id: "blabr-logo-banner"
  #    click: =>
  #  logo = $ "<img>",
  #    src: "img/blabr-logo.png"
  #  logoDiv.append(logo).append("Blabr")
  #  $("#top-banner").append(logoDiv)
  
  logo: ->
    logoDiv = $ "<div>",
      id: "blabr-logo-footer"
      click: => @spec.guide()
    logo = $ "<img>",
      src: "img/blabr-logo.png"
    logoDiv.append(logo).append("Blabr")
    @append(logoDiv)
  
  startButtons: ->
    @container.empty()
    @append "<hr>"
    @logo()
    @docButton()
    @sep()
    @linkButton "Settings", =>
      console.log "settings"
      @spec.editSettings()
    
  makeEditable: ->
    return if @isStart
    $("#computation-code-wrapper").show(500)
    @spec.makeEditable()
    @startButtons()
    @appendBlabButtons()
    @author()
    
  appendBlabButtons: ->
    @sep()
    @sourceButton()
      
    @sep()
    @forkButton = @linkButton "Fork", =>
      forceNew = true
      $blab.github?.save(forceNew)
      
  docButton: ->
    @linkButton "Doc & Examples", => @spec.guide()
    
  sourceButton: ->
    @linkButton "GitHub Source", (->), $blab.github?.sourceLink()
  
  author: ->
    owner = $blab.github?.gist?.gistOwner
    return unless owner
    
    author = $ "<div>",
      id: "blab-author"
      text: "Author: "
      css: float: "right"
        
    a = $ "<a>",
      text: "@"+owner
      href: "//gist.github.com/#{owner}"
      target: "_blank"
      css: textDecoration: "none"
    
    author.append a
    
    @container.append author
    
  createButton: (txt) ->
    button = $ "<button>", text: txt
    @append button
    button
    
  linkButton: (txt, click, href) ->
    button = $ "<a>",
      #class: "link-button"
      click: -> click?()
      text: txt
      target: "_blank"
    button.attr(href: href) if href
    @append button
    button
    
  append: (element) -> @container.append element
  
  sep: -> @append " | "
    


class EditPageButton
    
  constructor: (@container, @callback) ->
    
    # TODO: user-select off
    #@checked = false
    
    @div = $ "<div>",
      id: "edit-page-button-container"
      css:
        position: "fixed"
        bottom: 20
        right: 10
        zIndex: 300
    
    @b = $ "<a>",
      id: "edit-page-button"
      click: =>
        @b.button("refresh")
        @callback?()
    
    @b.button {label: "Layout"}
    
    @div.append(@b)
    @container.append @div
    
    @hide()
    
  show: -> @b.show()
  
  hide: -> @b.hide()


class Errors
  
  errors:
    "compute.coffee": {heading: "Computation", error: null}
    "defs.coffee": {heading: "Definitions", error: null}
    "layout.coffee": {heading: "Layout", error: null}
    
  containerSel: "#blab-error"
  
  constructor: ->
    
    @container = $(@containerSel)
    
    @filenames = (name for name of @errors)
    
    window.onerror = (e, url, line) =>
      $blab.windowError = e
      # Optional: Return "true" to suppress red error in console.
    
    $(document).on "preCompileCoffee", (e, data) => @reset data.resource.url
    
    $(document).on "blabError", (evt, data) =>
      filename = data.source
      return unless filename in @filenames
      $blab.windowError = false
      @set filename, data.error
      @disp()
      
  reset: (filename) ->
    for name, e of @errors
      @errors[name].error = null if filename is name
  
  set: (filename, error) ->
    for name, e of @errors
      if filename is name
        @errors[name].error = if error then error else null
  
  disp: ->
    @container.empty()
    new $blab.utils.CloseButton @container, => @container.hide()
    first = true
    show = false
    str = ""
    for name, e of @errors
      error = e.error
      continue unless error
      show = true
      str += "<br><br>" unless first
      str += "<b>#{e.heading}</b><br>" + error
      first = false
    @container.append str
    if show then @container.show() else @container.hide()


class Loader
  
  constructor: (@init)->
    
    @resources = $blab.resources
    @resources.blockPostLoadFromSpecFile = true
    
    layout = @resources.add url: "layout.coffee"
    guide = @resources.add url: "guide.coffee"
    tables = @resources.add url: "tables.json"
    
    if not @resources.getSource? or @resources.getSource("demo.coffee")
      demoRunner = @resources.add(url: "demo-runner.coffee")
      demo = @resources.add(url: "demo.coffee")
    
    @resources.loadUnloaded =>
      @definitions = new Definitions (cb) =>
        @init()
        layout.compile()
        guide?.compile()
        demoRunner?.compile()
        demo?.compile()
        @resources.postLoadFromSpecFile()
        cb()


class BlabEvents
  
  constructor: ->
    @body = $(document.body)
    @body.mousedown (e) => @trigger "blabmousedown"
    @body.mouseup (e) => @trigger "blabmouseup"
    document.body.addEventListener "copy", (e) => @trigger "blabcopy", {original: e}
    @unbind ["blabcompute"]
    @on "preCompileCoffee", (e, data) => @unbinds data.resource.url
    @on "compiledCoffeeScript", (e, data) => @triggers data.url
  
  unbinds: (filename) ->
    @unbind ["blabcompute"] if filename is "layout.coffee"
    @unbind ["blabmousedown", "blabmouseup", "blabcopy", "blabpaste"]
  
  triggers: (filename) ->
    isCompute = filename is "compute.coffee"
    isLayout = filename is "layout.coffee"
    unless isCompute or isLayout
      @trigger "blabError", {source: filename, error: $blab.windowError}
    @trigger "blabcompute" if isCompute  # only if no error?
    
  on: (name, handler) -> $(document).on name, (evt, data) -> handler(evt, data)
  
  trigger: (evt, data) -> $.event.trigger evt, data
  
  unbind: (events) -> $(document).unbind(e) for e in events


class Background
  
  constructor: (background) ->
      
    if background
      $(document.body).css backgroundImage: "url(#{background})"
      $("#outer-container").addClass "outer-background"
      $("#outer-container").css
        marginTop: 30
        paddingTop: 10
      $("#container").css
        marginTop: 20
    else
      $(document.body).css backgroundImage: ""
      $("#outer-container").removeClass "outer-background"
      $("#outer-container").css
        marginTop: 0
        paddingTop: 0
      $("#container").css
        marginTop: 40


class Settings
  
  set: (@spec) ->
    new Background @spec?.background
    author = $("#blab-author")
    @spec.showAuthor = not @spec?.showAuthor? or @spec?.showAuthor
    if author.length
      if @spec?.showAuthor then author.show() else author.hide()
      
  #showAuthor: -> @spec.showAuthor


class PopupEditorManager
  
  constructor: (@spec) ->
    
    {@widgetEditor, @markdownEditor} = @spec
    
    # States
    @layoutEnabled = false
    @clickedOnComponent = false
    @currentComponent = null
    
    @markdownEditor.on "clickText", (data) => @showMarkdownEditor data.start
    @markdownEditor.on "setViewPort", => @highlightLayout()
    @markdownEditor.on "clickCloseButton", => @disableLayout()
    
    @widgetEditor.on "setViewPort", => @highlightLayout()
    @widgetEditor.on "clickCloseButton", => @disableLayout()
    @widgetEditor.on "clickDelete", => @clickedOnComponent = true
    
    @on "clickWidget", (evt, data) => @showLayoutEditor(widget: data.widget)
    
    Layout.on "clickBox", => @showLayoutEditor(signature: "layout")
    
    $(document.body).click (evt) => @hideAll(evt)
      
    @on "clickInputWidget", (evt, data) => @hideLayout()
    
    @editPageButton = new EditPageButton $("#edit-page"), => @enableLayout()
      
  enableLayout: ->
    @enable()
    @showLayoutEditor(signature: "layout", clicked: true)
    
  disableLayout: ->
    @enable(false)
    @hideLayout()
  
  enable: (enabled=true) ->
    @initEnabled = true if enabled
    @layoutEnabled = enabled
    
  cursorOnWidget: (widget) ->
    @showLayoutEditor(widget: widget, id: null, clicked: false)  # Why id null?
  
  showMarkdownEditor: (start) ->
    return unless @layoutEnabled
    @clickedOnComponent = true
    @highlightWidget null
    @widgetEditor.setViewPort null
    @markdownEditor.setViewPort start
    
  showLayoutEditor: (spec) ->
    
    # Will hide layout editor if no widget or signature (e.g., cursor not on widget line).
    
    return unless @layoutEnabled
    return if @clickedOnComponent  # Order of observer registration matters here
    
    widget = spec.widget
    signature = spec.signature ? null
    clicked = spec.clicked ? true  # Default true
    
    if widget
      type = widget.constructor.handle
      id = widget.id
      signature = type + " " + "\"#{id}\""
    
    if clicked
      @clickedOnComponent = true
      setTimeout (=> @clickedOnComponent = false), 300
    
    @widgetEditor.setViewPort signature
    @markdownEditor.setViewPort null
    @highlightWidget(widget?.mainContainer ? null)
    @widgetEditor.currentId = widget.domId() if widget
    
    # Need to consolidate?  into highlightLayout?
    @editPageButton.hide() if signature
  
  highlightLayout: ->
    displayed = @widgetEditor.viewPortDisplayed or @markdownEditor.viewPortDisplayed
    Layout.highlight(displayed)
    @editPageButton.hide() if displayed
  
  hideLayout: ->
    @highlightWidget null
    @widgetEditor.setViewPort null
    @markdownEditor.setViewPort null
    
    if @layoutEnabled
      @editPageButton.hide()
    else
      setTimeout (=> @editPageButton.b.fadeIn(500)), 500 if @initEnabled
  
  highlightWidget: (component) =>
    @currentComponent?.removeClass "widget-highlight"
    @currentComponent = component
    @currentComponent?.addClass "widget-highlight"
  
  hideAll: (evt) ->
    setTimeout (=>
      @hideLayout() unless @clickedOnComponent or $(evt.target).attr("class") # Hack for Ace editor click
      @clickedOnComponent = false
    ), 100
  
  on: (name, handler) -> $(document).on name, (evt, data) -> handler(evt, data)


class App
  
  constructor: ->
    @loader = new Loader => @init()
  
  init: ->
    
    new BlabEvents
    
    Widgets.initialize()
    @widgetEditor = Widgets.widgetEditor
    @computationEditor = new ComputationEditor
    @markdownEditor = new MarkdownEditor
    @definitions = @loader.definitions
    
    @on "aceFilesLoaded", => @initEditors()
    
    @beforeCompute =>
      Computation.precode()
      Widgets.setAllUnused()
    
    Layout.on "renderedWidgets", => @markdownEditor.setWidgetsRendered()
    
    $("#computation-code-wrapper").hide()
    @on "layoutCompiled", => @initButtons()  # For first layout only
    
    @on "codeNodeChanged", =>
      return if @changed  # First code change only
      @changed = true
      @buttons.makeEditable()
    
    @settingsObj = new Settings
    new Errors
    
    $pz.renderHtml = => @markdownEditor.process()
    
  initEditors: ->
    @markdownEditor.process()
    @definitions.initEditor()
    
    @editors = new PopupEditorManager {@widgetEditor, @markdownEditor}
    
    @computationEditor.on "cursorOnWidget", (data) =>
      return if @settings?.popupWidgetEditor? and not @settings?.popupWidgetEditor
      @editors.cursorOnWidget data.widget
    
    setTimeout (=> @computationEditor.initFocusBlur()), 900
    
  initButtons: ->
    return if @buttons
    @buttons = new Buttons
      guide: => $blab.blabrGuide.slideToggle()
      makeEditable: => @editors?.enable()
      editSettings: =>
        @editors?.enable()
        @editors?.showLayoutEditor(signature: "settings")
      getSettings: => @settings
  
  setSettings: (@settings) ->
    @settingsObj.set @settings
  
  beforeCompute: (handler) ->
    @on "preCompileCoffee", (e, data) =>
      return unless data.resource.url is "compute.coffee"
      handler()
      
  # Unused
  forceEditorRendering: ->
    # Force rendering of editors (e.g., mathjax, links)
    setTimeout (=>
      @computationEditor.aceEditor?.focus()
      setTimeout (=>
        @computationEditor.aceEditor?.blur()
        @definitions.aceEditor.focus()
        setTimeout (=>
          @definitions.aceEditor.blur()
          @computationEditor.initFocusBlur()
          #@initEditorEventHandlers()
        ), 300
      ), 300
    ), 300
    #setTimeout (=>
    #  @computationEditor.aceEditor?.focus()
    #  @computationEditor.initFocusBlur()
     #@initEditorEventHandlers()
    #), 900
  
  
  on: (name, handler) -> $(document).on name, (evt, data) -> handler(evt, data)
  


$blab.blabrApp = new App
$blab.Layout = Layout

# Export
$blab.Widget = Widget
$blab.Widgets = Widgets 

# Not used
codeSections = ->
  title = "Show/hide code"
  comp = $ "#computation-code-section"
  layout = $ "#layout-code-section"
  predef = $ ".predefined-code"
  
  predef.hide()
  
  $("#computation-code-heading")
    .click -> comp.toggle(500)
  
  $("#layout-code-heading")
    .click -> layout.toggle(500)
  
  ps = true
  toggleHeading = ->
    ps = not ps
    #$("#predefined-code-heading").html (if ps then "[Hide" else "[Show")+" predefined code]"
  toggleHeading()
  
  removeInit = ->
    resource = $blab.resources.find("predefine.coffee")
    editor = resource?.containers?.fileNodes?[0].editor
    editor?.container.removeClass "init-editor"
    ev = resource?.containers?.evalNodes?[0].editor
    ev?.container.removeClass "init-editor"
  
  $("#predefined-code-heading")
    .click ->
      removeInit()
      predef.toggle(500)
      toggleHeading()


# To deprecate (use MarkdownEditor instead)
class TextEditor
  
  containerId: "#main-text"
  filename: "text.html"
  wikyUrl: "/puzlet/puzlet/js/wiky.js"
  posAttr: "data-pos"
  widgetsId: "#widgets"
  
  constructor: ->
    
    @text = $ @containerId
    return unless @text.length
    @text.css(cursor: "default")  # ZZZ do in CSS
    @text.click => @toggle()
    
    @resources = $blab.resources
    @widgetsRendered = false
      
  setWidgetsRendered: ->
    @widgetsRendered = true
    @process() if Wiky?
  
  loadWiky: (callback) ->
    console.log "TextEditor::loadWiky"
    @resources.add {url: @wikyUrl}
    @resources.loadUnloaded -> callback?()
    
  init: ->
    console.log "TextEditor::init"
    @resource = @resources.find(@filename)
    @editor = @resource?.containers?.fileNodes?[0].editor
    return unless @editor
    @editor.container.removeClass "init-editor"
    @editor.onChange => @render()
    @editor.show false
    @process() if @widgetsRendered
    
  render: ->
    @renderId ?= null
    clearTimeout(@renderId) if @renderId
    @renderId = setTimeout (=>
      #@resource.content = 
      @process()
    ), 500
    
  process: ->
    console.log "TextEditor::process"
    unless Wiky?
      @loadWiky => @init()
      return
    #return unless Wiky?
    console.log "TextEditor::process/Wiky"
    @text.empty()
    html = Wiky.toHtml(@resource.content)
    return if html is ""
    @text.append html
    @setTitle()
    @positionText()
    $.event.trigger "htmlOutputUpdated"
    
  setTitle: ->
    headings = $ ":header"
    return unless headings.length
    $blab.title = headings[0].innerHTML
    document.title = $blab.title
    
  positionText: ->
    
    sel = "div[#{@posAttr}]"
    widgets = $(@widgetsId)
    current = widgets.find sel
    current.remove()
    
    divs = @text.find sel
    return unless divs.length
    
    append = => $($(p).attr @posAttr).append($(p)) for p in divs
    
    if widgets.length  # Alt: if $("#row1").length
      append()
    else
      # ZZZ needs to trigger after widget rendering
      setTimeout (-> append()), 1000
      
  toggle: ->
    return unless @editor
    @editorShown ?= false  # ZZZ get from editor show state?
    @editor.show(not @editorShown)
    @editorShown = not @editorShown


