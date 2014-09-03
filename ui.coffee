source = $("#source")

headings = $ "h2"
return unless headings.length

heading = $(headings[0])
heading.css cursor: "pointer"
heading.attr title: "Click to show/hide source code editors for page HTML/CSS/resources."
heading.click => source.toggle()
