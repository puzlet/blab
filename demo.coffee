$blab.demoScript = (spec) ->
  
  {text, md, compute, defs, widget, slider, delays} = spec
  
  delays
    step: 500
    dwell: 1000
    changeCode: 500
    codeChar: 100
    mdChar: 50
    slider: 200
  
  compute "k = slider \"k\"", "Create a slider in the canvas above.<br>Specify an id (\"k\") so you can refer to it elsewhere.", 3000
  
  defs "nPoints = 5", "Define a value."
  defs "quadratic = (x, k) -> k*x*x", "Define a function."
  defs "defs {nPoints, quadratic}", "Use these definitions in computation above."
  
  compute "x = [1..nPoints]", "Define a vector."
  compute "y = quadratic(x, k)", "Vector equation based on slider value and x.<br>The result is shown in the box on the right.", 3000
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
    find: "# yaxis", replace: "yaxis"
    guide: "Change the plot's y-axis limit."
    dwell: 0
    
  widget
    vline: 5, find: "max: 1", replace: "max: 100"
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
    guide: "Change page title."
    
  md
    append: "This blab (short for we**_b lab_**)\nshows the quadratic function:\n\n> $f(x) = k x^2$\n\n* * *"
    guide: "Add markdown (Github-flavored).  Supports MathJax."
    
  #md
  #  append: " "
  #  guide: "<b>Learn more about blabr</b><br><a href='?58ef3095767efcdf1977'>Click here</a> to see more blabr demos."
  #  dwell: 10000
    
  md
    close: true
  
  text """
  <b>Learn more about blabr</b><br>
  #{$blab.demoListHtml(highlight: "58ef3095767efcdf1977")}
  """, 10000, "#ff9"

