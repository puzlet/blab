defs
  nPoints: 1000
  bar: use "gist:cfd20900e379868040f9", (defs) ->
    defs.myfun = (x) -> x*x + defs.bar.foo(x)
