# ultramarked

[**Marked**](https://github.com/chjj/marked) with built-in syntax highlighting and input sanitizing that doesn't encode all HTML.

**Ultramarked** wraps around marked, so it's essentially Marked, with a few extra options.

## Fetch

    $ npm install ultramarked --save

## Use

    var marked = require('ultramarked');

    marked.setOptions({
        // your options go here
    });

    marked('This is **awesome**!');

## Configure

### options.ultralight

Syntax highlighting powered by [highlight.js](https://github.com/isagalaev/highlight.js), no extra magic.