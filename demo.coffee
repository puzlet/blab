$blab.demoScript = (spec) ->
  
  {compute, widget} = spec
  
  compute "k = slider \"k\"", "Create a slider in the canvas above."
  compute "x = [1..5]", "Define a vector."
  compute "y = k*x*x", "Vector equation based on slider value and x.<br>The result is shown in the box on the right."
  compute "table \"xy\", x, y", "Display the data in a table.<br>Table parameters are shown below."
  
  widget
    line: 13, word: 2, replace: ": [\"$x$\", \"$kx^2$\"]"
    guide: "Add column headings to table.  Supports MathJax."
    
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