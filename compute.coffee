t = linspace(0, 2*pi, 1000) #;
k = slider "k"
z = exp(j*t) - exp(k*j*t)/2 + j*exp(-14*j*t)/3 #;
plot "mystery-curve", z.x, z.y
table "kpowers",  [k], [k*k], [k*k*k]