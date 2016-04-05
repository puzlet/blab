# ZZZ To implement

menu = new $blab.components.Menu
  container: $("#menu")
  prompt: "Input"
  init: 0
  options: [
    {text: "None", value: 0}
    {text: "Small", value: 5}
    {text: "Large", value: 20}
  ]
  align: "left"

display = -> $("#result").html("Input value = " + menu.getVal())

display()
menu.change -> display()
  