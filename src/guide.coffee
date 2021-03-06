console.log "Blabr Guide"

content =

  syntaxTips: [
    "k = slider \"k\""
    "table \"my-table\", x, y"
    "x = table \"t\", [], [-> z]"
    "plot \"my-plot\", x, y"
    "x = [1, 2, 3]"
    "x = [1..3]"
    "x = linspace 1, 3, 3"
    "square = (x) -> x*x"
    "# comment"
  ]

  demos: [
    {text: "Basic math", id: "58ef3095767efcdf1977"}
    {text: "Basic plot", id: "3b19d13e5eaa11a4a540"}
    {text: "Text", id: "277bf74a4b1e7364df29"}
    {text: "Tables", id: "0a248098997a6f95635c"}
    {text: "Sliders", id: "9b6fbf80ed838d1e1cef"}
    {text: "Layout of components", id: "c7837da7dd136710e2ba"}
    {text: "Function definitions", id: "e8457f2a62b292e1d0a2"}
    {text: "Importing definitions", id: "d1889126b58315ba2239"}
    {text: "Programming", id: "01df7d9c87dab79fccf0"}
    {text: "Example: lunar crust I", id: "2c7e4d04634ee1d2aa40"}
    {text: "Example: lunar crust II", id: "e9f3424ada245162d24f"}
  ]

  examples: [
    {
      text: "Mystery Curve"
      img: "//blabr.github.io/img/mystery-curve.png"
      id: "4bd90a0b619bff7707b3"
    }
    {
      text: "Basic Properties of Mars as a Planetary Body"
      img: "//spacemath.github.io/resources/images/thumbs/mars2.png"
      id: "3df6e2368e89a8c3f780"
    }
    {
      text: "Exploring the Interior of Pluto"
      img: "//spacemath.github.io/resources/images/thumbs/planet-core.png"
      id: "d6927773b95652943582"
    }
    {
      text: "Star Trek's solitons are real"
      img: "//blabr.github.io/img/solitons.png"
      id: "2a55efd937f9d3e87d29"
    }
    {
      text: "A toy problem for compressive sensing"
      img: "//blabr.github.io/img/cs-intro.png"
      id: "e8a066234715f21c21fd"
    }
  ]

  references: [
    {text: "Widgets", id: "ff66265ccd580d6a9b04"}
    {text: "Language overview", id: "cac35c998a6640457c39"}
    {text: "Definitions and imports", id: "919000f98b993fcfeb81"}
    {text: "Math functions", id: "c19c10d7828efd13ddee"}
    {text: "Vectors and matrices", id: "cb9ef53d61658dcedd45"}
    {text: "Complex numbers", id: "c182256cc10492eb43b5"}
    {text: "Linear algebra and numeric", id: "19516c877c92649672f4"}
    {text: "Utilities", id: "ccd42df2e696df7e9317"}
  ]
  
  credits: [
    {name: "Ace", url: "ace.c9.io"}
    {name: "CoffeeScript", url: "coffeescript.org"}
    {name: "MathJax", url: "mathjax.org"}
    {name: "numericjs", url: "numericjs.com"}
    {name: "Flot", url: "flotcharts.org"}
    {name: "PaperScript", url: "paperjs.org/reference/paperscript"}
    {name: "jQuery", url: "jquery.com"}
    {name: "GitHub", url: "github.com"}
    {name: "SpaceMath", url: "spacemath.gsfc.nasa.gov"}
  ]

class Guide
  
  constructor: ->
    
    @container = $ "#demo-list"
    @container.hide()
    #@guideControl = new GuideControl @container 
    @isMain = not $blab.resources.getSource?  # Needed?
    @container.empty()
  
    new $blab.utils.CloseButton @container, => @container.slideUp(500, => @guideControl?.show())
    @tips()
    @demos()
    @examples()
    refsCol = @references()
    new Credits @container, refsCol, content.credits
    
  append: (txt) -> @container.append txt
  
  slideDown: -> @container.slideDown 500, => @scroll()
  
  slideToggle: ->
    @container.slideToggle 500, => @scroll()
        
  scroll: ->
    return unless @container.is ":visible"
    wTop = $(window).scrollTop()
    cTop = @container.offset().top
    wh = $(window).height()
    ch = @container.height()
    diff = cTop+ch - (wTop+wh)
    if diff>0
      $("html, body").animate {scrollTop: wTop + diff + 70}, 400
    
  tips: ->
    
    str = ""
    str += "<code>" + tip + "</code><br>" for tip in content.syntaxTips
    
    @append """
      <div class="guide-col">
        <h3>Quick Syntax Tips</h3>
        #{str}
      </div>
    """
  
  demos: ->
    
    @append """
      <div class="guide-col">
        <h3>Demos</h3>
        #{$blab.demoListHtml(blank: true)}
      </div>
    """
    
  examples: ->
    
    str = ""
    for example in content.examples
      str += """
        <div class="gist">
        <a href='//blabr.io?#{example.id}' target="_blank">
        <img src='#{example.img}'>
        <p>#{example.text}</p>
        </a>
        </div>
      """
  
    @append """
      <div class="guide-col">
        <h3>Examples</h3>
        #{str}
        <a href="//blabr.org" target="_blank">More blabs<a>
      </div>
    """
    
  references: ->
  
    col = $ "<div>", class: "guide-col"
    @append col
  
    col.append """
      <h3>Reference</h3>
      #{$blab.refListHtml(blank: true)}
      <br>
      <a href="//coffeescript.org" target="_blank">CoffeeScript language guide</a>
      <br><br>
    """
    
    col


class GuideControl
  
  constructor: (@guide) ->
    
    @tagline = $ "#blabr-tagline"
    @tagline.show()
    
    @button = $ "#demo-list-button"
    @button.click => @click?()
    
    @show()
  
  show: (show=true) ->
    @click = ->
    @tagline.animate opacity: (if show then 1 else 0)
    @tagline.css cursor: (if show then "text" else "default")
    @button.css cursor: (if show then "pointer" else "default")
    return unless show
    @click = =>
      @show(false)
      @guide.slideDown 500


class Credits
  
  constructor: (@container, @containerButton, @credits) ->
    
    @button = $ "<button>",
      text: "Credits"
#      text: "About Blabr"
      click: => @credits.slideToggle(500)
      css: marginLeft: "10px"
    #@containerButton.append(@button)
    
    @footer = $ "<div>", class: "guide-footer"
    @container.append @footer
    #@footer.hide()
  
    l = (txt, url) -> "<a href='//#{url}' target='_blank'>#{txt}</a>"
    str = (l(credit.name, credit.url) for credit in @credits).join(", ")
  
    @footer.append """
      <div style="display: inline-block">
      <a href='//blabr.org' target='_blank'>Blabr</a> 
      is developed by 
      <a href="//github.com/mvclark" target="_blank">Martin Clark</a> and 
      <a href="//github.com/garyballantyne" target="_blank">Gary Ballantyne</a> (Haulashore Limited) 
      as part of the <a href='//github.com/puzlet' target='_blank'>Puzlet</a> project.
      <a href="//twitter.com/blabrnet" target="_blank"><img src="img/TwitterLogo.png" height=24 style="vertical-align: middle"/>Follow us on Twitter</a>.
      </div>
    """
    
    @credits = $ "<div>",
      #css: display: "inline-block"
      html: "Thanks to: #{str}."
    
    @footer.append(@button).append(@credits)
    @credits.hide()
    
    #@footer.append "<br>Thanks to: #{str}."
    


$blab.demoListHtml = (spec) ->
  html = "<ul>\n"
  for item in content.demos
    c = if item.id is spec.highlight then "demo-list-item-highlight" else ""
    t = if spec.blank then " target = '_blank'" else ""
    href = if item.id then "?#{item.id}" else ""
    html += "<li><a class='#{c}' href='#{href}'#{t}>#{item.text}</a></li>\n"
  html += "</ul>\n"
  


$blab.refListHtml = (spec) ->
  html = "<ul>\n"
  for item in content.references
    t = if spec.blank then " target = '_blank'" else ""
    html += "<li><a href='?#{item.id}'#{t}>#{item.text}</a></li>\n"
  html += "</ul>\n"


$blab.guideClass = Guide

#$blab.blabrGuide = new Guide
