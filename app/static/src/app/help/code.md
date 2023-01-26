# Write odin code

Write code in this editor and press “Compile” and the odin model will be created, which will be available for use in the other tabs.

## Key bits to remember
```
deriv(X) <- ...
```

Specifies that `X` is a variable that will change over time, but that we can only describe `X` in terms of its rates of 
change. Every `deriv()` call must be paired with an `initial()` call that describes the initial conditions
```
initial(X) <- ...
```
The code here looks like R but is not R.

To create other quantities, use `<-` to bind a name (e.g., `a`) to a mathematical expression (e.g., `X + 1`) such as:
```
a <- X + 1
```
Standard mathematical operators (`*`, `/`, `+`, `-`) are supported, you can also use `a^b` for “`a` to the power of `b`”.

You can also add comments and notes to your code by using the `#` symbol.
```
# This is a comment and will be ignored
b <- 2 * a # the text after the '#' is a comment and will be ignored
```

## Further help
A more detailed user guide can be found [here](https://mrc-ide.github.io/infectiousdiseasemodels-2019/guide/) (opens in new page).
