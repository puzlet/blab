$blab.demoScript = (spec) ->
  
  {text, md, compute, defs, widget, slider, delays} = spec
  
  delays
    step: 500
    dwell: 1000
    changeCode: 500
    codeChar: 100
    mdChar: 50
    slider: 200
  
  #text """
  #<b>Blabr</b> is a tool for creating a <b>blab</b> (short for we<b><i>b lab</i></b>).<br><br>
  #A blab is a web page for interactive computation:<br>math, sliders, tables, plots, etc.
  #""", 6000
  
  compute "k = slider \"k\"", "Create a slider in the canvas above.<br>Specify an id (\"k\") so you can refer to it elsewhere.", 3000
  
  #defs "nPoints = 5", "Define a value."
  #defs "quadratic = (x, k) -> k*x*x", "Define a function."
  #defs "defs {nPoints, quadratic}", "Use these definitions in computation above."
  
  compute "x = [1..5]", "Define a vector."
  
  compute "y = k*x*x", """
    Vector equation based on slider value and x.<br>The result is shown in the box on the right.
    """, 5000

#    The code is <a href="//coffeescript.org" target="_blank">CoffeeScript</a>, customized for math and scientific computing. 
  
  compute "table \"xy\", x, y", "Display the data in a table.<br>Table parameters are shown below.", 4000
  
  widget
    find: "[]", replace: "[\"$x$\", \"$kx^2$\"]", slow: true
    guide: "Add column headings to table.<br>Supports MathJax."
    dwell: 3000
    
  widget
    find: "widths: [100]", replace: "widths: [100, 100]"
    guide: "Set column widths."
  
  compute "plot \"plot\", x, y", "Plot the data.", 3000
  
  widget
    vline: 5, find: "max: 1", replace: "max: 100"
    guide: "Change the plot's y-axis limit."
    dwell: 0
    
  widget
    find: "# yaxis", replace: "yaxis"
    guide: "Change the plot's y-axis limit."
  
  widget
    find: "pos: 1", replace: "pos: 2"
    guide: "Change the plot position."
    dwell: 2000
    
  slider
    id: "k", vals: [1..9]
    guide: "Adjust the slider and see the computation updated on-the-fly."
    
  md
    find: "Untitled", replace: "Quadratic"
    guide: """
      When you click on the page title, this editor appears.<br>
      Change the page title here.<br><br>
      (Similarly, when you click a slider/table/plot, an editor appears so you can change its settings.)<br>
    """
    dwell: 5000
    
  md
    append: "This blab (short for we**_b lab_**)\nshows the quadratic function:\n\n> $f(x) = k x^2$\n\n* * *"
    guide: "Add markdown (Github-flavored).  Supports MathJax."
    
  md
    close: true
  
  text """
  You can save a blab as a <a href="//gist.github.com" target="_blank">GitHub Gist</a>.<br>
  Just click the Save button at the top right.<br><br>
  You'll get a blab link like this one:<br>
  <a href="//blabr.io/?4bd90a0b619bff7707b3" target="_blank" style="margin-left: 10">blabr.io?4bd90a0b619bff7707b3</a>.<br><br>
  Share your blab's link with anyone.<br><br>
  For scientific computing, a blab is an alternative to an online spreadsheet.
  """, 10000
  
  #text """
  #For scientific computing, a blab is an alternative to an online spreadsheet.
  #""", 3000
  
  #text """
  #For scientific computing, Blabr is an alternative<br>to online spreadsheets.<br><br>
  #<b>Learn more about Blabr:</b><br>
  ##{$blab.demoListHtml(highlight: "58ef3095767efcdf1977")}
  #See blab examples <a href="//blabr.org">here</a>.<br>
  #<br>
  #<a href="//blabr.io">Run this demo again</a>
  #""", 30000


