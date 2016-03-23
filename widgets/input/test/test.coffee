container = $ "#input"

input = new $blab.components.Input
  container: container
  prompt: "Input"
  unit: "Hz"
  init: 2

display = -> $("#result").html("Input value = " + input.val())

display()
input.change -> display()
  