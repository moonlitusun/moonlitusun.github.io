+++
author = "Roc"
title = "Code Reuse In Shell"
date = "2024-01-30 13:58:29"
tags = [
    "Shell",
]
+++

In shell scripting, unlike some programming languages, there is no built-in module system that allows the use of `import` syntax as seen in JavaScript or Python. However, you can achieve code reuse through techniques like sourcing external scripts using `source` or `.`(dot) commands。

```sh
source xx.sh
#or
. xx.sh
```

Consider the following example where we reuse a varialbe from one script in another:

*test3.sh*

```sh
#!/bin/bash

name=2

echo "test3.sh: name=$name"
```

*test.sh*

```sh
#!/bin/bash

. ./test3.sh

# 2
echo $name
```

As demonstrated above, you can share variables between scripts using the `source`. This allows you to reuse not only variables but also functions and environment variables.

Let's extend the example to include a function:

*test3.sh*

```sh
#!/bin/bash

name=2

function say {
  name=$1
  echo "say: name=$name"
}
```

*test.sh*

```sh
#!/bin/bash

. ./test3.sh

# Outputs: say: name=roc
say "roc"
```

In the above script, the `say` functions is defined in `test3.sh` and is then reused in `test.sh`, demonstrating the flexibility and simplicity of code reuse in shell scripting.

While shell scripting may lack some of the advanced modularity features found in other languages, leveraging sourcing and a consistent variable scope allows for effective code reuse, making you scripts more maintainable and modular.
