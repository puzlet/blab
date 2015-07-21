$blab.demoScript = (spec) ->
  
  {md, compute, defs, widget, slider, delays} = spec
  
  delays
    step: 500
    changeCode: 500
    codeChar: 150
    mdChar: 50
    slider: 200
    
  compute "k = slider \"k\"", "Create a slider in the canvas above.<br>Specify an id (\"k\") so you can refer to it elsewhere."
  
  defs "nPoints = 5", "Define a value"
  defs "quadratic = (x, k) -> k*x*x", "Define a function"
  defs "defs {nPoints, quadratic}", "Use these definitions in computation above"
  
  compute "x = [1..nPoints]", "Define a vector."
  compute "y = quadratic(x, k)", "Vector equation based on slider value and x.<br>The result is shown in the box on the right."
  compute "table \"xy\", x, y", "Display the data in a table.<br>Table parameters are shown below."
  
  widget
    find: "[]", replace: "[\"$x$\", \"$kx^2$\"]"
    guide: "Add column headings to table.<br>Supports MathJax."
    
  widget
    find: "widths: [100]", replace: "widths: [100, 100]"
    guide: "Set column widths."
  
  compute "plot \"plot\", x, y", "Plot the data."
  
  widget
    find: "# yaxis", replace: "yaxis"
    guide: "Change the plot's y-axis limit."
    
  widget
    vline: 5, find: "max: 1", replace: "max: 100"
    guide: "Change the plot's y-axis limit."
  
  widget
    find: "pos: 1", replace: "pos: 2"
    guide: "Change the plot position."
    
  slider
    id: "k", vals: [1..9]
    guide: "Adjust the slider and see the computation updated on-the-fly."
    
  md
    find: "Untitled", replace: "Quadratic"
    guide: "Change page title."
    
  md
    append: "This blab (short for we**_b lab_**)\nshows the quadratic function:\n\n> $f(x) = k x^2$\n\n* * *"
    guide: "Add markdown (Github-flavored).  Supports MathJax."
    
  md
    close: true
  
    