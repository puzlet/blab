console.log "======== Demo List"

list = $ "#demo-list"
list.hide()

button = $ "#demo-list-button"
button.click -> list.slideToggle()

demoLinks = (items) ->
  
  list.empty()
  
  list.append """
  <div class="guide-col">
  <h3>Quick Syntax Tips</h3>
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
      <h3>Demos</h3>
      #{$blab.demoListHtml(blank: true)}
    </div>
  """
    
  list.append """
    <div class="guide-col">
      
    <h3>Examples</h3>
    
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
    """
  
  col4 = $ "<div>",
    class: "guide-col"
  list.append col4
  
  col4.append """
      <h3>Reference</h3>
      #{$blab.refListHtml(blank: true)}
      <br>
      <a href="//coffeescript.org" target="_blank">CoffeeScript language guide</a>
  """
  creditsButton = $ "<button>",
    text: "About Blabr"
    click: -> credits.slideToggle(500)
  col4.append("<br><br>").append(creditsButton)
  
  l = (txt, url) -> "<a href='//#{url}' target='_blank'>#{txt}</a>"
  
  credits = $ "<div>", class: "guide-footer"
  list.append credits
  credits.hide()
  
  credits.append """
  <a href='//blabr.org' target='_blank'>Blabr</a> 
  is developed by Martin Clark and Gary Ballantyne (Haulashore Limited) 
  as part of the <a href='//github.com/puzlet' target='_blank'>Puzlet</a> project.<br>
  Thanks to:
    #{l "Ace", "ace.c9.io"},
    #{l "CoffeeScript", "coffeescript.org"},
    #{l "MathJax", "mathjax.org"},
    #{l "numericjs", "numericjs.com"},
    #{l "Flot", "flotcharts.org"},
    #{l "PaperScript", "paperjs.org/reference/paperscript"},
    #{l "jQuery", "jquery.com"},
    #{l "GitHub", "github.com"},
    #{l "SpaceMath", "spacemath.gsfc.nasa.gov"}.
  """

$blab.demoListHtml = (spec) ->
  html = "<ul>\n"
  for item in demoList
    c = if item.id is spec.highlight then "demo-list-item-highlight" else ""
    t = if spec.blank then " target = '_blank'" else ""
    href = if item.id then "?#{item.id}" else ""
    html += "<li><a class='#{c}' href='#{href}'#{t}>#{item.text}</a></li>\n"
  html += "</ul>\n"
  
  
$blab.refListHtml = (spec) ->
  html = "<ul>\n"
  for item in refList
    t = if spec.blank then " target = '_blank'" else ""
    html += "<li><a href='?#{item.id}'#{t}>#{item.text}</a></li>\n"
  html += "</ul>\n"

demoList = [
  # {text: "Introduction", id: ""}
  {text: "Basic math", id: "58ef3095767efcdf1977"}
  {text: "Basic plot", id: "ee2036a3e55336c6d010"}
  {text: "Text", id: "277bf74a4b1e7364df29"}
  {text: "Tables", id: "e31dcf9a402f12fbf4f5"}
  {text: "Sliders", id: "9b6fbf80ed838d1e1cef"}
  {text: "Layout of components", id: "c7837da7dd136710e2ba"}
  {text: "Function definitions", id: "e8457f2a62b292e1d0a2"}
  {text: "Importing definitions", id: "d1889126b58315ba2239"}
  {text: "Programming", id: "01df7d9c87dab79fccf0"}
  {text: "Example: lunar crust", id: "2c7e4d04634ee1d2aa40"}
]

refList = [
  {text: "Language overview", id: "cac35c998a6640457c39"}
  {text: "Math functions", id: "c19c10d7828efd13ddee"}
  {text: "Vectors and matrices", id: "cb9ef53d61658dcedd45"}
  {text: "Complex numbers", id: "c182256cc10492eb43b5"}
  {text: "Linear algebra and numeric", id: "19516c877c92649672f4"}
  {text: "Utilities", id: "ccd42df2e696df7e9317"}
]

demoLinks demoList
