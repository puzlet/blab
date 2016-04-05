# math sugar?

table = new $blab.components.Table
  container: $("#table")
  id: "my-table"  # Must be consistent with tables.json
  title: "My Table"
  headings: ["$x$", "$x^2$"]  # ["Column 1", "Column 2"]
  widths: 100  #[100, 100]
  change: -> compute()

# e.g., slider
# slider = ...

compute = ->
  
  # e.g., 
  # p = slider()
  p = 1
  
  x = table.set [], [-> y]
  y = p*x*x

# Above: won't work if other components in play?  i.e, table would need to be instantiated last.

# ZZZ handle via coffee.compile() ?
