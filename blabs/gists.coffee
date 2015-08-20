class Gists
  
  api: "https://api.github.com"
  
  constructor: ->
    
    @container = $("#list-gists")
    
    @username = $.cookie("gh_user")
    @key = $.cookie("gh_key")
    
    unless @username
      @container.append "Set username in blab save credentials form"
      return
    
    @setCredentials() if @username and @key
      
    $.ajax
      type: "GET"
      url: @api+"/gists?per_page=200"
      beforeSend: (xhr) => @authBeforeSend(xhr)
      success: (data) =>
        console.log "Gist data", data
        @display data
  
  display: (data) ->
    @container.append "<h2>#{if @username then @username else ""}</h2>"
    @container.append "<p>Gray links are secret gists.</p>"
    table = $ "<table>"
    @container.append table
    
    headings = ["Comments", "Description", "Created", "Updated"]
    
    for h in headings
      table.append "<th>#{h}</th>"
    
    for d in data
      tr = $ "<tr>"
      table.append tr
      @cell tr, (if d.comments then d.comments else "")
      @link tr, d
      @cell tr, @date(d.created_at)
      @cell tr, @date(d.updated_at)
  
  link: (tr, d) ->
    
    td = $ "<td>"
    tr.append td
    
    re = /\[http:/
    m = d.description.match(re)
    desc = if m.index then d.description.substring(0, m.index-1) else d.description
    if m.index
      p = d.description.substring(m.index+1).slice(0, -1)
    
    a = $ "<a>",
      class: (if d.public then "public-gist-link" else "secret-gist-link")
      href: d.html_url
      target: "_blank"
      text: desc
    
    td.append(a)
    
    if p
      a2 = $ "<a>",
        class: "app-link"
        href: p
        target: "_blank"
        text: "[#{p}]"
      td.append("<br>").append(a2)
    
  cell: (tr, txt) ->
    td = $ "<td>"
    tr.append td
    td.append txt
    td
    
  date: (str) ->
    d = new Date(str)
    d.toLocaleString()  #toUTCString()
    
  setCredentials: ->
    
    console.log "username/key", @username, @key
    
    make_base_auth = (user, password) ->
      tok = user + ':' + password
      hash = btoa(tok)
      "Basic " + hash
    
    if @username and @key
      @auth = make_base_auth @username, @key
  
  authBeforeSend: (xhr) ->
    return unless @auth
    console.log "Set request header", @auth
    xhr.setRequestHeader('Authorization', @auth)
    
    
new Gists