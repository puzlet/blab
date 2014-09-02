source = $("#source")

headings = $ "h2"
return unless headings.length

heading = $(headings[0])
heading.css cursor: "pointer"
heading.click => source.toggle()
