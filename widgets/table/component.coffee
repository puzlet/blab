#!vanilla
#!no-math-sugar

# Table component.
# For any web page.

# TODO:
# Copy-paste - blabcopy etc.

class Table
  
  constructor: (@spec) ->
    
    {@container, @id, @title, @headings, @widths, @colCss, @css, @precision, change} = @spec
    
    # Make component object accessible via jQuery.
    @container.data "blab-component", this
    
    @table = $ "<table>",
      id: @id
      class: "widget"  # ZZZ component?
        
    @container.append @table
    
    @caption = $("<caption>", text: @title) if @title
    @table.append @caption
    
    @table.css(@css) if @css
    
    @colGroup = $ "<colgroup>"
    @table.append @colGroup
    @widths ?= 100
    @widths = [@widths] unless Array.isArray(@widths)
    @setColGroup()
    
    if @headings
      tr = $ "<tr>"
      @table.append tr
      for h, idx in @headings
        tr.append "<th>#{h}</th>"
        
    @tbody = $ "<tbody>"
    @table.append @tbody
    
    @tablesFile = $blab.resources.find "tables.json"
    
    unless $blab.tableData
      $blab.tableData = if @tablesFile then JSON.parse(@tablesFile.content) else {}
      
    $blab.tableData[@id] ?= {}
    @tableData = $blab.tableData[@id]
    
    @changeFcn = if change then (-> change()) else (->)
    
    # ZZZ need different approach?  just call setFunctions directly because have object
    #$(document).on "blabcompute", => @setFunctions()
    
    $(document).on "blabcompute", => @setFunctions()
    
    @setVal([[0]])
    
    #setTimeout (=> @tableChange()), 0
  
  ui: -> (v...) => @set v...
  
  change: (f) -> @changeFcn = -> f?()
  
  # ZZZ TEMP
  domId: -> @id
  
  lectureAction: (spec) =>
    f: => @populate(spec)
    b: => console.log "No back step for table" #@restore()
    
  populate: (spec) ->
    {col, vals, delay, callback} = spec
    delay ?= 1000
    idx = 0
    set = =>
      v = vals[idx]
      cell = @editableCells[col][idx]  # 0 needs to be arg.
      cellDiv =  cell.div
      parent = cellDiv.parent()
      bg = parent.css "background"
      setBg = (col) -> parent.css background: col
      dir = if idx<vals.length-1 then 1 else 0
      
      cellDiv.text v
      setBg "#ccc"
      setTimeout (->
        setBg bg
        cell.done()
      ), 200
      idx++
      if idx < vals.length
        setTimeout (-> set()), delay
      else
        cells = $('.editable-table-cell')
        setTimeout (->
          $(cells[2]).blur()
          $("#container").click()
        ), 1000
        callback?()
    set()
  
  set: (v...) ->
    return unless v.length
    unless v[0] instanceof Object
      for x, idx in v
        v[idx] = [x] unless Array.isArray(x)
    @setVal(v)
  
  tableChange: ->
    @store()
    #console.log "table.json", @tablesFile.content
    @changeFcn()
    @setFunctions()  # ZZZ should this be callback after @change?()
  
  # ZZZ To port (see above)
  # compute: (id, v...) ->
  #   return unless v.length
  #   unless v[0] instanceof Object
  #     for x, idx in v
  #       v[idx] = [x] unless Array.isArray(x)
  #   @setValAndGet(id, v...)
  
  create: (@spec) ->
    
    # {@title, @headings, @widths, @colCss, @css, @precision} = @spec
    
    # @table = $ "#"+@domId()
    # @table.remove() if @table.length
    # @table = $ "<table>",
    #   id: @domId()
    #   class: "widget"
    #   mouseup: =>  # Use mouseup instead of click so can control propagation.
    #     @select()
        
    # @caption = $("<caption>", text: @title) if @title
    # @table.append @caption
    #
    # @table.css(@css) if @css
    #
    # @colGroup = $ "<colgroup>"
    # @table.append @colGroup
    # @widths ?= 100
    # @widths = [@widths] unless Array.isArray(@widths)
    # @setColGroup()
      
    # if @headings
    #   tr = $ "<tr>"
    #   @table.append tr
    #   for h, idx in @headings
    #     tr.append "<th>#{h}</th>"
      
    # @tbody = $ "<tbody>"
    # @table.append @tbody
    
    @appendToCanvas @table
    
    # @tablesFile = $blab.resources.find "tables.json"
    #
    # unless $blab.tableData
    #   $blab.tableData = if @tablesFile then JSON.parse(@tablesFile.content) else {}
    
    # $blab.tableData[@id] ?= {}
    # @tableData = $blab.tableData[@id]
    
    $(document).on "blabcompute", => @setFunctions()
    
    #(document.body).removeEventListener "copy"
    #(document.body).addEventListener "copy", (e) => console.log "doc copy"
    
    @setVal([[0]])
  
  setColGroup: (n) ->
    
    if n
      expand = n and @widths.length<n and not Array.isArray(@spec.widths)
      return unless expand
      @widths = (@spec.widths for i in [1..n])
    
    @colGroup.empty()
    for w, idx in @widths
      css = @colCss?[idx] ? {}
      css.width = w
      col = $ "<col>", css: css
      @colGroup.append col
  
  
  initialize: ->
  
  setVal: (v) ->
    
    #@setUsed()
    
    unless v[0] instanceof Array
      # Doesn't yet handle multiple objects (rows)
      # Need to do similar check as one below?  [] and [->]
      @v0 = v[0]
      @first = null
      return @setValObject()
    
    # Currently, we don't support constant value columns mixed in with [] and [->].
    o = {}
    invalid = false
    for val, idx in v
      l = val.length
      if l is 0
        dynamic = true
        editable = true
        o[idx] = val  # Arg is []
      else if l is 1 and typeof val[0] is "function"
        dynamic = true
        o[idx] = val[0]
      else
        invalid = true
        break
    
    if dynamic
      if invalid
        console.log "Invalid table signature."  # Throw error?
        return null
      else unless editable
        console.log "Must have at least one editable column."
        return null
      else
        @v0 = o
        @first = null  # ZZZ dup code?
        return @setValObject()
    else
      @setValRegular(v)
  
  
  setValRegular: (v) ->
    
    @setColGroup(v.length)
    
    @tbody.empty()
    row = []
    for x, idx in v[0]
      tr = $ "<tr>"
      @tbody.append tr
      for i in [0...v.length]
        d = v[i][idx]
        val = if typeof d is "number" then @format(d) else d
        tr.append "<td class='table-cell'>"+val+"</td>"
    @value = v
    
    new TableCellSelector(@domId())
    
    null
  
  
  setValObject: ->
    
    @editableCells = {}
    @functionCells = {}
    @funcs = {}
    @isFunc = {}
    @editableCols = []  # Columns (editable)
    @t ?= {}  # Table object after evaluation.  Now used for editable cells only.
    @editNext ?= {}  # Needs to retain state from last computation.
    
    numCols = 0
    
    for name, val of @v0
      numCols++
      @first = name unless @first  # Bug if function first col?
      @isFunc[name] = typeof val is "function"
      if @isFunc[name]
        @functionCells[name] ?= []
        @funcs[name] = val
      else
        @editableCells[name] ?= []
        @editableCols.push(@setData(name, val))
        @firstEditableColName = name unless @firstEditableColName
    
    @colNames = (name for name, cell of @editableCells)
    @colIdx = {}
    @colIdx[name] = idx for name, idx in @colNames
    
    @currentCol ?= @first  # Assumes editable?
    
    # Set table cells
    @setColGroup(numCols)
    @tbody.empty()
    for x, idx in @tableData[@firstEditableColName]
      tr = $ "<tr>"
      @tbody.append tr
      for name, val of @v0
        td = $ "<td>"  # class table-cell?
        tr.append td
        @setCell td, name, idx, val
    
    new TableCellSelector(@domId())
    
    @checkForFocusCell()  # ZZZ move to clickNext?
    @clickNext(@currentCol)
    @value = @v0  # Is this correct?
    
    # Return value: x or [x, y, ...]
    if @editableCols.length is 1 then @editableCols[0] else @editableCols
  
  setData: (name, val) ->
    if val.length is 0 then val = [null]
    @tableData[name] ?= val
    val = @tableData[name]
    @t[name] = (v for v in val)  # Must do copy here.
    # Check for null values
    for v, idx in @t[name]
      @t[name][idx] = 0 if v is null
    @t[name]  # Return value
  
  
  setCell: (td, name, idx, v) ->
    if @isFunc[name]
      @functionCells[name].push td
    else
      d = @tableData[name][idx]
      cell = @createEditableCell td, name, idx, d
      @editableCells[name].push cell
  
  
  createEditableCell: (container, name, idx, val) ->
    new EditableCell
      container: container
      idx: idx
      val: val  # TODO: need to format for display?
      callback: (val, changed, dir, colDir) => @cellAction name, idx, val, changed, dir, colDir
      del: => @deleteRow name, idx 
      insert: => @insertRow name, idx
      paste: (idx, val) => @paste name, idx, val
      clickCell: (focus=true) =>
        @focusCell = if focus then {name, idx} else null #@focusAction(name, idx)  # Later: needs to set clickNext params.
  
  setFunctions: ->
    
    return unless @funcs
    
    for name, func of @funcs
      
      try
        val = func(@t)  # pass @t here, in case func needs it (no closure).
      catch error
        console.log "====Blabr====", error
        return
        
      for cell, idx in @functionCells[name]
        d = val[idx]
        v = if typeof d is "number" then @format(d) else d
        cell.html v
  
  
  cellAction: (name, idx, val, changed, dir, colDir) ->
    @setNext(name, idx, dir, colDir)
    @appendRow(name) if @editNext[name]>=@editableCells[name].length
    if changed
      @tableData[name][idx] = val
      @tableChange()
      #@store()
      #@computeAll()
    else
      @clickNext(@currentCol)
  
  setNext: (name, idx, dir, colDir) ->
    
    # Don't use focusCell if moving cell with key.
    @focusCell = null if dir isnt 0 or colDir isnt 0
    
    if colDir isnt 0
      m = @colIdx[name] + colDir
      if m>=0 and m<@colNames.length
        @currentCol = @colNames[m]
        @editNext[@currentCol] = idx
    else
      @currentCol = name
      if dir is 0
        @editNext[name] = false
      else
        nextIdx = idx + dir
        nextIdx = 0 if nextIdx<0
        @editNext[name] = nextIdx
  
  clickNext: (name) ->
    next = @editNext[name]
    ok = next isnt false and next>=0 and next<@editableCells[name].length
    @editableCells[name][@editNext[name]].click() if ok
  
  appendRow: (name) ->
    # Append cell for *all* editable columns.
    @tableData[n].push(null) for n, cell of @editableCells
    @tableChange()
    #@store()
    #@computeAll()
  
  insertRow: (name, idx) ->
    @currentCol = name
    for n, cell of @editableCells
      @tableData[n].splice(idx, 0, null)
      @editNext[n] = idx
    @tableChange()
    #@store()
    #@computeAll()
    
  deleteRow: (name, idx) ->
    @focusCell = null  # needed?
    @currentCol = name
    @tableData[n].splice(idx, 1) for n, cell of @editableCells
    @editNext[name] = if idx>1 then idx-1 else 0
    @tableChange()
    #@store()
    #@computeAll()
  
  paste: (name, idx, val) ->
    vals = val.split(", ").join(" ").split(" ")
    for v, i in vals
      @tableData[name][idx+i] = parseFloat(v)
    @editNext[name] = idx
    @tableChange()
    #@store()
    #@computeAll()
   
  checkForFocusCell: ->
    # Handle clicking on another cell after changing previous cell (and thus recomputing)
    return unless @focusCell
    @currentCol = @focusCell.name
    @editNext[@currentCol] = @focusCell.idx
    @focusCell = null
    
  store: ->
    # ZZZ To implement for component
    @tablesFile.content = JSON.stringify($blab.tableData, null, 2)
    #$.event.trigger "codeNodeChanged" unless $blab.isEmbedded or $blab?.layoutPos or $blab.lecture2 # ZZZ should do via ace node set?
   
  format: (x) ->
    if x is 0 or Number.isInteger?(x) and Math.abs(x)<1e10
      x
    else
      x.toPrecision(@precision ? 4) 


class EditableCell
  
  constructor: (@spec) ->
    
    {@container, @idx, @val, @callback, @del, @insert, @paste, @clickCell} = @spec
    
    @disp = if @val is null then "" else @val
    
    @div = $ "<div>",
      class: "editable-table-cell"
      text: @disp
      contenteditable: true
      
      focus: (e) =>
        @clickCell()
        #e.preventDefault()
        setTimeout (=> @selectElementContents @div[0]), 0
      
      mousedown: (e) => $.event.trigger "clickInputWidget"
      #mouseup: (e) => e.stopPropagation()
      click: (e) =>
        e.stopPropagation()
        @click(e)
      keydown: (e) => @keyDown(e)
      change: (e) => @change(e)
      blur: (e) =>
        @clickCell(false)
        setTimeout (=> @change(e)), 100 #@reset()  # Not quite right - needs to select new cell that click on.
        
    @div.on "paste", (e) =>
      @div.css color: "white"  # Temporary - cell gets rebuilt when computation done.
      setTimeout (=> @paste(@idx, @div.text())), 0
    
    @container.append @div
    
  selectElementContents: (el) ->
    range = document.createRange()
    range.selectNodeContents(el)
    sel = window.getSelection()
    sel.removeAllRanges()
    #console.log "*****", Object.keys(range).length #isnt 0  #sel, sel.addRange, range
    sel?.addRange?(range) unless $blab.isIe #and Object.keys(range).length isnt 0
  
  click: (e) ->
    @div.focus()
    
  reset: ->
    @div.empty()
    @div.text(if @val is null then "" else @val)
        
  keyDown: (e) ->
    
    key = e.keyCode
    #console.log "key", key, e.shiftKey
    
    ret = 13
    backspace = 8
    left = 37
    up = 38
    right = 39
    down = 40
    
    if key is ret
      # Handle case where user presses return without changing value.
      e.preventDefault()
      if e.shiftKey
        @insert(@idx)
      else
        @noChange = true
        @done(0)
      return
      
    if key is backspace
      #console.log "backspace", @idx
      if @div.text() is ""
        e.preventDefault()
        @del(@idx) 
      return
    
    return unless key in [left, up, right, down]
    e.preventDefault() if key in [up, down]
    
    # NOT YET WORKING - need to make work with edit mode.  click on selected text to edit.
    #if key in [left, right]
    #  r = window.getSelection().getRangeAt(0)
    #  console.log "+++++ SEL", r.startContainer, r.startOffset, r.endOffset
    #  return unless r.startOffset?
    #  return unless (key is left and r.startOffset is 0) or (key is right and r.startOffset is r.startContainer.length)
      #return
      #setTimeout (-> console.log "SEL", r.startContainer, r.startOffset, r.endOffset), 100
      #return
    
    dir = if key is down then 1 else if key is up then -1 else 0
    colDir = if key is right then 1 else if key is left then -1 else 0
    @done(dir, colDir)
    
  change: (e) ->
    @done() unless @noChange
  
  enterVal: (v, dir=1) ->
    # Interface for demo.
    @noChange = true
    @div.click()
    @div.text v
    @done(dir)
  
  done: (dir=0, colDir=0) ->
    v = @div.text()  # @div?
    if v is ""
      changed = v isnt @disp
      val = null
      @val = val
      @callback val, changed, dir, colDir
    else
      val = if v then parseFloat(v) else null
      val = v if isNaN(val)  # handle text cell
      changed = val isnt @val
      @val = val if changed
      @disp = @val
      @callback val, changed, dir, colDir


class TableCellSelector
  
  constructor: (@tableId) ->
    
    #console.log "Table cell selector", @tableId
    
    @cell = $("##{@tableId} td")
    
    @cell.unbind(e) for e in ["click", "blur", "mousedown", "mousemove", "mouseenter", "mouseleave", "mouseup"]
    
    # To stop layout editor:
    # But note that table widget can be selected ony via table heading.  another way?
    @cell.click (e) => @stop(e)
    
    @cell.blur (e) => console.log "blur"
    
    @cell.mousedown (e) => @mousedown(e)
    @cell.mousemove (e) => @mousemove(e)
    @cell.mouseleave (e) => @mouseleave(e)
    @cell.mouseenter (e) => @mouseenter(e)
    @cell.mouseup (e) => @mouseup(e)
    
    # Unbind for blabmousedown/blabmouseup/blabcopy is in blabr.coffee.
    $(document).on "blabmousedown", (e) =>
      @reset() unless @down and @inTable
      
    $(document).on "blabmouseup", (e) =>
      @reset() unless @down and @inTable
    
    $(document).on "blabcopy", (e, data) => @copy(e, data)
    
    @selected = []
    @reset()
  
  reset: ->
    
    @deselectAll()
    
    @down = false
    @inTable = false
    
    @first = false
    
    @column = null
    @start = -1
    @end = -1
    
    @selected = []
    @vector = []
    
  mousedown: (e) ->
    
    @stop(e)
    
    @deselectAll()
    
    @down = true
    @inTable = true
    @first = true
    
    [row, @column] = @coord(e)
    @start = @end = row
    
    setTimeout (=> @initFirst(e)), 100
  
  initFirst: (e) ->
    return unless @first and @down
    @select e
    @first = false
  
  mousemove: (e) ->
    return unless @first and @down
    @stop(e)
    @initFirst(e)
  
  mouseleave: (e) =>
    
    return unless @down
    @stop(e)
    
    [row, col] = @coord(e)
    
    if col isnt @column
      @reset()
      return
      
    @inTable = false  # Set on mouseenter
    
    @lastLeave = e
    @lastLeaveRow = row
    
  mouseenter: (e) ->
    
    return unless @down
    @stop(e)
    
    @inTable = true
    
    [row, col] = @coord(e)
    
    if col isnt @column
      @reset()
      return
    
    #window.getSelection().removeAllRanges() unless @isEditable(e)  # Covered by CSS now.
      
    @first = false
    
    @deselect(@lastLeave) if @lastLeaveRow>row
    @select(e) if row>@end
    @end = row
  
  mouseup: (e) ->
    @stop(e)
    @down = false
    @inTable = false
    @normal(@start) if @selected.length is 1
    @vector = ($(s.target).text() for s in @selected)
  
  copy: (e, data) ->
    console.log "copy cells", @tableId, @vector
    return unless @vector.length
    console.log "data", data
    e = data.original
    e.preventDefault()
    string = @vector.join ", "
    e.clipboardData.setData('Text', string)
    # t = e.clipboardData.getData('Text') # for paste purposes.
  
  coord: (e) ->
    t = $(e.target)
    p = t.parent()
    if @isEditable(e)
      # <div>
      td = p
      tr = td.parent()
    else
      # <td>
      td = t
      tr = p
    row = tr.index()
    col = td.index()
    [row, col]
  
  deselectAll: ->
    return unless @selected.length
    @normal(s) for s in @selected
    @selected = []
  
  select: (e) ->
    @highlight e
    @selected.push e
    
  deselect: (e) ->
    @selected.pop()
    @normal(e)
  
  highlight: (e) ->
    $(e.target).css background: "rgb(180, 213, 254)"
  
  normal: (e) ->
    $(e.target).css background: ""  # ZZZ Need to revert to what it was?
    
  isEditable: (e) -> $(e.target).attr("class") is "editable-table-cell"
    
  stop: (e) ->
    e.preventDefault()
    e.stopPropagation()

window.$blab ?= {}
$blab.components ?= {}
$blab.components.Table = Table

#Widget.register [Table]
