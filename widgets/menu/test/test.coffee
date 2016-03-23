# ZZZ To implement

container = $ "#input"

menu = new $blab.components.Menu
  container: container
  prompt: "Input"
  unit: "Hz"
  init: 2

display = -> $("#result").html("Input value = " + input.val())

display()
input.change -> display()
  