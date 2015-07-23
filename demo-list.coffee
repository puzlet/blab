console.log "======== Demo List"

list = $ "#demo-list"
list.hide()

button = $ "#demo-list-button"
button.click -> list.slideToggle()

demoLinks = (items) ->
  list.empty()
  list.append "<b>Demos</b><br>"
  for item in items
    link = $ "<a>",
      href: "?"+item.id
      text: item.text
      target: "_blank"
    list.append(link).append("<br>")
    
$blab.demoListHtml = (spec) ->
  html = ""
  for item in demoList
    c = if item.id is spec.highlight then "demo-list-item-highlight" else ""
    html += "<a class='#{c}' href='?#{item.id}' target='_blank'>#{item.text}</a><br>\n"
  html

demoList = [
  {text: "Basic Math", id: "58ef3095767efcdf1977"}
  {text: "Basic Plot", id: "ee2036a3e55336c6d010"}
  {text: "Text", id: "277bf74a4b1e7364df29"}
  {text: "Layout", id: "c7837da7dd136710e2ba"}
  {text: "Importing", id: "d1889126b58315ba2239"}
]

demoLinks demoList
