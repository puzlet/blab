defs
  nPoints: 1000
  bar: use "gist:cfd20900e379868040f9", (bar) ->
    @myfun = (x) -> x*x + bar.foo(x)
