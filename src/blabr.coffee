#!vanilla

console.log "---Blabr", navigator.userAgent
$blab.isIe10 = /MSIE 10.0/i.test(navigator.userAgent)
$blab.isIe11 = /rv:11.0/i.test(navigator.userAgent)
$blab.isLteIe9 = $("html").attr("class") is "ie"
$blab.isIe = $blab.isLteIe9 or $blab.isIe10 or $blab.isIe11

alert("This version of IE not currently supported.  Please try Chrome/Safari/Firefox/IE10+.") if $blab.isLteIe9

# Hack to process only once - not needed?
return if $blab?.layoutProcessed
$blab.layoutProcessed = true

$blab.codeDecoration = true

class Widget
  
  @handle: null
  
  @register: (W) -> Widgets.register W
  
  @getName: (W) ->
    # For browsers that don't support W.name (e.g., IE).
    #W.name ?
    name = W.name ? /^function\s+([\w\$]+)\s*\(/.exec(W.toString())[1]
    #console.log "W/name", W, name
    name
  
  @getWidget: ->
    #console.log "Widget @", Widget.getName(@)  #/^function\s+([\w\$]+)\s*\(/.exec(@.toString())[1]  #Widget.getName(@)
    name = @name ? Widget.getName(@)
    #console.log "getWidget", name
    Widgets.Registry[name]
  
  @getApi: ->
    name = @name ? Widget.getName(@)
    "$blab.Widgets.Registry."+name
  
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
    w = Widgets.fetch(W, id, v...)
    w?.setUsed()
    w
  
  @compute: (id, v...) ->
    # Default compute method.  Can override in subclass.
    if @source
      @getVal(id, v...) ? @initVal
    else
      @setVal(id, v...)
  
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
    
  @createDomId: (prefix, id) ->
    # Cannot have spaces in DOM id.  Replace with underscores.
    domId = prefix + id.split(" ").join("-")
    #console.log "domId", domId
    domId
    
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
  
  initialize: ->
    # Override in subclass.
    @setVal @initVal
  
  setVal: (v) ->
    # Override in subclass.
    @value = v
  
  getVal: ->
    # Override in subclass.
    @value
  
  appendToCanvas: (@mainContainer) ->
    Widgets.append @domId(), this, @mainContainer
    domId = @domId()
    @mainContainer.attr(id: domId) unless $("#"+domId).length
    events = $._data(@mainContainer.get(0), "events")
    unless events?.mouseup
      @mainContainer.mouseup => @select()
  
  domId: ->
    Widget.createDomId @constructor.domIdPrefix(), @id
    #@constructor.domIdPrefix() + @id
    
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
    console.log "Register", WidgetSet
    # setTimeout (->
    #   for W in WidgetSet
    #     console.log "reg widget", W, W.name, /^function\s+([\w\$]+)\s*\(/.exec( W.toString() )[ 1 ]
    # ), 1000
    for W in WidgetSet
      $blab.resources.fetch(W.cssUrl) if W.cssUrl
      name = Widget.getName(W) #Widget.name ? Widget.cName #/^function\s+([\w\$]+)\s*\(/.exec(Widget.toString())[1]
      console.log "Widget", name
      @Registry[name] = W
  
  @widgets: {}
  @count: 0
  
  @initialize: ->
    
    console.log "======= Widgets initialize"
    
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
      @removeAllFromCanvas()
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
    id2 = if prefix then Widget.createDomId(prefix, id) else id
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
      id = Widget.createDomId(prefix, id) if prefix
      widget = @widgets[id]
      break
    widget ? null
    
  @setAllUnused: ->
    w.setUsed false for id, w of @widgets
    
  @removeAllFromCanvas: ->
    for id, w of @widgets
      w.destroy?()
      w.mainContainer?.remove()


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
    @editor.onChange => @showTip()
    @aceEditor.setShowFoldWidgets true
    
    @container = @editor.container
    @parent = @container.parent()
    
    @closeButton = new $blab.utils.CloseButton @parent, => @trigger "clickCloseButton"
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
    
    @container = @editor.container
    @parent = @container.parent()
    
    if @firstDisplay
      @container.removeClass "init-editor"
      @container.css maxHeight: "0px" #"10px"
      @parent.show()
      @editor.show true
      if txt
        @vp(txt, true)  # Does this ever happen?
      else
        setTimeout (=> @parent.hide()), 1000
      @firstDisplay = false
    else
      if @sliding
        @next = =>
          @vp txt
          @next = =>
      else
        @vp txt
  
  vp: (txt, first=false) ->
    
    @container.css
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
      @parent.slideUp 400, =>
        @sliding = false
        @next()
      return
    
    @parent.addClass "popup-editor" unless @parent.hasClass "popup-editor"
    
    @parent.css
      maxHeight: "0px" # "10px"
    @parent.show()
    @deleteButton()
    @errorMessage()
    
    @editor.show true if @start
    spec.viewPort = true
    spec.startLine = @start+1
    spec.endLine = if @end-@start+1<20 then @end+1 else @start+20
    @editor.setViewPort()
    @editor.editorContainer[0].onwheel = -> false
    
    @parent.hide()
    @parent.css
      maxHeight: ""
    
    @sliding = true
    @parent.slideDown 400, =>
      @sliding = false
      @next()
  
  showTip: ->
    return if not @del?.is(':empty') and @edited
    @edited = true
    @del?.css color: "#aaa"
    @del?.html "Press shift-return to update"
    
  deleteButton: ->
    
    @del?.empty()
    
    unless @del?.length
      @del = $ "<div>",
        css:
          position: "absolute"
          display: "inline-block"
          top: 5
          right: 15
      @editor.editorContainer.append @del
    
    return unless @currentId
    widget = Widgets.widgets[@currentId]  # ZZZ make method
    return if widget?.used
      
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
        @parent.hide()
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
  markedUrl: "/puzlet/puzlet/js/marked.min.js"  # To go in index.html.
  posAttr: "data-pos"
  widgetsId: "#widgets-container"
  editorHeight: 15
  
  constructor: ->
    
    @initMarked()
    
    @text = $ @containerId
    return unless @text.length
    @text.css(cursor: "default")  # ZZZ do in CSS
    @text.mouseup (evt) => @trigger "clickText", {evt: evt, start: 0}
    
    @resources = $blab.resources
    @widgetsRendered = false
    
    @firstDisplay = true
    @viewPortDisplayed = false
    
    @observers =
      initialized: []
      setViewPort: []
      clickText: []
      clickCloseButton: []
    
  setWidgetsRendered: ->
    @widgetsRendered = true
    @process() if @initialized #marked?
  
  initResource: ->
    @resource = @resources.find(@filename) #unless @resource
    console.log "**** MD", @resource
  
  init: ->
    
    @initMarked()
    
    # console.log "MarkdownEditor::init"
    #
    # marked.setOptions
    #   renderer: new marked.Renderer
    #   gfm: true
    #   tables: true
    #   breaks: false
    #   pedantic: false
    #   sanitize: false
    #   smartLists: true
    #   smartypants: false
    #
    # @customizeLinks()
    
    #@resource = @resources.find(@filename)
    
    @initResource()
    
    @editor = @resource?.containers?.fileNodes?[0].editor
    
    @initialized = true
    
    return unless @editor
    @aceEditor = @editor.editor
    
    @container = @editor.container
    @parent = @container.parent()
    
    @container.removeClass "init-editor"
    @editor.onChange => @render()
    @editor.show false
    
    @closeButton = new $blab.utils.CloseButton @parent, => @trigger "clickCloseButton"
    @closeButton.css right: 30
    
    @setViewPort null
    
    @process() if @widgetsRendered
    
    @trigger "initialized"
  
  initMarked: ->
    
    return unless marked?
    
    marked.setOptions
      renderer: new marked.Renderer
      gfm: true
      tables: true
      breaks: false
      pedantic: false
      sanitize: false
      smartLists: true
      smartypants: false
      
    @customizeLinks()
  
  customizeLinks: ->
    marked.Renderer.prototype.link = (href, title, text) ->
      if this.options.sanitize
        try
          prot = decodeURIComponent(unescape(href))
            .replace(/[^\w:]/g, '')
            .toLowerCase()
        catch
          return ''
        return '' if (prot.indexOf('javascript:') is 0 or prot.indexOf('vbscript:') is 0)
      t = if title then " title=\"#{title}\"" else ""
      out = "<a href=\"#{href}\" target=\"_blank\"#{t}>#{text}</a>"
    
  preProcess: (file) ->
    
    # replace troublesome stuff
    preText = file
      .replace(/\\\$/g,"\\&pound;") # \$
      .replace(/\\`/g,"\\&sect;") # \`
      .replace(/([^-])([-]{3})([^-])/g, "$1&mdash;$3")  # could be handled using smartypants?
      
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
  
  renderMd: ->
    #console.log "MarkdownEditor::process"
    #unless @initialized
    #  @init()
    #  return
    #unless marked?
    #  @loadMarked => @init()
    #  return
    #console.log "MarkdownEditor::process/marked"
    @text.empty()
    $(".rendered-markdown").remove()
    
    md = @snippets(@preProcess @resource.content)
#    md = @snippets(@resource.content)
    
    out = []
    @text.hide() if $blab.layoutPos
    for m in md
      if m.pos is 0
        @text.append m.html
        out.push m.html
      else
        container = Layout.getContainer(m.pos, m.order)
        @markdownDiv(container, m)
    @setTitle(out.join "\n")
    $.event.trigger "htmlOutputUpdated"
    
  process: ->
    console.log "MarkdownEditor::process"
    unless @initialized
      @init()
      return
    @renderMd()
    @trigger "setViewPort"
    
  # Note used - marked loaded in index.html.
  loadMarked: (callback) ->
    console.log "MarkdownEditor::loadMarked"
    @resources.add {url: @markedUrl}
    @resources.loadUnloaded -> callback?()
    
  markdownDiv: (container, m) =>
    div = $ "<div>",
      class: "rendered-markdown"
      css: cursor: "default"
      mouseup: (evt) =>
        @trigger "clickText", {evt: evt, start: parseInt(div.attr "data-start")}
    div.attr("data-pos": m.pos, "data-order": m.order, "data-start": m.start)
    div.append m.html
    container.append div
    div
    
  setTitle: ->
    headings = $ ":header"
    $blab.title = if headings.length then headings[0].innerHTML else "Puzlet"
    console.log "MarkdownEditor::setTitle", $blab.title
    if $blab.title isnt "Untitled" and document.title isnt $blab.title
      #console.log "%%%%%%%%%% changeBlabTitle"
      $.event.trigger "changeBlabTitle"
      document.title = $blab.title #unless $blab.title is "Untitled"
      
  setViewPort: (start) ->
    
    return unless @editor
    
    @viewPortDisplayed = start isnt null and start isnt false
    @trigger "setViewPort"
    
    @container = @editor.container
    @parent = @container.parent()
    
    if @firstDisplay
      #container = @editor.container
      @container.removeClass "init-editor"  # Done above?
      @container.css maxHeight: "0px" # "10px"
      @parent.show()
      @editor.show true
      setTimeout (=> @vp start, true), 500
      @firstDisplay = false
    else
      @vp start
  
  vp: (startChar, first=false) ->
    
    @container.css
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
        @parent.hide()
      else
        @parent.slideUp 400
      return
      
    @parent.addClass "popup-editor" unless @parent.hasClass "popup-editor"
    
    @start = (if startChar is 0 then 0 else @getStartLine startChar)
    @end = @start + @editorHeight - 1
    
    if first
      @parent.show()
    else
      @parent.slideDown 400
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
    widgets = $("#widgets-container")
    widgets.empty()
    for label, row of @spec
      r = $ "<div>", id: label
      widgets.append r
      for col in row
        c = $ "<div>",
          class: col
          mouseup: (evt) =>
            @trigger "clickBox", {evt}
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
    #console.log "%%%%%%%%%%%%%%%%%%%%%%%% LAYOUT POS", $blab.layoutPos
    return unless @spec.length
    #console.log "RENDER LAYOUT", @spec
    n = 1
    widgets = $("#widgets-container")
    widgets.empty()
    for numCols, rowIdx in @spec
      if numCols>4
        console.log "Maximum of 4 columns per row"
        numCols = 4
      r = $ "<div>", id: "widget-row-#{rowIdx+1}"  # ZZZ later: widgets-row-1
      widgets.append r
      for colNum in [1..numCols]
        #col = if colNum is 1 then "left" else "right"  # ZZZ temporary
        cNum = colNum
        if $blab.layoutPos
          cNum = 1
          if n isnt parseInt($blab.layoutPos)
            n++
            continue
        boxId = "widget-box-#{n}"
        boxClass = "box-#{numCols}-#{cNum}"
        c = $ "<div>",
          id: boxId
          class: boxClass
          mouseup: (evt) =>
            return if $(evt.target).hasClass("ui-slider-handle")  # Hack to prevent slider mouseup triggering clickBox.
            @trigger "clickBox", {evt}  # Use mouseup instead of click so can control propagation.
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
    
    @resources = $blab.resources
    
    @coffee = @resources.add url: @filename
    
    #@resources.blockPostLoadFromSpecFile = true #if @resources.find(@filename)
    # TODO: improve so can specify block per resource.  resources postload would check all.
    
    $blab.definitions = {}
    
    $blab.use = (id=null, callback) => @use id, callback
    $blab.useRecursive = (urls, callback) => @useRecursive urls, callback
    
    @allLoaded = false
    $blab.defs = {}
    $blab.mainDefs = (defs) => @main(defs)
    
    @precode @filename
      
    $(document).on "preCompileCoffee", (evt, data) =>
      return unless data.resource.url is @filename
      $blab.defs = {}
      $blab.definitions = {}
      @allLoaded = false
    
    @resources.loadUnloaded =>
      @coffee.compile()
  
  main: (defs) ->
    # Main defs.coffee
    # $blab.mainDefs(defs)
    
    if typeof defs is "string"
      @directDefs defs
      return
    
    $blab.definitions[@filename] = defs
    defs.loaded = true
    $blab.defs = defs
    @checkLoaded defs
    defs
  
  use: (id=null, callback) ->
    # $blab.use(id, callback)
    
    # Load from defs.coffee
    loadDefsCoffee = typeof id is "string"
    
    if loadDefsCoffee
      url = (if id then "#{id}/" else "") + @filename
    else
      # id: {url: "..."}  # For loading JS, CSS, etc.
      url = id.url ? @extractUrl(id)
    
    # Initialize unless already set by another import.
    $blab.definitions[url] ?= {}
    defs = $blab.definitions[url]
    defs.isImport ?= true
    defs.loaded ?= false
    if defs.loaded
      setTimeout (=> @checkLoaded defs), 0
    else
      doneLoading = =>
        callback?(defs)
        @getDefs url, defs
      if loadDefsCoffee
        @loadCoffee url, -> doneLoading()
      else
        resource = @resources.add id
        @resources.load ((resource) -> resource.url is url), ->
          resource.compile?()  # For coffee
          doneLoading()
    
    defs  # Initially returns {}; fills properties when imported defs.coffee loaded.
  
  extractUrl: (spec) ->
    # Currently handles only one property.
    for p, v of spec
      url = v
      fileExt = p
    url
  
  getDefs: (url, defs) ->
    # $blab.definitions[url] can be {}.
    blabDefs = $blab.definitions[url]
    blabDefs.loaded = true
    defs[name] = def for name, def of blabDefs
    @checkLoaded defs
  
  checkLoaded: (defs) ->
    return if @allLoaded
    # Check defs file loaded
    return false unless defs.loaded
    # Check imports loaded
    checkAll = true
    for name, def of defs
      checkAll = false if def.isImport and not def.loaded
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
      @triggerAllLoaded()
    else
      @done =>
        @firstDone = true
        @triggerAllLoaded()
    
  processDerived: (d) ->
    for name, def of d
      @processDerived(def) if def.isImport  # Recursion
    d.derived?()
  
  loadCoffee: (url, callback) ->
    @removeResource(url)
    return if Gist.import(url, @resources, (coffee) => @doLoad(coffee, callback))
    coffee = @resources.add {url}
    @doLoad(coffee, callback)
  
  doLoad: (coffee, callback) ->
    url = coffee.url
    @precode url
    @resources.load ((resource) -> resource.url is url), =>
      coffee.compile()
      callback?()
  
  precode: (url) ->
    
    location = url.slice(0, -("/defs.coffee".length))  # removes defs.coffee.  TODO: use regex.
    
    preamble = """
        blabId = "#{url}"
        use = (id, callback) -> $blab.use(id, callback)
        load = (urls, callback) -> $blab.useRecursive(urls, callback)
        location = "#{location}"
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
  
  directDefs: (id) ->
    # Simple import:
    # defs "gist:id"
    gist = @use id
    @main
      derived: ->
        for name, property of gist
          this[name] = property if not (name in ["loaded", "isImport"])
  
  triggerAllLoaded: ->
    $.event.trigger "allBlabDefinitionsLoaded", {list: @list()}
    
  list: ->
    d = []
    console.log "$blab.defs", $blab.defs
    for name, def of $blab.defs
      d.push name unless name is "loaded" or name is "derived"
    list = d.join ", "
    "{#{list}} = $blab.defs"
  
  removeResource: (url) ->
    # TODO: move this method to $blab.resources.
    rArray = @resources.resources
    coffeeIdx = idx for r, idx in rArray when r.url is url
    rArray.splice(coffeeIdx, 1) if coffeeIdx
  
  # Utility function to handle recursive use.
  useRecursive: (urls, callback) ->
    idx = 0
    u = =>
      unless idx<urls.length
        callback?()
        return
      @use url: urls[idx], ->
        idx++
        u()  # recursion
    u()
    
    


class Gist
  
  # defs.coffee import from Gist.
  
  @id: (url) ->
    return false unless url.indexOf("gist") is 0
    re = /^gist:([a-z0-9_-]+)/
    match = re.exec url
    return false unless match
    gistId = match[1]
  
  @import: (url, resources, callback) ->
    gistId = @id(url)
    return false unless gistId
    @get gistId, (data) =>
      source = data.defs
      coffee = resources.add {url: url, source: source}
      coffee.gistData = data  # Hack to let Ace access gist description/author
      coffee.location ?= {}  # Hack for FF
      coffee.location.inBlab = false  # Hack for gist save
      callback coffee
    return true
  
  @get: (gistId, callback) ->
    api = "https://api.github.com/gists"
    url = "#{api}/#{gistId}"
    $.get url, (data) =>
      defs = data.files?["defs.coffee"]?.content ? null
      description = data.description
      owner = data.owner.login
      callback?({defs, description, owner})


class DefinitionsEditor
  
  constructor: (@coffee) ->
    
    $(document).on "aceFilesLoaded", =>
      @setHeading()
    
  init: ->
    @editor = @coffee.containers?.fileNodes?[0].editor
    @aceEditor = @editor.editor
    @aceEditor.on "focus", => @hint.fadeIn()
    @aceEditor.on "blur", => @hint.fadeOut()
  
  setHeading: ->
    $("#defs-code-heading").html "Definitions <div id='defs-hint' class='code-hint'>Press shift-enter to run</div>"
    @hint = $ "#defs-hint"
    @hint.hide()


class Buttons
  
  constructor: (@spec) ->
    
    @container = $ "#buttons"
    
    @resources = $blab.resources
    @isGist = @resources.getSource?
    @isDemo = @isGist and @resources.getSource("demo.coffee")
    
    @isStart = not @isGist
    @isBlab = @isGist and not @isDemo 
    
    @settings = @spec.getSettings()
    
    showCode = -> $("#computation-code-wrapper").show()
    
    showCode() if (@settings?.showCodeOnLoad and not $blab.layoutPos) or ((@isStart or @isDemo) and not @settings?.showCodeOnLoad?)
    
    if @isStart
      showCode() if @settings?.showCodeOnLoad
      #@spec.makeEditable()
      @startButtons()
      
    if @isBlab
      $("#top-banner").slideUp()
      showCode() if @settings?.showCodeOnLoad and not $blab.layoutPos
      return if $blab.noLogo
      @append "<hr>"
      #console.log "SETTINGS!", spec.getSettings()
      #$("#computation-code-wrapper").hide()
      @logo()
      return if $blab.isEmbedded
      @docButton()
      @sep()
      #@append "Powered by "
      #@linkButton "Blabr", => @spec.guide()
      # @sep()
      @sourceButton()
      @sep()
      @revisionsButton()
      @sep()
      @showForkButton()
      @sep()
      @commentsButton()
      @sep()
      @embedButton()
      
      @sep()
      b = @linkButton "Edit Page", => @makeEditable()
      b.css color: "green", fontWeight: "bold", textDecoration: "none"
      b.attr title: "Edit blab's layout, text, and widgets."
      
      @sep()
      @moreBlabs()
      
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
    #console.log "***************BLAB", $blab
    logoDiv = $ "<div>",
      id: "blabr-logo-footer"
      #click: => @spec.guide()
    logoLink = $ "<a>",
        href: if $blab.isEmbedded then "//blabr.io?" + $blab.github?.gist?.id else "//blabr.io"
    logoLink.attr target: "_blank" if $blab.isEmbedded
    logoDiv.append logoLink
    logo = $ "<img>",
      src: "img/blabr-logo.png"
    logoLink.append(logo).append("Blabr")
    @append(logoDiv)
  
  startButtons: ->
    @container.empty()
    @append "<hr>"
    @logo()
    @docButton()
    #@sep()
    #@linkButton "Settings", =>
    #  console.log "settings"
    #  @spec.editSettings()
    
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
    @revisionsButton()
    @sep()
    @showForkButton()
    @sep()
    @commentsButton()
    @sep()
    @embedButton()
    @sep()
    s = @linkButton "Settings", =>
      console.log "settings"
      @spec.editSettings()
    s.attr title: "Edit blab settings."
      
  docButton: ->
    @linkButton "Doc & Examples", => @spec.guide()
    
  sourceButton: ->
    l = @linkButton "Source Control", (->), $blab.github?.sourceLink()
    l.attr title: "View GitHub Gist page for this blab."
    
  revisionsButton: ->
    l = @linkButton "Revisions", (->), $blab.github?.sourceLink() + "/revisions"
    l.attr title: "View GitHub Gist revisions for this blab."
    
  commentsButton: ->
    l = @linkButton "Comment", (->), $blab.github?.sourceLink() + "#comments"
    l.attr title: "Comment on this blab in GitHub Gist page."
  
  embedButton: ->
    l = @linkButton "Embed", => @spec.embed()
    l.attr title: "Embed this blab, or a single layout box, in your website."
    
  showForkButton: ->
    b = @forkButton = @linkButton "Fork", =>
      forceNew = true
      $blab.github?.save(forceNew)
    b.attr title: "Create your own version of this blab."
    
  moreBlabs: ->
    b = @linkButton "More Blabs...", (->), "//blabr.org"
    b.css color: "blue", fontWeight: "bold", textDecoration: "none"
    b.attr title: "See more blabs on blabr.org."
  
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
  
  enable: true
  
  constructor: ->
    
    @container = $(@containerSel)
    
    @filenames = (name for name of @errors)
    
    window.onerror = (e, url, line) =>
      $blab.windowError = e
      # Optional: Return "true" to suppress red error in console.
    
    $(document).on "preCompileCoffee", (e, data) => @reset data.resource.url
    
    $(document).on "blabError", (evt, data) =>
      filename = data.source
      return unless @enable and filename in @filenames
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
    md = @resources.add url: "blab.md"
    #guide = @resources.add url: "guide.coffee"
    tables = @resources.add url: "tables.json"
    
    if not @resources.getSource? or @resources.getSource("demo.coffee")
      demo = @resources.add(url: "demo.coffee")
      #@resources.add(url: "js/demo-runner.js")
      #demoRunner = @resources.add(url: "src/demo-runner.coffee")
      
      initDemo = ->
        $blab.initDemoRunner()
        demo.compile()
    
    #done = (cb) =>
    #  @resources.postLoadFromSpecFile()
    #  cb()
    
    @resources.loadUnloaded =>
      @definitions = new Definitions (cb) =>
        @init()
        layout.compile()
        #guide?.compile()
        #console.log "$blab", $blab
        $blab.blabrGuide = new $blab.guideClass
        initDemo?()
        #if demo
          #demo = @resources.add(url: "demo.coffee")
          #demo = @resources.add(url: "demo.coffee")
          #@resources.add(url: "js/demo-runner.js")
          #@resources.loadUnloaded =>
            #demoRunner?.compile()
        #  $blab.initDemoRunner()
          #demoRunner?.compile()
        #  demo.compile()
          #done cb
        #else
        #  done cb
        @resources.postLoadFromSpecFile()
        cb()
        #  @resources.postLoadFromSpecFile()
        #  cb()


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
    
    if background and screen.width>=1024 and not $blab.isEmbedded
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


class EmbedDialog
  
  constructor: ->
    @dialog = $ "<div>",
      id: "embed-dialog"
      title: "Embed blab in your website"
    
    @dialog.dialog
      autoOpen: false
      height: 520
      width: 500
      modal: true
      close: =>
    
    @layoutPos = 1
    
  show: ->
    @content()
    @dialog.dialog "open"
  
  content: ->
    
    @dialog.empty()
    
    id = $blab.github.gist.id
    url = "//blabr.io?#{id}"
    title = $blab.title
    
    width = $("#container").width() + 110  # 1070 ?
    height = $("#container").height() + 60
    
    @dialog.append """
    
    <p>Copy-paste the HTML code into your web page.</p>
    
    <h3>Whole blab</h3>
    <pre><code>&lt;iframe width=#{width} height=#{height}
    src="#{url}"
    style="border: 2px dotted gray;"&gt;
    &lt;a href="#{url}"&gt;
    #{title}
    &lt;/a&gt;&lt;/iframe&gt;</code></pre>
    <h3>Single layout box</h3>
    """
    
    @layoutBoxField()
    
    box = $("#widget-box-#{@layoutPos}")
    width = box.width() + 30
    height = box.height() + 70
    
    @dialog.append """
    <pre id="iframe-code-box"><code>&lt;iframe width=#{width} height=#{height}
    src="#{url}&amp;pos=#{@layoutPos}"
    scrolling="no" style="border: none;"&gt;
    &lt;a href="#{url}"&gt;
    #{title}
    &lt;/a&gt;&lt;/iframe&gt;</code></pre>
    """
    
  layoutBoxField: ->
    
    id = "embed-layout-box"
    
    label = $ "<label>",
      "for": id
      text: "Layout box"
      css:
        display: "block"
        float: "left"
        paddingRight: "10px"
    
    layoutBoxMenu = $ "<select>",
      name: "layout-box"
      id: id
      value: @layoutPos
      change: (evt) =>
        @layoutPos = parseInt(layoutBoxMenu.val())
        @content()
      css:
        marginBottom: "10px"
        width: "50px"
    
    numBoxes = $(".layout-box").length
    
    for n in [1..numBoxes]
      sel = if n is @layoutPos then " selected" else ""
      layoutBoxMenu.append("<option value='#{n}' #{sel}>#{n}</option>")
      
    @dialog.append(label).append(layoutBoxMenu)


class PopupEditorManager
  
  constructor: (@spec) ->
    
    {@widgetEditor, @markdownEditor} = @spec
    
    # States
    @layoutEnabled = false
    @clickedOnComponent = false
    @currentComponent = null
    
    @markdownEditor.on "clickText", (data) =>
      if data.evt?.target.tagName is "A"
        data.evt.stopPropagation()
        return
      @showMarkdownEditor data.start
    @markdownEditor.on "setViewPort", => @highlightLayout()
    @markdownEditor.on "clickCloseButton", => @disableLayout()
    
    @widgetEditor.on "setViewPort", => @highlightLayout()
    @widgetEditor.on "clickCloseButton", => @disableLayout()
    @widgetEditor.on "clickDelete", => @clickedOnComponent = true
    
    @on "clickWidget", (evt, data) => @showLayoutEditor(widget: data.widget)
    
    Layout.on "clickBox", (data) =>
      return if data.evt.target.className is "editable-table-cell"  #  Hack to deal with table cell clicking issue.
      @showLayoutEditor(signature: "layout")
    
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
    #console.log "****** enabled", enabled
    @initEnabled = true if enabled
    @layoutEnabled = enabled
    
  cursorOnWidget: (widget) ->
    @showLayoutEditor(widget: widget, id: null, clicked: false)  # Why id null?
  
  showMarkdownEditor: (start) ->
    #console.log "showMarkdownEditor", @layoutEnabled
    return unless @layoutEnabled
    @clickedOnComponent = true
    setTimeout (=> @clickedOnComponent = false), 300
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


class GoogleAnalytics
  
  constructor: ->
    @codeChanged = false
    title = ->
      id = $blab.github?.gist?.id
      title = if $blab.title is "Untitled" and not id then "---Home Page---" else $blab.title
      if id then "#{title} [#{id}]" else title
    @track "changeBlabTitle", "blab", "view", title
    @track "codeNodeChanged", "blab", "firstEdit", title, (=> not @codeChanged), (=> @codeChanged = true)
    @track "saveGitHub", "blab", "saveButton", title
    @track "createBlab", "blab", "createBlab", title
    @track "forkBlab", "blab", "forkBlab", title
    @track "runBlabDemo", "blab", "runDemo", title
    #@track "runCode", "runCode", "run", @title
    
  track: (blabEvent, gCat, gEvent, gTextFcn, condition=(->true), callback) ->
    $(document).on blabEvent, =>
      gText = gTextFcn()
      #console.log "*** Track Event", blabEvent, gEvent, gText, condition()
      _gaq?.push ["_trackEvent", gCat, gEvent, gText] if condition()
      callback?()


class App
  
  constructor: ->
    new GoogleAnalytics
    console.log "*** BROWSER", $("html").attr("class")
    @blabParams()
    @loader = new Loader => @init()
  
  blabParams: ->
    getParameterByName = (name) ->
      name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]")
      regex = new RegExp("[\\?&]" + name + "=([^&#]*)")
      results = regex.exec(location.search)
      if results is null then "" else decodeURIComponent(results[1].replace(/\+/g, " "))
    bare = getParameterByName "bare"
    $blab.isBare = bare is "1"
    $blab.isEmbedded = $blab.isBare or window.self isnt window.top  # Use this instead of bare
    $blab.layoutPos = getParameterByName("pos")
    $blab.noLogo = (getParameterByName("logo") is "0") or $blab.layoutPos
    if $blab.isEmbedded
      $(".footer").css marginBottom: "0px"
      $("#buttons").css marginBottom: "0px"
    #if $blab.noLogo
    #  $("#top-banner").hide()
  
  init: ->
    
    new BlabEvents
    
    Widgets.initialize()
    @widgetEditor = Widgets.widgetEditor
    @computationEditor = new ComputationEditor
    @markdownEditor = new MarkdownEditor
    @definitions = @loader.definitions
    @definitionsEditor = new DefinitionsEditor @definitions.coffee
    @embedDialog = new EmbedDialog
    
    # TEST rendering md earlier
    #@markdownEditor.process() #if @widgetsRendered
    #@markdownEditor.initialized = false
    
    @on "aceFilesLoaded", => @initEditors()
    
    @beforeCompute =>
      Computation.precode()
      Widgets.setAllUnused()
    
    Layout.on "renderedWidgets", =>
      # TEST rendering md earlier
      @markdownEditor.initResource()
      @markdownEditor.renderMd()
#      @markdownEditor.process()
      @markdownEditor.setWidgetsRendered()
#      @markdownEditor.initialized = false
    
    $("#computation-code-wrapper").hide()
    @on "layoutCompiled", =>
      @initButtons()  # For first layout only
    
    @on "codeNodeChanged", =>
      #console.log "=======codeNodeChanged", @changed
      return if @changed  # First code change only
      @changed = true
#      @buttons.makeEditable()
    
    @settingsObj = new Settings
    @errors = new Errors
    
    $pz.renderHtml = => @markdownEditor.process()
    
    #$(".footer").append("screen width: " + screen.width)
    
  initEditors: ->
    #console.log "**** initEditors"
    @markdownEditor.process()
    @definitionsEditor.init()
#    @definitions.initEditor()
    
    @editors = new PopupEditorManager {@widgetEditor, @markdownEditor}
    
    @computationEditor.on "cursorOnWidget", (data) =>
      return if (@settings?.popupWidgetEditor? and not @settings?.popupWidgetEditor) or @disablePopupWidgetEditor
      #console.log "disable", @disablePopupWidgetEditor
      @editors.cursorOnWidget data.widget
    
    setTimeout (=> @computationEditor.initFocusBlur()), 900
    
    #setTimeout (-> console.log "*** TITLE", document.title), 2000
    #@on "changeBlabTitle", =>
    #  console.log "%%%%%%%%%% blabEditorsInitialized"
    #  $.event.trigger "blabEditorsInitialized"  # For google analytics
      
    #-------------
    # This isn't working from buttons.
    @editors.enable() if not $blab.resources.getSource?
    
  initButtons: ->
    return if @buttons
    @buttons = new Buttons
      guide: => $blab.blabrGuide.slideToggle()
      embed: => @embedDialog.show()
      makeEditable: =>
        #console.log "---makeEditable", @editors
        @editors?.enable()
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
        @definitionsEditor.aceEditor.focus()
        setTimeout (=>
          @definitionsEditor.aceEditor.blur()
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
  



$blab.AppClass = App
#$blab.blabrApp = new App  # DEBUG
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
  widgetsId: "#widgets-container"
  
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


