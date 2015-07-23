console.log "======== Demo List"

list = $ "#demo-list"
list.hide()

button = $ "#demo-list-button"
button.click -> list.slideToggle()

demoLinks = (items) ->
  list.empty()
  list.append """
  <b>Quick Syntax Tips</b><br>
  <code>k = slider "k"</code><br>
  <code>table "my-table", x, y</code><br>
  <code>plot "my-plot", x, y</code><br>
  <br>
  """
  list.append "<b>Demos</b><br>"
  for item in items
    link = $ "<a>",
      href: "?"+item.id
      text: item.text
      target: "_blank"
    list.append(link).append("<br>")
    
  list.append """
  <br>
  <b>Examples</b><br>
  (Thumbnails/links to a few nice examples here.)
  <br><br>
  <b>Reference</b><br>
  (Documentation blabs - CoffeeScript/Blabr language guide.)
  """
    
$blab.demoListHtml = (spec) ->
  html = "<ul>\n"
  for item in demoList
    c = if item.id is spec.highlight then "demo-list-item-highlight" else ""
    html += "<li><a class='#{c}' href='?#{item.id}'>#{item.text}</a></li>\n"
  html += "</ul>\n"

demoList = [
  {text: "Basic Math", id: "58ef3095767efcdf1977"}
  {text: "Basic Plot", id: "ee2036a3e55336c6d010"}
  {text: "Text", id: "277bf74a4b1e7364df29"}
  {text: "Tables", id: "e31dcf9a402f12fbf4f5"}
  {text: "Sliders", id: "9b6fbf80ed838d1e1cef"}
  {text: "Layout of components", id: "c7837da7dd136710e2ba"}
  {text: "Function definitions", id: "e8457f2a62b292e1d0a2"}
  {text: "Importing definitions", id: "d1889126b58315ba2239"}
]

demoLinks demoList
