defs
  nPoints: 1000
  lib: use "gist:cfd20900e379868040f9"
  lib2: use "gist:45daa69168bef190ae06"
  dependents: ->
    @myfun = (x) => x*x + @lib.foo.bar(x) + @lib2.xyz
