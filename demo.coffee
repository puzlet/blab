$blab.demoScript = (spec) ->
  
  {md, compute, widget, slider} = spec
  
  compute "k = slider \"k\"", "Create a slider in the canvas above.<br>Specify an id (\"k\") so you can refer to it elsewhere."
  compute "x = [1..5]", "Define a vector."
  compute "y = k*x*x", "Vector equation based on slider value and x.<br>The result is shown in the box on the right."
  compute "table \"xy\", x, y", "Display the data in a table.<br>Table parameters are shown below."
  
  widget
    line: 13, word: 2, replace: ": [\"$x$\", \"$kx^2$\"]"
    guide: "Add column headings to table.<br>Supports MathJax."
    
  widget
    line: 14, word: 3, replace: "100, 100"
    guide: "Set column widths."
  
  compute "plot \"plot\", x, y", "Plot the data."
  
  widget
    line: 21, word: 1, replace: ""
    guide: "Change the plot's y-axis limit."
    
  widget
    line: 21, word: 9, replace: "100"
    guide: "Change the plot's y-axis limit."
  
  widget
    line: 25, word: 3, replace: "2"
    guide: "Change the plot position."
    
  slider
    id: "k", vals: [1..9]
    guide: "Adjust the slider and see the computation updated on-the-fly."
    
  md
    line: 1, word: 1, replace: "Quadratic"
    guide: "Change page title."
    
  md
    append: "This blab (short for we**_b lab_**)\nshows the quadratic function:\n\n> $f(x) = k x^2$\n\n* * *"
    guide: "Add markdown (Github-flavored).  Supports MathJax."
    
  md
    close: true
  
    