#!vanilla

layout [2, 2]

plot "mystery-curve",
  width: 400, height: 380
  xlabel: "x", ylabel: "y"
  xaxis: {min: -2, max: 2}
  yaxis: {min: -2, max: 2}
  series: {lines: lineWidth: 1}
  colors: ["red", "blue"]
  grid: {backgroundColor: "white"}
  css: marginTop: 40
  pos: 2, order: 1

slider "k",
  min: 0, max: 10, step: 0.1, init: 5
  prompt: "$k$:"
  unit: ""
  pos: 1, order: 1

table "kpowers",
  headings: ["$k$", "$k^2$", "$k^3$"]
  widths: [120, 120, 120]
  pos: 1, order: 2
