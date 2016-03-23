container = $ "#plot"

plot = new $blab.components.Plot
  container: container
  title: "TEST PLOT"
  width: 500, height: 300
  xlabel: "x", ylabel: "y"
  # xaxis: {min: 0, max: 1}
  # yaxis: {min: 0, max: 1}
  series: {lines: lineWidth: 2}
  colors: ["red", "blue"]
  grid: {backgroundColor: "white"}
 
plot.setVal([[1..10], [1..10]])
