console.log "======== Demo List"

list = $ "#demo-list"
list.hide()

button = $ "#demo-list-button"
button.click -> list.slideToggle()

demoLinks = (items) ->
  
  list.empty()
  
  list.append """
  <div class="guide-col">
  <b>Quick Syntax Tips</b><br><hr>
  <code>k = slider "k"</code><br>
  <code>table "my-table", x, y</code><br>
  <code>plot "my-plot", x, y</code><br>
  <code>x = [1, 2, 3]</code><br>
  <code>x = [1..3]</code><br>
  <code>x = linspace 1, 3, 3</code><br>
  <code>square = (x) -> x*x</code><br>
  <code># comment</code><br>
  </div>
  """
  
  list.append """
    <div class="guide-col">
      <b>Demos</b><br><hr>
      #{$blab.demoListHtml(blank: true)}
    </div>
  """
  
  #for item in items
  #  link = $ "<a>",
  #    href: "?"+item.id
  #    text: item.text
  #    target: "_blank"
  #  list.append(link).append("<br>")
  
  #list.append "</div>"

  #list.append demos
    
  list.append """
    <div class="guide-col">

    <b>Examples</b><br><hr>
    
    <div class="gist">
    <a href='//blabr.io?4bd90a0b619bff7707b3' target="_blank">
    <img src='//blabr.org/img/mystery-curve.png'>
    <p>Mystery Curve</p>
    </a>
    </div>
     
    <div class="gist">
    <a href='//blabr.io?3df6e2368e89a8c3f780' target="_blank">
    <img src='//spacemath.github.io/resources/images/thumbs/mars2.png'>
    <p>Basic Properties of Mars as a Planetary Body</p>
    </a>
    </div>
    
    <div class="gist">
    <a href='//blabr.io?d6927773b95652943582' target="_blank">
    <img src='//spacemath.github.io/resources/images/thumbs/planet-core.png'>
    <p>Exploring the Interior of Pluto</p>
    </a>
    </div>
    
    <div class="gist">
    <a href='//blabr.io?2a55efd937f9d3e87d29' target="_blank">
    <img src='//blabr.org/img/solitons.png'>
    <p>Star Trek's solitons are real</p>
    </a>
    </div>
    
    <a href="//blabr.org" target="_blank">More blabs<a>
    </div>
    <div class="guide-col">
    <b>Reference</b><br><hr>
    (Documentation blabs - Blabr language guide.)<br>
    <a href="//coffeescript.org" target="_blank">CoffeeScript language guide</a>
    </div>
  """
  # Link to coffeescript.org
    
$blab.demoListHtml = (spec) ->
  html = "<ul>\n"
  for item in demoList
    c = if item.id is spec.highlight then "demo-list-item-highlight" else ""
    t = if spec.blank then " target = '_blank'" else ""
    html += "<li><a class='#{c}' href='?#{item.id}'#{t}>#{item.text}</a></li>\n"
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
